import assert from "node:assert/strict";
import { prisma } from "../lib/prisma";
import { normalizeOrderEntry } from "../lib/order-entry";
import type { CreateOrderInput } from "../lib/validation/orders";
import { createOrderSchema } from "../lib/validation/orders";

// This exercises committed service transactions only against the disposable copy.
async function main() {
  const url = new URL(process.env.DATABASE_URL ?? "");
  assert.equal(url.hostname, "127.0.0.1");
  assert.equal(url.port, "55439");
  assert.equal(url.pathname, "/order_revamp_verify");
  require("next/cache").revalidatePath = () => {};
  const { createOrder, updateOrder, lockOrder, finalizeOrder, searchOrders } = await import("../lib/services/orders");
  const schools = await prisma.school.findMany({ take: 2 });
  assert.equal(schools.length, 2);
  const item = await prisma.item.findFirstOrThrow();
  const itemRef = { itemCode: item.itemCode, itemName: item.itemName };
  const sheet1 = {
    orderPlacedDate: "2026-10-20", orderType: "ambiguous",
    billingToType: "individual", billingToName: "Verification payer",
    shippingToType: "individual", shippingToName: "Verification recipient",
    shippingToSummary: "Manual address unrelated to end schools"
  };

  const ambiguousInput = createOrderSchema.parse({ sheet1, ambiguousItems: [{ ...itemRef, groupedQuantity: 7 }] });
  const ambiguous = await createOrder(ambiguousInput);
  assert.equal(ambiguous.billingToCode, null);
  assert.equal(ambiguous.shippingToCode, null);
  assert.equal(ambiguous.sessionYear, null);
  assert.equal(ambiguous.expectedDeliveryDate, null);
  assert.equal(ambiguous.orderReceivedDate, null);
  assert.equal(ambiguous.ambiguousSchools.length, 0);
  await lockOrder(ambiguous.orderSheet1Id);
  const finalizedAmbiguous = await finalizeOrder(ambiguous.orderSheet1Id);
  assert.deepEqual(finalizedAmbiguous.finalRows.map(row => [row.sourceType, row.quantity]), [["TWO_B2", 7]]);
  await assert.rejects(() => finalizeOrder(ambiguous.orderSheet1Id), /Only locked/);
  await assert.rejects(() => lockOrder(ambiguous.orderSheet1Id), /cannot be locked/);

  const schoolInput = createOrderSchema.parse({ sheet1: { ...sheet1, orderType: "descriptive", descriptiveMode: "individual" }, descriptiveRows: schools.slice(0, 1).map((school, index) => ({ schoolCode: school.schoolCode, schoolName: school.schoolName, ...itemRef, quantity: index + 3 })) });
  const schoolOrder = await createOrder(schoolInput);
  assert.equal(schoolOrder.descriptiveRows.length, 1);
  await lockOrder(schoolOrder.orderSheet1Id);
  const finalizedSchool = await finalizeOrder(schoolOrder.orderSheet1Id);
  assert.equal(finalizedSchool.finalRows.length, 1);
  assert.equal(finalizedSchool.finalRows.reduce((sum, row) => sum + row.quantity, 0), 3);

  const participants = schools.map(school => ({ schoolCode: school.schoolCode, schoolName: school.schoolName }));
  const multipleInput = createOrderSchema.parse({ sheet1: { ...sheet1, orderType: "descriptive", descriptiveMode: "multiple_schools" }, combinedSchools: participants, combinedItems: [{ ...itemRef, pooledQuantity: 17 }] });
  const multiple = await createOrder(multipleInput);
  assert.equal(multiple.schoolGroupId, null);
  assert.equal(multiple.endUserGroupCode, null);
  assert.equal(multiple.descriptiveRows.length, 0);
  const editedMultiple = await updateOrder(multiple.orderSheet1Id, { ...multipleInput, sheet1: { ...multipleInput.sheet1, billingToName: "Changed multiple payer" } });
  assert.equal(editedMultiple.combinedItems[0].pooledQuantity, 17);
  await lockOrder(multiple.orderSheet1Id);
  const finalizedMultiple = await finalizeOrder(multiple.orderSheet1Id);
  assert.deepEqual(finalizedMultiple.finalRows.map(row => [row.sourceType, row.quantity]), [["TWO_C2", 17]]);

  // Older orders retain 2A sources until an explicit edit converts them.
  const legacy = await prisma.orderSheet1.create({ data: {
    orderNo: multiple.orderNo + 1, orderPlacedDate: new Date("2026-10-20"), orderType: "descriptive", descriptiveMode: "school",
    billingToType: "individual", billingToName: sheet1.billingToName, shippingToType: "individual", shippingToName: sheet1.shippingToName, shippingToSummary: sheet1.shippingToSummary,
    descriptiveRows: { create: participants.map((school, index) => ({ ...school, ...itemRef, orderNo: multiple.orderNo + 1, quantity: index + 4 })) }
  }, include: { descriptiveRows: true } });
  const sourceIds = legacy.descriptiveRows.map(row => row.orderSheet2AId);
  await lockOrder(legacy.orderSheet1Id);
  const legacyFinal = await finalizeOrder(legacy.orderSheet1Id);
  assert.deepEqual(legacyFinal.finalRows.map(row => row.sourceId).sort(), sourceIds.sort());
  assert.ok(legacyFinal.finalRows.every(row => row.sourceType === "TWO_A"));
  const editableLegacy = await prisma.orderSheet1.create({ data: {
    orderNo: legacy.orderNo + 1, orderPlacedDate: new Date("2026-10-20"), orderType: "descriptive", descriptiveMode: "school",
    billingToType: "individual", billingToName: sheet1.billingToName, shippingToType: "individual", shippingToName: sheet1.shippingToName, shippingToSummary: sheet1.shippingToSummary,
    descriptiveRows: { create: participants.map((school, index) => ({ ...school, ...itemRef, orderNo: legacy.orderNo + 1, quantity: index + 4 })) }
  }, include: { descriptiveRows: true } });
  const converted = normalizeOrderEntry({ ...multipleInput, sheet1: { ...multipleInput.sheet1, descriptiveMode: "school" }, combinedSchools: [], combinedItems: [], descriptiveRows: editableLegacy.descriptiveRows.map(row => ({ ...row, notes: row.notes ?? "" })) } as unknown as CreateOrderInput);
  const savedConversion = await updateOrder(editableLegacy.orderSheet1Id, converted);
  assert.equal(savedConversion.descriptiveMode, "multiple_schools");
  assert.equal(savedConversion.combinedItems[0].pooledQuantity, 9);
  await lockOrder(savedConversion.orderSheet1Id);
  assert.deepEqual((await finalizeOrder(savedConversion.orderSheet1Id)).finalRows.map(row => [row.sourceType, row.quantity]), [["TWO_C2", 9]]);
  // Persisted constraints are checked even if a record bypasses the create API.
  const invalid = await prisma.orderSheet1.create({ data: {
    orderNo: editableLegacy.orderNo + 1, orderPlacedDate: new Date("2026-10-20"), orderType: "descriptive", descriptiveMode: "individual",
    billingToType: "individual", billingToName: "Invalid fixture", shippingToType: "individual", shippingToName: "Invalid fixture", shippingToSummary: "Fixture address",
    descriptiveRows: { create: participants.map(school => ({ ...school, ...itemRef, orderNo: editableLegacy.orderNo + 1, quantity: 1 })) }
  } });
  await assert.rejects(() => lockOrder(invalid.orderSheet1Id), /exactly one school/);
  await prisma.orderSheet1.update({ where: { orderSheet1Id: invalid.orderSheet1Id }, data: { orderStatus: "locked" } });
  await assert.rejects(() => finalizeOrder(invalid.orderSheet1Id), /exactly one school/);

  const suffix = Date.now().toString();
  const christian = await prisma.schoolGroup.create({ data: { groupCode: `CVERIFY-${suffix}`, groupName: "Verification Christian group", sourceType: "CHRISTIAN" } });
  const groupInput = createOrderSchema.parse({ sheet1: { ...sheet1, orderType: "descriptive", descriptiveMode: "multiple_group", endUserGroupCode: christian.groupCode }, combinedSchools: schools.map(school => ({ schoolCode: school.schoolCode, schoolName: school.schoolName })), combinedItems: [{ ...itemRef, pooledQuantity: 13 }] });
  const groupOrder = await createOrder(groupInput);
  assert.equal(groupOrder.orderType, "descriptive");
  assert.equal(groupOrder.descriptiveMode, "multiple_group");
  assert.equal(groupOrder.endUserGroupCode, christian.groupCode);
  assert.equal(groupOrder.billingToName, sheet1.billingToName);
  const updated = await updateOrder(groupOrder.orderSheet1Id, { ...groupInput, sheet1: { ...groupInput.sheet1, billingToName: "Changed payer", shippingToName: "Changed recipient", shippingToSummary: "Changed destination" } });
  assert.equal(updated.orderNo, groupOrder.orderNo);
  assert.equal(updated.shippingToSummary, "Changed destination");
  assert.equal(updated.combinedSchools.length, 2);
  assert.equal(updated.combinedItems[0].pooledQuantity, 13);
  await lockOrder(groupOrder.orderSheet1Id);
  const finalizedGroup = await finalizeOrder(groupOrder.orderSheet1Id);
  assert.deepEqual(finalizedGroup.finalRows.map(row => [row.sourceType, row.quantity]), [["TWO_C2", 13]]);

  const gs = await prisma.schoolGroup.create({ data: { groupCode: `GS${suffix}`, groupName: "Verification GS group", sourceType: "GS" } });
  await prisma.organisation.create({ data: { prCode: `PR${suffix}1`, organisationName: "Verification GS member", groupCode: gs.groupCode } });
  const gsInput = createOrderSchema.parse({ ...groupInput, sheet1: { ...groupInput.sheet1, endUserGroupCode: gs.groupCode } });
  const gsOrder = await createOrder(gsInput);
  assert.equal(gsOrder.combinedSchools.length, 1);
  assert.match(gsOrder.combinedSchools[0].schoolCode, /^PT\d+$/);
  assert.equal(gsOrder.shippingToSummary, sheet1.shippingToSummary);
  assert.equal(gsOrder.billingToType, "individual");
  await prisma.organisation.updateMany({ where: { groupCode: gs.groupCode }, data: { groupCode: null } });
  const editedGs = await updateOrder(gsOrder.orderSheet1Id, { ...gsInput, sheet1: { ...gsInput.sheet1, shippingToSummary: "New independent GS destination" } });
  assert.deepEqual(editedGs.combinedSchools.map(row => row.schoolCode), gsOrder.combinedSchools.map(row => row.schoolCode));
  assert.equal(editedGs.shippingToSummary, "New independent GS destination");
  await lockOrder(gsOrder.orderSheet1Id);
  const finalizedGs = await finalizeOrder(gsOrder.orderSheet1Id);
  assert.equal(finalizedGs.finalRows[0].sourceType, "TWO_C2");
  assert.equal(finalizedGs.finalRows[0].quantity, 13);

  const results = await searchOrders(new URLSearchParams({ order_type: "descriptive" }));
  assert.ok(results.some(order => order.orderSheet1Id === groupOrder.orderSheet1Id));
  assert.ok(results.some(order => order.orderSheet1Id === schoolOrder.orderSheet1Id));
  console.log("Passed save/edit/lock/finalize, manual parties, nullable metadata, individual and pooled school quantities, legacy conversion/source preservation, Christian/GS groups, GS snapshots, pooled totals, filters, and duplicate-finalization protection on isolated database.");
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());

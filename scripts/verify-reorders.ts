import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { prisma } from "../lib/prisma";
import { getOrderEnteredDate } from "../lib/order-dates";
import { createOrderSchema } from "../lib/validation/orders";
import type { ReorderInput } from "../lib/reorder";

async function main() {
  const url = new URL(process.env.DATABASE_URL ?? "");
  assert.equal(url.hostname, "127.0.0.1");
  assert.equal(url.port, "55439");
  assert.equal(url.pathname, "/order_revamp_verify");
  require("next/cache").revalidatePath = () => {};
  const { createOrder, createReorder, updateOrder, getOrder, lockOrder, finalizeOrder } = await import("../lib/services/orders");
  const schools = await prisma.school.findMany({ take: 2 });
  assert.equal(schools.length, 2);
  const item = await prisma.item.findFirstOrThrow({ where: { active: true, obsolete: false } });
  const itemRef = { itemCode: item.itemCode, itemName: item.itemName };
  const shipping = { shippingToType: "individual" as const, shippingToCode: "", shippingToName: "Reorder recipient", shippingToSummary: "New reorder address", expectedDeliveryDate: "" };
  const input: ReorderInput = { shipping, descriptiveItems: [{ ...itemRef, quantity: 6 }], ambiguousItems: [], combinedItems: [] };
  let orderNo = (await prisma.orderSheet1.aggregate({ _max: { orderNo: true } }))._max.orderNo ?? 0;
  const original = await prisma.orderSheet1.create({ data: {
    orderNo: ++orderNo, orderStatus: "finalized", orderType: "descriptive", descriptiveMode: "individual",
    orderPlacedDate: new Date("2025-01-01"), orderReceivedDate: new Date("2025-01-02"), expectedDeliveryDate: new Date("2025-02-01"),
    billingToType: "individual", billingToName: "Reorder original payer",
    shippingToType: "individual", shippingToName: "Reorder original recipient", shippingToSummary: "Original address",
    contactNumbers: ["9876543210"], pendingPayment: true, booksellerType: "Saved type", booksellerRating: "A",
    commissionPartyType: "vendor", commissionPartyCode: "DELETED-HISTORICAL-COMMISSION", commissionPercentage: 8.5,
    notes: "Preserved order notes",
    descriptiveRows: { create: { orderNo, schoolCode: schools[0].schoolCode, schoolName: "Saved historical school name", ...itemRef, quantity: 11 } },
    schoolExecutives: { create: { schoolCode: schools[0].schoolCode, incumbentCode: "DELETED-INCUMBENT", name: "Historical executive name" } }
  } });
  const originalRow = await prisma.orderSheet2A.findFirstOrThrow({ where: { orderSheet1Id: original.orderSheet1Id } });
  await prisma.orderSheet3.create({ data: {
    orderSheet1Id: original.orderSheet1Id, orderNo: original.orderNo, sourceType: "TWO_A", sourceId: originalRow.orderSheet2AId,
    ...itemRef, quantity: 11, paymentReceived: true, acceptedByClient: true,
    dispatchDate: new Date("2025-02-01"), plDate: new Date("2025-02-01"), plNumber: "ORIGINAL-PL", cancelOrOnHoldStatus: "on_hold"
  } });
  const before = await getOrder(original.orderSheet1Id);
  const defaultsBefore = await prisma.schoolExecutiveDefault.findMany({ orderBy: { prCode: "asc" } });
  const [first, second] = await Promise.all([createReorder(original.orderSheet1Id, input), createReorder(original.orderSheet1Id, input)]);
  assert.notEqual(first.orderNo, second.orderNo);
  assert.notEqual(first.orderNo, original.orderNo);
  assert.equal(first.reorderOfOrderId, original.orderSheet1Id);
  assert.equal(first.reorderOfOrder?.orderNo, original.orderNo);
  assert.equal(first.orderStatus, "draft");
  assert.equal(first.orderPlacedDate.toISOString().slice(0, 10), getOrderEnteredDate());
  assert.equal(first.orderReceivedDate?.toISOString().slice(0, 10), getOrderEnteredDate());
  assert.equal(first.expectedDeliveryDate, null);
  for (const key of ["billingToType", "billingToCode", "billingToName", "commissionPartyType", "commissionPartyCode", "notes", "booksellerType", "booksellerRating", "pendingPayment"] as const) assert.equal(first[key], original[key]);
  assert.equal(first.commissionPercentage?.toString(), "8.5");
  assert.deepEqual(first.contactNumbers, original.contactNumbers);
  assert.equal(first.descriptiveRows[0].schoolName, "Saved historical school name");
  assert.equal(first.descriptiveRows[0].quantity, 6);
  assert.equal(first.schoolExecutives[0].name, "Historical executive name");
  assert.equal(first.schoolExecutives[0].incumbentCode, "DELETED-INCUMBENT");
  assert.deepEqual(first.finalRows, []);
  assert.deepEqual(await getOrder(original.orderSheet1Id), before);
  assert.deepEqual(await prisma.schoolExecutiveDefault.findMany({ orderBy: { prCode: "asc" } }), defaultsBefore);

  // Reordering a reorder links to the immediate source and still allocates a new number.
  const third = await createReorder(first.orderSheet1Id, input);
  assert.equal(third.reorderOfOrderId, first.orderSheet1Id);
  assert.notEqual(third.orderNo, first.orderNo);
  await lockOrder(first.orderSheet1Id);
  const final = await finalizeOrder(first.orderSheet1Id);
  assert.equal(final.finalRows[0].quantity, 6);
  assert.equal(final.finalRows[0].paymentReceived, false);
  assert.equal(final.finalRows[0].dispatchDate, null);
  assert.equal(final.finalRows[0].plNumber, null);

  const countBefore = await prisma.orderSheet1.count();
  await assert.rejects(() => createReorder(original.orderSheet1Id, { ...input, descriptiveItems: [] }));
  await assert.rejects(() => createReorder(original.orderSheet1Id, { ...input, shipping: { ...shipping, shippingToType: "vendor", shippingToCode: "UNKNOWN" } }), /must exist/);
  await assert.rejects(() => createReorder(-1, input), /Invalid source/);
  await assert.rejects(() => createReorder(2147483647, input), /not found/);
  assert.equal(await prisma.orderSheet1.count(), countBefore);

  const sourceIds: number[] = [];
  for (const mode of ["multiple_schools", "multiple_group", "legacy", "ambiguous", "combined"] as const) {
    const number = (await prisma.orderSheet1.aggregate({ _max: { orderNo: true } }))._max.orderNo! + 1;
    const ambiguous = mode === "ambiguous";
    const legacy = mode === "legacy";
    const source = await prisma.orderSheet1.create({ data: {
      orderNo: number, orderPlacedDate: new Date("2025-01-01"), orderStatus: "cancelled",
      orderType: ambiguous ? "ambiguous" : mode === "combined" ? "combined" : "descriptive", descriptiveMode: ambiguous || legacy || mode === "combined" ? null : mode,
      endUserGroupCode: mode === "multiple_group" ? "GS999999" : null,
      billingToType: mode === "combined" ? "school" : "individual", billingToCode: mode === "combined" ? "GS999999" : null, billingToName: "Saved pooled payer",
      shippingToType: "individual", shippingToName: "Saved recipient", shippingToSummary: "Saved address",
      ...(!ambiguous && !legacy ? { combinedSchools: { create: schools.map(school => ({ orderNo: number, schoolCode: school.schoolCode, schoolName: school.schoolName, notes: "Saved participant notes" })) } } : {}),
      ...(legacy ? { descriptiveRows: { create: schools.map(school => ({ orderNo: number, schoolCode: school.schoolCode, schoolName: school.schoolName, ...itemRef, quantity: 2 })) } } : {})
    } });
    sourceIds.push(source.orderSheet1Id);
    const reordered = await createReorder(source.orderSheet1Id, {
      shipping, descriptiveItems: [],
      ambiguousItems: ambiguous ? [{ ...itemRef, groupedQuantity: 3 }] : [],
      combinedItems: ambiguous ? [] : [{ ...itemRef, pooledQuantity: 5 }]
    });
    assert.equal(reordered.orderStatus, "draft");
    if (mode === "combined") assert.equal(reordered.endUserGroupCode, "GS999999");
    if (!ambiguous) assert.deepEqual(reordered.combinedSchools.map(row => row.schoolCode), schools.map(school => school.schoolCode));
    else assert.equal(reordered.ambiguousItems[0].groupedQuantity, 3);
    await lockOrder(reordered.orderSheet1Id);
    await finalizeOrder(reordered.orderSheet1Id);
  }
  const special = await prisma.orderSheet1.update({ where: { orderSheet1Id: third.orderSheet1Id }, data: { classification: "group_parent" } });
  await assert.rejects(() => createReorder(special.orderSheet1Id, input), /Only normal orders/);
  await prisma.orderSheet1.update({ where: { orderSheet1Id: third.orderSheet1Id }, data: { classification: "normal" } });

  const normalInput = createOrderSchema.parse({ sheet1: { ...shipping, billingToType: "individual", billingToName: "Ordinary creation", orderPlacedDate: getOrderEnteredDate(), orderType: "ambiguous" }, ambiguousItems: [{ ...itemRef, groupedQuantity: 2 }] });
  const normal = await createOrder(normalInput);
  assert.equal(normal.reorderOfOrderId, null);
  const edited = await updateOrder(normal.orderSheet1Id, { ...normalInput, ambiguousItems: [{ ...itemRef, groupedQuantity: 4 }] });
  assert.equal(edited.orderNo, normal.orderNo);
  assert.equal(edited.ambiguousItems[0].groupedQuantity, 4);
  await writeFile("tmp/reorder-browser-fixture.json", JSON.stringify({ sourceId: original.orderSheet1Id, sourceNo: original.orderNo, pooledIds: sourceIds, itemCode: item.itemCode }));
  console.log("Reorder integration checks passed: numbering, concurrency, snapshots, dates, validation, rollback, fulfillment, all modes, and ordinary create/edit.");
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());

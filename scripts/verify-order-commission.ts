import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { prisma } from "../lib/prisma";
import { createOrderSchema } from "../lib/validation/orders";

async function main() {
  const url = new URL(process.env.DATABASE_URL ?? "");
  assert.equal(url.hostname, "127.0.0.1");
  assert.equal(url.port, "55439");
  assert.equal(url.pathname, "/order_revamp_verify");
  require("next/cache").revalidatePath = () => {};
  const { createOrder, updateOrder, lockOrder, finalizeOrder, getOrder, listOrders } = await import("../lib/services/orders");
  const vendor = await prisma.vendor.findFirstOrThrow();
  const schools = await prisma.school.findMany({ where: { schoolCode: { startsWith: "PT" } }, take: 2 });
  assert.equal(schools.length, 2);
  const item = await prisma.item.findFirstOrThrow({ where: { active: true, obsolete: false } });
  const itemRef = { itemCode: item.itemCode, itemName: item.itemName };
  const sheet1 = {
    orderPlacedDate: "2026-10-24", orderType: "ambiguous",
    billingToType: "individual", billingToName: "Commission verification payer",
    shippingToType: "individual", shippingToName: "Commission verification recipient", shippingToSummary: "Verification address"
  };
  const commission = { commissionEnabled: true, commissionPartyType: "vendor", commissionPartyCode: vendor.vendorCode, commissionPercentage: 7.5 };
  const input = createOrderSchema.parse({ sheet1: { ...sheet1, ...commission }, ambiguousItems: [{ ...itemRef, groupedQuantity: 2 }] });
  const created = await createOrder(input);
  assert.equal(created.commissionPartyCode, vendor.vendorCode);
  assert.equal(created.commissionPercentage?.toString(), "7.5");
  assert.equal((await getOrder(created.orderSheet1Id))?.commissionPartyType, "vendor");
  assert.equal((await listOrders()).find(order => order.orderSheet1Id === created.orderSheet1Id)?.commissionPercentage?.toString(), "7.5");
  const zero = await updateOrder(created.orderSheet1Id, { ...input, sheet1: { ...input.sheet1, commissionPercentage: 0 } });
  assert.equal(zero.commissionPercentage?.toString(), "0");
  const cleared = await updateOrder(created.orderSheet1Id, { ...input, sheet1: { ...input.sheet1, commissionEnabled: false } });
  assert.equal(cleared.commissionPartyType, null);
  assert.equal(cleared.commissionPartyCode, null);
  assert.equal(cleared.commissionPercentage, null);
  const enabled = await updateOrder(created.orderSheet1Id, input);
  assert.equal(enabled.commissionPercentage?.toString(), "7.5");
  await assert.rejects(createOrder({ ...input, sheet1: { ...input.sheet1, commissionPartyCode: "COMMISSION-UNKNOWN" } }), /must exist/);
  const manualInput = { ...input, sheet1: { ...input.sheet1, commissionPartyType: "individual" as const, commissionPartyCode: "External Agent / ABC-42" } };
  const manual = await createOrder(manualInput);
  assert.equal(manual.commissionPartyType, "individual");
  assert.equal((await getOrder(manual.orderSheet1Id))?.commissionPartyCode, "External Agent / ABC-42");
  const manualEdit = await updateOrder(manual.orderSheet1Id, { ...manualInput, sheet1: { ...manualInput.sheet1, commissionPartyCode: "Another external agent", commissionPercentage: 12.5 } });
  assert.equal(manualEdit.commissionPartyCode, "Another external agent");
  assert.equal(manualEdit.commissionPercentage?.toString(), "12.5");
  await assert.rejects(prisma.orderSheet1.update({ where: { orderSheet1Id: created.orderSheet1Id }, data: { commissionPercentage: 101 } }), /order_commission_valid/);

  for (const mode of ["individual", "multiple_schools"] as const) {
    const descriptive = createOrderSchema.parse({
      sheet1: { ...sheet1, ...commission, orderType: "descriptive", descriptiveMode: mode },
      ...(mode === "individual" ? {
        descriptiveRows: [{ schoolCode: schools[0].schoolCode, schoolName: schools[0].schoolName, ...itemRef, quantity: 2 }]
      } : {
        combinedSchools: schools.map(school => ({ schoolCode: school.schoolCode, schoolName: school.schoolName })),
        combinedItems: [{ ...itemRef, pooledQuantity: 3 }]
      })
    });
    const order = await createOrder(descriptive);
    await lockOrder(order.orderSheet1Id);
    const finalized = await finalizeOrder(order.orderSheet1Id);
    assert.equal(finalized.commissionPercentage?.toString(), "7.5");
    assert.equal(finalized.commissionPartyCode, vendor.vendorCode);
  }
  const plain = await createOrder(createOrderSchema.parse({ sheet1, ambiguousItems: [{ ...itemRef, groupedQuantity: 2 }] }));
  assert.equal(plain.commissionPartyCode, null);
  assert.equal(plain.commissionPercentage, null);
  writeFileSync("tmp/order-revamp/commission-fixture.json", JSON.stringify({ orderId: created.orderSheet1Id, vendorCode: vendor.vendorCode }));
  console.log("Passed commission migration, create/read/list/edit, zero, clearing, re-enabling, unknown-reference rejection, database constraints, and descriptive finalization on the disposable database.");
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());

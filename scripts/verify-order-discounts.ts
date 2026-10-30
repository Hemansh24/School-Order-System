import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { prisma } from "../lib/prisma";
import { createOrderSchema } from "../lib/validation/orders";
import { getOrderEnteredDate } from "../lib/order-dates";

async function main() {
  const url = new URL(process.env.DATABASE_URL ?? "");
  assert.equal(url.hostname, "127.0.0.1");
  assert.equal(url.port, "55439");
  assert.equal(url.pathname, "/order_revamp_verify");
  require("next/cache").revalidatePath = () => {};
  const { createOrder, updateOrder, createReorder } = await import("../lib/services/orders");
  const item = await prisma.item.findFirstOrThrow({ where: { active: true, obsolete: false } });
  const school = await prisma.school.findFirstOrThrow();
  const itemRef = { itemCode: item.itemCode, itemName: item.itemName };
  const code = `DISCOUNT-VERIFY-${Date.now()}`;
  const vendor = await prisma.vendor.create({ data: { vendorCode: code, vendorName: "Discount verification bookseller", actualDiscount: "Initial" } });
  const base = createOrderSchema.parse({ sheet1: {
    orderPlacedDate: getOrderEnteredDate(), billingToType: "vendor", billingToCode: code, billingToName: vendor.vendorName,
    shippingToType: "individual", shippingToName: "Party X", shippingToSummary: "Party X address", orderType: "ambiguous", booksellerDiscount: "Y: 30% + 5%"
  }, ambiguousItems: [{ ...itemRef, groupedQuantity: 2 }] });
  const master = async () => (await prisma.vendor.findUniqueOrThrow({ where: { vendorId: vendor.vendorId } })).actualDiscount;
  const x = await createOrder(base);
  assert.equal(x.booksellerDiscount, "Y: 30% + 5%");
  assert.equal(await master(), x.booksellerDiscount);
  const zInput = { ...base, sheet1: { ...base.sheet1, shippingToName: "Party Z", booksellerDiscount: "Z: 40%" } };
  const z = await createOrder(zInput);
  assert.equal(await master(), "Z: 40%");
  const editedX = await updateOrder(x.orderSheet1Id, { ...base, sheet1: { ...base.sheet1, notes: "Unrelated edit" } });
  assert.equal(editedX.booksellerDiscount, "Y: 30% + 5%");
  assert.equal(await master(), "Z: 40%");
  const reorderInput = {
    shipping: { shippingToType: "individual" as const, shippingToCode: "", shippingToName: "Party X again", shippingToSummary: "Reorder address", expectedDeliveryDate: "" },
    descriptiveItems: [], combinedItems: [], ambiguousItems: [{ ...itemRef, groupedQuantity: 3 }]
  };
  const reordered = await createReorder(x.orderSheet1Id, reorderInput);
  assert.equal(reordered.booksellerDiscount, "Y: 30% + 5%");
  assert.equal(reordered.reorderOfOrderId, x.orderSheet1Id);
  assert.notEqual(reordered.orderNo, x.orderNo);
  assert.equal(await master(), "Z: 40%");
  const orderBefore = await prisma.orderSheet1.findUniqueOrThrow({ where: { orderSheet1Id: x.orderSheet1Id } });
  await updateOrder(x.orderSheet1Id, { ...base, sheet1: { ...base.sheet1, booksellerDiscount: undefined } });
  assert.equal(await master(), "Z: 40%");
  assert.equal((await prisma.orderSheet1.findUniqueOrThrow({ where: { orderSheet1Id: x.orderSheet1Id } })).booksellerDiscount, orderBefore.booksellerDiscount);

  const legacy = await createOrder({ ...base, sheet1: { ...base.sheet1, booksellerDiscount: null } });
  const legacyEdit = await updateOrder(legacy.orderSheet1Id, { ...base, sheet1: { ...base.sheet1, booksellerDiscount: undefined } });
  assert.equal(legacyEdit.booksellerDiscount, null);
  assert.equal((await createReorder(legacy.orderSheet1Id, reorderInput)).booksellerDiscount, null);
  assert.equal(await master(), "Z: 40%");

  const blank = await createOrder({ ...base, sheet1: { ...base.sheet1, booksellerDiscount: "" } });
  assert.equal(blank.booksellerDiscount, "");
  assert.equal(await master(), "");
  assert.equal((await createOrder({ ...base, sheet1: { ...base.sheet1, booksellerDiscount: undefined } })).booksellerDiscount, "");
  await updateOrder(z.orderSheet1Id, { ...zInput, sheet1: { ...zInput.sheet1, booksellerDiscount: "Z2" } });
  assert.equal(await master(), "Z2");
  await updateOrder(z.orderSheet1Id, zInput);
  assert.equal(await master(), "Z: 40%");
  assert.equal((await prisma.orderSheet1.findUniqueOrThrow({ where: { orderSheet1Id: x.orderSheet1Id } })).booksellerDiscount, "Y: 30% + 5%");

  const count = await prisma.orderSheet1.count();
  await assert.rejects(() => createOrder(createOrderSchema.parse({
    sheet1: { ...base.sheet1, orderType: "descriptive", descriptiveMode: "individual", booksellerDiscount: "ROLLBACK" },
    descriptiveRows: [{ schoolCode: school.schoolCode, schoolName: school.schoolName, ...itemRef, quantity: 1 }],
    schoolExecutives: [{ schoolCode: school.schoolCode, incumbentCode: "MISSING-DISCOUNT-EXECUTIVE", name: "Missing" }]
  })), /Unknown incumbent code/);
  assert.equal(await master(), "Z: 40%");
  assert.equal(await prisma.orderSheet1.count(), count);

  const fallbackVendor = await prisma.vendor.create({ data: { vendorCode: code + "-FALLBACK", vendorName: "Committed fallback bookseller" } });
  await prisma.preBookseller.create({ data: { pbsCode: code + "-PBS", vendorName: fallbackVendor.vendorName, convertedVendorId: fallbackVendor.vendorId, committedDiscount: "Committed: 25%" } });
  const changedBilling = { ...base, sheet1: { ...base.sheet1, billingToCode: fallbackVendor.vendorCode, billingToName: fallbackVendor.vendorName, booksellerDiscount: undefined } };
  assert.equal((await createOrder(changedBilling)).booksellerDiscount, "Committed: 25%");
  assert.equal((await createOrder({ ...changedBilling, sheet1: { ...changedBilling.sheet1, booksellerDiscount: "Committed: 25%" } })).booksellerDiscount, "Committed: 25%");
  assert.equal((await updateOrder(blank.orderSheet1Id, changedBilling)).booksellerDiscount, "Committed: 25%");
  assert.equal((await prisma.vendor.findUniqueOrThrow({ where: { vendorId: fallbackVendor.vendorId } })).actualDiscount, null);
  await writeFile("tmp/order-discount-browser-fixture.json", JSON.stringify({
    xId: x.orderSheet1Id, zId: z.orderSheet1Id, legacyId: legacy.orderSheet1Id, vendorCode: code,
    fallbackCode: fallbackVendor.vendorCode, xDiscount: x.booksellerDiscount, defaultDiscount: "Z: 40%"
  }));
  console.log("Discount integration passed: Y/Z history, reorders, omitted fields, unknown/blank, default updates, billing changes, committed fallback, and transaction rollback.");
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());

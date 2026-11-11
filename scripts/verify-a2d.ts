import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma";
import { createOrderSchema } from "../lib/validation/orders";
import type { A2DInput } from "../lib/a2d";
import { savedOrderToInput } from "../lib/order-input";
import { normalizeOrderEntry } from "../lib/order-entry";

async function main() {
  const url = new URL(process.env.DATABASE_URL ?? "");
  assert.equal(url.hostname, "127.0.0.1"); assert.equal(url.port, "55439");
  assert.ok(["/order_revamp_verify", "/school_consolidation_verify"].includes(url.pathname));
  require("next/cache").revalidatePath = () => {};
  const { createOrder, updateOrder, getOrder, lockOrder, finalizeOrder } = await import("../lib/services/orders");
  const { convertAmbiguousOrder } = await import("../lib/services/a2d");
  const suffix = String(Date.now());
  const group = await prisma.schoolGroup.create({ data: { groupCode: `GS${suffix}`, groupName: "A2D verification group", sourceType: "GS" } });
  const orgs = await Promise.all([1, 2].map(index => prisma.organisation.create({ data: { prCode: `PR${suffix}${index}`, organisationName: `A2D verification school ${index}`, groupCode: group.groupCode } })));
  const executive = await prisma.executive.create({ data: { incumbentCode: `A2D-${suffix}`, name: "A2D verification executive" } });
  async function source(finalized = false) {
    const order = await createOrder(createOrderSchema.parse({ sheet1: { orderType: "ambiguous", orderPlacedDate: "2026-11-11", sessionYear: "2026-2027", billingToType: "individual", billingToName: "A2D verification payer", shippingToType: "individual", shippingToName: "A2D verification recipient", shippingToSummary: "Saved shipping address", pendingPayment: true, booksellerDiscount: "Saved discount" }, ambiguousItems: [{ itemCode: "A2D-A", itemName: "Verification A", groupedQuantity: 100 }, { itemCode: "A2D-B", itemName: "Verification B", groupedQuantity: 40 }] }));
    if (finalized) { await lockOrder(order.orderSheet1Id); await finalizeOrder(order.orderSheet1Id); await prisma.orderSheet3.updateMany({ where: { orderSheet1Id: order.orderSheet1Id }, data: { transitId: "TRACK-A2D", parts: "Saved parts", paymentReceived: true, plNumber: "Saved PL", cancelOrOnHoldStatus: "on_hold" } }); }
    return (await getOrder(order.orderSheet1Id))!;
  }
  function request(order: Awaited<ReturnType<typeof source>>, rows: A2DInput["rows"], mode: A2DInput["mode"] = "multiple_schools"): A2DInput {
    return { requestId: randomUUID(), expectedUpdatedAt: order.updatedAt.toISOString(), mode, groupCode: mode.endsWith("group") ? group.groupCode : "", schools: orgs.map(org => org.ptCode ?? org.prCode), rows, schoolExecutives: orgs.map((org, index) => ({ schoolCode: org.ptCode ?? org.prCode, incumbentCode: index ? null : executive.incumbentCode, name: index ? "Custom executive" : executive.name, updateDefault: true })) };
  }
  const original = await source(true);
  const partial = request(original, [{ itemCode: "A2D-A", quantity: 60 }]);
  const child = await convertAmbiguousOrder(original.orderSheet1Id, partial);
  assert.notEqual(child.orderNo, original.orderNo); assert.equal(child.orderStatus, "finalized"); assert.equal(child.billingToName, original.billingToName); assert.equal(child.booksellerDiscount, original.booksellerDiscount);
  const saved = (await getOrder(child.orderSheet1Id))!;
  assert.deepEqual(saved.combinedItems.map(row => row.pooledQuantity), [60]); assert.equal(saved.schoolExecutives.length, 2);
  assert.deepEqual(saved.schoolExecutives.map(row => row.name).sort(), [executive.name, "Custom executive"].sort());
  assert.equal(saved.finalRows.length, 1);
  for (const row of saved.finalRows) { assert.equal(row.transitId, "TRACK-A2D"); assert.equal(row.plNumber, "Saved PL"); assert.equal(row.cancelOrOnHoldStatus, "on_hold"); assert.equal(row.paymentReceived, true); }
  const remaining = (await getOrder(original.orderSheet1Id))!;
  assert.deepEqual(remaining.ambiguousItems.map(row => row.groupedQuantity), [40, 40]);
  assert.deepEqual(remaining.finalRows.map(row => row.quantity), [40, 40]);
  assert.equal((await convertAmbiguousOrder(original.orderSheet1Id, partial)).orderSheet1Id, child.orderSheet1Id);
  assert.equal(await prisma.a2DConversion.count({ where: { sourceOrderId: original.orderSheet1Id } }), 1);
  await assert.rejects(() => convertAmbiguousOrder(original.orderSheet1Id, { ...partial, requestId: randomUUID() }), /changed/);
  const freshOrgs = await prisma.organisation.findMany({ where: { id: { in: orgs.map(org => org.id) } }, orderBy: { prCode: "asc" } });
  const before = await prisma.orderSheet1.count();
  await assert.rejects(() => convertAmbiguousOrder(original.orderSheet1Id, request(remaining, [{ itemCode: "UNKNOWN", quantity: 1 }])), /not available/);
  await assert.rejects(() => convertAmbiguousOrder(original.orderSheet1Id, request(remaining, [{ itemCode: "A2D-A", quantity: 41 }, { itemCode: "A2D-B", quantity: 39 }])), /exceeds/);
  assert.equal(await prisma.orderSheet1.count(), before);
  const exact = await convertAmbiguousOrder(original.orderSheet1Id, request(remaining, [{ itemCode: "A2D-A", quantity: 40 }, { itemCode: "A2D-B", quantity: 40 }]));
  assert.equal(exact.orderNo, original.orderNo); assert.equal(exact.orderSheet1Id, original.orderSheet1Id);
  const converted = (await getOrder(exact.orderSheet1Id))!;
  assert.equal(converted.ambiguousItems.length, 0); assert.equal(converted.finalRows.reduce((sum, row) => sum + row.quantity, 0) + saved.finalRows.reduce((sum, row) => sum + row.quantity, 0), 140);
  assert.ok(converted.finalRows.every(row => row.sourceType === "TWO_C2"));
  for (const mode of ["multiple_schools", "multiple_group"] as const) {
    const order = await source();
    const rows = [{ itemCode: "A2D-A", quantity: 100 }, { itemCode: "A2D-B", quantity: 40 }];
    const result = await convertAmbiguousOrder(order.orderSheet1Id, request(order, rows, mode));
    assert.equal(result.orderNo, order.orderNo); assert.equal(result.orderStatus, "draft");
    const input = normalizeOrderEntry(savedOrderToInput((await getOrder(result.orderSheet1Id))!));
    await updateOrder(result.orderSheet1Id, input);
    await lockOrder(result.orderSheet1Id); await finalizeOrder(result.orderSheet1Id);
    const final = (await getOrder(result.orderSheet1Id))!;
    assert.equal(final.schoolExecutives.length, 2); assert.equal(final.finalRows.reduce((sum, row) => sum + row.quantity, 0), 140);
    assert.equal(final.descriptiveRows.length, 0);
  }
  const concurrent = await source();
  const christian = await prisma.schoolGroup.create({ data: { groupCode: `C${suffix}`, groupName: "A2D verification Christian group", sourceType: "CHRISTIAN" } });
  const christianSource = await source();
  const christianRequest = { ...request(christianSource, [{ itemCode: "A2D-A", quantity: 100 }, { itemCode: "A2D-B", quantity: 40 }], "multiple_group"), groupCode: christian.groupCode };
  const christianResult = await convertAmbiguousOrder(christianSource.orderSheet1Id, christianRequest);
  assert.equal(christianResult.endUserGroupCode, christian.groupCode);
  assert.equal((await getOrder(christianResult.orderSheet1Id))!.schoolExecutives.length, 2);
  const concurrentInput = request(concurrent, [{ itemCode: "A2D-A", quantity: 60 }]);
  const results = await Promise.allSettled([convertAmbiguousOrder(concurrent.orderSheet1Id, concurrentInput), convertAmbiguousOrder(concurrent.orderSheet1Id, { ...concurrentInput, requestId: randomUUID() })]);
  assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
  assert.equal((await getOrder(concurrent.orderSheet1Id))!.ambiguousItems.find(row => row.itemCode === "A2D-A")!.groupedQuantity, 40);
  assert.ok(freshOrgs.every(org => org.ptCode));
  console.log("A2D integration checks passed: partial/exact conversion, item restrictions, executives/PT defaults, all allocation modes, edit/finalise, tracking, idempotency and concurrency.");
  console.log(JSON.stringify({ browserSourceId: concurrent.orderSheet1Id, schools: freshOrgs.map(org => ({ schoolCode: org.ptCode, schoolName: org.organisationName })), groupCode: group.groupCode }));
}
main().finally(() => prisma.$disconnect()).catch(error => { console.error(error); process.exitCode = 1; });

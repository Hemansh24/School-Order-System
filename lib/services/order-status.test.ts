import assert from "node:assert/strict";
import { test } from "node:test";
import { prisma } from "../prisma";
import { createOrderSchema } from "../validation/orders";

require("next/cache").revalidatePath = () => {};

test("order lifecycle permits direct finalisation and prevents protected transitions", async t => {
  const { finalizeOrder, updateOrder, updateOrderStatus } = await import("./orders");
  let order: any = {
    orderSheet1Id: 1, orderNo: 123, orderStatus: "pending", classification: "normal",
    orderType: "ambiguous", pendingPayment: true, descriptiveRows: [], combinedSchools: [], combinedItems: [],
    ambiguousItems: [{ orderSheet2B2Id: 2, itemCode: "BOOK", itemName: "Book", groupedQuantity: 5 }]
  };
  const rows: any[] = [];
  const tx = {
    $queryRaw: async () => [],
    orderSheet1: {
      findUnique: async () => order,
      update: async ({ data }: any) => { order = { ...order, ...data }; return order; }
    },
    orderSheet3: { upsert: async ({ create }: any) => { rows.push(create); return create; } }
  };
  t.mock.method(prisma, "$transaction", async (run: any) => run(tx));

  const result = await finalizeOrder(1);
  assert.equal(result.orderStatus, "finalized");
  assert.equal(result.orderNo, 123);
  assert.deepEqual(rows.map(row => [row.sourceType, row.quantity, row.paymentReceived]), [["TWO_B2", 5, false]]);
  await assert.rejects(() => finalizeOrder(1), /Only pending/);
  assert.equal(rows.length, 1);

  const input = createOrderSchema.parse({
    sheet1: {
      orderType: "ambiguous", orderPlacedDate: "2026-11-14", billingToType: "individual",
      billingToName: "Payer", shippingToType: "individual", shippingToName: "Recipient",
      shippingToSummary: "Delivery address"
    },
    ambiguousItems: [{ itemCode: "BOOK", itemName: "Book", groupedQuantity: 5 }]
  });
  for (const status of ["finalized", "dispatched", "cancelled"]) {
    order.orderStatus = status;
    await assert.rejects(() => updateOrder(1, input), /Only pending orders can be edited/);
    await assert.rejects(() => finalizeOrder(1), /Only pending/);
  }
  for (const status of ["finalized", "dispatched"]) {
    order.orderStatus = status;
    await assert.rejects(() => updateOrderStatus(1, "cancelled"), /cannot be changed/);
  }
  order.orderStatus = "pending";
  for (const target of ["pending", "finalized", "dispatched"]) {
    await assert.rejects(() => updateOrderStatus(1, target as any), /Only cancellation/);
  }
  order.ambiguousItems = [];
  await assert.rejects(() => finalizeOrder(1), /require grouped items/);
  assert.equal(order.orderStatus, "pending");
  assert.equal(rows.length, 1);
  order.classification = "group_parent";
  await assert.rejects(() => finalizeOrder(1), /tracking containers/);
});

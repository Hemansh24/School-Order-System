import assert from "node:assert/strict";
import { test } from "node:test";
import type { Prisma } from "@prisma/client";
import { getEndUserTypes } from "./end-user-types";
import { reverseUnusedPtCodesTx } from "./school-code-reversal";

function fixture() {
  const orders = [
    { orderSheet1Id: 1, orderStatus: "draft", sessionYear: "2026-2027", codes: ["PR1"] },
    { orderSheet1Id: 2, orderStatus: "cancelled", sessionYear: "2026-2027", codes: ["PT2"] },
    { orderSheet1Id: 3, orderStatus: "finalized", sessionYear: "2025-2026", codes: ["PT2"] },
    { orderSheet1Id: 4, orderStatus: "draft", sessionYear: "2027-2028", codes: ["PT3"] }
  ];
  const db = {
    organisation: { findMany: async () => [{ prCode: "PR1", ptCode: "PT1" }] },
    ptCodeUsageHistory: { findMany: async () => [{ ptCode: "PT4", sessionYear: "2026-2027" }] },
    orderSheet1: { findMany: async ({ where }: { where: {
      orderStatus: { not: string }; sessionYear: { lt: string }; orderSheet1Id?: { not: number }
    } }) => orders.filter(order => order.orderStatus !== where.orderStatus.not
      && order.sessionYear < where.sessionYear.lt && order.orderSheet1Id !== where.orderSheet1Id?.not)
      .map(order => ({ ...order, billingToType: "individual", billingToCode: null,
        shippingToType: "individual", shippingToCode: null,
        descriptiveRows: order.codes.map(schoolCode => ({ schoolCode })),
        ambiguousSchools: [], combinedSchools: [], groupParticipants: [] })) }
  } as unknown as Prisma.TransactionClient;
  return db;
}

test("combines imported history and local orders, excludes cancelled orders and resolves PR aliases", async () => {
  const types = await getEndUserTypes(["PT1", "PR1", "PT2", "PT3", "PT4", "PR9"], "2027-2028", undefined, fixture());
  assert.deepEqual(types.PT1, { ptCode: "PT1", type: "old" });
  assert.deepEqual(types.PR1, types.PT1);
  assert.equal(types.PT2.type, "gap");
  assert.equal(types.PT3.type, "new");
  assert.equal(types.PT4.type, "old");
  assert.deepEqual(types.PR9, { ptCode: null, type: "new" });
});

test("editing to a later session does not count the order being edited as previous usage", async () => {
  const types = await getEndUserTypes(["PT1"], "2027-2028", 1, fixture());
  assert.equal(types.PT1.type, "new");
});

test("missing session and empty selections need no history read; database errors propagate", async () => {
  const brokenDb = {} as Prisma.TransactionClient;
  assert.deepEqual(await getEndUserTypes([], "2027-2028", undefined, brokenDb), {});
  assert.deepEqual(await getEndUserTypes(["PT1"], "", undefined, brokenDb), { PT1: { ptCode: null, type: null } });
  await assert.rejects(() => getEndUserTypes(["PT1"], "2027-2028", undefined, brokenDb));
});

test("cancelling the last local order preserves PT codes with imported history", async () => {
  const db = {
    organisation: { findMany: async () => [{ ptCode: "PT1", prCode: "PR1" }] },
    ptCodeUsageHistory: { findFirst: async () => ({ ptCode: "PT1" }) }
  } as unknown as Prisma.TransactionClient;
  // Any attempt to reverse the code or look for further orders would fail on this fixture.
  await reverseUnusedPtCodesTx(db, ["PT1"]);
});

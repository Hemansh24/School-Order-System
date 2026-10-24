import assert from "node:assert/strict";
import { test } from "node:test";
import type { Prisma } from "@prisma/client";
import { createOrderSchema } from "../validation/orders";
import { resolveCommissionData } from "./order-commission";

function input(type: "school" | "vendor" | "group" = "vendor", code = "BS001") {
  return createOrderSchema.parse({ sheet1: {
    orderPlacedDate: "2026-10-24", orderType: "ambiguous",
    billingToType: "individual", billingToName: "Payer",
    shippingToType: "individual", shippingToName: "Recipient", shippingToSummary: "Address",
    commissionEnabled: true, commissionPartyType: type, commissionPartyCode: code, commissionPercentage: 7.5
  }, ambiguousItems: [{ itemCode: "ITEM1", itemName: "Book", groupedQuantity: 1 }] }).sheet1;
}

test("commission validates every existing party type and rejects unknown codes", async () => {
  for (const [type, model, method] of [["school", "school", "findUnique"], ["vendor", "vendor", "findFirst"], ["group", "schoolGroup", "findUnique"]] as const) {
    let calls = 0;
    const tx = { [model]: { [method]: async () => { calls++; return { id: 1 }; } } } as unknown as Prisma.TransactionClient;
    assert.deepEqual(await resolveCommissionData(tx, input(type)), { commissionPartyType: type, commissionPartyCode: "BS001", commissionPercentage: 7.5 });
    assert.equal(calls, 1);
    const missing = { [model]: { [method]: async () => null } } as unknown as Prisma.TransactionClient;
    await assert.rejects(resolveCommissionData(missing, input(type)), /must exist/);
  }
});

test("unchanged historical parties can be retained; changed identities must exist", async () => {
  const tx = { schoolGroup: { findUnique: async () => null } } as unknown as Prisma.TransactionClient;
  const saved = { commissionPartyType: "vendor", commissionPartyCode: "BS001" };
  assert.equal((await resolveCommissionData(tx, input(), saved)).commissionPercentage, 7.5);
  await assert.rejects(resolveCommissionData(tx, input("group"), saved), /must exist/);
  assert.deepEqual(await resolveCommissionData(tx, { ...input(), commissionEnabled: false }, saved), {
    commissionPartyType: null, commissionPartyCode: null, commissionPercentage: null
  });
});

test("existing GS locations can be commissioned parties", async () => {
  const tx = {
    schoolGroup: { findUnique: async () => null },
    schoolGroupLocation: { findFirst: async ({ where }: { where: unknown }) => {
      assert.deepEqual(where, { subCode: "1", schoolGroup: { groupCode: "GS001" } });
      return { schoolGroupLocationId: 1 };
    } }
  } as unknown as Prisma.TransactionClient;
  assert.equal((await resolveCommissionData(tx, input("group", "GS001-1"))).commissionPartyCode, "GS001-1");
});

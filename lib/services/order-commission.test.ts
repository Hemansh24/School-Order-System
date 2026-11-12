import assert from "node:assert/strict";
import { test } from "node:test";
import type { Prisma } from "@prisma/client";
import { createOrderSchema } from "../validation/orders";
import { resolveCommissionData } from "./order-commission";
const emptyBookseller = { commissionBooksellerExecutiveId: null, commissionPartyName: null, commissionPbsCode: null };

function input(type: "school" | "vendor" | "group" | "individual" | "executive" = "vendor", code = "BS001") {
  return createOrderSchema.parse({ sheet1: {
    orderPlacedDate: "2026-10-24", orderType: "ambiguous",
    billingToType: "individual", billingToName: "Payer",
    shippingToType: "individual", shippingToName: "Recipient", shippingToSummary: "Address",
    commissionEnabled: true, commissionPartyType: type, commissionPartyCode: code, commissionPercentage: 7.5
  }, ambiguousItems: [{ itemCode: "ITEM1", itemName: "Book", groupedQuantity: 1 }] }).sheet1;
}

test("manual names and codes save without querying existing parties", async () => {
  const tx = {} as Prisma.TransactionClient;
  const manual = input("individual", "  External Agent / ABC-42  ");
  const expected = { ...emptyBookseller, commissionPartyType: "individual", commissionPartyCode: "External Agent / ABC-42", commissionPercentage: 7.5 };
  assert.deepEqual(await resolveCommissionData(tx, manual), expected);
  assert.deepEqual(await resolveCommissionData(tx, { ...manual, commissionPartyType: undefined }), expected);
  assert.deepEqual(await resolveCommissionData(tx, { ...manual, commissionPartyCode: "Another agent" }), { ...expected, commissionPartyCode: "Another agent" });
  await assert.rejects(resolveCommissionData(tx, { ...manual, commissionPartyCode: " " }), /name or code/);
});

test("commission validates every existing party type and rejects unknown codes", async () => {
  for (const [type, model, method] of [["school", "organisation", "findMany"], ["vendor", "vendor", "findFirst"], ["group", "schoolGroup", "findUnique"]] as const) {
    let calls = 0;
    const tx = { [model]: { [method]: async () => { calls++; return model === "organisation" ? [{ id: 1 }] : { id: 1 }; } } } as unknown as Prisma.TransactionClient;
    assert.deepEqual(await resolveCommissionData(tx, input(type)), { ...emptyBookseller, commissionPartyType: type, commissionPartyCode: "BS001", commissionPercentage: 7.5 });
    assert.equal(calls, 1);
    const missing = { [model]: { [method]: async () => model === "organisation" ? [] : null } } as unknown as Prisma.TransactionClient;
    await assert.rejects(resolveCommissionData(missing, input(type)), /must exist/);
  }
});

test("unchanged historical parties can be retained; changed identities must exist", async () => {
  const tx = { schoolGroup: { findUnique: async () => null } } as unknown as Prisma.TransactionClient;
  const saved = { commissionPartyType: "vendor", commissionPartyCode: "BS001" };
  assert.equal((await resolveCommissionData(tx, input(), saved)).commissionPercentage, 7.5);
  await assert.rejects(resolveCommissionData(tx, input("group"), saved), /must exist/);
  assert.deepEqual(await resolveCommissionData(tx, { ...input(), commissionEnabled: false }, saved), {
    ...emptyBookseller, commissionPartyType: null, commissionPartyCode: null, commissionPercentage: null
  });
});

test("executive commission validates incumbent codes and preserves historical selections", async () => {
  const tx = { executive: { findUnique: async ({ where }: { where: unknown }) => {
    assert.deepEqual(where, { incumbentCode: "IN001" });
    return { incumbentCode: "IN001" };
  } } } as unknown as Prisma.TransactionClient;
  const selection = input("executive", "IN001");
  const expected = { ...emptyBookseller, commissionPartyType: "executive", commissionPartyCode: "IN001", commissionPercentage: 7.5 };
  assert.deepEqual(await resolveCommissionData(tx, selection), expected);
  const missing = { executive: { findUnique: async () => null } } as unknown as Prisma.TransactionClient;
  await assert.rejects(resolveCommissionData(missing, selection), /must exist/);
  assert.deepEqual(await resolveCommissionData(missing, selection, expected), expected);
  await assert.rejects(resolveCommissionData(missing, input("executive", "IN002"), expected), /must exist/);
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

test("bookseller commission validates record identity and takes its snapshot from the database", async () => {
  const selection = { ...input(), commissionPartyType: "bookseller_executive" as const, commissionPartyCode: "BI000009",
    commissionBooksellerExecutiveId: 9, commissionPartyName: "Forged", commissionPbsCode: "Wrong" };
  const tx = { booksellerExecutive: { findUnique: async ({ where }: { where: unknown }) => {
    assert.deepEqual(where, { booksellerExecutiveId: 9 });
    return { incumbentCode: "BI000009", name: "Deepak", pbsCode: "PBS00008" };
  } } } as unknown as Prisma.TransactionClient;
  const expected = { commissionPartyType: "bookseller_executive", commissionPartyCode: "BI000009", commissionPercentage: 7.5,
    commissionBooksellerExecutiveId: 9, commissionPartyName: "Deepak", commissionPbsCode: "PBS00008" };
  assert.deepEqual(await resolveCommissionData(tx, selection), expected);
  const missing = { booksellerExecutive: { findUnique: async () => null } } as unknown as Prisma.TransactionClient;
  await assert.rejects(resolveCommissionData(missing, selection), /must exist/);
  await assert.rejects(resolveCommissionData(tx, { ...selection, commissionPartyCode: "BI000010" }), /must exist/);
  await assert.rejects(resolveCommissionData(tx, { ...selection, commissionBooksellerExecutiveId: undefined }), /Select a bookseller/);
  // Unchanged saved selections retain the snapshot even after a directory change or deletion.
  assert.deepEqual(await resolveCommissionData({} as Prisma.TransactionClient, { ...selection, commissionPercentage: 0 }, expected), { ...expected, commissionPercentage: 0 });
  await assert.rejects(resolveCommissionData(missing, { ...selection, commissionBooksellerExecutiveId: 10 }, expected), /must exist/);
  assert.deepEqual(await resolveCommissionData({} as Prisma.TransactionClient, { ...selection, commissionEnabled: false }, expected), {
    ...emptyBookseller, commissionPartyType: null, commissionPartyCode: null, commissionPercentage: null
  });
  assert.deepEqual(await resolveCommissionData({} as Prisma.TransactionClient, input("individual", "Other"), expected), {
    ...emptyBookseller, commissionPartyType: "individual", commissionPartyCode: "Other", commissionPercentage: 7.5
  });
});

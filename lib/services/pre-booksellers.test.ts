import assert from "node:assert/strict";
import { test } from "node:test";
import type { Prisma } from "@prisma/client";
import { nextBsCode, sameBsCode } from "../bs-codes";
import { conversionCode } from "./pre-booksellers";

test("BS allocation includes location suffixes, duplicate suffixes, and historical formats", () => {
  assert.equal(nextBsCode(["BS00878-1", "BS00002-1-02", "BS-00900", "VEN-99999"]), "BS00901");
  assert.equal(sameBsCode("BS00003", "BS00003-2-02"), true);
  assert.equal(sameBsCode("BS00003", "BS00030-1"), false);
});

function database(vendors: object[], prospects: object[]) {
  return {
    vendor: { findMany: async () => vendors },
    preBookseller: { findMany: async () => prospects }
  } as unknown as Prisma.TransactionClient;
}
const prospect = { preBooksellerId: 1, pbsCode: "PBS00597", sourceBsCode: null as string | null };

test("new conversions reserve source and assigned codes as well as imported vendor locations", async () => {
  const result = await conversionCode(database([{ vendorCode: "BS00878-1" }], [
    { preBooksellerId: 2, sourceBsCode: "BS00910", assignedBsCode: null },
    { preBooksellerId: 3, sourceBsCode: null, assignedBsCode: "BS00920" }
  ]), prospect);
  assert.deepEqual(result, { bsCode: "BS00921", conflict: null });
});

test("explicit source mapping is preserved rather than derived from PBS digits", async () => {
  assert.deepEqual(await conversionCode(database([], []), { ...prospect, sourceBsCode: "BS00628" }), {
    bsCode: "BS00628", conflict: null
  });
});

test("conversion blocks an existing location, an existing PBS identity, and another prospect's reservation", async () => {
  const record = { ...prospect, sourceBsCode: "BS00628" };
  for (const vendor of [
    { vendorCode: "BS00628-1" },
    { vendorCode: "OTHER", booksellerCode: "BS00628" },
    { vendorCode: "BS00999", preVendorCode: prospect.pbsCode }
  ]) {
    assert.match((await conversionCode(database([vendor], []), record)).conflict!, /already exists/);
  }
  assert.match((await conversionCode(database([], [{ preBooksellerId: 2, sourceBsCode: "BS00628" }]), record)).conflict!, /reserved/);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import type { Prisma } from "@prisma/client";
import { nextVendorCode } from "./reference-codes";

function database(vendors: object[], prospects: object[] = []) {
  return {
    vendor: { findMany: async () => vendors },
    preBookseller: { findMany: async () => prospects }
  } as unknown as Prisma.TransactionClient;
}

test("Create Vendor starts the BS sequence independently of legacy VEN codes", async () => {
  assert.equal(await nextVendorCode(database([])), "BS00001");
  assert.equal(await nextVendorCode(database([{ vendorCode: "VEN-99999" }])), "BS00001");
});

test("Create Vendor continues after imported BS locations and bookseller codes", async () => {
  assert.equal(await nextVendorCode(database([
    { vendorCode: "BS00878-1" },
    { vendorCode: "BS00002-1-02" },
    { vendorCode: "BS-00900" },
    { vendorCode: "VEN-99999", booksellerCode: "BS00910" }
  ])), "BS00911");
});

test("Create Vendor respects source and assigned PBS reservations and advances after saving", async () => {
  const vendors = [{ vendorCode: "BS00878-1" }];
  const db = database(vendors, [
    { sourceBsCode: "BS00910", assignedBsCode: null },
    { sourceBsCode: null, assignedBsCode: "BS00920" }
  ]);
  const code = await nextVendorCode(db);
  assert.equal(code, "BS00921");
  vendors.push({ vendorCode: code });
  assert.equal(await nextVendorCode(db), "BS00922");
});

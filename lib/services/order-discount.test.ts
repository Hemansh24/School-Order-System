import assert from "node:assert/strict";
import { test } from "node:test";
import type { Prisma } from "@prisma/client";
import { defaultBooksellerDiscount } from "../bookseller-discount";
import { sheet1Schema } from "../validation/orders";
import { resolveOrderDiscount } from "./order-discount";

const sheet = (booksellerDiscount?: string | null) => sheet1Schema.parse({
  orderPlacedDate: "2026-10-30", orderType: "ambiguous", billingToType: "vendor", billingToCode: "BS1", billingToName: "Bookseller",
  shippingToType: "individual", shippingToName: "Recipient", shippingToSummary: "Address", booksellerDiscount
});
function database(actualDiscount: string | null, committed: Record<string, unknown>[] = []) {
  const writes: string[] = [];
  const tx = {
    vendor: {
      findUnique: async () => ({ vendorId: 1, vendorCode: "BS1", preVendorCode: "PBS1", actualDiscount }),
      update: async ({ data }: { data: { actualDiscount: string } }) => { writes.push(data.actualDiscount); }
    },
    preBookseller: { findMany: async () => committed }
  } as unknown as Prisma.TransactionClient;
  return { tx, writes };
}

test("order discount validates free text while distinguishing blank, unknown, and omitted", () => {
  assert.equal(sheet("  30% + 5%  ").booksellerDiscount, "30% + 5%");
  assert.equal(sheet("").booksellerDiscount, "");
  assert.equal(sheet(null).booksellerDiscount, null);
  assert.equal(sheet().booksellerDiscount, undefined);
  assert.throws(() => sheet("x".repeat(501)));
});

test("unchanged and omitted saved discounts never query or rewrite the bookseller default", async () => {
  const noDatabase = {} as Prisma.TransactionClient;
  for (const booksellerDiscount of ["Y", "", null]) {
    const current = { billingToType: "vendor", billingToCode: "BS1", booksellerDiscount };
    assert.equal(await resolveOrderDiscount(noDatabase, sheet(booksellerDiscount), current), booksellerDiscount);
    assert.equal(await resolveOrderDiscount(noDatabase, sheet(), current), booksellerDiscount);
  }
});

test("explicit changes update the default, including an explicit blank", async () => {
  for (const submitted of ["Y", ""]) {
    const { tx, writes } = database("Z");
    assert.equal(await resolveOrderDiscount(tx, sheet(submitted)), submitted);
    assert.deepEqual(writes, [submitted]);
  }
});

test("omitted new-order discount captures actual or committed default without writing it", async () => {
  const { tx, writes } = database(null, [
    { sourceBsCode: "BS1", committedDiscount: "Source fallback" },
    { convertedVendorId: 1, committedDiscount: "Converted mapping" }
  ]);
  assert.equal(await resolveOrderDiscount(tx, sheet()), "Converted mapping");
  assert.deepEqual(writes, []);
  assert.equal(defaultBooksellerDiscount("", "Committed"), "");
  assert.equal(defaultBooksellerDiscount(null, "Committed"), "Committed");
});

test("unknown and non-bookseller orders never borrow or change a bookseller default", async () => {
  const noDatabase = {} as Prisma.TransactionClient;
  assert.equal(await resolveOrderDiscount(noDatabase, sheet(null)), null);
  assert.equal(await resolveOrderDiscount(noDatabase, { ...sheet("Y"), billingToType: "school" }), null);
});

test("accepting an unchanged committed suggestion does not overwrite its source", async () => {
  const { tx, writes } = database(null, [{ convertedVendorId: 1, committedDiscount: "Committed: 25%" }]);
  assert.equal(await resolveOrderDiscount(tx, sheet("Committed: 25%")), "Committed: 25%");
  assert.deepEqual(writes, []);
});

test("switching bookseller on an older caller resolves the newly selected bookseller", async () => {
  const { tx, writes } = database("New vendor default");
  const current = { billingToType: "vendor", billingToCode: "BS0", booksellerDiscount: "Old vendor discount" };
  assert.equal(await resolveOrderDiscount(tx, sheet(), current), "New vendor default");
  assert.deepEqual(writes, []);
});

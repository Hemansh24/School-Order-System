import assert from "node:assert/strict";
import test from "node:test";
import { createVendorSchema } from "./reference";

const vendor = { vendorCode: "BS1", vendorName: "Bookseller" };
test("vendor links accept decimal organisation IDs without losing BigInt precision and deduplicate", () => {
  assert.deepEqual(createVendorSchema.parse({ ...vendor,
    organisationIds: ["9007199254740993", "9007199254740993", "2"]
  }).organisationIds, [BigInt("9007199254740993"), BigInt("2")]);
  assert.deepEqual(createVendorSchema.parse({ ...vendor, organisationIds: [] }).organisationIds, []);
});
test("vendor links reject invalid or numeric organisation IDs", () => {
  for (const id of ["0", "-1", "1.5", "1e3", "", "abc", 9007199254740992]) {
    assert.equal(createVendorSchema.safeParse({ ...vendor, organisationIds: [id] }).success, false);
  }
});

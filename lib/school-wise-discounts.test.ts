import assert from "node:assert/strict";
import test from "node:test";
import { parseSchoolDiscountRows, schoolDiscountHeaders } from "./school-wise-discounts";

test("preserves literal discounts, codes, whitespace, and missing trailing fields", () => {
  const discounts = ["33.2%(183.70)", "40.9%(162.5)", "-", "0", "0%", "34.90%", "", " 35% "];
  const rows = discounts.map(discount => ["PR001", "PT0001", "School", "District", "State", "BS00312 (2)", "Seller", discount]);
  const parsed = parseSchoolDiscountRows([schoolDiscountHeaders, ...rows]);
  assert.deepEqual(parsed.map(row => row.discount), discounts.map(value => value || null));
  assert.equal(parsed[0].billingToWhom, "BS00312 (2)");
  assert.equal(parsed[0].ptCode, "PT0001");
  assert.equal(parsed[0].groupName, null);
});

test("retains source row identity across blanks and duplicate school codes", () => {
  const parsed = parseSchoolDiscountRows([schoolDiscountHeaders, ["PR1"], [], ["PR1"]]);
  assert.deepEqual(parsed.map(row => row.sourceRow), [2, 4]);
});

test("rejects invalid headers, unformatted numbers, empty sources, and extra columns", () => {
  assert.throws(() => parseSchoolDiscountRows([["wrong"]]), /headers/);
  assert.throws(() => parseSchoolDiscountRows([schoolDiscountHeaders, ["PR1", 0.35]]), /formatted/);
  assert.throws(() => parseSchoolDiscountRows([schoolDiscountHeaders]), /No school/);
  assert.throws(() => parseSchoolDiscountRows([schoolDiscountHeaders, [...Array(10).fill(""), "extra"]]), /extra columns/);
});

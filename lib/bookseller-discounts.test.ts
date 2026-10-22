import assert from "node:assert/strict";
import test from "node:test";
import { assignDiscountVendorCodes, matchDiscountRows, parseDiscountRows, type DiscountRow } from "./bookseller-discounts";

const row = (sourceRow: number, actualDiscount: string | null = null): DiscountRow => ({ booksellerCode: "BS00063", booksellerSubCode: "1", sourceRow, actualDiscount });
test("preserves qualified discounts and maps blanks to null", () => {
  const header = Array(18).fill(""); header[2] = "Bookseller Code"; header[3] = "2_Bookseller Sub Code"; header[17] = "Actual Discount";
  const values = ["33.50%", "45% Gross", "Rs 33.50%", " "].map(discount => { const cells = Array(18).fill(""); cells[2] = "BS1"; cells[3] = "1"; cells[17] = discount; return cells; });
  assert.deepEqual(parseDiscountRows([header, ...values]).map(row => row.actualDiscount), ["33.50%", "45% Gross", "Rs 33.50%", null]);
  assert.throws(() => parseDiscountRows([]), /headers/);
});
test("duplicates require source row identity even when their discounts agree", () => {
  assert.equal(matchDiscountRows([row(78), row(79)], [row(79), row(78)]).matched.length, 2);
  assert.throws(() => matchDiscountRows([row(78), row(79)], [row(80), row(81)]), /Ambiguous/);
});
test("unmatched source rows are reported and null clears a matched discount", () => {
  assert.equal(matchDiscountRows([row(2)], []).unmatched.length, 1);
  assert.equal(matchDiscountRows([row(2)], [row(3, "45%")]).matched[0].source.actualDiscount, null);
});
test("legacy row numbers resolve through address and incumbent identity", () => {
  const first = { ...row(78), address01: "Address A", incumbentCode: "BI1" };
  const second = { ...row(79), address01: "Address B", incumbentCode: "x" };
  const result = matchDiscountRows([first, second], [{ ...first, sourceRow: 2222 }]);
  assert.equal(result.matched.length, 1);
  assert.equal(result.unmatched[0].sourceRow, 79);
});
test("vendor mapping follows existing name sort and duplicate suffixes", () => {
  const input = [{ booksellerCode: "BS1", booksellerSubCode: "1", booksellerName: "Z" }, { booksellerCode: "BS1", booksellerSubCode: "1", booksellerName: "A" }];
  assert.deepEqual(assignDiscountVendorCodes(input).map(row => row.vendorCode), ["BS1-1", "BS1-1-02"]);
});

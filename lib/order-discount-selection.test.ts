import assert from "node:assert/strict";
import test from "node:test";
import { discountEndUserCodes, selectSchoolDiscount } from "./order-discount-selection";

const row = (prCode: string, discount: string | null, billingToWhom = "BS001-2", sourceRow = 2) =>
  ({ prCode, ptCode: `PT${prCode.slice(2)}`, discount, billingToWhom, sourceRow });

test("matches PT/PR aliases and corresponding billing subcode", () => {
  const rows = [row("PR1", "35%", "BS001 (2)")];
  assert.equal(selectSchoolDiscount(rows, [["PR1", "PT1"]], ["bs001-2"]), "35%");
  assert.equal(selectSchoolDiscount(rows, [["PT1"]], ["BS001-2"]), "35%");
  assert.equal(selectSchoolDiscount(rows, [["PT1"]], ["BS001"]), null);
  assert.equal(selectSchoolDiscount(rows, [["PT1"]], ["BS001-3"]), null);
  assert.equal(selectSchoolDiscount([row("PR1", "25%", "PT9")], [["PR1"]], ["PR9", "PT9"]), "25%");
});

test("majority counts each school once; ties follow selected school order", () => {
  const rows = [row("PR1", "35%"), row("PR2", "40%"), row("PR3", "40%")];
  assert.equal(selectSchoolDiscount(rows, [["PR1"], ["PR2"], ["PR3"]], ["BS001-2"]), "40%");
  assert.equal(selectSchoolDiscount(rows, [["PR1", "PT1"], ["PT1"], ["PR2"]], ["BS001-2"]), "35%");
  assert.equal(selectSchoolDiscount(rows, [["PR2"], ["PR1"]], ["BS001-2"]), "40%");
});

test("skips blanks, dash, and unmatched schools but preserves literal qualified and zero values", () => {
  const rows = [row("PR1", "-"), row("PR2", null), row("PR3", ""), row("PR4", "0"), row("PR5", "33.2%(183.70)")];
  assert.equal(selectSchoolDiscount(rows, [["PR1"], ["PR2"], ["PR3"], ["PR99"]], ["BS001-2"]), null);
  assert.equal(selectSchoolDiscount(rows, [["PR1"], ["PR4"]], ["BS001-2"]), "0");
  assert.equal(selectSchoolDiscount(rows, [["PR5"], ["PR4"]], ["BS001-2"]), "33.2%(183.70)");
  assert.equal(selectSchoolDiscount([row("PR1", "35%"), row("PR2", "35.00%")], [["PR2"], ["PR1"]], ["BS001-2"]), "35.00%");
});

test("extracts ordered end users across pooled, allocated, and ambiguous orders", () => {
  const input = { sheet1: { orderType: "descriptive", descriptiveMode: "allocated_group" },
    descriptiveRows: [{ schoolCode: "PR2" }, { schoolCode: "PR1" }, { schoolCode: "PR2" }], combinedSchools: [{ schoolCode: "PR3" }] };
  assert.deepEqual(discountEndUserCodes(input), ["PR2", "PR1"]);
  assert.deepEqual(discountEndUserCodes({ ...input, sheet1: { ...input.sheet1, descriptiveMode: "multiple_group" } }), ["PR3"]);
  assert.deepEqual(discountEndUserCodes({ ...input, sheet1: { orderType: "ambiguous" } }), []);
});

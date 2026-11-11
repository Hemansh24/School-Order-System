import assert from "node:assert/strict";
import { test } from "node:test";
import { parseBooksellerExecutiveRows } from "./bookseller-executive-import";

const header = ["Pre_BS_Code", "Incumbent Code", "Name", "Designation", "Contact 1", "Contact 2", "mail id", "Aadhaar Card no."];
test("bookseller executive import preserves repeated codes, source rows and all contact variants", () => {
  const first = ["PBS00001", "BI000001", " First ", "Owner", "0012345678", "9876543210 / 8765432109", "first@example.test\nother@example.test", "NA"];
  const second = ["PBS00002", "BI000001", "Different person", null, "6.88E+34"];
  const records = parseBooksellerExecutiveRows([header, first, [], second, first]);
  assert.equal(records.length, 3);
  assert.deepEqual(records.map(row => row.sourceSheetRow), [2, 4, 5]);
  assert.equal(records[0].contact1, "0012345678");
  assert.equal(records[0].contact2, first[5]);
  assert.equal(records[0].email, first[6]);
  assert.equal(records[0].aadhaarCardNo, "NA");
  assert.deepEqual(records[0].sourceValues, first);
  assert.equal(records[1].contact1, "6.88E+34");
  assert.equal(records[1].email, null);
  assert.equal(records[1].name, "Different person");
});

test("bookseller executive import fails before writing malformed or incomplete input", () => {
  assert.throws(() => parseBooksellerExecutiveRows({ values: [] }), /JSON array/);
  assert.throws(() => parseBooksellerExecutiveRows([header, ["PBS00001", {}]]), /plain cell/);
  assert.throws(() => parseBooksellerExecutiveRows([["Name"]]), /Missing column/);
  assert.throws(() => parseBooksellerExecutiveRows([header, ["PBS00001", "BI000001"]]), /Row 2/);
  assert.throws(() => parseBooksellerExecutiveRows([header, []]), /No bookseller/);
});

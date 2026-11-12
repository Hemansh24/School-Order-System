import assert from "node:assert/strict";
import { test } from "node:test";
import { parseBooksellerExecutiveRows } from "./bookseller-executive-import";

const header = ["Pre_BS_Code", "Incumbent Code", "Name", "Designation", "Contact 1", "Contact 2", "mail id"];
test("bookseller executive import keeps the first row per BI code even when later names or PBS codes differ", () => {
  const first = ["PBS00001", "BI000001", " First ", "Owner", "0012345678", "9876543210 / 8765432109", "first@example.test\nother@example.test"];
  const second = ["PBS00002", "BI000001", "Different person", null, "6.88E+34"];
  const records = parseBooksellerExecutiveRows([header, first, [], second, first]);
  assert.equal(records.length, 1);
  assert.deepEqual(records.map(row => row.sourceSheetRow), [2]);
  assert.equal(records[0].contact1, "0012345678");
  assert.equal(records[0].contact2, first[5]);
  assert.equal(records[0].email, first[6]);
  assert.deepEqual(records[0].sourceValues, first);
  assert.equal(records[0].name, "First");
  assert.equal(records[0].pbsCode, "PBS00001");
  const unique = parseBooksellerExecutiveRows([header, first, [], second, ["PBS00003", "BI000003", "Unique", null, "6.88E+34"]]);
  assert.deepEqual(unique.map(row => row.sourceSheetRow), [2, 5]);
  assert.equal(unique[1].contact1, "6.88E+34");
  assert.equal(unique[1].email, null);
});

test("bookseller executive import fails before writing malformed or incomplete input", () => {
  assert.throws(() => parseBooksellerExecutiveRows({ values: [] }), /JSON array/);
  assert.throws(() => parseBooksellerExecutiveRows([header, ["PBS00001", {}]]), /plain cell/);
  assert.throws(() => parseBooksellerExecutiveRows([["Name"]]), /Missing column/);
  assert.throws(() => parseBooksellerExecutiveRows([header, ["PBS00001", "BI000001"]]), /Row 2/);
  assert.throws(() => parseBooksellerExecutiveRows([header, []]), /No bookseller/);
});

test("bookseller executive import omits the removed field even from legacy snapshots", () => {
  const records = parseBooksellerExecutiveRows([[...header, "Aadhaar Card no."],
    ["PBS00001", "BI000001", "New name", "Owner", "0012345678", null, "new@example.test", "obsolete"]]);
  assert.equal("aadhaarCardNo" in records[0], false);
  assert.equal(records[0].name, "New name");
  assert.equal(records[0].sourceValues.length, 7);
  assert.deepEqual(records[0].sourceValues, ["PBS00001", "BI000001", "New name", "Owner", "0012345678", null, "new@example.test"]);
});

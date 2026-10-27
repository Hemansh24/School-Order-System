import assert from "node:assert/strict";
import { test } from "node:test";
import { parseExecutiveRows } from "./executive-import";

const header = ["S.No.", "Mobile No.", "Employees/Directors", "Incumbent Code", "Email. Id", "Base Location"];
const row = ["1", "0012345678", " Executive One ", "in001", "one@example.test", "Delhi"];
test("executive import handles title row, blanks, text phone numbers and repeated identical records", () => {
  assert.deepEqual(parseExecutiveRows([["Title"], header, row, [], row]), [{
    incumbentCode: "IN001", name: "Executive One", mobile: "0012345678", email: "one@example.test", baseLocation: "Delhi"
  }]);
});
test("executive import validates headers, empty input, incomplete rows and conflicting duplicates", () => {
  assert.throws(() => parseExecutiveRows([row]), /header/);
  assert.throws(() => parseExecutiveRows([header]), /No executive/);
  assert.throws(() => parseExecutiveRows([header, ["1", "", "Name"]]), /Row 2/);
  assert.throws(() => parseExecutiveRows([header, row, [...row.slice(0, 2), "Different", ...row.slice(3)]]), /Row 3.*duplicate/);
});

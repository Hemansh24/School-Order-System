import assert from "node:assert/strict";
import { test } from "node:test";
import { applyExecutiveToSelectedSchools } from "./school-executives";

const executive = { incumbentCode: "INC001", name: "Selected Executive" };
const schools = [
  { schoolCode: "PT101", schoolName: "Visible School" },
  { schoolCode: "PR202", schoolName: "School hidden by the search filter" }
];

test("bulk assignment covers every selected school, including PR schools and filtered-out schools", () => {
  const assignments = applyExecutiveToSelectedSchools([], schools, executive);
  assert.equal(assignments.length, 2);
  for (const school of schools) {
    assert.deepEqual(assignments.find(row => row.schoolCode === school.schoolCode), {
      schoolCode: school.schoolCode, ...executive, updateDefault: true
    });
  }
});

test("replaces selected assignments while leaving other schools and original inputs intact", () => {
  const previous = [
    { schoolCode: "PT101", incumbentCode: "OLD", name: "Previous Executive", updateDefault: false },
    { schoolCode: "PT999", incumbentCode: null, name: "Unselected School Executive", updateDefault: false }
  ];
  const original = structuredClone(previous);
  const assignments = applyExecutiveToSelectedSchools(previous, schools, executive);
  assert.equal(assignments.filter(row => row.schoolCode === "PT101").length, 1);
  assert.equal(assignments.find(row => row.schoolCode === "PT101")?.incumbentCode, executive.incumbentCode);
  assert.deepEqual(assignments.find(row => row.schoolCode === "PT999"), previous[1]);
  assert.deepEqual(previous, original);
});

test("deduplicates selected schools and does nothing when no schools are selected", () => {
  const assignments = applyExecutiveToSelectedSchools([], [...schools, schools[0]], executive);
  assert.equal(assignments.length, schools.length);
  assert.deepEqual(applyExecutiveToSelectedSchools(assignments, [], executive), assignments);
});

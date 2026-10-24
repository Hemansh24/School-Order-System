import assert from "node:assert/strict";
import { test } from "node:test";
import { classifyEndUser, distinctEndUsers, savedOrderEndUsers } from "./end-user-type";

test("New, Old and Gap depend on usage before the selected session", () => {
  assert.equal(classifyEndUser("2027-2028", []), "new");
  assert.equal(classifyEndUser("2027-2028", ["2027-2028", "2027-2028"]), "new");
  assert.equal(classifyEndUser("2027-2028", ["2024-2025", "2026-2027"]), "old");
  assert.equal(classifyEndUser("2027-2028", ["2025-2026", "2027-2028"]), "gap");
  assert.equal(classifyEndUser("2028-2029", ["2027-2028"]), "old");
});

test("historical sessions ignore later orders and malformed history", () => {
  assert.equal(classifyEndUser("2025-2026", ["2026-2027", "2025-2026", "bad", "2023-2025"]), "new");
  assert.equal(classifyEndUser("2025-2026", ["2024-2025", "2026-2027"]), "old");
  assert.equal(classifyEndUser("", ["2026-2027"]), null);
  assert.equal(classifyEndUser("2027-2029", []), null);
});

test("end-user rows deduplicate school codes and exclude group and empty codes", () => {
  assert.deepEqual(distinctEndUsers([
    { schoolCode: "pt0001 ", schoolName: "School" },
    { schoolCode: "PT0001", schoolName: "School" },
    { schoolCode: "PR2", schoolName: "New school" },
    { schoolCode: "GS1", schoolName: "Group" },
    { schoolCode: "", schoolName: "" }
  ]).map(row => row.schoolCode), ["PT0001", "PR2"]);
});

test("details collect multiple-school, direct-group and parent-group participants", () => {
  assert.deepEqual(savedOrderEndUsers({
    descriptiveRows: [{ schoolCode: "PT1", schoolName: "First" }], ambiguousSchools: [],
    combinedSchools: [{ schoolCode: "PT2", schoolName: "Second" }],
    groupParticipants: [{ ptCode: "PT3", schoolName: "Third" }],
    groupChildLinks: [{ childOrder: { billingToType: "school", billingToCode: "PT4", billingToName: "Fourth" } }]
  }).map(row => row.schoolCode), ["PT1", "PT2", "PT3", "PT4"]);
  assert.deepEqual(savedOrderEndUsers({ descriptiveRows: [], ambiguousSchools: [], combinedSchools: [], groupParticipants: [], groupChildLinks: [] }), []);
});

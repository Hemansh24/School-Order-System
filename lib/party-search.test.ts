import assert from "node:assert/strict";
import { test } from "node:test";
import { createPartySearchMatcher } from "./party-search";

const parties = [
  { code: "PT101", name: "St. Mary School", addressSummary: "Church Road, Ahmedabad, Gujarat, 380001" },
  { code: "PT102", name: "St. Mary School", addressSummary: "Mumbai, Maharashtra, 400001" },
  { code: "BS101", name: "Mary Booksellers", addressSummary: "Ahmedabad, Gujarat" },
  { code: "GS101", name: "Mary Group", addressSummary: "Surat, Gujarat" }
];

test("every word narrows results across name and address", () => {
  assert.deepEqual(parties.filter(createPartySearchMatcher("st. mary gujarat")), [parties[0]]);
  assert.deepEqual(parties.filter(createPartySearchMatcher("st. mary")), parties.slice(0, 2));
  assert.deepEqual(parties.filter(createPartySearchMatcher("mary gujarat mumbai")), []);
});

test("matches code, city, district, state, street, and pincode substrings in any order", () => {
  for (const query of ["PT10 Gujarat", "Ahmedabad st. mary", "church 3800", "GUJARAT  \t St.   MARY"]) {
    assert.deepEqual(parties.filter(createPartySearchMatcher(query)), [parties[0]], query);
  }
  assert.deepEqual(parties.filter(createPartySearchMatcher("ahmedabad")), [parties[0], parties[2]]);
  assert.deepEqual(parties.filter(createPartySearchMatcher("bs101 gujarat")), [parties[2]]);
  assert.deepEqual(parties.filter(createPartySearchMatcher("gs101 surat")), [parties[3]]);
});

test("blank searches include all entries and missing addresses still allow code/name searches", () => {
  assert.deepEqual(parties.filter(createPartySearchMatcher(" \t ")), parties);
  for (const addressSummary of [undefined, null, ""]) {
    const party = { code: "PT999", name: "St. Mary School", addressSummary };
    assert.equal(createPartySearchMatcher("pt999 mary")(party), true);
    assert.equal(createPartySearchMatcher("mary gujarat")(party), false);
  }
});

test("uses literal partial matches without spelling correction or wildcard expansion", () => {
  for (const query of ["mary gujrat", "mary %", "mary *"]) {
    assert.deepEqual(parties.filter(createPartySearchMatcher(query)), []);
  }
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { getCurrentSessionYear } from "./session-year";

test("orders always target the following academic year, regardless of month", () => {
  for (const date of ["2026-01-01T00:00:00Z", "2026-04-01T00:00:00Z", "2026-10-23T00:00:00Z"]) {
    assert.equal(getCurrentSessionYear(new Date(date)), "2027-2028");
  }
  assert.equal(getCurrentSessionYear(new Date("2027-06-01T00:00:00Z")), "2028-2029");
});

test("the session rolls forward at midnight on January 1 in India", () => {
  assert.equal(getCurrentSessionYear(new Date("2026-12-31T18:29:59Z")), "2027-2028");
  assert.equal(getCurrentSessionYear(new Date("2026-12-31T18:30:00Z")), "2028-2029");
});

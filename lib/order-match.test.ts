import assert from "node:assert/strict";
import { test } from "node:test";
import { sameEndUsers } from "./order-match";

test("end-user matching compares normalized sets, not order or overlap", () => {
  assert.equal(sameEndUsers(["PT1", "pt2", "PT1"], [" PT2 ", "pt1"]), true);
  assert.equal(sameEndUsers(["PT1", "PT2"], ["PT1"]), false);
  assert.equal(sameEndUsers(["PT1"], ["PT2"]), false);
});

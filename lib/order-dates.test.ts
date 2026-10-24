import assert from "node:assert/strict";
import { test } from "node:test";
import { getOrderEnteredDate } from "./order-dates";

test("entered date rolls over at midnight in India", () => {
  assert.equal(getOrderEnteredDate(new Date("2026-10-23T18:29:59Z")), "2026-10-23");
  assert.equal(getOrderEnteredDate(new Date("2026-10-23T18:30:00Z")), "2026-10-24");
  assert.equal(getOrderEnteredDate(new Date("2026-12-31T18:30:00Z")), "2027-01-01");
});

test("saved orders use their creation day regardless of later edits", () => {
  const order = {
    createdAt: new Date("2026-10-20T20:00:00Z"),
    updatedAt: new Date("2026-10-24T20:00:00Z")
  };
  assert.equal(getOrderEnteredDate(order.createdAt), "2026-10-21");
});

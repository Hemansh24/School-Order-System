import assert from "node:assert/strict";
import { test } from "node:test";
import { formatReorderCreatedAt, isRecentReorder } from "./reorder-reminder";

test("24-hour check includes both boundaries and excludes future and older orders", () => {
  const checkedAt = "2026-11-11T18:30:00.000Z";
  const check = (createdAt: string) => isRecentReorder({ orderId: 1, orderNo: 42, createdAt, checkedAt });
  assert.equal(check(checkedAt), true);
  assert.equal(check("2026-11-10T18:30:00.000Z"), true);
  assert.equal(check("2026-11-10T18:29:59.999Z"), false);
  assert.equal(check("2026-11-11T18:30:00.001Z"), false);
  assert.equal(check("invalid"), false);
});

test("creation time is displayed in IST across midnight regardless of host timezone", () => {
  assert.match(formatReorderCreatedAt("2026-11-11T18:29:59Z"), /11 Nov 2026.*11:59:59 pm IST/i);
  assert.match(formatReorderCreatedAt("2026-11-11T18:30:00Z"), /12 Nov 2026.*12:00:00 am IST/i);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { a2dSchema, a2dSchoolBelongsToGroup, calculateA2DBalance } from "./a2d";
import { normalizeOrderEntry } from "./order-entry";
import { createOrderSchema } from "./validation/orders";
import { isPooledOrder, entryModeForOrder, hasLegacySchoolAllocations } from "./order-model";

const source = [{ itemCode: "A", groupedQuantity: 100 }, { itemCode: "B", groupedQuantity: 40 }];

test("A2D GS groups restrict membership while Christian groups allow explicit school selection", () => {
  const gs = { sourceType: "GS", groupCode: "GS1" };
  assert.equal(a2dSchoolBelongsToGroup(" gs1 ", gs), true);
  assert.equal(a2dSchoolBelongsToGroup("GS2", gs), false);
  assert.equal(a2dSchoolBelongsToGroup(null, gs), false);
  const christian = { sourceType: "CHRISTIAN", groupCode: "C1" };
  assert.equal(a2dSchoolBelongsToGroup(null, christian), true);
  assert.equal(a2dSchoolBelongsToGroup("GS2", christian), true);
});
const input = { requestId: "bd02dd45-9002-4dcb-b86a-b94af14cc73c", expectedUpdatedAt: "2026-11-11T00:00:00.000Z", mode: "allocated_schools", schools: ["PT1", "PT2"], rows: [{ schoolCode: "PT1", itemCode: "A", quantity: 40 }, { schoolCode: "PT2", itemCode: "A", quantity: 60 }], schoolExecutives: [{ schoolCode: "PT1", name: "First" }, { schoolCode: "PT2", name: "Second" }] };

test("partial allocations aggregate each item across schools and retain unallocated items", () => {
  assert.deepEqual(calculateA2DBalance(source, input.rows), { full: false, balances: [{ itemCode: "A", before: 100, allocated: 100, remaining: 0 }, { itemCode: "B", before: 40, allocated: 0, remaining: 40 }] });
});
test("all remaining item quantities must match for conversion in place", () => {
  assert.equal(calculateA2DBalance(source, [...input.rows, { itemCode: "B", quantity: 40 }]).full, true);
  assert.equal(calculateA2DBalance([{ itemCode: "A", groupedQuantity: 12 }], [{ itemCode: "A", quantity: 12 }]).full, true);
});
test("rejects unknown items, excess by one item despite matching total, and invalid quantities", () => {
  assert.throws(() => calculateA2DBalance(source, [{ itemCode: "C", quantity: 1 }]), /not available/);
  assert.throws(() => calculateA2DBalance(source, [{ itemCode: "A", quantity: 101 }, { itemCode: "B", quantity: 39 }]), /exceeds/);
  for (const quantity of [0, -1, 1.2, NaN, Infinity]) assert.throws(() => calculateA2DBalance(source, [{ itemCode: "A", quantity }]));
  assert.throws(() => calculateA2DBalance(source, []));
});
test("validates school allocations and independent executive assignments", () => {
  const pooled = { ...input, mode: "multiple_schools", rows: [{ itemCode: "A", quantity: 100 }] };
  const parsed = a2dSchema.parse(pooled);
  assert.equal(parsed.schoolExecutives?.length, 2);
  assert.throws(() => a2dSchema.parse({ ...pooled, schoolExecutives: [{ schoolCode: "OTHER", name: "Other" }] }));
  assert.throws(() => a2dSchema.parse({ ...pooled, schoolExecutives: [input.schoolExecutives[0], input.schoolExecutives[0]] }));
  assert.throws(() => a2dSchema.parse({ ...pooled, rows: [pooled.rows[0], pooled.rows[0]] }));
  assert.throws(() => a2dSchema.parse({ ...pooled, rows: [{ schoolCode: "PT1", itemCode: "A", quantity: 1 }] }));
  assert.throws(() => a2dSchema.parse({ ...pooled, rows: [] }));
  for (const mode of ["allocated_schools", "allocated_group"]) assert.throws(() => a2dSchema.parse({ ...pooled, mode }));
  assert.doesNotThrow(() => a2dSchema.parse({ ...pooled, mode: "individual", schools: ["PT1"], rows: [input.rows[0]], schoolExecutives: [input.schoolExecutives[0]] }));
});
test("pooled groups and multiple schools use identical quantity matching", () => {
  for (const mode of ["multiple_group", "multiple_schools"]) {
    const parsed = a2dSchema.parse({ ...input, mode, groupCode: "GS1", rows: [{ itemCode: "A", quantity: 100 }, { itemCode: "B", quantity: 40 }] });
    assert.equal(calculateA2DBalance(source, parsed.rows).full, true);
  }
  assert.throws(() => a2dSchema.parse({ ...input, mode: "allocated_group" }));
});
test("school-wise descriptive modes retain allocations and executive selections through normalization", () => {
  for (const mode of ["allocated_schools", "allocated_group"] as const) {
    const saved = createOrderSchema.parse({ sheet1: { orderType: "descriptive", descriptiveMode: mode, endUserGroupCode: "GS1", orderPlacedDate: "2026-11-11", billingToType: "individual", billingToName: "Payer", shippingToType: "individual", shippingToName: "Recipient", shippingToSummary: "Address" }, descriptiveRows: input.rows.map(row => ({ ...row, schoolName: row.schoolCode, itemName: row.itemCode })), schoolExecutives: input.schoolExecutives });
    const normalized = normalizeOrderEntry(saved);
    assert.deepEqual(normalized.descriptiveRows, saved.descriptiveRows);
    assert.deepEqual(normalized.schoolExecutives, saved.schoolExecutives);
    assert.equal(isPooledOrder(normalized.sheet1), false);
    assert.equal(entryModeForOrder(normalized.sheet1), mode);
    assert.equal(hasLegacySchoolAllocations({ ...normalized.sheet1, descriptiveRows: normalized.descriptiveRows }), false);
  }
});

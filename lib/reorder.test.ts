import assert from "node:assert/strict";
import { test } from "node:test";
import { Prisma } from "@prisma/client";
import type { SavedOrderInput } from "./order-input";
import { buildReorderInput, reorderDefaults, type ReorderInput } from "./reorder";

function source(overrides: Partial<SavedOrderInput> = {}): SavedOrderInput {
  return {
    orderSheet1Id: 1, orderNo: 71, reorderOfOrderId: null, sessionYear: "2025-2026",
    orderPlacedDate: new Date("2025-01-01"), orderReceivedDate: null, expectedDeliveryDate: new Date("2025-02-01"),
    billingToType: "individual", billingToCode: null, billingToName: "Saved payer",
    shippingToType: "individual", shippingToCode: null, shippingToName: "Saved recipient", shippingToSummary: "Saved address",
    orderType: "descriptive", descriptiveMode: "individual", endUserGroupCode: null,
    classification: "normal", schoolGroupId: null, schoolGroupLocationId: null, orderStatus: "finalized",
    booksellerType: "Saved type", booksellerRating: "A", pendingPayment: true,
    commissionPartyType: "individual", commissionPartyCode: "Saved commission", commissionPercentage: new Prisma.Decimal("7.5"),
    contactNumbers: ["9876543210"], notes: "Saved order notes", createdAt: new Date("2025-01-01"), updatedAt: new Date("2025-01-01"),
    schoolExecutives: [{ orderSheet1Id: 1, schoolCode: "PT1", incumbentCode: "IN1", name: "Historical executive" }],
    descriptiveRows: [{ orderSheet2AId: 1, orderSheet1Id: 1, orderNo: 71, orderModificationNo: null,
      schoolCode: "PT1", schoolName: "Saved school", itemCode: "OLD", itemName: "Old book", quantity: 20,
      notes: "Old item notes", createdAt: new Date(), updatedAt: new Date() }],
    ambiguousItems: [], combinedSchools: [], combinedItems: [], ...overrides
  };
}
const now = new Date("2026-10-27T19:00:00Z");
const shipping = { shippingToType: "individual" as const, shippingToCode: "", shippingToName: "New recipient", shippingToSummary: "New address", expectedDeliveryDate: "" };
const item = { itemCode: "NEW", itemName: "New book", quantity: 3 };
const request: ReorderInput = { shipping, descriptiveItems: [item], ambiguousItems: [], combinedItems: [] };

test("empty defaults retain individual identity and protected snapshots, refreshing Indian dates", () => {
  const original = source();
  const before = JSON.stringify(original);
  const { values, individualSchool } = reorderDefaults(original, now);
  assert.deepEqual(individualSchool, { schoolCode: "PT1", schoolName: "Saved school" });
  assert.deepEqual(values.descriptiveRows, []);
  assert.equal(values.sheet1.orderPlacedDate, "2026-10-28");
  assert.equal(values.sheet1.orderReceivedDate, "2026-10-28");
  assert.equal(values.sheet1.expectedDeliveryDate, "");
  assert.equal(values.sheet1.sessionYear, "2027-2028");
  assert.equal(values.schoolExecutives?.[0].name, "Historical executive");
  assert.equal(JSON.stringify(original), before);
});

test("server derives billing, school and executive from source and strips protected-field tampering", () => {
  const values = buildReorderInput(source(), {
    ...request, sheet1: { billingToName: "Tampered", orderPlacedDate: "2000-01-01" },
    schoolExecutives: [], combinedSchools: [{ schoolCode: "PT2", schoolName: "Other" }],
    descriptiveItems: [{ ...item, schoolCode: "PT2", schoolName: "Other" }]
  } as unknown as ReorderInput, now);
  assert.equal(values.sheet1.billingToName, "Saved payer");
  assert.equal(values.sheet1.shippingToName, "New recipient");
  assert.equal(values.sheet1.orderPlacedDate, "2026-10-28");
  assert.equal(values.sheet1.commissionPercentage, 7.5);
  assert.equal(values.sheet1.pendingPayment, true);
  assert.equal(values.sheet1.notes, "Saved order notes");
  assert.deepEqual(values.descriptiveRows, [{ ...item, schoolCode: "PT1", schoolName: "Saved school" }]);
  assert.equal(values.schoolExecutives?.[0].incumbentCode, "IN1");
});

test("empty items, wrong item shapes, duplicates, and invalid quantities cannot be saved", () => {
  for (const descriptiveItems of [[], [{ ...item, quantity: 0 }], [{ ...item, quantity: -1 }], [{ ...item, quantity: 1.5 }], [item, item]]) {
    assert.throws(() => buildReorderInput(source(), { ...request, descriptiveItems }, now));
  }
  assert.throws(() => buildReorderInput(source(), { ...request, descriptiveItems: [], combinedItems: [{ itemCode: "NEW", itemName: "New book", pooledQuantity: 3 }] }, now));
});

test("group and multiple-school reorders retain exact saved participants", () => {
  const combinedSchools = ["PT1", "PT2"].map((schoolCode, i) => ({ schoolCode, schoolName: `Saved ${i}`, notes: "Saved participant notes" })) as SavedOrderInput["combinedSchools"];
  for (const descriptiveMode of ["multiple_schools", "multiple_group"]) {
    const original = source({ descriptiveMode, endUserGroupCode: descriptiveMode === "multiple_group" ? "GS999" : null, descriptiveRows: [], combinedSchools });
    const { values } = reorderDefaults(original, now);
    assert.deepEqual(values.combinedSchools, combinedSchools);
    assert.deepEqual(values.combinedItems, []);
    const built = buildReorderInput(original, { ...request, descriptiveItems: [], combinedItems: [{ itemCode: "NEW", itemName: "New book", pooledQuantity: 4 }] }, now);
    assert.deepEqual(built.combinedSchools, combinedSchools);
  }
});

test("legacy normal orders retain all schools while using empty pooled items", () => {
  const original = source({ descriptiveMode: null });
  original.descriptiveRows.push({ ...original.descriptiveRows[0], orderSheet2AId: 2, schoolCode: "PT2", schoolName: "Second school" });
  const { values } = reorderDefaults(original, now);
  assert.equal(values.sheet1.descriptiveMode, "multiple_schools");
  assert.deepEqual(values.combinedSchools.map(row => row.schoolCode), ["PT1", "PT2"]);
  assert.deepEqual(values.combinedItems, []);
});

test("legacy combined groups retain their billing-based group identity", () => {
  const original = source({ orderType: "combined", descriptiveMode: null,
    billingToType: "school", billingToCode: "GS999", billingToName: "Historical group",
    descriptiveRows: [], schoolExecutives: [],
    combinedSchools: [{ schoolCode: "PT1", schoolName: "Saved school", notes: null }] as SavedOrderInput["combinedSchools"]
  });
  const values = buildReorderInput(original, { ...request, descriptiveItems: [], combinedItems: [{ itemCode: "NEW", itemName: "New book", pooledQuantity: 4 }] }, now);
  assert.equal(values.sheet1.endUserGroupCode, "GS999");
  assert.equal(values.sheet1.descriptiveMode, "multiple_group");
});

test("ambiguous orders start empty and accept fresh grouped quantities", () => {
  const original = source({ orderType: "ambiguous", descriptiveMode: null, descriptiveRows: [], schoolExecutives: [] });
  assert.deepEqual(reorderDefaults(original, now).values.ambiguousItems, []);
  const values = buildReorderInput(original, { ...request, descriptiveItems: [], ambiguousItems: [{ itemCode: "NEW", itemName: "New book", groupedQuantity: 5 }] }, now);
  assert.equal(values.ambiguousItems[0].groupedQuantity, 5);
});

test("all source statuses are allowed but special classifications are rejected", () => {
  for (const orderStatus of ["draft", "pending_confirmation", "locked", "finalized", "cancelled"] as const) {
    assert.doesNotThrow(() => buildReorderInput(source({ orderStatus }), request, now));
  }
  for (const classification of ["group_parent", "direct_group"] as const) {
    assert.throws(() => reorderDefaults(source({ classification }), now), /Only normal orders/);
  }
});

test("server dates advance at Indian midnight and expected delivery is validated", () => {
  const before = buildReorderInput(source(), request, new Date("2026-12-31T18:29:59Z"));
  const after = buildReorderInput(source(), request, new Date("2026-12-31T18:30:00Z"));
  assert.equal(before.sheet1.orderPlacedDate, "2026-12-31");
  assert.equal(after.sheet1.orderPlacedDate, "2027-01-01");
  assert.equal(after.sheet1.sessionYear, "2028-2029");
  assert.throws(() => buildReorderInput(source(), { ...request, shipping: { ...shipping, expectedDeliveryDate: "invalid" } }, now));
});

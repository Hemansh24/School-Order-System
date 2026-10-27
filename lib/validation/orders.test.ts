import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeOrderEntry } from "../order-entry";
import type { CreateOrderInput } from "./orders";
import { createOrderSchema, sheet1Schema } from "./orders";
import { isGroupOrder, isPooledOrder, hasLegacySchoolAllocations, orderTypeLabel } from "../order-model";

const sheet1 = {
  billingToType: "individual", billingToCode: "", billingToName: "Manual payer",
  shippingToType: "individual", shippingToCode: "", shippingToName: "Another recipient",
  shippingToSummary: "A manually entered destination", orderPlacedDate: "2026-10-20",
  orderType: "ambiguous"
};
const item = { itemCode: "ITEM1", itemName: "Book" };
const school = { schoolCode: "PT1", schoolName: "End school" };
const ambiguous = { sheet1, ambiguousItems: [{ ...item, groupedQuantity: 10 }] };

test("executives are optional and restricted to one assignment per descriptive end school", () => {
  const input = { sheet1: { ...sheet1, orderType: "descriptive", descriptiveMode: "individual" }, descriptiveRows: [{ ...school, ...item, quantity: 2 }] };
  for (const assignment of [{ schoolCode: "PT1", name: "Custom executive" }, { schoolCode: "PT1", name: "", incumbentCode: null }, { schoolCode: "PT1", name: "Executive", incumbentCode: "in01" }]) {
    assert.equal(createOrderSchema.safeParse({ ...input, schoolExecutives: [assignment] }).success, true);
  }
  const assignment = { schoolCode: "PT1", name: "Custom" };
  assert.equal(createOrderSchema.safeParse({ ...input, schoolExecutives: [assignment, assignment] }).success, false);
  assert.equal(createOrderSchema.safeParse({ ...input, schoolExecutives: [{ ...assignment, schoolCode: "PT2" }] }).success, false);
  assert.equal(createOrderSchema.safeParse({ ...ambiguous, schoolExecutives: [assignment] }).success, false);
  assert.equal(createOrderSchema.safeParse({ ...input, schoolExecutives: [{ ...assignment, name: "", incumbentCode: "IN1" }] }).success, false);
});

test("commission requires a party name or code and a finite percentage from 0 to 100", () => {
  const commission = { ...sheet1, commissionEnabled: true, commissionPartyType: "vendor", commissionPartyCode: "BS001" };
  for (const commissionPercentage of [0, 7.5, 100, "12.25"]) {
    const parsed = sheet1Schema.parse({ ...commission, commissionPercentage });
    assert.equal(parsed.commissionPercentage, Number(commissionPercentage));
  }
  for (const commissionPercentage of [undefined, "", " ", null, "abc", -1, 100.01, NaN, Infinity]) {
    assert.equal(sheet1Schema.safeParse({ ...commission, commissionPercentage }).success, false, String(commissionPercentage));
  }
  for (const missing of [{ commissionPartyCode: undefined }, { commissionPartyCode: " " }]) {
    assert.equal(sheet1Schema.safeParse({ ...commission, commissionPercentage: 5, ...missing }).success, false);
  }
});

test("commission accepts external names and codes without an existing reference", () => {
  for (const commissionPartyType of [undefined, "individual"]) {
    const parsed = sheet1Schema.parse({ ...sheet1, commissionEnabled: true, commissionPartyType, commissionPartyCode: "  Ramesh Sharma / Agent 42  ", commissionPercentage: 12.5 });
    assert.equal(parsed.commissionPartyCode, "Ramesh Sharma / Agent 42");
  }
});

test("disabled commission clears values and older drafts remain compatible", () => {
  const parsed = sheet1Schema.parse({ ...sheet1, commissionEnabled: false, commissionPartyType: "school", commissionPartyCode: "PT1", commissionPercentage: 10 });
  assert.equal(parsed.commissionPartyType, undefined);
  assert.equal(parsed.commissionPartyCode, undefined);
  assert.equal(parsed.commissionPercentage, undefined);
  assert.equal(createOrderSchema.safeParse(ambiguous).success, true);
  const input = createOrderSchema.parse({ ...ambiguous, sheet1: { ...sheet1, commissionEnabled: true, commissionPartyType: "school", commissionPartyCode: "PT1", commissionPercentage: 7.5 } });
  assert.deepEqual(normalizeOrderEntry(JSON.parse(JSON.stringify(input))).sheet1, input.sheet1);
  assert.equal(createOrderSchema.safeParse({ ...input, sheet1: { ...input.sheet1, orderType: "descriptive", descriptiveMode: "individual" }, ambiguousItems: [], descriptiveRows: [{ ...school, ...item, quantity: 2 }] }).success, true);
});

test("only recipient details, placed date and type are required in sheet 1", () => {
  const parsed = sheet1Schema.parse(sheet1);
  assert.equal(parsed.expectedDeliveryDate, "");
  assert.equal(parsed.orderReceivedDate, "");
  assert.equal(parsed.sessionYear, "");
  for (const field of ["billingToName", "shippingToName", "shippingToSummary", "orderPlacedDate"]) {
    assert.equal(sheet1Schema.safeParse({ ...sheet1, [field]: " " }).success, false, field);
  }
});

test("all billing/shipping combinations support either order type", () => {
  for (const billingToType of ["school", "vendor", "group", "individual"]) {
    for (const shippingToType of ["school", "vendor", "group", "individual"]) {
      const parties = { ...sheet1, billingToType, shippingToType, billingToCode: "REF1", shippingToCode: "REF2" };
      assert.equal(createOrderSchema.safeParse({ ...ambiguous, sheet1: parties }).success, true);
      assert.equal(createOrderSchema.safeParse({ sheet1: { ...parties, orderType: "descriptive", descriptiveMode: "individual" }, descriptiveRows: [{ ...school, ...item, quantity: 2 }] }).success, true);
      assert.equal(createOrderSchema.safeParse({ sheet1: { ...parties, orderType: "descriptive", descriptiveMode: "multiple_group", endUserGroupCode: "GS1" }, combinedSchools: [school], combinedItems: [{ ...item, pooledQuantity: 8 }] }).success, true);
    }
  }
});

test("ambiguous orders accept only item quantities and reject schools", () => {
  assert.equal(createOrderSchema.safeParse(ambiguous).success, true);
  assert.equal(createOrderSchema.safeParse({ ...ambiguous, ambiguousSchools: [school] }).success, false);
  assert.equal(createOrderSchema.safeParse({ ...ambiguous, ambiguousItems: [] }).success, false);
});

test("older ambiguous orders and drafts hide schools without changing quantities", () => {
  const legacy = { ...createOrderSchema.parse(ambiguous), ambiguousSchools: [{ ...school, notes: "Historical link" }] };
  const snapshot = structuredClone(legacy);
  const editable = normalizeOrderEntry(legacy);
  assert.deepEqual(editable.ambiguousSchools, []);
  assert.deepEqual(editable.ambiguousItems, legacy.ambiguousItems);
  assert.equal(createOrderSchema.safeParse(editable).success, true);
  assert.deepEqual(legacy, snapshot);
});

test("group mode requires a group, participants, and pooled quantities", () => {
  const input = { sheet1: { ...sheet1, orderType: "descriptive", descriptiveMode: "multiple_group", endUserGroupCode: "C1-001" }, combinedSchools: [school], combinedItems: [{ ...item, pooledQuantity: 5 }] };
  assert.equal(createOrderSchema.safeParse(input).success, true);
  assert.equal(createOrderSchema.safeParse({ ...input, sheet1: { ...input.sheet1, endUserGroupCode: "" } }).success, false);
  assert.equal(createOrderSchema.safeParse({ ...input, combinedSchools: [] }).success, false);
  assert.equal(createOrderSchema.safeParse({ ...input, combinedItems: [] }).success, false);
  assert.equal(createOrderSchema.safeParse({ ...input, combinedSchools: [school, school] }).success, false);
  assert.equal(createOrderSchema.safeParse({ ...input, descriptiveRows: [{ ...school, ...item, quantity: 1 }] }).success, false);
});

test("individual orders reject a second school while allowing several items", () => {
  const input = { sheet1: { ...sheet1, orderType: "descriptive", descriptiveMode: "individual" }, descriptiveRows: [{ ...school, ...item, quantity: 2 }, { ...school, schoolCode: "PT2", ...item, quantity: 3 }] };
  assert.equal(createOrderSchema.safeParse(input).success, false);
  assert.equal(createOrderSchema.safeParse({ ...input, descriptiveRows: [input.descriptiveRows[0], { ...input.descriptiveRows[0], itemCode: "ITEM2" }] }).success, true);
});

test("multiple schools require two distinct participants and shared item totals", () => {
  const input = { sheet1: { ...sheet1, orderType: "descriptive", descriptiveMode: "multiple_schools" }, combinedSchools: [school, { ...school, schoolCode: "PT2" }], combinedItems: [{ ...item, pooledQuantity: 8 }] };
  assert.equal(createOrderSchema.safeParse(input).success, true);
  assert.equal(createOrderSchema.safeParse({ ...input, combinedSchools: [school] }).success, false);
  assert.equal(createOrderSchema.safeParse({ ...input, combinedSchools: [school, school] }).success, false);
  assert.equal(createOrderSchema.safeParse({ ...input, combinedItems: [] }).success, false);
  assert.equal(createOrderSchema.safeParse({ ...input, descriptiveRows: [{ ...school, ...item, quantity: 1 }] }).success, false);
  for (const pooledQuantity of [0, -1, 0.5]) assert.equal(createOrderSchema.safeParse({ ...input, combinedItems: [{ ...item, pooledQuantity }] }).success, false);
  assert.equal(isGroupOrder(input.sheet1), false);
  assert.equal(isPooledOrder(input.sheet1), true);
});

test("legacy multi-school allocations become shared totals without mutating the saved input", () => {
  const original = {
    ...createOrderSchema.parse({ ...ambiguous }),
    sheet1: { ...createOrderSchema.parse(ambiguous).sheet1, orderType: "descriptive", descriptiveMode: "school" },
    ambiguousItems: [], descriptiveRows: [{ ...school, ...item, quantity: 3, notes: "First school" }, { ...school, schoolCode: "PT2", ...item, quantity: 7, notes: "Second school" }]
  } as unknown as CreateOrderInput;
  const snapshot = structuredClone(original);
  assert.equal(hasLegacySchoolAllocations({ ...original.sheet1, descriptiveRows: original.descriptiveRows }), true);
  const converted = normalizeOrderEntry(original);
  assert.equal(converted.sheet1.descriptiveMode, "multiple_schools");
  assert.equal(converted.combinedSchools.length, 2);
  assert.equal(converted.combinedItems.length, 1);
  assert.equal(converted.combinedItems[0].pooledQuantity, 10);
  assert.match(converted.combinedItems[0].notes ?? "", /First school/);
  assert.match(converted.combinedItems[0].notes ?? "", /Second school/);
  assert.equal(createOrderSchema.safeParse(converted).success, true);
  assert.deepEqual(original, snapshot);
  assert.deepEqual(normalizeOrderEntry(converted), converted);
  assert.equal(isPooledOrder(original.sheet1), false);
});

test("legacy single-school and group entries normalize to the new modes", () => {
  const base = createOrderSchema.parse(ambiguous);
  const individual = normalizeOrderEntry({ ...base, sheet1: { ...base.sheet1, orderType: "descriptive", descriptiveMode: "school" }, ambiguousItems: [], descriptiveRows: [{ ...school, ...item, quantity: 4 }] } as unknown as CreateOrderInput);
  assert.equal(individual.sheet1.descriptiveMode, "individual");
  assert.equal(individual.descriptiveRows[0].quantity, 4);
  const group = normalizeOrderEntry({ ...base, sheet1: { ...base.sheet1, orderType: "combined", billingToCode: "GS1" }, ambiguousItems: [], combinedSchools: [school], combinedItems: [{ ...item, pooledQuantity: 9 }] } as unknown as CreateOrderInput);
  assert.equal(group.sheet1.descriptiveMode, "multiple_group");
  assert.equal(group.sheet1.endUserGroupCode, "GS1");
  assert.equal(createOrderSchema.safeParse(group).success, true);
});

test("rejects invalid quantities, mixed modes and the retired combined input", () => {
  for (const groupedQuantity of [0, -1, 1.5]) {
    assert.equal(createOrderSchema.safeParse({ ...ambiguous, ambiguousItems: [{ ...item, groupedQuantity }] }).success, false);
  }
  assert.equal(createOrderSchema.safeParse({ ...ambiguous, combinedItems: [{ ...item, pooledQuantity: 1 }] }).success, false);
  assert.equal(createOrderSchema.safeParse({ ...ambiguous, sheet1: { ...sheet1, orderType: "combined" } }).success, false);
});

test("validates optional dates only when supplied", () => {
  assert.equal(sheet1Schema.safeParse({ ...sheet1, expectedDeliveryDate: "2026-10-21" }).success, true);
  assert.equal(sheet1Schema.safeParse({ ...sheet1, orderReceivedDate: "2026-10-19" }).success, false);
  assert.equal(sheet1Schema.safeParse({ ...sheet1, expectedDeliveryDate: "invalid" }).success, false);
  assert.equal(sheet1Schema.safeParse({ ...sheet1, orderReceivedDate: "2026-10-22", expectedDeliveryDate: "2026-10-21" }).success, false);
});

test("legacy combined orders retain descriptive group semantics", () => {
  assert.equal(isGroupOrder({ orderType: "combined" }), true);
  assert.equal(orderTypeLabel({ orderType: "combined" }), "Descriptive / Group");
  assert.equal(isGroupOrder({ orderType: "descriptive", descriptiveMode: "individual" }), false);
});

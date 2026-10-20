import assert from "node:assert/strict";
import { test } from "node:test";
import { createOrderSchema, sheet1Schema } from "./orders";
import { isGroupOrder, orderTypeLabel } from "../order-model";

const sheet1 = {
  billingToType: "individual", billingToCode: "", billingToName: "Manual payer",
  shippingToType: "individual", shippingToCode: "", shippingToName: "Another recipient",
  shippingToSummary: "A manually entered destination", orderPlacedDate: "2026-10-20",
  orderType: "ambiguous"
};
const item = { itemCode: "ITEM1", itemName: "Book" };
const school = { schoolCode: "PT1", schoolName: "End school" };
const ambiguous = { sheet1, ambiguousItems: [{ ...item, groupedQuantity: 10 }] };

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
      assert.equal(createOrderSchema.safeParse({ sheet1: { ...parties, orderType: "descriptive", descriptiveMode: "school" }, descriptiveRows: [{ ...school, ...item, quantity: 2 }] }).success, true);
      assert.equal(createOrderSchema.safeParse({ sheet1: { ...parties, orderType: "descriptive", descriptiveMode: "group", endUserGroupCode: "GS1" }, combinedSchools: [school], combinedItems: [{ ...item, pooledQuantity: 8 }] }).success, true);
    }
  }
});

test("ambiguous schools are optional but grouped quantities are required", () => {
  assert.equal(createOrderSchema.safeParse(ambiguous).success, true);
  assert.equal(createOrderSchema.safeParse({ ...ambiguous, ambiguousSchools: [school] }).success, true);
  assert.equal(createOrderSchema.safeParse({ ...ambiguous, ambiguousItems: [] }).success, false);
});

test("group mode requires a group, participants, and pooled quantities", () => {
  const input = { sheet1: { ...sheet1, orderType: "descriptive", descriptiveMode: "group", endUserGroupCode: "C1-001" }, combinedSchools: [school], combinedItems: [{ ...item, pooledQuantity: 5 }] };
  assert.equal(createOrderSchema.safeParse(input).success, true);
  assert.equal(createOrderSchema.safeParse({ ...input, sheet1: { ...input.sheet1, endUserGroupCode: "" } }).success, false);
  assert.equal(createOrderSchema.safeParse({ ...input, combinedSchools: [] }).success, false);
  assert.equal(createOrderSchema.safeParse({ ...input, combinedItems: [] }).success, false);
  assert.equal(createOrderSchema.safeParse({ ...input, combinedSchools: [school, school] }).success, false);
  assert.equal(createOrderSchema.safeParse({ ...input, descriptiveRows: [{ ...school, ...item, quantity: 1 }] }).success, false);
});

test("school quantities remain separate for multiple schools", () => {
  const input = { sheet1: { ...sheet1, orderType: "descriptive", descriptiveMode: "school" }, descriptiveRows: [{ ...school, ...item, quantity: 2 }, { ...school, schoolCode: "PT2", ...item, quantity: 3 }] };
  assert.equal(createOrderSchema.safeParse(input).success, true);
  assert.equal(createOrderSchema.safeParse({ ...input, descriptiveRows: [input.descriptiveRows[0], input.descriptiveRows[0]] }).success, false);
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
  assert.equal(isGroupOrder({ orderType: "descriptive", descriptiveMode: "school" }), false);
});

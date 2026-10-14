import assert from "node:assert/strict";
import { test } from "node:test";
import { extractContactNumbers } from "./contact-numbers";
import { sheet1Schema } from "./validation/orders";

test("missing contacts and email-only sources leave the field blank", () => {
  for (const source of [null, undefined, "", "N/A", "office1234567890@example.com"]) {
    assert.deepEqual(extractContactNumbers(source), []);
  }
});

test("extracts several labelled phone numbers while excluding emails", () => {
  assert.deepEqual(extractContactNumbers("Phone: +91 98765 43210 / 011-23456789; office@example.com"), ["+91 98765 43210", "011-23456789"]);
  assert.deepEqual(extractContactNumbers("9876543210 9123456789"), ["9876543210", "9123456789"]);
});

test("deduplicates numbers and ignores non-phone digit counts", () => {
  assert.deepEqual(extractContactNumbers("9876543210, 98765 43210, 12345, 1234567890123456"), ["9876543210"]);
});

const sheet1 = {
  sessionYear: "2026-2027", orderPlacedDate: "2026-10-14", orderReceivedDate: "2026-10-14",
  expectedDeliveryDate: "2026-10-21", billingToType: "school", billingToCode: "PT1", billingToName: "School",
  shippingToType: "school", shippingToCode: "PT1", shippingToName: "School", shippingToSummary: "Address",
  orderType: "descriptive", pendingPayment: false
};

test("order validation accepts multiple editable numbers and blank rows", () => {
  const result = sheet1Schema.parse({ ...sheet1, contactNumbers: [" +91 98765 43210 ", "011-23456789", ""] });
  assert.deepEqual(result.contactNumbers, ["+91 98765 43210", "011-23456789", ""]);
  assert.equal(sheet1Schema.safeParse(sheet1).success, true);
});

test("order validation flags invalid manual phone numbers", () => {
  for (const number of ["123", "office@example.com", "1234567890123456"]) {
    const result = sheet1Schema.safeParse({ ...sheet1, contactNumbers: [number] });
    assert.equal(result.success, false);
    if (!result.success) assert.deepEqual(result.error.issues[0].path, ["contactNumbers", 0]);
  }
});

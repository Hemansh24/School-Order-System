import { z } from "zod";

export const orderTypeSchema = z.enum(["descriptive", "ambiguous", "combined"]);
export const billingToTypeSchema = z.enum(["school", "vendor"]);
export const shippingToTypeSchema = z.enum(["school", "vendor"]);
export const orderStatusSchema = z.enum([
  "draft",
  "pending_confirmation",
  "locked",
  "finalized",
  "cancelled"
]);

const isoDate = z
  .string()
  .min(1, "Date is required")
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date");
const itemCodeSchema = z
  .string()
  .trim()
  .min(1, "Item code is required");

export const sheet1Schema = z
  .object({
    sessionYear: z.string().min(4, "Session year is required"),
    orderPlacedDate: isoDate,
    orderReceivedDate: isoDate,
    expectedDeliveryDate: isoDate,
    billingToType: billingToTypeSchema,
    billingToCode: z.string().min(1, "Billing code is required"),
    billingToName: z.string().min(1, "Billing name is required"),
    shippingToType: shippingToTypeSchema,
    shippingToCode: z.string().min(1, "Shipping code is required"),
    shippingToName: z.string().min(1, "Shipping name is required"),
    shippingToSummary: z.string().min(1, "Shipping address is required"),
    orderType: orderTypeSchema,
    booksellerType: z.string().optional(),
    booksellerRating: z.string().optional(),
    pendingPayment: z.boolean().default(false),
    notes: z.string().optional()
  })
  .refine(
    (data) => new Date(data.orderPlacedDate) <= new Date(data.orderReceivedDate),
    {
      message: "Order placed date cannot be after order received date",
      path: ["orderPlacedDate"]
    }
  )
  .refine(
    (data) => new Date(data.expectedDeliveryDate) >= new Date(data.orderReceivedDate),
    {
      message: "Expected delivery date cannot be before order received date",
      path: ["expectedDeliveryDate"]
    }
  );

export const sheet2ARowSchema = z.object({
  schoolCode: z.string().min(1, "School code is required"),
  schoolName: z.string().min(1, "School name is required"),
  itemCode: itemCodeSchema,
  itemName: z.string().min(1, "Item name is required"),
  quantity: z.coerce.number().int().positive("Quantity must be greater than 0"),
  notes: z.string().optional()
});

export const sheet2B1RowSchema = z.object({
  schoolCode: z.string().min(1, "School code is required"),
  schoolName: z.string().min(1, "School name is required"),
  notes: z.string().optional()
});

export const sheet2B2RowSchema = z.object({
  itemCode: itemCodeSchema,
  itemName: z.string().min(1, "Item name is required"),
  groupedQuantity: z.coerce
    .number()
    .int()
    .positive("Grouped quantity must be greater than 0"),
  notes: z.string().optional()
});

export const sheet2C1RowSchema = z.object({
  schoolCode: z.string().min(1, "School code is required"),
  schoolName: z.string().min(1, "School name is required"),
  notes: z.string().optional()
});

export const sheet2C2RowSchema = z.object({
  itemCode: itemCodeSchema,
  itemName: z.string().min(1, "Item name is required"),
  pooledQuantity: z.coerce.number().int().positive("Pooled quantity must be greater than 0"),
  notes: z.string().optional()
});

export const createOrderSchema = z
  .object({
    sheet1: sheet1Schema,
    descriptiveRows: z.array(sheet2ARowSchema).default([]),
    ambiguousSchools: z.array(sheet2B1RowSchema).default([]),
    ambiguousItems: z.array(sheet2B2RowSchema).default([]),
    combinedSchools: z.array(sheet2C1RowSchema).default([]),
    combinedItems: z.array(sheet2C2RowSchema).default([])
  })
  .superRefine((data, ctx) => {
    if (data.sheet1.orderType === "descriptive") {
      if (data.descriptiveRows.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["descriptiveRows"],
          message: "Descriptive orders require at least one Order Sheet 2A row"
        });
      }
      if (
        data.ambiguousSchools.length > 0 ||
        data.ambiguousItems.length > 0 ||
        data.combinedSchools.length > 0 ||
        data.combinedItems.length > 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sheet1", "orderType"],
          message: "Descriptive orders cannot contain ambiguous or combined rows"
        });
      }
    }

    if (data.sheet1.orderType === "ambiguous") {
      if (data.sheet1.billingToType !== "vendor") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sheet1", "billingToType"],
          message: "Ambiguous orders can only be placed by a vendor or bookseller"
        });
      }
      if (data.ambiguousSchools.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ambiguousSchools"],
          message: "Ambiguous orders require at least one Order Sheet 2B1 school row"
        });
      }
      if (data.ambiguousItems.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ambiguousItems"],
          message: "Ambiguous orders require at least one Order Sheet 2B2 item row"
        });
      }
      if (
        data.descriptiveRows.length > 0 ||
        data.combinedSchools.length > 0 ||
        data.combinedItems.length > 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sheet1", "orderType"],
          message: "Ambiguous orders cannot contain descriptive or combined rows"
        });
      }
    }

    if (data.sheet1.orderType === "combined") {
      if (data.sheet1.billingToType !== "school") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["sheet1", "billingToType"], message: "Combined orders must be placed by a school" });
      }
      if (
        data.sheet1.shippingToType !== "school" ||
        data.sheet1.shippingToCode !== data.sheet1.billingToCode
      ) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["sheet1", "shippingToCode"], message: "Combined-order shipping must match the billing school" });
      }
      if (data.combinedSchools.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["combinedSchools"], message: "Combined orders require at least one participating school" });
      }
      if (new Set(data.combinedSchools.map((row) => row.schoolCode)).size !== data.combinedSchools.length) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["combinedSchools"], message: "A school can only be added once to a combined order" });
      }
      if (data.combinedItems.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["combinedItems"], message: "Combined orders require at least one pooled item" });
      }
      if (new Set(data.combinedItems.map((row) => row.itemCode)).size !== data.combinedItems.length) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["combinedItems"], message: "An item can only be added once to a combined order" });
      }
      if (data.descriptiveRows.length > 0 || data.ambiguousSchools.length > 0 || data.ambiguousItems.length > 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["sheet1", "orderType"], message: "Combined orders cannot contain descriptive or ambiguous rows" });
      }
    }
  });

export const finalizationUpdateSchema = z.object({
  discountPercentage: z.coerce.number().min(0).max(100).optional(),
  acceptedByClient: z.boolean().optional(),
  paymentReceived: z.boolean().optional(),
  cancelOrOnHoldStatus: z.enum(["active", "cancelled", "on_hold"]).optional()
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

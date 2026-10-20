import { z } from "zod";

export const orderTypeSchema = z.enum(["descriptive", "ambiguous"]);
export const billingToTypeSchema = z.enum(["school", "vendor", "group", "individual"]);
export const shippingToTypeSchema = z.enum(["school", "vendor", "group", "individual"]);
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
    sessionYear: z.string().trim().default(""),
    orderPlacedDate: isoDate,
    orderReceivedDate: z.union([isoDate, z.literal("")]).default(""),
    expectedDeliveryDate: z.union([isoDate, z.literal("")]).default(""),
    billingToType: billingToTypeSchema,
    billingToCode: z.string().trim().default(""),
    billingToName: z.string().trim().min(1, "Billing name is required"),
    shippingToType: shippingToTypeSchema,
    shippingToCode: z.string().trim().default(""),
    shippingToName: z.string().trim().min(1, "Shipping name is required"),
    shippingToSummary: z.string().trim().min(1, "Shipping address is required"),
    orderType: orderTypeSchema,
    descriptiveMode: z.enum(["school", "group"]).optional(),
    endUserGroupCode: z.string().trim().optional(),
    schoolGroupId: z.number().int().positive().optional(),
    schoolGroupLocationId: z.number().int().positive().optional(),
    booksellerType: z.string().optional(),
    booksellerRating: z.string().optional(),
    contactNumbers: z.array(z.string().trim().refine(
      value => !value || (/^\+?[\d\s().-]+$/.test(value) && value.replace(/\D/g, "").length >= 7 && value.replace(/\D/g, "").length <= 15),
      "Enter a valid contact number (7–15 digits)"
    )).optional(),
    pendingPayment: z.boolean().default(false),
    notes: z.string().optional()
  })
  .refine(
    (data) => !data.orderReceivedDate || new Date(data.orderPlacedDate) <= new Date(data.orderReceivedDate),
    {
      message: "Order placed date cannot be after order received date",
      path: ["orderPlacedDate"]
    }
  )
  .refine(
    (data) => !data.expectedDeliveryDate || !data.orderReceivedDate || new Date(data.expectedDeliveryDate) >= new Date(data.orderReceivedDate),
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
    const { orderType, descriptiveMode } = data.sheet1;
    const group = orderType === "descriptive" && descriptiveMode === "group";
    const school = orderType === "descriptive" && !group;
    const issue = (path: string[], message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
    for (const party of ["billing", "shipping"] as const) {
      if (data.sheet1[`${party}ToType`] !== "individual" && !data.sheet1[`${party}ToCode`]) {
        issue(["sheet1", `${party}ToCode`], "Select a reference or choose Individual / manual entry");
      }
    }
    if (school && !data.descriptiveRows.length) issue(["descriptiveRows"], "Add at least one school item quantity");
    if (group) {
      if (!data.sheet1.endUserGroupCode) issue(["sheet1", "endUserGroupCode"], "Select an end-school group");
      if (!data.combinedSchools.length) issue(["combinedSchools"], "Group orders require participating schools");
      if (!data.combinedItems.length) issue(["combinedItems"], "Group orders require pooled items");
    }
    if (orderType === "ambiguous" && !data.ambiguousItems.length) issue(["ambiguousItems"], "Add at least one grouped item quantity");
    if ((!school && data.descriptiveRows.length) || (!group && (data.combinedSchools.length || data.combinedItems.length)) || (orderType !== "ambiguous" && (data.ambiguousSchools.length || data.ambiguousItems.length))) {
      issue(["sheet1", "orderType"], "Remove rows belonging to another order type or descriptive mode");
    }
    for (const [name, keys] of [
      ["descriptiveRows", data.descriptiveRows.map(row => `${row.schoolCode}:${row.itemCode}`)],
      ["combinedSchools", data.combinedSchools.map(row => row.schoolCode)],
      ["combinedItems", data.combinedItems.map(row => row.itemCode)],
      ["ambiguousSchools", data.ambiguousSchools.map(row => row.schoolCode)],
      ["ambiguousItems", data.ambiguousItems.map(row => row.itemCode)]
    ] as const) {
      if (new Set(keys).size !== keys.length) issue([name], "Duplicate entries are not allowed");
    }
  });

export const finalizationUpdateSchema = z.object({
  discountPercentage: z.coerce.number().min(0).max(100).optional(),
  acceptedByClient: z.boolean().optional(),
  paymentReceived: z.boolean().optional(),
  cancelOrOnHoldStatus: z.enum(["active", "cancelled", "on_hold"]).optional()
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

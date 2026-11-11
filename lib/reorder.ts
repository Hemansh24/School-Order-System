import { z } from "zod";
import { savedOrderToInput, type SavedOrderInput } from "./order-input";
import { normalizeOrderEntry } from "./order-entry";
import { getOrderEnteredDate } from "./order-dates";
import { getCurrentSessionYear } from "./session-year";
import { createOrderSchema, shippingToTypeSchema, sheet2ARowSchema, sheet2B2RowSchema, sheet2C2RowSchema } from "./validation/orders";

export const reorderSchema = z.object({
  matchedSession: z.string().optional(),
  shipping: z.object({
    shippingToType: shippingToTypeSchema,
    shippingToCode: z.string().trim().default(""),
    shippingToName: z.string().trim().min(1, "Shipping name is required"),
    shippingToSummary: z.string().trim().min(1, "Shipping address is required"),
    expectedDeliveryDate: z.string().default("")
  }),
  descriptiveItems: z.array(sheet2ARowSchema.omit({ schoolCode: true, schoolName: true })).default([]),
  allocatedRows: z.array(sheet2ARowSchema).optional(),
  ambiguousItems: z.array(sheet2B2RowSchema).default([]),
  combinedItems: z.array(sheet2C2RowSchema).default([])
});
export type ReorderInput = z.infer<typeof reorderSchema>;

export function reorderDefaults(source: SavedOrderInput, now = new Date()) {
  if (source.classification !== "normal") throw new Error("Only normal orders can be reordered. Reorder linked PT orders separately.");
  const values = normalizeOrderEntry(savedOrderToInput(source));
  const individualSchool = values.descriptiveRows[0]
    ? { schoolCode: values.descriptiveRows[0].schoolCode, schoolName: values.descriptiveRows[0].schoolName }
    : undefined;
  const today = getOrderEnteredDate(now);
  return {
    individualSchool,
    values: {
      ...values,
      sheet1: { ...values.sheet1, sessionYear: getCurrentSessionYear(now), orderPlacedDate: today, orderReceivedDate: today, expectedDeliveryDate: "" },
      descriptiveRows: [], ambiguousItems: [], combinedItems: []
    }
  };
}

/** Protected values always come from the saved source, never the browser. */
export function buildReorderInput(source: SavedOrderInput, input: ReorderInput, now = new Date()) {
  const { values, individualSchool } = reorderDefaults(source, now);
  const parsed = reorderSchema.parse(input);
  const allocated = values.sheet1.descriptiveMode === "allocated_schools" || values.sheet1.descriptiveMode === "allocated_group";
  const sourceSchools = new Map(source.descriptiveRows.map(row => [row.schoolCode, row.schoolName]));
  if (allocated && parsed.allocatedRows?.some(row => !sourceSchools.has(row.schoolCode))) throw new Error("Reorder end users must belong to the original order.");
  if (parsed.matchedSession && parsed.matchedSession !== source.sessionYear) throw new Error("The matched session no longer matches the original order.");
  return createOrderSchema.parse({
    ...values,
    sheet1: { ...values.sheet1, ...parsed.shipping, sessionYear: parsed.matchedSession || values.sheet1.sessionYear },
    descriptiveRows: allocated ? (parsed.allocatedRows ?? []).map(row => ({ ...row, schoolName: sourceSchools.get(row.schoolCode)! })) : parsed.descriptiveItems.map(item => ({ ...item, ...individualSchool })),
    ambiguousItems: parsed.ambiguousItems,
    combinedItems: parsed.combinedItems
  });
}

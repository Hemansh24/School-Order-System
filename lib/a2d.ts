import { z } from "zod";
import { createOrderSchema } from "./validation/orders";

export const a2dSchema = z.object({
  requestId: z.string().uuid(),
  expectedUpdatedAt: z.string().datetime(),
  mode: z.enum(["individual", "multiple_schools", "multiple_group"]),
  groupCode: z.string().trim().default(""),
  schools: z.array(z.string().trim().min(1)).min(1).max(1000),
  rows: z.array(z.object({
    schoolCode: z.string().trim().optional(),
    itemCode: z.string().trim().min(1),
    quantity: z.number().int().positive().max(2147483647)
  })).min(1),
  schoolExecutives: createOrderSchema.innerType().shape.schoolExecutives
}).superRefine((input, ctx) => {
  const issue = (message: string) => ctx.addIssue({ code: "custom", message });
  if (new Set(input.schools).size !== input.schools.length) issue("Select each school only once.");
  if (input.mode === "individual" && input.schools.length !== 1) issue("Individual conversion requires one school.");
  if (input.mode === "multiple_schools" && input.schools.length < 2) issue("Select at least two schools for pooled multiple-school conversion.");
  if (input.mode.endsWith("group") && !input.groupCode) issue("Select an end-school group.");
  const pooled = input.mode === "multiple_schools" || input.mode === "multiple_group";
  const keys = input.rows.map(row => `${pooled ? "" : row.schoolCode}:${row.itemCode}`);
  if (new Set(keys).size !== keys.length) issue("Duplicate school/item allocations are not allowed.");
  if (input.rows.some(row => pooled ? !!row.schoolCode : !row.schoolCode || !input.schools.includes(row.schoolCode))) issue("Allocations must belong to selected schools and the selected allocation mode.");
  if (!pooled && input.schools.some(code => !input.rows.some(row => row.schoolCode === code))) issue("Assign at least one item quantity to every selected school.");
  const executives = input.schoolExecutives ?? [];
  if (new Set(executives.map(row => row.schoolCode)).size !== executives.length || executives.some(row => !input.schools.includes(row.schoolCode))) issue("Executive assignments must belong to selected schools without duplicates.");
});
export type A2DInput = z.infer<typeof a2dSchema>;

/** GS membership is maintained; Christian groups use explicit school selection. */
export function a2dSchoolBelongsToGroup(schoolGroupCode: string | null, group: { groupCode: string; sourceType: string }) {
  return group.sourceType === "CHRISTIAN" || (group.sourceType === "GS" && (schoolGroupCode ?? "").trim().toUpperCase() === group.groupCode.trim().toUpperCase());
}

/** Compare each item independently; a matching grand total is insufficient. */
export function calculateA2DBalance(source: { itemCode: string; groupedQuantity: number }[], rows: { itemCode: string; quantity: number }[]) {
  const totals = new Map<string, number>();
  for (const row of rows) {
    if (!Number.isSafeInteger(row.quantity) || row.quantity <= 0) throw new Error("Enter positive whole quantities.");
    if (!source.some(item => item.itemCode === row.itemCode && item.groupedQuantity > 0)) throw new Error(`Item ${row.itemCode} is not available in this ambiguous order.`);
    totals.set(row.itemCode, (totals.get(row.itemCode) ?? 0) + row.quantity);
  }
  if (!rows.length) throw new Error("Allocate at least one item.");
  const balances = source.map(item => {
    const allocated = totals.get(item.itemCode) ?? 0;
    if (allocated > item.groupedQuantity) throw new Error(`Item ${item.itemCode}: allocated ${allocated} exceeds remaining quantity ${item.groupedQuantity}.`);
    return { itemCode: item.itemCode, before: item.groupedQuantity, allocated, remaining: item.groupedQuantity - allocated };
  });
  return { balances, full: balances.every(item => item.remaining === 0) };
}

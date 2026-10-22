import { entryModeForOrder, isGroupOrder } from "./order-model";
import type { CreateOrderInput } from "./validation/orders";

/** Read adapter only: saved orders/drafts upgrade when explicitly saved. */
export function normalizeOrderEntry(input: CreateOrderInput): CreateOrderInput {
  if (input.sheet1.orderType === "ambiguous") return { ...input, ambiguousSchools: [] };
  const mode = entryModeForOrder({ ...input.sheet1, descriptiveRows: input.descriptiveRows });
  const sheet1 = {
    ...input.sheet1, orderType: "descriptive" as const, descriptiveMode: mode,
    endUserGroupCode: input.sheet1.endUserGroupCode || (isGroupOrder(input.sheet1) ? input.sheet1.billingToCode : "")
  };
  if (mode !== "multiple_schools" || !input.descriptiveRows.length) return { ...input, sheet1 };
  const schools = new Map<string, CreateOrderInput["combinedSchools"][number]>();
  const items = new Map<string, CreateOrderInput["combinedItems"][number]>();
  for (const row of input.descriptiveRows) {
    schools.set(row.schoolCode, { schoolCode: row.schoolCode, schoolName: row.schoolName, notes: "" });
    const item = items.get(row.itemCode);
    const notes = [...new Set([item?.notes, row.notes].filter(Boolean))].join("\n");
    items.set(row.itemCode, { itemCode: row.itemCode, itemName: row.itemName, pooledQuantity: (item?.pooledQuantity ?? 0) + row.quantity, notes });
  }
  return { ...input, sheet1, descriptiveRows: [], combinedSchools: [...schools.values()], combinedItems: [...items.values()] };
}

export type DescriptiveMode = "individual" | "multiple_schools" | "multiple_group" | "allocated_schools" | "allocated_group";
type OrderMode = { orderType: string; descriptiveMode?: string | null; descriptiveRows?: { schoolCode: string }[] };

/** Group membership and pooled fulfillment are separate concerns. */
export function isGroupOrder(order: OrderMode) {
  return order.orderType === "combined" || (order.orderType === "descriptive" && ["group", "multiple_group", "allocated_group"].includes(order.descriptiveMode ?? ""));
}

export function isPooledOrder(order: OrderMode) {
  return order.orderType === "combined" || (order.orderType === "descriptive" && ["group", "multiple_group", "multiple_schools"].includes(order.descriptiveMode ?? ""));
}

export function hasLegacySchoolAllocations(order: OrderMode) {
  return order.orderType === "descriptive" && !isPooledOrder(order) && !["individual", "allocated_schools", "allocated_group"].includes(order.descriptiveMode ?? "") && new Set(order.descriptiveRows?.map(row => row.schoolCode)).size > 1;
}

export function entryModeForOrder(order: OrderMode): DescriptiveMode {
  if (order.descriptiveMode === "allocated_schools" || order.descriptiveMode === "allocated_group") return order.descriptiveMode;
  if (isGroupOrder(order)) return "multiple_group";
  if (order.descriptiveMode === "multiple_schools" || hasLegacySchoolAllocations(order)) return "multiple_schools";
  return "individual";
}

export function orderTypeLabel(order: OrderMode) {
  if (order.orderType === "ambiguous") return "Ambiguous";
  const mode = entryModeForOrder(order);
  return mode === "allocated_group" ? "Descriptive / Group (school quantities)" : mode === "allocated_schools" ? "Descriptive / Multiple Schools (school quantities)" : mode === "multiple_group" ? "Descriptive / Group" : mode === "multiple_schools" ? "Descriptive / Multiple Schools" : "Descriptive / Individual";
}

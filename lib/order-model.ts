export type DescriptiveMode = "individual" | "multiple_schools" | "multiple_group";
type OrderMode = { orderType: string; descriptiveMode?: string | null; descriptiveRows?: { schoolCode: string }[] };

/** Group membership and pooled fulfillment are separate concerns. */
export function isGroupOrder(order: OrderMode) {
  return order.orderType === "combined" || (order.orderType === "descriptive" && ["group", "multiple_group"].includes(order.descriptiveMode ?? ""));
}

export function isPooledOrder(order: OrderMode) {
  return isGroupOrder(order) || (order.orderType === "descriptive" && order.descriptiveMode === "multiple_schools");
}

export function hasLegacySchoolAllocations(order: OrderMode) {
  return order.orderType === "descriptive" && !isPooledOrder(order) && order.descriptiveMode !== "individual" && new Set(order.descriptiveRows?.map(row => row.schoolCode)).size > 1;
}

export function entryModeForOrder(order: OrderMode): DescriptiveMode {
  if (isGroupOrder(order)) return "multiple_group";
  if (order.descriptiveMode === "multiple_schools" || hasLegacySchoolAllocations(order)) return "multiple_schools";
  return "individual";
}

export function orderTypeLabel(order: OrderMode) {
  if (order.orderType === "ambiguous") return "Ambiguous";
  const mode = entryModeForOrder(order);
  return mode === "multiple_group" ? "Descriptive / Group" : mode === "multiple_schools" ? "Descriptive / Multiple Schools" : "Descriptive / Individual";
}

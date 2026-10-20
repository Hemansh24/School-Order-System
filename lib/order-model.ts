/** Legacy combined values remain readable during migration rollout. */
export function isGroupOrder(order: { orderType: string; descriptiveMode?: string | null }) {
  return order.orderType === "combined" || (order.orderType === "descriptive" && order.descriptiveMode === "group");
}
export function orderTypeLabel(order: { orderType: string; descriptiveMode?: string | null }) {
  return isGroupOrder(order) ? "Descriptive / Group" : order.orderType === "descriptive" ? "Descriptive / School" : "Ambiguous";
}

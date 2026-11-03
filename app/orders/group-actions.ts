"use server";
import { getCurrentSessionYear } from "@/lib/session-year";
import { createDirectGroupOrder } from "@/lib/services/group-orders";

function input(formData: FormData) {
  return { sessionYear: getCurrentSessionYear(), orderPlacedDate: String(formData.get("orderPlacedDate")), orderReceivedDate: String(formData.get("orderReceivedDate")), expectedDeliveryDate: String(formData.get("expectedDeliveryDate")), notes: String(formData.get("notes") || "") };
}
export async function createDirectGroupOrderAction(formData: FormData) {
  const ptCodes = String(formData.get("ptCodes") || "").split(/[\s,]+/).filter(Boolean);
  const items = JSON.parse(String(formData.get("items") || "[]"));
  return createDirectGroupOrder(Number(formData.get("locationId")), ptCodes, items, input(formData));
}

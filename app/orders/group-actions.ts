"use server";
import { revalidatePath } from "next/cache";
import { createDirectGroupOrder, createParentGroupOrder } from "@/lib/services/group-orders";

function input(formData: FormData) {
  return { sessionYear: String(formData.get("sessionYear") || "2026-2027"), orderPlacedDate: String(formData.get("orderPlacedDate")), orderReceivedDate: String(formData.get("orderReceivedDate")), expectedDeliveryDate: String(formData.get("expectedDeliveryDate")), notes: String(formData.get("notes") || "") };
}
export async function createDirectGroupOrderAction(formData: FormData) {
  const ptCodes = String(formData.get("ptCodes") || "").split(/[\s,]+/).filter(Boolean);
  const items = JSON.parse(String(formData.get("items") || "[]"));
  const order = await createDirectGroupOrder(Number(formData.get("locationId")), ptCodes, items, input(formData));
  revalidatePath("/orders"); revalidatePath("/");
  return order.orderSheet1Id;
}
export async function createParentGroupOrderAction(formData: FormData) {
  try {
    const childIds = formData.getAll("childOrderIds").map(Number).filter(Boolean);
    const order = await createParentGroupOrder(Number(formData.get("groupId")), childIds, input(formData));
    revalidatePath("/orders"); revalidatePath("/");
    return { orderSheet1Id: order.orderSheet1Id };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not group the selected PT orders." };
  }
}

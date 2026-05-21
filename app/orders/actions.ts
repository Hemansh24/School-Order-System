"use server";

import { redirect } from "next/navigation";
import {
  cancelHeldOrder,
  createOrder,
  createRevision,
  finalizeOrder,
  lockOrder,
  markPaymentReceived,
  putOrderOnHold,
  updateOrder,
  updateOrderStatus
} from "@/lib/services/orders";
import { createOrderSchema, type CreateOrderInput } from "@/lib/validation/orders";

export type ActionState = {
  ok: boolean;
  message?: string;
  orderSheet1Id?: number;
};

export async function createOrderAction(input: CreateOrderInput): Promise<ActionState> {
  try {
    const parsed = createOrderSchema.parse(input);
    const order = await createOrder(parsed);
    return { ok: true, orderSheet1Id: order.orderSheet1Id };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not create order."
    };
  }
}

export async function updateOrderAction(
  orderSheet1Id: number,
  input: CreateOrderInput
): Promise<ActionState> {
  try {
    const parsed = createOrderSchema.parse(input);
    const order = await updateOrder(orderSheet1Id, parsed);
    return { ok: true, orderSheet1Id: order.orderSheet1Id };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not update order."
    };
  }
}

export async function lockOrderAction(orderSheet1Id: number) {
  await lockOrder(orderSheet1Id);
}

export async function finalizeOrderAction(orderSheet1Id: number) {
  await finalizeOrder(orderSheet1Id);
}

export async function cancelOrderAction(orderSheet1Id: number) {
  await updateOrderStatus(orderSheet1Id, "cancelled");
}

export async function markPaymentReceivedAction(orderSheet1Id: number) {
  await markPaymentReceived(orderSheet1Id);
}

export async function putOrderOnHoldAction(orderSheet1Id: number) {
  await putOrderOnHold(orderSheet1Id);
}

export async function cancelHeldOrderAction(orderSheet1Id: number) {
  await cancelHeldOrder(orderSheet1Id);
}

export async function createRevisionAction(orderSheet1Id: number) {
  const revision = await createRevision(orderSheet1Id);
  redirect(`/orders/${revision.orderSheet1Id}`);
}

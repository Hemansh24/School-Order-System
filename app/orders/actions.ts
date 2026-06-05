"use server";

import { redirect } from "next/navigation";
import { formatActionError } from "@/lib/action-errors";
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

export type OrderMutationState = {
  ok: boolean;
  message?: string;
};

export async function createOrderAction(input: CreateOrderInput): Promise<ActionState> {
  try {
    const parsed = createOrderSchema.parse(input);
    const order = await createOrder(parsed);
    return { ok: true, orderSheet1Id: order.orderSheet1Id };
  } catch (error) {
    return {
      ok: false,
      message: formatActionError(error, {
        fallback: "Could not create this order. Please review the form and try again."
      })
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
      message: formatActionError(error, {
        fallback: "Could not update this order. Please review the form and try again."
      })
    };
  }
}

export async function lockOrderAction(
  orderSheet1Id: number,
  _previousState: OrderMutationState,
  _formData: FormData
): Promise<OrderMutationState> {
  try {
    await lockOrder(orderSheet1Id);
    return { ok: true, message: "Order locked." };
  } catch (error) {
    return {
      ok: false,
      message: formatActionError(error, {
        fallback: "Could not lock this order. Please review the order details and try again."
      })
    };
  }
}

export async function finalizeOrderAction(
  orderSheet1Id: number,
  _previousState: OrderMutationState,
  _formData: FormData
): Promise<OrderMutationState> {
  try {
    await finalizeOrder(orderSheet1Id);
    return { ok: true, message: "Order finalized." };
  } catch (error) {
    return {
      ok: false,
      message: formatActionError(error, {
        fallback: "Could not finalize this order. Please review the order details and try again."
      })
    };
  }
}

export async function cancelOrderAction(
  orderSheet1Id: number,
  _previousState: OrderMutationState,
  _formData: FormData
): Promise<OrderMutationState> {
  try {
    await updateOrderStatus(orderSheet1Id, "cancelled");
    return { ok: true, message: "Order cancelled." };
  } catch (error) {
    return {
      ok: false,
      message: formatActionError(error, {
        fallback: "Could not cancel this order. Please try again."
      })
    };
  }
}

export async function markPaymentReceivedAction(
  orderSheet1Id: number,
  _previousState: OrderMutationState,
  _formData: FormData
): Promise<OrderMutationState> {
  try {
    await markPaymentReceived(orderSheet1Id);
    return { ok: true, message: "Payment marked as received." };
  } catch (error) {
    return {
      ok: false,
      message: formatActionError(error, {
        fallback: "Could not update payment status. Please try again."
      })
    };
  }
}

export async function putOrderOnHoldAction(
  orderSheet1Id: number,
  _previousState: OrderMutationState,
  _formData: FormData
): Promise<OrderMutationState> {
  try {
    await putOrderOnHold(orderSheet1Id);
    return { ok: true, message: "Order put on hold." };
  } catch (error) {
    return {
      ok: false,
      message: formatActionError(error, {
        fallback: "Could not put this order on hold. Please try again."
      })
    };
  }
}

export async function cancelHeldOrderAction(
  orderSheet1Id: number,
  _previousState: OrderMutationState,
  _formData: FormData
): Promise<OrderMutationState> {
  try {
    await cancelHeldOrder(orderSheet1Id);
    return { ok: true, message: "On-hold order cancelled." };
  } catch (error) {
    return {
      ok: false,
      message: formatActionError(error, {
        fallback: "Could not cancel this on-hold order. Please try again."
      })
    };
  }
}

export async function createRevisionAction(
  orderSheet1Id: number,
  _previousState: OrderMutationState,
  _formData: FormData
): Promise<OrderMutationState> {
  try {
    const revision = await createRevision(orderSheet1Id);
    redirect(`/orders/${revision.orderSheet1Id}`);
  } catch (error) {
    return {
      ok: false,
      message: formatActionError(error, {
        fallback: "Could not create a revision for this order. Please try again."
      })
    };
  }
}

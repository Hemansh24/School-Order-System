"use client";

import { useActionState } from "react";
import {
  cancelHeldOrderAction,
  cancelOrderAction,
  createRevisionAction,
  finalizeOrderAction,
  lockOrderAction,
  markPaymentReceivedAction,
  putOrderOnHoldAction,
  type OrderMutationState
} from "@/app/orders/actions";
import { ButtonLink, SubmitButton } from "@/components/ui";

const initialState: OrderMutationState = { ok: false };

export function OrderActionButtons({
  orderSheet1Id,
  status,
  hasFinalRows,
  fulfillmentStatus
}: {
  orderSheet1Id: number;
  status: string;
  hasFinalRows: boolean;
  fulfillmentStatus?: "active" | "on_hold" | "cancelled";
}) {
  const canEdit =
    status === "draft" || status === "revision_requested" || status === "pending_confirmation";
  const canChangeStatus = status !== "finalized" && status !== "cancelled";
  const isOnHold = fulfillmentStatus === "on_hold";
  const isFulfillmentCancelled = fulfillmentStatus === "cancelled";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {canEdit ? (
          <ButtonLink href={`/orders/${orderSheet1Id}/edit`} className="border border-line bg-white">
            Edit Draft
          </ButtonLink>
        ) : null}
        <OrderActionForm action={createRevisionAction.bind(null, orderSheet1Id)} variant="secondary">
          Create Sub-order / Revision
        </OrderActionForm>
        {canEdit ? (
          <OrderActionForm action={lockOrderAction.bind(null, orderSheet1Id)} variant="secondary">
            Lock Order
          </OrderActionForm>
        ) : null}
        {status === "locked" ? (
          <OrderActionForm action={finalizeOrderAction.bind(null, orderSheet1Id)}>
            Finalize Order
          </OrderActionForm>
        ) : null}
        {canChangeStatus ? (
          <OrderActionForm action={cancelOrderAction.bind(null, orderSheet1Id)} variant="danger">
            Cancel Order
          </OrderActionForm>
        ) : null}
        {hasFinalRows ? (
          <>
            {!isOnHold && !isFulfillmentCancelled ? (
              <OrderActionForm action={putOrderOnHoldAction.bind(null, orderSheet1Id)} variant="secondary">
                Put On Hold
              </OrderActionForm>
            ) : null}
            {isOnHold ? (
              <OrderActionForm action={cancelHeldOrderAction.bind(null, orderSheet1Id)} variant="danger">
                Cancel Order
              </OrderActionForm>
            ) : null}
            {!isFulfillmentCancelled ? (
              <OrderActionForm
                action={markPaymentReceivedAction.bind(null, orderSheet1Id)}
                variant="secondary"
              >
                Mark Payment Received
              </OrderActionForm>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

function OrderActionForm({
  action,
  children,
  variant
}: {
  action: (state: OrderMutationState, formData: FormData) => Promise<OrderMutationState>;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-1">
      <SubmitButton type="submit" variant={variant}>
        {children}
      </SubmitButton>
      {state.message ? (
        <p className={`max-w-64 text-xs ${state.ok ? "text-green-800" : "text-red-700"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

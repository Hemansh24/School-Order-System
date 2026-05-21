import {
  cancelHeldOrderAction,
  cancelOrderAction,
  createRevisionAction,
  finalizeOrderAction,
  lockOrderAction,
  markPaymentReceivedAction,
  putOrderOnHoldAction
} from "@/app/orders/actions";
import { ButtonLink, SubmitButton } from "@/components/ui";

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
    <div className="flex flex-wrap gap-2">
      {canEdit ? (
        <ButtonLink href={`/orders/${orderSheet1Id}/edit`} className="border border-line bg-white">
          Edit Draft
        </ButtonLink>
      ) : null}
      <form action={createRevisionAction.bind(null, orderSheet1Id)}>
        <SubmitButton type="submit" variant="secondary">
          Create Sub-order / Revision
        </SubmitButton>
      </form>
      {canEdit ? (
        <form action={lockOrderAction.bind(null, orderSheet1Id)}>
          <SubmitButton type="submit" variant="secondary">
            Lock Order
          </SubmitButton>
        </form>
      ) : null}
      {status === "locked" ? (
        <form action={finalizeOrderAction.bind(null, orderSheet1Id)}>
          <SubmitButton type="submit">Finalize Order</SubmitButton>
        </form>
      ) : null}
      {canChangeStatus ? (
        <form action={cancelOrderAction.bind(null, orderSheet1Id)}>
          <SubmitButton type="submit" variant="danger">
            Cancel Order
          </SubmitButton>
        </form>
      ) : null}
      {hasFinalRows ? (
        <>
          {!isOnHold && !isFulfillmentCancelled ? (
            <form action={putOrderOnHoldAction.bind(null, orderSheet1Id)}>
              <SubmitButton type="submit" variant="secondary">
                Put On Hold
              </SubmitButton>
            </form>
          ) : null}
          {isOnHold ? (
            <form action={cancelHeldOrderAction.bind(null, orderSheet1Id)}>
              <SubmitButton type="submit" variant="danger">
                Cancel Order
              </SubmitButton>
            </form>
          ) : null}
          {!isFulfillmentCancelled ? (
            <form action={markPaymentReceivedAction.bind(null, orderSheet1Id)}>
              <SubmitButton type="submit" variant="secondary">
                Mark Payment Received
              </SubmitButton>
            </form>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

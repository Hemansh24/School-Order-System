"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { formatReorderCreatedAt, isRecentReorder, type ReorderReminder } from "@/lib/reorder-reminder";

export function ReorderReminderGate({ reminder, children }: {
  reminder: ReorderReminder | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [stage, setStage] = useState<"latest" | "recent" | "done">(reminder ? "latest" : "done");

  useEffect(() => {
    if (stage !== "done" && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [stage]);

  function cancel() {
    router.replace("/orders");
  }

  if (stage === "done" || !reminder) return <>
    {!reminder ? <p role="status" className="mb-4 rounded-md border border-line bg-canvas p-3 text-sm">No previous matching finalized order found.</p> : null}
    {children}
  </>;

  return <dialog ref={dialog} aria-labelledby="reorder-reminder-title" aria-describedby="reorder-reminder-message"
    onCancel={event => { event.preventDefault(); cancel(); }}
    className="w-[calc(100%-2rem)] max-w-lg rounded-lg border border-line bg-white p-6 text-ink shadow-lg backdrop:bg-black/40">
    <h2 id="reorder-reminder-title" className="text-lg font-semibold">
      {stage === "latest" ? "Latest order reminder" : "Order within the last 24 hours"}
    </h2>
    <p id="reorder-reminder-message" className="mt-3 text-sm">
      {stage === "latest"
        ? `The latest matching finalized order is Order ${reminder.orderNo}, created on ${formatReorderCreatedAt(reminder.createdAt)}. Continue with this reorder?`
        : "This order was created within the last 24 hours. Are you sure you want to place another order?"}
    </p>
    <div className="mt-6 flex justify-end gap-3">
      <button type="button" autoFocus onClick={cancel} className="focus-ring rounded-md border border-line px-4 py-2 text-sm font-semibold">Cancel</button>
      <button type="button" onClick={() => setStage(stage === "latest" && isRecentReorder(reminder) ? "recent" : "done")}
        className="focus-ring rounded-md bg-brand px-4 py-2 text-sm font-semibold text-ink">Continue</button>
    </div>
  </dialog>;
}

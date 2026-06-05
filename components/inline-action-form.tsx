"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/ui";

type InlineActionState = {
  ok: boolean;
  message?: string;
};

const initialState: InlineActionState = { ok: false };

export function InlineActionForm({
  action,
  children,
  variant = "secondary"
}: {
  action: (state: InlineActionState, formData: FormData) => Promise<InlineActionState>;
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

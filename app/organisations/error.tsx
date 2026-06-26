"use client";

import { Card, EmptyState, SubmitButton } from "@/components/ui";

export default function OrganisationsError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card className="p-4">
      <EmptyState>
        <div className="space-y-3">
          <p>Could not load organisation records.</p>
          <p className="break-words text-xs text-muted">{error.message}</p>
          <SubmitButton type="button" variant="secondary" onClick={reset}>
            Try Again
          </SubmitButton>
        </div>
      </EmptyState>
    </Card>
  );
}

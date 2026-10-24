"use client";

import { useEffect, useState } from "react";
import { getEndUserTypesAction } from "@/app/orders/end-user-type-actions";
import { sessionStartYear, type EndUser, type EndUserClassification } from "@/lib/end-user-type";
import { EndUserTypes } from "./end-user-types";

export function EndUserTypesPreview({ schools, sessionYear, orderSheet1Id }: {
  schools: EndUser[]; sessionYear: string; orderSheet1Id?: number;
}) {
  const [retry, setRetry] = useState(0);
  const key = JSON.stringify({ codes: schools.map(row => row.schoolCode).sort(), sessionYear, orderSheet1Id });
  const [result, setResult] = useState<{ key: string; types?: Record<string, EndUserClassification>; error?: string }>();
  useEffect(() => {
    if (sessionStartYear(sessionYear) === null || !schools.length) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const response = await getEndUserTypesAction(JSON.parse(key));
        if (!cancelled) setResult(response.ok ? { key, types: response.types } : { key, error: response.message });
      } catch {
        if (!cancelled) setResult({ key, error: "Type of End User is unavailable. Please try again." });
      }
    }, 150);
    return () => { cancelled = true; clearTimeout(timer); };
    // The key contains every server input; names and item quantities do not affect types.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, retry]);
  const current = result?.key === key ? result : undefined;
  return <EndUserTypes schools={schools} sessionYear={sessionYear} types={current?.types}
    loading={!current} error={current?.error} retry={() => { setResult(undefined); setRetry(value => value + 1); }} />;
}

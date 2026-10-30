"use client";

import { useId, useState } from "react";

export function BooksellerDiscount({ value, onChange, error }: {
  value: string | null | undefined;
  onChange?: (value: string) => void;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);
  const inputId = useId();
  return <div className="mt-2 text-sm text-muted">
    <label className="flex items-center gap-2">
      <input type="checkbox" className="focus-ring" checked={visible} onChange={event => setVisible(event.target.checked)} />
      Show discount
    </label>
    {visible ? <div className="mt-2 space-y-2">
      {onChange ? <>
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase">Discount for this order</label>
        <input id={inputId} name="sheet1.booksellerDiscount" className="focus-ring h-10 w-full rounded-md border border-line bg-white px-3 text-sm"
          value={value ?? ""} maxLength={500} placeholder={value == null ? "Discount not recorded" : "Enter discount"}
          onChange={event => onChange(event.target.value)} onKeyDown={event => { if (event.key === "Enter") event.preventDefault(); }} />
        <p className="text-xs">Saved with this order. Changes also update the bookseller’s default for future new orders.</p>
      </> : <p className="whitespace-pre-wrap">{value == null ? "Discount not recorded" : value || "No discount"}</p>}
      {error ? <p role="alert" className="text-xs text-red-700">{error}</p> : null}
    </div> : null}
  </div>;
}

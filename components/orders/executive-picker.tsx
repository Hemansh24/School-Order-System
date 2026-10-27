"use client";

import { useId, useState } from "react";

export type ExecutiveValue = { incumbentCode?: string | null; name: string };
export type ExecutiveOption = { incumbentCode: string; name: string };

export function ExecutivePicker({ value, options, onChange }: {
  value: ExecutiveValue; options: ExecutiveOption[]; onChange: (value: ExecutiveValue) => void;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const label = value.incumbentCode ? `${value.name} — ${value.incumbentCode}` : value.name;
  const query = value.incumbentCode ? "" : value.name.trim().toLowerCase();
  const matches = options.filter(option => !query || option.name.toLowerCase().includes(query) || option.incumbentCode.toLowerCase().includes(query));
  function finishTyping() {
    if (!value.incumbentCode) {
      const exact = options.filter(option => option.incumbentCode.toLowerCase() === query || option.name.toLowerCase() === query);
      if (exact.length === 1) onChange(exact[0]);
    }
    setOpen(false);
  }
  return <div className="relative min-w-0" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) finishTyping(); }}>
    <label htmlFor={id} className="mb-1 block text-xs font-semibold uppercase text-muted">Executive</label>
    <div className="flex min-w-0 gap-2">
      <input id={id} className="focus-ring h-10 w-full min-w-0 rounded-md border border-line bg-white px-3 text-sm"
        value={label} maxLength={200} placeholder="Search name or incumbent code"
        autoComplete="off" aria-expanded={open} aria-controls={`${id}-options`}
        onFocus={() => setOpen(true)} onChange={event => { onChange({ name: event.target.value, incumbentCode: null }); setOpen(true); }}
        onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); finishTyping(); } if (event.key === "Escape") setOpen(false); }} />
      <button type="button" className="focus-ring rounded border border-line px-2 text-sm" onClick={() => { onChange({ name: "", incumbentCode: null }); setOpen(false); }}>Clear</button>
    </div>
    {open ? <div id={`${id}-options`} className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-line bg-white p-1 shadow-lg">
      {matches.map(option => <button key={option.incumbentCode} type="button" className="focus-ring block w-full rounded px-3 py-2 text-left text-sm hover:bg-slate-100"
        onClick={() => { onChange(option); setOpen(false); }}>{option.name} — {option.incumbentCode}</button>)}
      {!value.incumbentCode && value.name.trim() ? <button type="button" className="focus-ring block w-full border-t border-line px-3 py-2 text-left text-sm font-semibold"
        onClick={() => { onChange({ name: value.name.trim(), incumbentCode: null }); setOpen(false); }}>Use custom name: {value.name.trim()}</button> : null}
      {!matches.length && !value.name.trim() ? <p className="p-3 text-sm text-muted">No imported executives. You can enter a custom name.</p> : null}
    </div> : null}
  </div>;
}

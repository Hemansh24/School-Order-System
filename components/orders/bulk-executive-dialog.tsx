"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SubmitButton } from "@/components/ui";
import { createPartySearchMatcher } from "@/lib/party-search";
import type { ExecutiveOption } from "@/components/orders/executive-picker";

export function BulkExecutiveDialog({ executives, selectedSchoolCount, disabled, onApply }: {
  executives: ExecutiveOption[];
  selectedSchoolCount: number;
  disabled?: boolean;
  onApply: (executive: ExecutiveOption) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ExecutiveOption | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const matchesSearch = createPartySearchMatcher(query);
  const matches = isOpen ? executives.filter(executive => matchesSearch({ code: executive.incumbentCode, name: executive.name })) : [];
  const selectedExecutive = selected ? executives.find(executive => executive.incumbentCode === selected.incumbentCode) : undefined;

  useEffect(() => {
    if (isOpen && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [isOpen]);

  function apply() {
    if (!selectedExecutive || !selectedSchoolCount || disabled) return;
    onApply(selectedExecutive);
    setAnnouncement(`${selectedExecutive.name} (${selectedExecutive.incumbentCode}) applied to ${selectedSchoolCount} selected schools.`);
    dialog.current?.close();
  }

  return <>
    <SubmitButton type="button" variant="secondary" disabled={disabled || !selectedSchoolCount} onClick={() => {
      setQuery("");
      setSelected(null);
      setAnnouncement("");
      setIsOpen(true);
    }}>Apply executive to all</SubmitButton>
    <span role="status" className="sr-only">{announcement}</span>
    {isOpen ? <dialog ref={dialog} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} onClose={() => setIsOpen(false)}
      className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-lg border border-line bg-white p-6 text-ink shadow-lg backdrop:bg-black/40">
      <h2 id={`${id}-title`} className="text-lg font-semibold">Apply executive to all</h2>
      <p id={`${id}-description`} className="mt-2 text-sm text-muted">Choose an executive for all {selectedSchoolCount} selected schools, including schools hidden by your search. This replaces their current assignments. Saved changes become each school's default.</p>
      <label className="mt-4 block">
        <span className="mb-1 block text-sm font-semibold">Incumbent code or executive name</span>
        <input autoFocus value={query} placeholder="Search incumbent code or name" autoComplete="off"
          className="focus-ring h-10 w-full min-w-0 rounded-md border border-line bg-white px-3 text-sm"
          onChange={event => { setQuery(event.target.value); setSelected(null); }}
          onKeyDown={event => { if (event.key === "Enter") event.preventDefault(); }} />
      </label>
      {!selectedExecutive ? <div className="mt-2 max-h-56 overflow-y-auto rounded-md border border-line">
        {matches.slice(0, 50).map(executive => <button key={executive.incumbentCode} type="button"
          className="focus-ring block w-full break-words px-3 py-2 text-left text-sm hover:bg-canvas"
          onClick={() => { setSelected(executive); setQuery(`${executive.incumbentCode} ${executive.name}`); }}>
          <span className="font-semibold">{executive.incumbentCode}</span> <span>{executive.name}</span>
        </button>)}
        {!matches.length ? <p className="p-3 text-sm text-muted">{executives.length ? "No matching executive found. Try another incumbent code or name." : "No executives are available in the executive table."}</p> : null}
        {matches.length > 50 ? <p className="border-t border-line p-3 text-xs text-muted">Showing the first 50 matches. Refine your search to find an executive.</p> : null}
      </div> : <div className="mt-3 rounded-md border border-line bg-canvas p-3 text-sm">
        <p className="font-semibold">{selectedExecutive.name}</p>
        <p className="mt-1 text-muted">Incumbent code: {selectedExecutive.incumbentCode}</p>
      </div>}
      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <SubmitButton type="button" variant="secondary" onClick={() => dialog.current?.close()}>Cancel</SubmitButton>
        <SubmitButton type="button" disabled={!selectedExecutive || !selectedSchoolCount || disabled} onClick={apply}>Apply to {selectedSchoolCount} schools</SubmitButton>
      </div>
    </dialog> : null}
  </>;
}

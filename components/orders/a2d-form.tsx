"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { convertAmbiguousOrderAction } from "@/app/orders/a2d/actions";
import { a2dSchema, a2dSchoolBelongsToGroup, calculateA2DBalance, type A2DInput } from "@/lib/a2d";
import { ExecutivePicker, type ExecutiveOption, type ExecutiveValue } from "./executive-picker";
import { Card } from "@/components/ui";

type School = { schoolCode: string; schoolName: string; groupCode: string | null; referenceCodes: string[] };
const inputClass = "rounded-md border border-line bg-white px-3 py-2 text-sm";
const keyFor = (school: string, item: string) => JSON.stringify([school, item]);

export function A2DForm({ sourceId, orderNo, updatedAt, items, schools, groups, executives, executiveDefaults }: {
  sourceId: number; orderNo: number; updatedAt: string;
  items: { itemCode: string; itemName: string; groupedQuantity: number }[];
  schools: School[];
  groups: { groupCode: string; groupName: string; sourceType: string }[];
  executives: ExecutiveOption[];
  executiveDefaults: { schoolCode: string; incumbentCode: string | null; name: string }[];
}) {
  const router = useRouter();
  const [mode, setMode] = useState<A2DInput["mode"]>("multiple_schools");
  const [groupCode, setGroupCode] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [assignments, setAssignments] = useState<Record<string, ExecutiveValue & { updateDefault?: boolean }>>({});
  const [review, setReview] = useState<A2DInput | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const inFlight = useRef(false);
  const requestId = useRef<string | null>(null);
  const pooled = mode === "multiple_schools" || mode === "multiple_group";
  const group = mode.endsWith("group");
  const selectedGroup = groups.find(row => row.groupCode === groupCode);
  const matchingGroups = groups.filter(row => !groupSearch.trim() || [row.groupCode, row.groupName].some(value => value.toLowerCase().includes(groupSearch.trim().toLowerCase())));
  const selectedSchools = schools.filter(school => selected.includes(school.schoolCode));
  const candidates = schools.filter(school => (!group || !!selectedGroup && a2dSchoolBelongsToGroup(school.groupCode, selectedGroup)) && (!search.trim() || [school.schoolName, ...school.referenceCodes].some(value => value.toLowerCase().includes(search.trim().toLowerCase()))));

  function toggleSchool(school: School, checked: boolean) {
    const removed = checked && mode === "individual" ? selected : checked ? [] : [school.schoolCode];
    setSelected(previous => checked ? mode === "individual" ? [school.schoolCode] : [...previous, school.schoolCode] : previous.filter(code => code !== school.schoolCode));
    setQuantities(previous => Object.fromEntries(Object.entries(previous).filter(([key]) => !removed.includes(JSON.parse(key)[0]))));
    setAssignments(previous => {
      const next = { ...previous };
      for (const code of removed) delete next[code];
      if (checked) {
        const saved = executiveDefaults.find(row => school.referenceCodes.includes(row.schoolCode));
        next[school.schoolCode] = { incumbentCode: saved?.incumbentCode ?? null, name: saved?.name ?? "", updateDefault: false };
      }
      return next;
    });
  }
  function resetSelection() { setSelected([]); setQuantities({}); setAssignments({}); setSearch(""); setError(""); }
  function changeGroup(code: string) {
    setGroupCode(code);
    resetSelection();
    const nextGroup = groups.find(row => row.groupCode === code);
    if (nextGroup?.sourceType !== "GS") return;
    const members = schools.filter(school => a2dSchoolBelongsToGroup(school.groupCode, nextGroup));
    setSelected(members.map(school => school.schoolCode));
    setAssignments(Object.fromEntries(members.map(school => {
      const saved = executiveDefaults.find(row => school.referenceCodes.includes(row.schoolCode));
      return [school.schoolCode, { incumbentCode: saved?.incumbentCode ?? null, name: saved?.name ?? "", updateDefault: false }];
    })));
  }
  function prepareReview() {
    try {
      const rows: A2DInput["rows"] = [];
      for (const schoolCode of pooled ? [""] : selected) for (const item of items) {
        const value = quantities[keyFor(schoolCode, item.itemCode)];
        if (value === undefined || value.trim() === "" || value === "0") continue;
        rows.push({ ...(pooled ? {} : { schoolCode }), itemCode: item.itemCode, quantity: Number(value) });
      }
      requestId.current ??= crypto.randomUUID();
      const input = a2dSchema.parse({ requestId: requestId.current, expectedUpdatedAt: updatedAt, mode, groupCode: group ? groupCode : "", schools: selected, rows,
        schoolExecutives: selected.map(schoolCode => ({ schoolCode, ...assignments[schoolCode] })) });
      calculateA2DBalance(items, rows);
      setError(""); setReview(input);
    } catch (failure) {
      setError(failure instanceof Error ? ("issues" in failure ? (failure as { issues: { message: string }[] }).issues[0].message : failure.message) : "Review your allocations.");
    }
  }
  function confirm() {
    if (!review || inFlight.current) return;
    inFlight.current = true;
    startTransition(async () => {
      try {
        const result = await convertAmbiguousOrderAction(sourceId, review);
        if (!result.ok) { setError(result.message); return; }
        router.push(`/orders/${result.orderSheet1Id}`); router.refresh();
      } catch { setError("Could not confirm conversion. Retry to safely check this request."); }
      finally { inFlight.current = false; }
    });
  }
  const summary = review ? calculateA2DBalance(items, review.rows) : null;
  function quantityTable(schoolCode: string) {
    return <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Locked item</th><th className="p-2">Available</th><th className="p-2">Allocate</th></tr></thead><tbody>{items.map(item => <tr key={item.itemCode} className="border-t border-line"><td className="p-2">{item.itemCode} — {item.itemName}</td><td className="p-2">{item.groupedQuantity}</td><td className="p-2"><input className={`${inputClass} w-28`} type="number" min={0} max={item.groupedQuantity} step={1} aria-label={`${schoolCode || "Pooled"} ${item.itemCode} quantity`} value={quantities[keyFor(schoolCode, item.itemCode)] ?? ""} onChange={event => setQuantities(previous => ({ ...previous, [keyFor(schoolCode, item.itemCode)]: event.target.value }))} /></td></tr>)}</tbody></table></div>;
  }
  return <div className="space-y-4">
    {error ? <p role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
    {review && summary ? <Card className="space-y-4 p-5">
      <h2 className="text-lg font-semibold">Review A2D conversion — Order {orderNo}</h2>
      <p>{summary.full ? `All remaining quantities match. Order ${orderNo} will become descriptive and retain its number.` : `One new descriptive order will be created. Order ${orderNo} will retain the remaining ambiguous quantities.`}</p>
      <p className="text-sm">{selectedSchools.map(school => `${school.schoolCode} — ${school.schoolName} (Executive: ${assignments[school.schoolCode]?.name || "None selected"})`).join("; ")}</p>
      {pooled ? <p className="text-sm text-muted">These quantities are pooled across the selected schools.</p> : <ul className="text-sm">{review.rows.map(row => <li key={keyFor(row.schoolCode!, row.itemCode)}>{row.schoolCode}: {row.itemCode} — {row.quantity}</li>)}</ul>}
      <table className="w-full text-left text-sm"><thead><tr><th>Item</th><th>Before</th><th>Allocated</th><th>Remaining</th></tr></thead><tbody>{summary.balances.map(row => <tr key={row.itemCode}><td className="py-2">{row.itemCode}</td><td>{row.before}</td><td>{row.allocated}</td><td>{row.remaining}</td></tr>)}</tbody></table>
      <p className="text-sm text-muted">The descriptive order inherits order details, status, and applicable item tracking. Conversion cannot be undone.</p>
      <div className="flex gap-3"><button className={inputClass} disabled={pending} onClick={() => { setReview(null); setError(""); }}>Back to allocations</button><button className="rounded-md bg-brand px-4 py-2 font-semibold text-ink disabled:opacity-50" disabled={pending} onClick={confirm}>{pending ? "Converting…" : "Confirm conversion"}</button></div>
    </Card> : <fieldset disabled={pending} className="space-y-4">
      <Card className="space-y-4 p-5">
        <h2 className="text-lg font-semibold">Order Sheet 2A — End users and item quantities</h2>
        <label className="block text-sm">Descriptive entry<select className={`${inputClass} ml-3`} value={mode} onChange={event => { setMode(event.target.value as A2DInput["mode"]); resetSelection(); }}><option value="individual">Individual school</option><option value="multiple_schools">Multiple schools — pooled quantities</option><option value="multiple_group">Group — pooled quantities</option></select></label>
        {group ? <div className="space-y-2">
          <label className="block text-sm" htmlFor="a2d-group-search">End-school group</label>
          <input id="a2d-group-search" className={`${inputClass} w-full`} aria-label="Search end-school groups" aria-controls="a2d-group-results" placeholder="Search groups by name or code" value={groupSearch} onChange={event => setGroupSearch(event.target.value)} />
          <div id="a2d-group-results" className="max-h-60 overflow-y-auto rounded-md border border-line" aria-label="Matching end-school groups">
            {matchingGroups.slice(0, 50).map(row => <button key={row.groupCode} type="button" aria-pressed={row.groupCode === groupCode} className={`block w-full border-b border-line px-3 py-2 text-left text-sm last:border-b-0 hover:bg-brand-soft ${row.groupCode === groupCode ? "bg-brand-soft font-semibold" : "bg-white"}`} onClick={() => { if (row.groupCode !== groupCode) changeGroup(row.groupCode); }}><span className="font-semibold">{row.groupCode}</span> — {row.groupName}</button>)}
            {!matchingGroups.length ? <p role="status" className="p-3 text-sm text-muted">No groups match this search.</p> : null}
          </div>
          {matchingGroups.length > 50 ? <p className="text-xs text-muted">Showing the first 50 matches. Search by group name or code to narrow the results.</p> : null}
          {selectedGroup ? <p className="text-sm font-semibold">Selected group: {selectedGroup.groupCode} — {selectedGroup.groupName}</p> : null}
        </div> : null}
        {selectedGroup && group ? <p className="text-sm text-muted">{selectedGroup.sourceType === "GS" ? "Member schools are selected automatically. Deselect any schools that are not participating." : "Select the participating schools for this Christian group."} Quantities are pooled; each selected school has its own executive.</p> : null}
        <input className={`${inputClass} w-full`} aria-label="Search end-user schools" placeholder="Search schools by name, PR or PT code" disabled={group && !selectedGroup} value={search} onChange={event => setSearch(event.target.value)} />
        <div className="max-h-60 space-y-2 overflow-auto">{(!group || groupCode) ? candidates.slice(0, 100).map(school => <label key={school.schoolCode} className="flex gap-2 text-sm"><input type="checkbox" checked={selected.includes(school.schoolCode)} onChange={event => toggleSchool(school, event.target.checked)} />{school.schoolCode} — {school.schoolName}</label>) : <p className="text-sm text-muted">Select a group to see its schools.</p>}{candidates.length > 100 ? <p className="text-xs text-muted">Showing the first 100 matches. Narrow the search to find more schools.</p> : null}</div>
        {(!group || selectedGroup) && !candidates.length ? <p role="status" className="text-sm text-muted">{search.trim() ? "No schools match this search. Clear the search to see available schools." : selectedGroup?.sourceType === "GS" ? "This GS group has no member schools. Update its membership before converting an order." : "No schools are available."}</p> : null}
        <p className="text-sm font-semibold">{selected.length} end users selected</p>
      </Card>
      {selectedSchools.map(school => <Card key={school.schoolCode} className="space-y-4 p-5"><div className="flex justify-between gap-3"><h3 className="font-semibold">{school.schoolCode} — {school.schoolName}</h3><button type="button" className="text-sm text-red-700" onClick={() => toggleSchool(school, false)}>Remove school</button></div><ExecutivePicker options={executives} value={assignments[school.schoolCode] ?? { name: "" }} onChange={value => setAssignments(previous => ({ ...previous, [school.schoolCode]: { ...value, updateDefault: true } }))} />{!pooled ? quantityTable(school.schoolCode) : null}</Card>)}
      {pooled && selected.length ? <Card className="p-5"><h3 className="mb-3 font-semibold">Pooled item quantities</h3>{quantityTable("")}</Card> : null}
      <button className="rounded-md bg-brand px-4 py-2 font-semibold text-ink disabled:opacity-50" disabled={!selected.length} onClick={prepareReview}>Review conversion</button>
    </fieldset>}
  </div>;
}

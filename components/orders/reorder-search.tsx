"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { searchReorderOrdersAction } from "@/app/orders/actions";
import type { ReorderSearchResponse } from "@/lib/reorder-search";
import { StatusPill } from "@/components/ui";

export function ReorderSearch() {
  const router = useRouter();
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const request = useRef(0);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<ReorderSearchResponse | null>(null);
  const [active, setActive] = useState(0);
  const [retry, setRetry] = useState(0);
  const search = query.trim();
  const orders = response?.ok ? response.orders : [];

  function close(restoreFocus = false) {
    request.current++;
    setOpen(false);
    if (restoreFocus) trigger.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) {
        request.current++;
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  useEffect(() => {
    const current = ++request.current;
    setResponse(null);
    setActive(0);
    if (!open || !search) return;
    const timer = setTimeout(async () => {
      try {
        const result = await searchReorderOrdersAction(search);
        if (request.current === current) setResponse(result);
      } catch {
        if (request.current === current) setResponse({ ok: false, message: "Could not search orders. Please try again." });
      }
    }, 250);
    return () => { clearTimeout(timer); request.current++; };
  }, [open, query, search, retry]);

  useEffect(() => {
    if (open && orders.length) document.getElementById(`${id}-option-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, id, open, orders.length]);

  function select(index: number) {
    const order = orders[index];
    if (!order) return;
    close();
    router.push(`/orders/${order.orderSheet1Id}/reorder`);
  }

  return (
    <div ref={root} className="relative" onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close();
    }} onKeyDown={event => {
      if (event.key === "Escape" && open) {
        event.preventDefault();
        close(true);
      }
    }}>
      <button ref={trigger} type="button" aria-expanded={open} aria-controls={`${id}-panel`}
        onClick={() => { if (open) close(); else setOpen(true); }}
        className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-brand-soft">
        <Search className="h-4 w-4" aria-hidden="true" /> Create reorder
      </button>
      {open ? <div id={`${id}-panel`} className="absolute right-0 z-30 mt-2 w-[min(30rem,calc(100vw-3rem))] rounded-lg border border-line bg-white shadow-lg">
        <div className="flex items-center gap-2 border-b border-line p-3">
          <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
          <input ref={input} value={query} maxLength={200} type="text" role="combobox"
            aria-label="Search orders to reorder" aria-autocomplete="list" aria-expanded={open}
            aria-controls={`${id}-results`} aria-describedby={`${id}-status`}
            aria-activedescendant={orders[active] ? `${id}-option-${active}` : undefined}
            placeholder="Order no., school, or billing party" autoComplete="off"
            className="focus-ring min-w-0 flex-1 rounded px-1 py-2 text-sm"
            onChange={event => {
              request.current++;
              setQuery(event.target.value);
              setResponse(null);
              setActive(0);
            }}
            onKeyDown={event => {
              if ((event.key === "ArrowDown" || event.key === "ArrowUp") && orders.length) {
                event.preventDefault();
                setActive(index => (index + (event.key === "ArrowDown" ? 1 : -1) + orders.length) % orders.length);
              } else if (event.key === "Enter") {
                event.preventDefault();
                select(active);
              }
            }} />
          <button type="button" aria-label="Close reorder search" onClick={() => close(true)} className="focus-ring rounded p-1 text-muted">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div id={`${id}-status`} role="status" className="px-4 py-3 text-xs text-muted">
          {!search ? "Search by order number, end-user school name/code, or billing name/code. Add words to narrow results."
            : !response ? "Searching orders…"
            : !response.ok ? response.message
            : !orders.length ? "No matching orders. Try another order number, school, or billing party."
            : response.hasMore ? "Showing 20 matches. Refine your search to find more specific orders."
            : `${orders.length} matching order${orders.length === 1 ? "" : "s"}. Select one to reorder.`}
          {response && !response.ok ? <button type="button" onClick={() => setRetry(value => value + 1)}
            className="focus-ring ml-2 rounded font-semibold text-brand-dark underline">Retry</button> : null}
        </div>
        <ul id={`${id}-results`} role="listbox" aria-label="Matching orders" aria-busy={Boolean(search && !response)}
          className="max-h-96 overflow-y-auto rounded-b-lg">
          {orders.map((order, index) => <li key={order.orderSheet1Id} id={`${id}-option-${index}`}
            role="option" aria-selected={active === index} onMouseEnter={() => setActive(index)}
            onMouseDown={event => event.preventDefault()} onClick={() => select(index)}
            className={`cursor-pointer border-t border-line px-4 py-3 text-sm ${active === index ? "bg-brand-soft" : "hover:bg-canvas"}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-ink">Order {order.orderNo} <span className="font-normal text-muted">· {order.sessionYear || "No session"}</span></span>
              <StatusPill value={order.orderStatus} />
            </div>
            <p className="mt-1 break-words text-ink">Billing: {order.billingToName}{order.billingToCode ? ` (${order.billingToCode})` : ""}</p>
            <p className="mt-1 break-words text-xs text-muted">Schools: {order.schools.length
              ? order.schools.map(school => `${school.schoolName} (${school.schoolCode})`).join("; ")
              : "No saved end-user schools"}</p>
          </li>)}
        </ul>
      </div> : null}
    </div>
  );
}

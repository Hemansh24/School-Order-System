"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, SubmitButton } from "@/components/ui";
import { createDirectGroupOrderAction, createParentGroupOrderAction } from "@/app/orders/group-actions";

type Props = { groups: any[]; items: any[]; orders: any[] };
const today = new Date().toISOString().slice(0, 10);
export function GroupOrderForm({ groups, items, orders }: Props) {
  const router = useRouter(); const [mode, setMode] = useState<"direct" | "parent">("parent"); const [locationId, setLocationId] = useState(""); const [groupId, setGroupId] = useState(""); const [itemCode, setItemCode] = useState(""); const [qty, setQty] = useState(""); const [lines, setLines] = useState<any[]>([]); const [error, setError] = useState(""); const [pending, start] = useTransition();
  const locations = groups.flatMap((g) => g.locations.map((l:any) => ({ ...l, groupCode: g.groupCode })));
  const location = locations.find((l) => String(l.schoolGroupLocationId) === locationId);
  const group = groups.find((g) => String(g.schoolGroupId) === groupId);
  const codes = mode === "parent" ? group?.locations.flatMap((l:any) => l.mappings.map((m:any) => m.ptCode)) ?? [] : location?.mappings.map((m:any) => m.ptCode) ?? [];
  const availableOrders = orders.filter((order) => codes.includes(order.billingToCode) && order.groupParentLinks.length === 0);
  const createDirect = (data: FormData) => { data.set("items", JSON.stringify(lines)); start(async () => { const id = await createDirectGroupOrderAction(data); router.push(`/orders/${id}`); }); };
  const createParent = (data: FormData) => { setError(""); start(async () => { const result = await createParentGroupOrderAction(data); if (result.error) { setError(result.error); return; } router.push(`/orders/${result.orderSheet1Id}`); }); };
  return <div className="space-y-5">{error ? <div className="rounded border border-danger bg-red-50 p-3 text-sm text-red-900">{error}</div> : null}<form action={createParent} className="space-y-4"><Card className="p-5"><h2 className="font-semibold">Parent Group Order</h2><p className="mb-4 text-sm text-muted">A numbered tracking container; PT orders remain independently fulfillable.</p><Dates/><label className="block text-sm font-medium">GS code<select required name="groupId" value={groupId} onChange={(e) => setGroupId(e.target.value)} className="mt-1 h-10 w-full rounded border border-line px-2"><option value="">Select group</option>{groups.map((g) => <option key={g.schoolGroupId} value={g.schoolGroupId}>{g.groupCode} - {g.groupName}</option>)}</select></label><div className="mt-4 space-y-2">{availableOrders.map((order:any) => <label key={order.orderSheet1Id} className="flex gap-2 text-sm"><input type="checkbox" name="childOrderIds" value={order.orderSheet1Id}/>#{order.orderNo} - {order.billingToCode} - {order.shippingToSummary}</label>)}{groupId && availableOrders.length === 0 ? <p className="text-sm text-muted">No ungrouped PT orders with confirmed mappings are available for this GS code.</p> : null}</div></Card><SubmitButton disabled={pending}>Create parent group order</SubmitButton></form></div>;
}
function Dates() { return <div className="mb-4 grid gap-3 md:grid-cols-3"><label>Placed<input required name="orderPlacedDate" type="date" defaultValue={today} className="mt-1 h-10 w-full rounded border border-line px-2"/></label><label>Received<input required name="orderReceivedDate" type="date" defaultValue={today} className="mt-1 h-10 w-full rounded border border-line px-2"/></label><label>Expected<input required name="expectedDeliveryDate" type="date" defaultValue={today} className="mt-1 h-10 w-full rounded border border-line px-2"/></label><input type="hidden" name="sessionYear" value="2026-2027"/></div>; }

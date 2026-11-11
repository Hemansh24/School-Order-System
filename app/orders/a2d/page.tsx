import Link from "next/link";
import { ButtonLink, Card, EmptyState, OrderNumber, PageHeader, StatusPill } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function A2DPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const params = await searchParams;
  const search = (params.q ?? "").trim().slice(0, 200);
  const requestedPage = Number(params.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 && requestedPage < 100000 ? requestedPage : 1;
  const where = { orderType: "ambiguous" as const, classification: "normal" as const, orderStatus: { not: "cancelled" as const }, ambiguousItems: { some: { groupedQuantity: { gt: 0 } } }, finalRows: { none: { cancelOrOnHoldStatus: "cancelled" as const } },
    ...(search ? { OR: [{ billingToName: { contains: search, mode: "insensitive" as const } }, { billingToCode: { contains: search, mode: "insensitive" as const } }, ...(Number.isInteger(Number(search)) && Number(search) >= 0 && Number(search) <= 2147483647 ? [{ orderNo: Number(search) }] : [])] } : {}) };
  const [orders, count] = await Promise.all([prisma.orderSheet1.findMany({ where, include: { ambiguousItems: true }, orderBy: [{ orderNo: "desc" }, { orderSheet1Id: "desc" }], take: 50, skip: (page - 1) * 50 }), prisma.orderSheet1.count({ where })]);
  const href = (next: number) => `/orders/a2d?q=${encodeURIComponent(search)}&page=${next}`;
  return <><PageHeader title="A2D — Ambiguous to Descriptive" description="Select an ambiguous order to allocate its remaining quantities to end users." action={<ButtonLink href="/orders">Orders</ButtonLink>} />
    <form className="mb-4 flex gap-2"><input name="q" defaultValue={search} placeholder="Order number or billing party" aria-label="Search ambiguous orders" className="rounded border border-line px-3 py-2 text-sm" /><button className="rounded bg-brand px-4 py-2 text-white">Search</button></form>
    {!orders.length ? <EmptyState>No eligible ambiguous orders found.</EmptyState> : <Card><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-canvas"><tr><th className="p-3">Order</th><th className="p-3">Billing party</th><th className="p-3">Status</th><th className="p-3">Remaining quantity</th><th className="p-3">Action</th></tr></thead><tbody>{orders.map(order => <tr key={order.orderSheet1Id} className="border-t border-line"><td className="p-3"><OrderNumber orderNo={order.orderNo} /></td><td className="p-3">{order.billingToName}<span className="block text-xs text-muted">{order.billingToCode}</span></td><td className="p-3"><StatusPill value={order.orderStatus} /></td><td className="p-3">{order.ambiguousItems.reduce((sum, row) => sum + row.groupedQuantity, 0)}</td><td className="p-3"><Link className="font-semibold text-brand-dark underline" href={`/orders/${order.orderSheet1Id}/a2d`}>Convert to descriptive</Link></td></tr>)}</tbody></table></div></Card>}
    <div className="mt-4 flex gap-4 text-sm">{page > 1 ? <Link href={href(page - 1)}>Previous</Link> : null}<span>Page {page} · {count} orders</span>{page * 50 < count ? <Link href={href(page + 1)}>Next</Link> : null}</div>
  </>;
}

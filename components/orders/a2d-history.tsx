import Link from "next/link";
import { Card } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export async function A2DHistory({ orderId }: { orderId: number }) {
  const history = await prisma.a2DConversion.findMany({ where: { OR: [{ sourceOrderId: orderId }, { resultOrderId: orderId }] }, include: { sourceOrder: { select: { orderNo: true } }, resultOrder: { select: { orderNo: true } } }, orderBy: { createdAt: "asc" } });
  if (!history.length) return null;
  return <Card className="mb-6 space-y-3 p-5"><h2 className="font-semibold">A2D conversion history</h2>{history.map(event => {
    const allocations = event.allocations as { schoolCode?: string; schoolName?: string; itemCode: string; quantity: number; schools?: string[] }[];
    const balances = event.balances as { itemCode: string; before: number; allocated: number; remaining: number }[];
    return <details key={event.id} className="text-sm"><summary className="cursor-pointer">{event.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} — {event.fullConversion ? "Converted in place" : "Partial conversion"}: <Link className="text-brand-dark underline" href={`/orders/${event.sourceOrderId}`}>Order {event.sourceOrder.orderNo}</Link> → <Link className="text-brand-dark underline" href={`/orders/${event.resultOrderId}`}>Order {event.resultOrder.orderNo}</Link></summary><div className="mt-3 overflow-auto">
      <table className="w-full text-left"><caption className="mb-2 text-left font-semibold">Allocated quantities</caption><thead><tr><th className="p-2">End user</th><th className="p-2">Item</th><th className="p-2">Quantity</th></tr></thead><tbody>{allocations.map((row, index) => <tr key={index} className="border-t border-line"><td className="p-2">{row.schoolCode ? `${row.schoolCode} — ${row.schoolName}` : `Pooled: ${row.schools?.join(", ")}`}</td><td className="p-2">{row.itemCode}</td><td className="p-2">{row.quantity}</td></tr>)}</tbody></table>
      <table className="mt-4 w-full text-left"><caption className="mb-2 text-left font-semibold">Balances at conversion</caption><thead><tr><th className="p-2">Item</th><th className="p-2">Before</th><th className="p-2">Allocated</th><th className="p-2">Remaining</th></tr></thead><tbody>{balances.map(row => <tr key={row.itemCode} className="border-t border-line"><td className="p-2">{row.itemCode}</td><td className="p-2">{row.before}</td><td className="p-2">{row.allocated}</td><td className="p-2">{row.remaining}</td></tr>)}</tbody></table>
    </div></details>;
  })}</Card>;
}

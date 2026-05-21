import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, EmptyState, PageHeader, StatusPill } from "@/components/ui";
import { getOrder } from "@/lib/services/orders";

export const dynamic = "force-dynamic";

export default async function FinalizationPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(Number(id));
  if (!order) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title="Finalization - Order Sheet 3"
        description="Sheet 3 has its own primary key and stores source_type plus source_id."
      />
      <Card>
        <div className="border-b border-line p-4">
          <h2 className="font-semibold text-ink">Final fulfillment rows</h2>
          <p className="text-sm text-muted">
            Descriptive quantities come from 2A. Ambiguous quantities come from 2B2.
          </p>
        </div>
        {order.finalRows.length === 0 ? (
          <div className="p-4">
            <EmptyState>This order has not been finalized into Order Sheet 3.</EmptyState>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-canvas text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3">Sheet 3 ID</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Hold/Cancel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {order.finalRows.map((row) => (
                  <tr key={row.orderSheet3Id}>
                    <td className="px-4 py-3 font-semibold text-ink">{row.orderSheet3Id}</td>
                    <td className="px-4 py-3">{row.sourceType} #{row.sourceId}</td>
                    <td className="px-4 py-3">{row.itemCode} - {row.itemName}</td>
                    <td className="px-4 py-3">{row.quantity}</td>
                    <td className="px-4 py-3">
                      <StatusPill value={row.paymentReceived ? "received" : "pending"} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill value={row.cancelOrOnHoldStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Link href={`/orders/${order.orderSheet1Id}`} className="mt-4 inline-block text-sm font-semibold text-brand-dark">
        Back to order details
      </Link>
    </>
  );
}

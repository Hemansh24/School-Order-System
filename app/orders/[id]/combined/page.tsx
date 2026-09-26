import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { getOrder } from "@/lib/services/orders";

export const dynamic = "force-dynamic";

export default async function CombinedEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(Number(id));
  if (!order) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title="Combined Entry - Order Sheet 2C1 and 2C2"
        description="Participating schools share the pooled item quantities in this order."
      />
      {order.orderType !== "combined" ? (
        <EmptyState>Order Sheet 2C1/2C2 is only available for combined orders.</EmptyState>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <div className="border-b border-line p-4">
              <h2 className="font-semibold text-ink">Order Sheet 2C1</h2>
              <p className="text-sm text-muted">Participating schools</p>
            </div>
            <ul className="divide-y divide-line">
              {order.combinedSchools.map((row) => (
                <li key={row.orderSheet2C1Id} className="p-4 text-sm">
                  <span className="font-semibold text-ink">{row.schoolCode}</span>
                  <span className="ml-2 text-muted">{row.schoolName}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <div className="border-b border-line p-4">
              <h2 className="font-semibold text-ink">Order Sheet 2C2</h2>
              <p className="text-sm text-muted">Pooled item quantities shared by all participating schools</p>
            </div>
            <ul className="divide-y divide-line">
              {order.combinedItems.map((row) => (
                <li key={row.orderSheet2C2Id} className="flex justify-between gap-4 p-4 text-sm">
                  <span><span className="font-semibold text-ink">{row.itemCode}</span><span className="ml-2 text-muted">{row.itemName}</span></span>
                  <span className="font-semibold text-ink">{row.pooledQuantity}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
      <Link href={`/orders/${order.orderSheet1Id}`} className="mt-4 inline-block text-sm font-semibold text-brand-dark">Back to order details</Link>
    </>
  );
}

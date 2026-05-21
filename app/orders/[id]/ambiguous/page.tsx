import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { getOrder } from "@/lib/services/orders";

export const dynamic = "force-dynamic";

export default async function AmbiguousEntryPage({
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
        title="Ambiguous Entry - Order Sheet 2B1 and 2B2"
        description="Grouped orders preserve involved schools separately from grouped item quantities."
      />
      {order.orderType !== "ambiguous" ? (
        <EmptyState>Order Sheet 2B1/2B2 is not available for descriptive orders.</EmptyState>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <div className="border-b border-line p-4">
              <h2 className="font-semibold text-ink">Order Sheet 2B1</h2>
              <p className="text-sm text-muted">Destination schools included in the grouped order.</p>
            </div>
            <ul className="divide-y divide-line">
              {order.ambiguousSchools.map((row) => (
                <li key={row.orderSheet2B1Id} className="p-4 text-sm">
                  <span className="font-semibold text-ink">{row.schoolCode}</span>
                  <span className="ml-2 text-muted">{row.schoolName}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <div className="border-b border-line p-4">
              <h2 className="font-semibold text-ink">Order Sheet 2B2</h2>
              <p className="text-sm text-muted">Grouped item quantities are not split by school.</p>
            </div>
            <ul className="divide-y divide-line">
              {order.ambiguousItems.map((row) => (
                <li key={row.orderSheet2B2Id} className="flex justify-between gap-4 p-4 text-sm">
                  <span>
                    <span className="font-semibold text-ink">{row.itemCode}</span>
                    <span className="ml-2 text-muted">{row.itemName}</span>
                  </span>
                  <span className="font-semibold text-ink">{row.groupedQuantity}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
      <Link href={`/orders/${order.orderSheet1Id}`} className="mt-4 inline-block text-sm font-semibold text-brand-dark">
        Back to order details
      </Link>
    </>
  );
}

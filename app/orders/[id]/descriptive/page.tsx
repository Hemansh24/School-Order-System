import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { getOrder } from "@/lib/services/orders";

export const dynamic = "force-dynamic";

export default async function DescriptiveEntryPage({
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
        title="Descriptive Entry - Order Sheet 2A"
        description="This editor is only shown for descriptive orders."
      />
      {order.orderType !== "descriptive" ? (
        <EmptyState>Order Sheet 2A is not available for ambiguous orders.</EmptyState>
      ) : (
        <Card>
          <div className="border-b border-line p-4">
            <h2 className="font-semibold text-ink">Sheet 2A rows</h2>
            <p className="text-sm text-muted">Each row has school, item, and positive quantity.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-canvas text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3">School</th>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {order.descriptiveRows.map((row) => (
                  <tr key={row.orderSheet2AId}>
                    <td className="px-4 py-3">{row.schoolCode} - {row.schoolName}</td>
                    <td className="px-4 py-3">{row.itemCode} - {row.itemName}</td>
                    <td className="px-4 py-3">{row.quantity}</td>
                    <td className="px-4 py-3 text-muted">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <Link href={`/orders/${order.orderSheet1Id}`} className="mt-4 inline-block text-sm font-semibold text-brand-dark">
        Back to order details
      </Link>
    </>
  );
}

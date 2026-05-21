import Link from "next/link";
import { ArrowRight, CalendarClock, ClipboardCheck, Layers3 } from "lucide-react";
import { Card, OrderNumber, PageHeader, StatusPill } from "@/components/ui";
import { getDashboardData } from "@/lib/services/orders";

export const dynamic = "force-dynamic";

const statLabels: Record<string, string> = {
  totalOrders: "Total orders",
  draftOrders: "Draft orders",
  pendingConfirmation: "Pending confirmation",
  lockedOrders: "Locked orders",
  finalizedOrders: "Finalized orders",
  cancelledOrders: "Cancelled orders",
  descriptiveOrders: "Descriptive orders",
  ambiguousOrders: "Ambiguous orders",
  pendingPayments: "Pending payments",
  onHoldOrders: "On-hold orders"
};

export default async function DashboardPage() {
  const { stats, recentOrders } = await getDashboardData();

  return (
    <>
      <PageHeader
        title="Operations Dashboard"
        description="Track Order Sheet 1 through 2A or 2B1/2B2 and finalization into Order Sheet 3."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Object.entries(stats).map(([key, value]) => (
          <Card key={key} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted">{statLabels[key]}</p>
                <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
              </div>
              <div className="rounded-md bg-brand-soft p-2 text-brand-dark">
                {key.includes("final") ? (
                  <ClipboardCheck className="h-5 w-5" />
                ) : key.includes("pending") ? (
                  <CalendarClock className="h-5 w-5" />
                ) : (
                  <Layers3 className="h-5 w-5" />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="border-b border-line p-4">
          <h2 className="font-semibold text-ink">Recent orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-canvas text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Display Order No</th>
                <th className="px-4 py-3">Billing To</th>
                <th className="px-4 py-3">Shipping To</th>
                <th className="px-4 py-3">Order Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Expected Delivery</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {recentOrders.map((order) => (
                <tr key={order.orderSheet1Id}>
                  <td className="px-4 py-3">
                    <OrderNumber orderNo={order.orderNo} subOrderNo={order.subOrderNo} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{order.billingToName}</div>
                    <div className="text-xs text-muted">{order.billingToType}</div>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted">
                    {order.shippingToSummary}
                  </td>
                  <td className="px-4 py-3 capitalize">{order.orderType}</td>
                  <td className="px-4 py-3">
                    <StatusPill value={order.orderStatus} />
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {order.expectedDeliveryDate.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/orders/${order.orderSheet1Id}`}
                      className="inline-flex items-center gap-1 font-semibold text-brand-dark"
                    >
                      Open <ArrowRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

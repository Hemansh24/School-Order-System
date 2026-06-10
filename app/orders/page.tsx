import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink, Card, OrderNumber, PageHeader, StatusPill } from "@/components/ui";
import { listOrders } from "@/lib/services/orders";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await listOrders();

  return (
    <>
      <PageHeader
        title="Orders"
        description="Order Sheet 1 records with separate parent and sub-order numbers."
        action={<ButtonLink href="/orders/new">Create order</ButtonLink>}
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-canvas text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Display No</th>
                <th className="px-4 py-3">Order No</th>
                <th className="px-4 py-3">Sub-order No</th>
                <th className="px-4 py-3">Billing To</th>
                <th className="px-4 py-3">Shipping To</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((order) => (
                <tr key={order.orderSheet1Id}>
                  <td className="px-4 py-3">
                    <OrderNumber orderNo={order.orderNo} subOrderNo={order.subOrderNo} />
                  </td>
                  <td className="px-4 py-3">{order.orderNo}</td>
                  <td className="px-4 py-3">{order.subOrderNo}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{order.billingToName}</div>
                    <div className="text-xs text-muted">{order.billingToCode}</div>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted">
                    <div className="font-medium text-ink">{order.shippingToName}</div>
                    <div className="truncate text-xs">{order.shippingToSummary}</div>
                  </td>
                  <td className="px-4 py-3 capitalize">{order.orderType}</td>
                  <td className="px-4 py-3">
                    <StatusPill value={order.orderStatus} />
                  </td>
                  <td className="px-4 py-3">
                    {order.pendingPayment ? (
                      <StatusPill value="pending" />
                    ) : (
                      <StatusPill value="received" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/orders/${order.orderSheet1Id}`}
                      className="inline-flex items-center gap-1 font-semibold text-brand-dark"
                    >
                      Details <ArrowRight className="h-4 w-4" />
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

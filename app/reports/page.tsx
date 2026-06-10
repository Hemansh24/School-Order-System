import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Card, OrderNumber, PageHeader, StatusPill, SubmitButton } from "@/components/ui";
import { searchOrders } from "@/lib/services/orders";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const paramsObject = await searchParams;
  const params = new URLSearchParams();
  Object.entries(paramsObject).forEach(([key, value]) => {
    if (typeof value === "string" && value.length > 0) {
      params.set(key, value);
    }
  });

  const orders = await searchOrders(params);

  return (
    <>
      <PageHeader
        title="Reports/Search"
        description="Filter orders by numbering, billing, shipping, type, status, item, dates, payment, and hold/cancel state."
      />

      <Card className="mb-6 p-4">
        <form className="grid gap-3 md:grid-cols-4 xl:grid-cols-6">
          <Input name="display_order_no" label="Display Order No" defaultValue={params.get("display_order_no") ?? ""} />
          <Input name="order_no" label="Order No" defaultValue={params.get("order_no") ?? ""} />
          <Input name="sub_order_no" label="Sub-order No" defaultValue={params.get("sub_order_no") ?? ""} />
          <Select name="billing_to_type" label="Billing Type" defaultValue={params.get("billing_to_type") ?? ""}>
            <option value="">All</option>
            <option value="school">School</option>
            <option value="vendor">Vendor</option>
          </Select>
          <Input name="billing" label="Billing Code/Name" defaultValue={params.get("billing") ?? ""} />
          <Input name="shipping" label="Shipping Code/Name" defaultValue={params.get("shipping") ?? ""} />
          <Select name="order_type" label="Order Type" defaultValue={params.get("order_type") ?? ""}>
            <option value="">All</option>
            <option value="descriptive">Descriptive</option>
            <option value="ambiguous">Ambiguous</option>
          </Select>
          <Select name="order_status" label="Order Status" defaultValue={params.get("order_status") ?? ""}>
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="revision_requested">Revision requested</option>
            <option value="pending_confirmation">Pending confirmation</option>
            <option value="locked">Locked</option>
            <option value="finalized">Finalized</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <Input name="item" label="Item Code/Name" defaultValue={params.get("item") ?? ""} />
          <Input name="session_year" label="Session Year" defaultValue={params.get("session_year") ?? ""} />
          <Select name="payment_status" label="Payment" defaultValue={params.get("payment_status") ?? ""}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="received">Received</option>
          </Select>
          <Select name="hold_status" label="Cancel/Hold" defaultValue={params.get("hold_status") ?? ""}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="on_hold">On hold</option>
          </Select>
          <Input type="date" name="expected_from" label="Expected From" defaultValue={params.get("expected_from") ?? ""} />
          <Input type="date" name="expected_to" label="Expected To" defaultValue={params.get("expected_to") ?? ""} />
          <Input type="date" name="dispatch_from" label="Dispatch From" defaultValue={params.get("dispatch_from") ?? ""} />
          <Input type="date" name="dispatch_to" label="Dispatch To" defaultValue={params.get("dispatch_to") ?? ""} />
          <div className="flex items-end">
            <SubmitButton type="submit" className="w-full">
              <Search className="mr-2 h-4 w-4" /> Search
            </SubmitButton>
          </div>
        </form>
      </Card>

      <Card>
        <div className="border-b border-line p-4">
          <h2 className="font-semibold text-ink">Results</h2>
          <p className="text-sm text-muted">
            Results explicitly show descriptive, ambiguous, pending, finalized, cancelled, and on-hold signals.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-canvas text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Display No</th>
                <th className="px-4 py-3">Billing</th>
                <th className="px-4 py-3">Shipping</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Hold/Cancel</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((order) => {
                const itemNames =
                  order.orderType === "descriptive"
                    ? order.descriptiveRows.map((row) => row.itemName)
                    : order.ambiguousItems.map((row) => row.itemName);
                const holdStates = order.finalRows.map((row) => row.cancelOrOnHoldStatus);

                return (
                  <tr key={order.orderSheet1Id}>
                    <td className="px-4 py-3">
                      <OrderNumber orderNo={order.orderNo} subOrderNo={order.subOrderNo} />
                    </td>
                    <td className="px-4 py-3">{order.billingToName}</td>
                    <td className="max-w-xs px-4 py-3 text-muted">
                      <div className="font-medium text-ink">{order.shippingToName}</div>
                      <div className="truncate text-xs">{order.shippingToSummary}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill value={order.orderType} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill value={order.orderStatus} />
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-muted">
                      {Array.from(new Set(itemNames)).join(", ")}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill value={order.pendingPayment ? "pending" : "received"} />
                    </td>
                    <td className="px-4 py-3">
                      {holdStates.length > 0 ? (
                        Array.from(new Set(holdStates)).map((state) => (
                          <span key={state} className="mr-1">
                            <StatusPill value={state} />
                          </span>
                        ))
                      ) : (
                        <StatusPill value="pending" />
                      )}
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
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function Input({
  label,
  name,
  defaultValue,
  type = "text"
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <label>
      <span className="mb-1 block text-xs font-semibold uppercase text-muted">{label}</span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        className="focus-ring h-10 w-full rounded-md border border-line bg-white px-3 text-sm"
      />
    </label>
  );
}

function Select({
  label,
  name,
  defaultValue,
  children
}: {
  label: string;
  name: string;
  defaultValue: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className="mb-1 block text-xs font-semibold uppercase text-muted">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="focus-ring h-10 w-full rounded-md border border-line bg-white px-3 text-sm"
      >
        {children}
      </select>
    </label>
  );
}

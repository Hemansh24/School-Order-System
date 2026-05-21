import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, EmptyState, OrderNumber, PageHeader, StatusPill } from "@/components/ui";
import { OrderActionButtons } from "@/components/orders/order-action-buttons";
import { getOrder } from "@/lib/services/orders";

export const dynamic = "force-dynamic";

export default async function OrderDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(Number(id));
  if (!order) {
    notFound();
  }
  const fulfillmentStatus = order.finalRows.some((row) => row.cancelOrOnHoldStatus === "cancelled")
    ? "cancelled"
    : order.finalRows.some((row) => row.cancelOrOnHoldStatus === "on_hold")
      ? "on_hold"
      : order.finalRows.length > 0
        ? "active"
        : undefined;

  return (
    <>
      <PageHeader
        title={`Order ${order.subOrderNo > 0 ? `${order.orderNo}.${order.subOrderNo}` : order.orderNo}`}
        description="Order details preserve the selected workflow and linked finalization rows."
        action={
          <OrderActionButtons
            orderSheet1Id={order.orderSheet1Id}
            status={order.orderStatus}
            hasFinalRows={order.finalRows.length > 0}
            fulfillmentStatus={fulfillmentStatus}
          />
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Info label="Display Order No">
              <OrderNumber orderNo={order.orderNo} subOrderNo={order.subOrderNo} />
            </Info>
            <Info label="Status">
              <StatusPill value={order.orderStatus} />
            </Info>
            {fulfillmentStatus ? (
              <Info label="Fulfillment">
                <StatusPill value={fulfillmentStatus} />
              </Info>
            ) : null}
            <Info label="Billing To">
              {order.billingToName}
              <span className="block text-xs text-muted">
                {order.billingToType} - {order.billingToCode}
              </span>
            </Info>
            <Info label="Shipping To">{order.shippingToSummary}</Info>
            <Info label="Order Type">
              <span className="capitalize">{order.orderType}</span>
            </Info>
            <Info label="Session Year">{order.sessionYear}</Info>
            <Info label="Order Received">{order.orderReceivedDate.toLocaleDateString()}</Info>
            <Info label="Expected Delivery">{order.expectedDeliveryDate.toLocaleDateString()}</Info>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold text-ink">Workflow</h2>
          <div className="mt-4 space-y-3 text-sm">
            <FlowStep active label="Order Sheet 1" />
            {order.orderType === "descriptive" ? (
              <FlowStep active label="Order Sheet 2A" />
            ) : (
              <>
                <FlowStep active label="Order Sheet 2B1 schools" />
                <FlowStep active label="Order Sheet 2B2 grouped items" />
              </>
            )}
            <FlowStep active={order.finalRows.length > 0} label="Order Sheet 3" />
          </div>
        </Card>
      </div>

      {order.orderType === "descriptive" ? (
        <Sheet2ATable rows={order.descriptiveRows} />
      ) : (
        <div className="mb-6 grid gap-4 xl:grid-cols-2">
          <Sheet2B1Table rows={order.ambiguousSchools} />
          <Sheet2B2Table rows={order.ambiguousItems} />
        </div>
      )}

      <Sheet3Table rows={order.finalRows} />

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        {order.orderType === "descriptive" ? (
          <Link className="font-semibold text-brand-dark" href={`/orders/${order.orderSheet1Id}/descriptive`}>
            Open Descriptive Entry - Sheet 2A
          </Link>
        ) : (
          <Link className="font-semibold text-brand-dark" href={`/orders/${order.orderSheet1Id}/ambiguous`}>
            Open Ambiguous Entry - Sheet 2B1 and 2B2
          </Link>
        )}
        <Link className="font-semibold text-brand-dark" href={`/orders/${order.orderSheet1Id}/finalization`}>
          Open Finalization - Sheet 3
        </Link>
      </div>
    </>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-muted">{label}</p>
      <div className="mt-1 text-sm font-medium text-ink">{children}</div>
    </div>
  );
}

function FlowStep({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`h-3 w-3 rounded-full ${active ? "bg-brand-dark" : "bg-line"}`} />
      <span className={active ? "font-medium text-ink" : "text-muted"}>{label}</span>
    </div>
  );
}

function Sheet2ATable({
  rows
}: {
  rows: Array<{
    orderSheet2AId: number;
    schoolCode: string;
    schoolName: string;
    itemCode: string;
    itemName: string;
    quantity: number;
  }>;
}) {
  return (
    <Card className="mb-6">
      <TableTitle title="Order Sheet 2A" subtitle="Descriptive school-wise quantities" />
      <SimpleTable
        headers={["School", "Item", "Quantity"]}
        rows={rows.map((row) => [
          `${row.schoolCode} - ${row.schoolName}`,
          `${row.itemCode} - ${row.itemName}`,
          row.quantity
        ])}
      />
    </Card>
  );
}

function Sheet2B1Table({
  rows
}: {
  rows: Array<{ orderSheet2B1Id: number; schoolCode: string; schoolName: string }>;
}) {
  return (
    <Card>
      <TableTitle title="Order Sheet 2B1" subtitle="Schools included in grouped order" />
      <SimpleTable
        headers={["School Code", "School Name"]}
        rows={rows.map((row) => [row.schoolCode, row.schoolName])}
      />
    </Card>
  );
}

function Sheet2B2Table({
  rows
}: {
  rows: Array<{
    orderSheet2B2Id: number;
    itemCode: string;
    itemName: string;
    groupedQuantity: number;
  }>;
}) {
  return (
    <Card>
      <TableTitle title="Order Sheet 2B2" subtitle="Grouped item quantities, not split by school" />
      <SimpleTable
        headers={["Item", "Grouped Quantity"]}
        rows={rows.map((row) => [`${row.itemCode} - ${row.itemName}`, row.groupedQuantity])}
      />
    </Card>
  );
}

function Sheet3Table({
  rows
}: {
  rows: Array<{
    orderSheet3Id: number;
    sourceType: string;
    sourceId: number;
    itemCode: string;
    itemName: string;
    quantity: number;
    paymentReceived: boolean;
    cancelOrOnHoldStatus: string;
  }>;
}) {
  return (
    <Card>
      <TableTitle title="Order Sheet 3" subtitle="Finalized fulfillment rows with independent primary keys" />
      {rows.length === 0 ? (
        <div className="p-4">
          <EmptyState>Lock and finalize this order to generate Order Sheet 3 rows.</EmptyState>
        </div>
      ) : (
        <SimpleTable
          headers={["Sheet 3 ID", "Source", "Item", "Quantity", "Payment", "Status"]}
          rows={rows.map((row) => [
            row.orderSheet3Id,
            `${row.sourceType} #${row.sourceId}`,
            `${row.itemCode} - ${row.itemName}`,
            row.quantity,
            row.paymentReceived ? "Received" : "Pending",
            row.cancelOrOnHoldStatus.replaceAll("_", " ")
          ])}
        />
      )}
    </Card>
  );
}

function TableTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="border-b border-line p-4">
      <h2 className="font-semibold text-ink">{title}</h2>
      <p className="text-sm text-muted">{subtitle}</p>
    </div>
  );
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: Array<Array<string | number>> }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-canvas text-xs uppercase text-muted">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td key={`${index}-${cellIndex}`} className="px-4 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

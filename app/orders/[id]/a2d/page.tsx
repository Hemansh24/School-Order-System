import { notFound } from "next/navigation";
import { A2DForm } from "@/components/orders/a2d-form";
import { ButtonLink, EmptyState, PageHeader } from "@/components/ui";
import { getOrder } from "@/lib/services/orders";
import { getExecutiveReferenceData } from "@/lib/services/executives";
import { prisma } from "@/lib/prisma";
import { asSchool } from "@/lib/school-reference";

export const dynamic = "force-dynamic";

export default async function A2DOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sourceId = Number(id);
  if (!Number.isSafeInteger(sourceId) || sourceId <= 0) notFound();
  const order = await getOrder(sourceId);
  if (!order) notFound();
  if (order.orderType !== "ambiguous" || order.classification !== "normal" || order.orderStatus === "cancelled" || order.finalRows.some(row => row.cancelOrOnHoldStatus === "cancelled")) return <EmptyState>This order is not eligible for A2D conversion. <ButtonLink href={`/orders/${sourceId}`}>Back to order</ButtonLink></EmptyState>;
  const [organisations, groups, executiveReference] = await Promise.all([
    prisma.organisation.findMany({ orderBy: { organisationName: "asc" } }),
    prisma.schoolGroup.findMany({ where: { active: true, sourceType: { in: ["GS", "CHRISTIAN"] } }, select: { groupCode: true, groupName: true, sourceType: true }, orderBy: { groupCode: "asc" } }),
    getExecutiveReferenceData()
  ]);
  return <><PageHeader title={`A2D — Order ${order.orderNo}`} description="Assign existing item quantities to known end users." action={<ButtonLink href={`/orders/${sourceId}`}>Back to order</ButtonLink>} />
    <A2DForm sourceId={sourceId} orderNo={order.orderNo} updatedAt={order.updatedAt.toISOString()} items={order.ambiguousItems.filter(row => row.groupedQuantity > 0).map(({ itemCode, itemName, groupedQuantity }) => ({ itemCode, itemName, groupedQuantity }))} schools={organisations.map(org => { const school = asSchool(org); return { schoolCode: school.schoolCode, schoolName: school.schoolName, referenceCodes: school.referenceCodes, groupCode: org.groupCode?.trim().toUpperCase() ?? null }; })} groups={groups} {...executiveReference} />
  </>;
}

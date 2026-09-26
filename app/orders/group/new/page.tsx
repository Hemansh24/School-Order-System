import { PageHeader } from "@/components/ui";
import { GroupOrderForm } from "@/components/orders/group-order-form";
import { getGroupOrderReferenceData } from "@/lib/services/groups";
export const dynamic = "force-dynamic";
export default async function NewGroupOrderPage() {
  const data = await getGroupOrderReferenceData();
  return <><PageHeader title="Group PT Orders" description="Create a numbered parent group order from existing PT-code orders. GS-code billing and shipping are selected from the normal Create Order screen." /><GroupOrderForm {...data}/></>;
}

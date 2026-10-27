import { hasLegacySchoolAllocations } from "@/lib/order-model";
import { notFound, redirect } from "next/navigation";
import { CreateOrderForm } from "@/components/orders/create-order-form";
import { PageHeader } from "@/components/ui";
import { getOrder } from "@/lib/services/orders";
import { getGsOrderOptions } from "@/lib/services/groups";
import { getReferenceData } from "@/lib/services/reference";
import { formatSchoolAddress, formatVendorAddress } from "@/lib/shipping";
import { savedOrderToInput } from "@/lib/order-input";
import { extractContactNumbers } from "@/lib/contact-numbers";
import { getExecutiveReferenceData } from "@/lib/services/executives";

export const dynamic = "force-dynamic";

function toSchoolOptions(
  schools: Array<{
    schoolCode: string;
    schoolName: string;
    phone: string | null;
    address: string | null;
    district: string | null;
    state: string | null;
    pincode: string | null;
  }>
): Array<{
  optionKey: string;
  schoolCode: string;
  schoolName: string;
  addressSummary: string;
  contactNumbers: string[];
}> {
  return schools.map((school) => ({
    optionKey: school.schoolCode,
    schoolCode: school.schoolCode,
    schoolName: school.schoolName,
    addressSummary: formatSchoolAddress(school),
    contactNumbers: extractContactNumbers(school.phone)
  }));
}

export default async function EditOrderPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(Number(id));
  if (!order) {
    notFound();
  }

  if (
    order.orderStatus === "finalized" || order.orderStatus === "cancelled" || order.classification !== "normal"
  ) {
    redirect(`/orders/${order.orderSheet1Id}`);
  }

  const reference = await getReferenceData();
  const executiveReference = await getExecutiveReferenceData();
  const gsOptions = await getGsOrderOptions();
  const initialValues = savedOrderToInput(order);

  return (
    <>
      <PageHeader
        title={`Edit Order ${order.orderNo}`}
        description="Update this order before finalization. Its order number remains unchanged."
      />
      <CreateOrderForm
        {...executiveReference}
        schools={toSchoolOptions(reference.schools)}
        groups={[
          ...gsOptions,
          ...reference.groupLocations.filter(location => order.billingToCode === `${location.schoolGroup.groupCode}-${location.subCode}`).map(location => ({ optionKey: `${location.schoolGroup.groupCode}-${location.subCode}`, schoolCode: `${location.schoolGroup.groupCode}-${location.subCode}`, schoolName: location.name, addressSummary: order.shippingToSummary, groupType: "GS" as const })),
          ...reference.christianGroups.map((group) => ({ optionKey: group.groupCode, schoolCode: group.groupCode, schoolName: group.groupName, addressSummary: formatSchoolAddress(group), contactNumbers: extractContactNumbers(group.phoneEmail), groupType: "Christian" as const }))
        ]}
        vendors={reference.vendors.map((vendor) => ({
          vendorCode: vendor.vendorCode,
          vendorName: vendor.vendorName,
          vendorType: vendor.vendorType,
          vendorRating: vendor.vendorRating,
          actualDiscount: vendor.actualDiscount,
          committedDiscount: vendor.committedDiscount,
          contactNumbers: extractContactNumbers(vendor.phone),
          addressSummary: formatVendorAddress(vendor.address),
          schools: toSchoolOptions(vendor.vendorSchools.map((row) => row.school))
        }))}
        items={reference.items.map((item) => ({
          itemCode: item.itemCode,
          itemName: item.itemName,
          categoryCode: item.categoryCode,
          categoryType: item.categoryType,
          subCategoryCode: item.subCategoryCode,
          languageCode: item.languageCode,
          customisationCode: item.customisationCode,
          customisationName: item.customisationName,
          editionCode: item.editionCode,
          mrp: item.mrp?.toString() ?? null
        }))}
        initialValues={initialValues}
        requiresLegacyConversion={hasLegacySchoolAllocations(order)}
        orderSheet1Id={order.orderSheet1Id}
        orderCreatedAt={order.createdAt.toISOString()}
        submitLabel="Save Changes"
      />
    </>
  );
}

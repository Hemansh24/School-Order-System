import { reorderDefaults } from "@/lib/reorder";
import { notFound, redirect } from "next/navigation";
import { CreateOrderForm } from "@/components/orders/create-order-form";
import { PageHeader } from "@/components/ui";
import { getOrder } from "@/lib/services/orders";
import { getGsOrderOptions } from "@/lib/services/groups";
import { getReferenceData } from "@/lib/services/reference";
import { formatSchoolAddress, formatVendorAddress } from "@/lib/shipping";
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

export default async function ReorderPage({
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
    order.classification !== "normal"
  ) {
    redirect(`/orders/${order.orderSheet1Id}`);
  }

  const reference = await getReferenceData();
  const executiveReference = await getExecutiveReferenceData();
  const gsOptions = await getGsOrderOptions();
  const { values: initialValues, individualSchool } = reorderDefaults(order);

  return (
    <>
      <PageHeader
        title={`Reorder of Order ${order.orderNo}`}
        description="Choose new items and quantities, and update shipping if needed. Billing and end users stay the same. Saving creates a new draft with a new order number."
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
        reorderSourceId={order.orderSheet1Id}
        reorderSourceNo={order.orderNo}
        reorderSchool={individualSchool}
        submitLabel="Place Reorder"
      />
    </>
  );
}

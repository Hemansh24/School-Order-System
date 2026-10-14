import { PageHeader } from "@/components/ui";
import { CreateOrderForm } from "@/components/orders/create-order-form";
import { getGsOrderOptions } from "@/lib/services/groups";
import { getReferenceData } from "@/lib/services/reference";
import { formatSchoolAddress, formatVendorAddress } from "@/lib/shipping";
import { extractContactNumbers } from "@/lib/contact-numbers";

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

export default async function CreateOrderPage() {
  const reference = await getReferenceData();
  const gsOptions = await getGsOrderOptions();

  return (
    <>
      <PageHeader
        title="Create Order"
        description="Create PT-code, GS-code, or Christian C1-group orders. Group choices are available in the Billing To and Shipping To search fields."
      />
      <CreateOrderForm
        schools={toSchoolOptions(reference.schools)}
        groups={[
          ...gsOptions,
          ...reference.christianGroups.map((group) => ({ optionKey: group.groupCode, schoolCode: group.groupCode, schoolName: group.groupName, addressSummary: formatSchoolAddress(group), contactNumbers: extractContactNumbers(group.phoneEmail), groupType: "Christian" as const }))
        ]}
        vendors={reference.vendors.map((vendor) => ({
          vendorCode: vendor.vendorCode,
          vendorName: vendor.vendorName,
          vendorType: vendor.vendorType,
          vendorRating: vendor.vendorRating,
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
      />
    </>
  );
}

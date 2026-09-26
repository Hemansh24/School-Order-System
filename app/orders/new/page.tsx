import { PageHeader } from "@/components/ui";
import { CreateOrderForm } from "@/components/orders/create-order-form";
import { getReferenceData } from "@/lib/services/reference";
import { formatSchoolAddress, formatVendorAddress } from "@/lib/shipping";

export const dynamic = "force-dynamic";

function toSchoolOptions(
  schools: Array<{
    schoolCode: string;
    schoolName: string;
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
}> {
  return schools.map((school) => ({
    optionKey: school.schoolCode,
    schoolCode: school.schoolCode,
    schoolName: school.schoolName,
    addressSummary: formatSchoolAddress(school)
  }));
}

export default async function CreateOrderPage() {
  const reference = await getReferenceData();

  return (
    <>
      <PageHeader
        title="Create Order"
        description="Create PT-code or GS-code orders. GS-code locations are available in the Billing To and Shipping To search fields."
      />
      <CreateOrderForm
        schools={toSchoolOptions(reference.schools)}
        groups={reference.groupLocations.map((location) => ({ optionKey: `${location.schoolGroup.groupCode}-${location.subCode}`, schoolCode: `${location.schoolGroup.groupCode}-${location.subCode}`, schoolName: location.name, addressSummary: formatSchoolAddress(location) }))}
        vendors={reference.vendors.map((vendor) => ({
          vendorCode: vendor.vendorCode,
          vendorName: vendor.vendorName,
          vendorType: vendor.vendorType,
          vendorRating: vendor.vendorRating,
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

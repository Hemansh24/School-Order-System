import { PageHeader } from "@/components/ui";
import { CreateOrderForm } from "@/components/orders/create-order-form";
import { getReferenceData } from "@/lib/services/reference";

export const dynamic = "force-dynamic";

function toSchoolOptions(
  schools: Array<{
    schoolCode: string;
    schoolName: string;
  }>
): Array<{
  optionKey: string;
  schoolCode: string;
  schoolName: string;
}> {
  return schools.map((school) => ({
    optionKey: school.schoolCode,
    schoolCode: school.schoolCode,
    schoolName: school.schoolName
  }));
}

export default async function CreateOrderPage() {
  const reference = await getReferenceData();

  return (
    <>
      <PageHeader
        title="Create Order"
        description="Step 1 creates Order Sheet 1, then the selected type opens either 2A or 2B1/2B2."
      />
      <CreateOrderForm
        schools={toSchoolOptions(reference.schools)}
        vendors={reference.vendors.map((vendor) => ({
          vendorCode: vendor.vendorCode,
          vendorName: vendor.vendorName,
          vendorType: vendor.vendorType,
          vendorRating: vendor.vendorRating,
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

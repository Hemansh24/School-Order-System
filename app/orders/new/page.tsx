import { PageHeader } from "@/components/ui";
import { CreateOrderForm } from "@/components/orders/create-order-form";
import { getReferenceData } from "@/lib/services/reference";

export const dynamic = "force-dynamic";

export default async function CreateOrderPage() {
  const reference = await getReferenceData();

  return (
    <>
      <PageHeader
        title="Create Order"
        description="Step 1 creates Order Sheet 1, then the selected type opens either 2A or 2B1/2B2."
      />
      <CreateOrderForm
        schools={reference.schools.map((school) => ({
          schoolCode: school.schoolCode,
          schoolName: school.schoolName
        }))}
        vendors={reference.vendors.map((vendor) => ({
          vendorCode: vendor.vendorCode,
          vendorName: vendor.vendorName,
          vendorType: vendor.vendorType,
          vendorRating: vendor.vendorRating,
          schools: vendor.vendorSchools.map((row) => ({
            schoolCode: row.school.schoolCode,
            schoolName: row.school.schoolName
          }))
        }))}
        items={reference.items.map((item) => ({
          itemCode: item.itemCode,
          itemName: item.itemName
        }))}
      />
    </>
  );
}

import { notFound } from "next/navigation";
import { EditVendorForm } from "@/components/reference/reference-forms";
import { ButtonLink, PageHeader } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditVendorPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [vendor, schools] = await Promise.all([
    prisma.vendor.findUnique({
      where: { vendorId: Number(id) },
      include: { vendorSchools: true }
    }),
    prisma.school.findMany({ orderBy: { schoolName: "asc" } })
  ]);

  if (!vendor) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title="Edit Vendor"
        description="Update bookseller details and school links used by vendor-billed orders."
        action={<ButtonLink href="/vendors">Back to vendors</ButtonLink>}
      />
      <EditVendorForm
        schools={schools}
        vendor={{
          vendorId: vendor.vendorId,
          vendorCode: vendor.vendorCode,
          vendorName: vendor.vendorName,
          vendorType: vendor.vendorType,
          vendorRating: vendor.vendorRating,
          address: vendor.address,
          contactPerson: vendor.contactPerson,
          phone: vendor.phone,
          email: vendor.email,
          schoolIds: vendor.vendorSchools.map((row) => row.schoolId)
        }}
      />
    </>
  );
}


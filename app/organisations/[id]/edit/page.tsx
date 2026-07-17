import { notFound } from "next/navigation";
import { EditOrganisationForm } from "@/components/reference/organisation-forms";
import { PageHeader } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditOrganisationPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const organisation = await prisma.organisation.findUnique({
    where: { id: BigInt(id) }
  });

  if (!organisation) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title="Edit Organisation"
        description="Review the organisation record. PR stays fixed and PT remains system-assigned."
      />
      <EditOrganisationForm
        organisation={{
          id: organisation.id.toString(),
          groupCode: organisation.groupCode,
          prCode: organisation.prCode,
          ptCode: organisation.ptCode,
          organisationName: organisation.organisationName,
          address: organisation.address,
          district: organisation.district,
          state: organisation.state,
          pinCode: organisation.pinCode,
          phone: organisation.phone,
          email: organisation.email,
          website: organisation.website,
          actionStatus: organisation.actionStatus,
          remark: organisation.remark,
          academicYear: organisation.academicYear,
          strength: organisation.strength,
          boardType: organisation.boardType,
          sessionStartFrom: organisation.sessionStartFrom
            ? organisation.sessionStartFrom.toISOString().slice(0, 10)
            : null,
          minorityType: organisation.minorityType,
          saturdayStatus: organisation.saturdayStatus,
          workingStatus: organisation.workingStatus
        }}
      />
    </>
  );
}

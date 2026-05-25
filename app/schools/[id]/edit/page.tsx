import { notFound } from "next/navigation";
import { EditSchoolForm } from "@/components/reference/reference-forms";
import { ButtonLink, PageHeader } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditSchoolPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const school = await prisma.school.findUnique({
    where: { schoolId: Number(id) }
  });

  if (!school) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title="Edit School"
        description="Update the school reference used by new orders and vendor links."
        action={<ButtonLink href="/schools">Back to schools</ButtonLink>}
      />
      <EditSchoolForm school={school} />
    </>
  );
}


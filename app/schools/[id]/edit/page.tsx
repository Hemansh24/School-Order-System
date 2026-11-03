import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function EditSchoolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) notFound();
  const record = await prisma.organisation.findFirst({ where: { legacySchoolIds: { has: Number(id) } } });
  if (!record) notFound();
  redirect(`/organisations/${record.id.toString()}/edit`);
}

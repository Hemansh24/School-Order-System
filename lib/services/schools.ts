import { prisma } from "@/lib/prisma";
import { asSchool, organisationCodes } from "@/lib/school-reference";
import { nextCompactCode } from "@/lib/reference-codes";

type SchoolResolutionInput = {
  schoolName?: string; address?: string; district?: string; state?: string;
  pincode?: string; contactPerson?: string; phone?: string; email?: string;
};
export type SchoolMatch = ReturnType<typeof asSchool>;
const normalize = (value?: string | null) => (value ?? "").trim().toLowerCase();
const identityFields = ["schoolName", "address", "district", "state", "pincode"] as const;

export async function findSchoolsByFields(input: SchoolResolutionInput): Promise<SchoolMatch[]> {
  const records = await prisma.organisation.findMany({ orderBy: [{ organisationName: "asc" }, { prCode: "asc" }] });
  return records.map(asSchool).filter(school => identityFields.every(field =>
    !normalize(input[field]) || normalize(school[field]).includes(normalize(input[field]))));
}

export async function createOrReuseSchool(input: SchoolResolutionInput & { schoolName: string }) {
  return prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(741024)`;
    const records = await tx.organisation.findMany();
    const matches = records.filter(record => identityFields.every(field =>
      normalize(asSchool(record)[field]) === normalize(input[field])));
    if (matches.length > 1) throw new Error("Multiple organisations have these details. Select an existing PR code.");
    if (matches[0]) return { created: false as const, school: asSchool(matches[0]) };
    const record = await tx.organisation.create({ data: {
      prCode: nextCompactCode("PR", records.flatMap(organisationCodes)),
      organisationName: input.schoolName.trim(),
      address: input.address?.trim() || null, district: input.district?.trim() || null,
      state: input.state?.trim() || null, pinCode: input.pincode?.trim() || null,
      contactPerson: input.contactPerson?.trim() || null,
      phone: input.phone?.trim() || null, email: input.email?.trim() || null
    } });
    return { created: true as const, school: asSchool(record) };
  });
}

import type { Organisation, Prisma } from "@prisma/client";

/** School is an order-entry role of an organisation, not a separate master. */
export function asSchool(organisation: Organisation) {
  return {
    organisationId: organisation.id.toString(),
    schoolCode: organisation.ptCode?.trim() || organisation.prCode.trim(),
    schoolName: organisation.organisationName,
    referenceCodes: organisationCodes(organisation),
    address: organisation.address,
    district: organisation.district,
    state: organisation.state,
    pincode: organisation.pinCode,
    contactPerson: organisation.contactPerson,
    phone: organisation.phone,
    email: organisation.email
  };
}

export function schoolCodeWhere(codes: string[]): Prisma.OrganisationWhereInput {
  return { OR: [
    { prCode: { in: codes } },
    { ptCode: { in: codes } },
    { legacySchoolCodes: { hasSome: codes } }
  ] };
}

export function organisationCodes(organisation: Pick<Organisation, "prCode" | "ptCode" | "legacySchoolCodes">) {
  return [...new Set([organisation.prCode, organisation.ptCode, ...organisation.legacySchoolCodes]
    .filter((code): code is string => !!code))];
}

export async function findSchoolByCode(tx: Prisma.TransactionClient, code: string) {
  const matches = await tx.organisation.findMany({ where: schoolCodeWhere([code.trim()]), take: 2 });
  if (matches.length > 1) throw new Error(`School code ${code} belongs to multiple organisations.`);
  return matches[0] ?? null;
}

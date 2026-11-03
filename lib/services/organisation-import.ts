import type { Prisma } from "@prisma/client";
import { moveSchoolGroupCodeTx } from "@/lib/pt-codes";
import { schoolCodeWhere } from "@/lib/school-reference";

/** Caller holds allocation lock 741024. Imports retain local identity and links. */
export async function upsertImportedOrganisation(
  tx: Prisma.TransactionClient,
  row: Prisma.OrganisationUncheckedCreateInput
) {
  const prCode = row.prCode.trim();
  const existing = await tx.organisation.findUnique({ where: { prCode } });
  const incomingPt = row.ptCode?.trim() || null;
  if (existing?.ptCode && incomingPt && existing.ptCode !== incomingPt) {
    throw new Error(`Cannot reassign ${prCode} from ${existing.ptCode} to ${incomingPt}.`);
  }
  for (const code of [prCode, incomingPt].filter((code): code is string => !!code)) {
    const owner = await tx.organisation.findFirst({
      where: { ...schoolCodeWhere([code]), ...(existing ? { id: { not: existing.id } } : {}) }
    });
    if (owner) throw new Error(`Code ${code} already belongs to ${owner.prCode}.`);
  }
  const data = { ...row, prCode, ptCode: incomingPt ?? existing?.ptCode ?? null };
  const result = await tx.organisation.upsert({ where: { prCode }, create: data, update: data });
  if (existing && !existing.ptCode && result.ptCode) {
    await moveSchoolGroupCodeTx(tx, prCode, result.ptCode);
  }
  return result;
}

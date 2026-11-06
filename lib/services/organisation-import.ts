import type { Prisma, PrismaClient } from "@prisma/client";
import { moveSchoolGroupCodeTx } from "@/lib/pt-codes";
import { schoolCodeWhere } from "@/lib/school-reference";

// Bound the work per transaction so a full master refresh can exceed two minutes.
const IMPORT_BATCH_SIZE = 200;
const IMPORT_TRANSACTION_TIMEOUT_MS = 120_000;

export async function upsertImportedOrganisationsInBatches(
  db: Pick<PrismaClient, "$transaction">,
  rows: readonly Prisma.OrganisationUncheckedCreateInput[],
  onProgress?: (imported: number, total: number) => void
) {
  for (let offset = 0; offset < rows.length; offset += IMPORT_BATCH_SIZE) {
    const batch = rows.slice(offset, offset + IMPORT_BATCH_SIZE);
    let currentPrCode = batch[0].prCode;
    try {
      await db.$transaction(async tx => {
        await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(741024)`;
        for (const row of batch) {
          currentPrCode = row.prCode;
          await upsertImportedOrganisation(tx, row);
        }
      }, { maxWait: 10_000, timeout: IMPORT_TRANSACTION_TIMEOUT_MS });
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Organisation import failed at PR code ${currentPrCode} ` +
        `(batch rows ${offset + 1}-${offset + batch.length}). ` +
        `${offset} of ${rows.length} rows were committed in earlier batches. ` +
        `This batch was rolled back; fix the error and rerun organisations:import. ${reason}`,
        { cause: error }
      );
    }
    onProgress?.(offset + batch.length, rows.length);
  }
}

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

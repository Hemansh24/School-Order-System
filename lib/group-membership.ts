import type { Prisma } from '@prisma/client';

export const normalizeGroupCode = (code: string | null | undefined) => (code ?? '').trim().toUpperCase();
export function explicitGroupMembers<T extends { groupCode: string | null }>(rows: T[], code: string) {
  return rows.filter(row => normalizeGroupCode(row.groupCode) === normalizeGroupCode(code));
}
export const normalizeSheetText = (value: unknown) => {
  const text = String(value ?? '').trim();
  return !text || /^(n\/?a|—|-)$/i.test(text) ? null : text;
};

export async function getGroupMembers(tx: Prisma.TransactionClient, groupCode: string) {
  const rows = await tx.organisation.findMany({ where: { groupCode: { not: null } }, orderBy: { prCode: 'asc' } });
  return explicitGroupMembers(rows, groupCode);
}

export function currentLocations<T extends { subCode: string }>(locations: T[], metadata: unknown): T[] {
  const sourceRows = (metadata as { sourceRows?: { subCode: string }[] } | null)?.sourceRows;
  return sourceRows ? locations.filter(location => sourceRows.some(row => row.subCode === location.subCode)) : locations;
}

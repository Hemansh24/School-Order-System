import type { Prisma } from '@prisma/client';

export const normalizeGroupCode = (code: string | null | undefined) => (code ?? '').trim().toUpperCase();
export const normalizeSheetText = (value: unknown) => {
  const text = String(value ?? '').trim();
  return !text || /^(n\/?a|—|-)$/i.test(text) ? null : text;
};

export async function getGroupMembers(tx: Prisma.TransactionClient, groupCode: string) {
  // Trim legacy values as well as inputs; names and pincodes never determine membership.
  const rows = await tx.organisation.findMany({ where: { groupCode: { not: null } }, orderBy: { prCode: 'asc' } });
  return rows.filter(row => normalizeGroupCode(row.groupCode) === normalizeGroupCode(groupCode));
}

export function currentLocations<T extends { subCode: string }>(locations: T[], metadata: unknown): T[] {
  const sourceRows = (metadata as { sourceRows?: { subCode: string }[] } | null)?.sourceRows;
  return sourceRows ? locations.filter(location => sourceRows.some(row => row.subCode === location.subCode)) : locations;
}

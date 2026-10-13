import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { loadEnvConfig } from '@next/env';
import { prisma } from '@/lib/prisma';
import { readGoogleSheetRows } from '@/lib/googleSheets';
import { normalizeGroupCode, normalizeSheetText } from '@/lib/group-membership';

loadEnvConfig(process.cwd());
export const GROUP_SHEET_ID = '1IVrJWu0wPmvTp-BjCGuWivnm8R3N2VRYEUzouTAgoGs';

export function parseGsRows(values: unknown[][]) {
  const headers = values[0]?.map(value => String(value ?? '').replace(/\s+/g, ' ').trim().toLowerCase());
  if (headers?.[0] !== 'gs code' || headers[1] !== 'gs sub code' || headers[2] !== 'name' || headers[7] !== 'address') throw new Error('Unexpected Group Sheet headers.');
  const keys = new Set<string>();
  const rows = values.slice(1).flatMap((values, index) => {
    if (!values.some(value => String(value ?? '').trim())) return [];
    const groupCode = normalizeGroupCode(String(values[0] ?? ''));
    const subCode = String(values[1] ?? '').trim();
    const name = String(values[2] ?? '').trim();
    if (!/^GS\d+$/i.test(groupCode) || !/^\d+$/.test(subCode) || !name) throw new Error(`Invalid group code, subcode or name at row ${index + 2}.`);
    const key = `${groupCode}|${subCode}`;
    if (keys.has(key)) throw new Error(`Duplicate group location ${key}.`);
    keys.add(key);
    return [{ groupCode, subCode, name, address: normalizeSheetText(values[7]), district: normalizeSheetText(values[8]), state: normalizeSheetText(values[9]), pincode: normalizeSheetText(values[10]), centralizedDecision: normalizeSheetText(values[11]), sourceSheetRow: index + 2, rawValues: values.map(value => String(value ?? '')) }];
  });
  if (!rows.length) throw new Error('Group Sheet is empty; refusing to retire existing data.');
  return rows;
}

export async function importGsGroups(values?: unknown[][], apply = false) {
  const rows = parseGsRows(values ?? (await readGoogleSheetRows({ spreadsheetId: process.env.GROUP_SHEETS_ID ?? process.env.GROUPS_SHEET_ID ?? GROUP_SHEET_ID, range: process.env.GROUP_SHEETS_RANGE ?? process.env.GROUPS_SHEET_RANGE ?? "'Group Sheet'!A1:L1000" })).map(row => row.values));
  const codes = [...new Set(rows.map(row => row.groupCode))];
  const existing = await prisma.schoolGroup.findMany({ where: { sourceType: 'GS' }, include: { locations: true } });
  const correction = await prisma.organisation.findMany({ where: { groupCode: 'GSO198' } });
  const summary = { groups: codes.length, locations: rows.length, newGroups: codes.filter(code => !existing.some(group => group.groupCode === code)).length, retiredGroups: existing.filter(group => group.active && !codes.includes(group.groupCode)).map(group => group.groupCode), correctedRelationships: correction.length };
  if (!apply) return { ...summary, applied: false };
  const backupPath = `tmp/group-backups/${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  await mkdir('tmp/group-backups', { recursive: true });
  await writeFile(backupPath, JSON.stringify({ createdAt: new Date(), groups: existing, organisations: correction }, (_, value) => typeof value === 'bigint' ? value.toString() : value, 2), { flag: 'wx' });
  await prisma.$transaction(async tx => {
    for (const groupCode of codes) {
      const sourceRows = rows.filter(row => row.groupCode === groupCode);
      const primary = [...sourceRows].sort((a, b) => Number(a.subCode) - Number(b.subCode))[0];
      const previous = existing.find(group => group.groupCode === groupCode)?.metadata;
      const data = { groupName: primary.name, active: true, sourceType: 'GS', sourceHash: createHash('sha256').update(JSON.stringify(sourceRows)).digest('hex'), syncedAt: new Date(), metadata: { ...(previous && typeof previous === 'object' && !Array.isArray(previous) ? previous : {}), sourceRows } };
      const group = await tx.schoolGroup.upsert({ where: { groupCode }, create: { groupCode, ...data }, update: data });
      for (const row of sourceRows) {
        const location = { name: row.name, address: row.address, district: row.district, state: row.state, pincode: row.pincode, centralizedDecision: row.centralizedDecision, syncedAt: new Date(), sourceHash: createHash('sha256').update(JSON.stringify(row)).digest('hex') };
        await tx.schoolGroupLocation.upsert({ where: { schoolGroupId_subCode: { schoolGroupId: group.schoolGroupId, subCode: row.subCode } }, create: { schoolGroupId: group.schoolGroupId, subCode: row.subCode, ...location }, update: location });
      }
    }
    await tx.schoolGroup.updateMany({ where: { sourceType: 'GS', groupCode: { notIn: codes } }, data: { active: false } });
    if (codes.includes('GS0198')) await tx.organisation.updateMany({ where: { groupCode: 'GSO198' }, data: { groupCode: 'GS0198' } });
  }, { timeout: 120000 });
  return { ...summary, applied: true, backupPath };
}

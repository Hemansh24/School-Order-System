import { mkdir, writeFile } from 'node:fs/promises';
import { loadEnvConfig } from '@next/env';
import { prisma } from './prisma';
import { readGoogleSheetRows } from './googleSheets';
import { planOrganisationGroupMappings } from './organisation-group-mappings';

loadEnvConfig(process.cwd());
export async function importOrganisationGroupMappings(values?: unknown[][], apply = false, skipInvalid = false) {
  const source = values ?? (await readGoogleSheetRows({ spreadsheetId: process.env.ORGANISATION_GROUP_SHEET_ID ?? '1IVrJWu0wPmvTp-BjCGuWivnm8R3N2VRYEUzouTAgoGs', range: "'Organisation'!A1:C61224" })).map(row => row.values);
  return prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(741024)`;
    const schools = await tx.organisation.findMany({ select: { prCode: true, ptCode: true, groupCode: true } });
    const masters = await tx.schoolGroup.findMany({ where: { active: true, sourceType: 'GS' }, select: { groupCode: true } });
    const summary = planOrganisationGroupMappings(source, schools, masters.map(group => group.groupCode));
    const reconciliation = await tx.groupReconciliation.findMany();
    if (!apply) return { ...summary, inferredEntriesToDisable: reconciliation.filter(row => row.active).length, applied: false };
    if (summary.errors.length && !skipInvalid) throw new Error(`Mapping import blocked by ${summary.errors.length} source errors. Run the dry run for row details. First error: row ${summary.errors[0].row}: ${summary.errors[0].message}`);
    const backupPath = `tmp/group-backups/organisation-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    await mkdir('tmp/group-backups', { recursive: true });
    await writeFile(backupPath, JSON.stringify({ schools, reconciliation }, null, 2), { flag: 'wx' });
    for (const change of summary.changes) await tx.organisation.update({ where: { prCode: change.prCode }, data: { groupCode: change.groupCode, sourceHash: null } });
    await tx.groupReconciliation.updateMany({ where: { active: true }, data: { active: false, reason: 'Archived: Organisation sheet is the sole membership authority.' } });
    return { ...summary, inferredEntriesToDisable: reconciliation.filter(row => row.active).length, backupPath, applied: true };
  }, { timeout: 120000 });
}

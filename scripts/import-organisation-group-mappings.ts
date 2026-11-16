import { readFile, writeFile } from 'node:fs/promises';
import { importOrganisationGroupMappings } from '../lib/importOrganisationGroupMappings';
import { prisma } from '../lib/prisma';

async function main() {
  const file = process.argv.indexOf('--file'), report = process.argv.indexOf('--report');
  const values = file < 0 ? undefined : JSON.parse(await readFile(process.argv[file + 1], 'utf8'));
  const result = await importOrganisationGroupMappings(values, process.argv.includes('--apply'), process.argv.includes('--skip-invalid'));
  if (report >= 0) await writeFile(process.argv[report + 1], JSON.stringify(result, null, 2));
  const { changes, errors, absentFromSource, ...summary } = result;
  console.log(JSON.stringify({ ...summary, errorCount: errors.length, exceptionExamples: errors.slice(0, 8), absentFromSourceCount: absentFromSource.length }, null, 2));
}
main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }).finally(() => prisma.$disconnect());

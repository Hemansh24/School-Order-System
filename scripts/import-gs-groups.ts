import { readFile } from 'node:fs/promises';
import { importGsGroups } from '../lib/importGsGroups';
import { prisma } from '../lib/prisma';

async function main() {
  const fileIndex = process.argv.indexOf('--file');
  const values = fileIndex >= 0 ? JSON.parse(await readFile(process.argv[fileIndex + 1], 'utf8')) : undefined;
  console.log(JSON.stringify(await importGsGroups(values, process.argv.includes('--apply')), null, 2));
}
main().catch(error => { console.error(error instanceof Error ? error.message : 'Import failed.'); process.exitCode = 1; }).finally(() => prisma.$disconnect());

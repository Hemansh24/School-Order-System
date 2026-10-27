import { readFile } from "node:fs/promises";
import { readGoogleSheetRows } from "../lib/googleSheets";
import { parseExecutiveRows } from "../lib/executive-import";
import { prisma } from "../lib/prisma";

async function main() {
  const fileIndex = process.argv.indexOf("--file");
  if (fileIndex >= 0 && !process.argv[fileIndex + 1]) throw new Error("--file requires a JSON path.");
  const input = fileIndex >= 0
    ? JSON.parse(await readFile(process.argv[fileIndex + 1], "utf8"))
    : (await readGoogleSheetRows({
      spreadsheetId: process.env.EXECUTIVES_SHEET_ID ?? "16EDVfPuY9ataqiUOVNmqx9l69lA3e-L26etGbGV2Q1s",
      range: process.env.EXECUTIVES_SHEET_RANGE ?? "'Adv-Ambassadors'!A1:F1000"
    })).map(row => row.values);
  const rows = Array.isArray(input) ? input : input.values;
  if (!Array.isArray(rows) || !rows.every(Array.isArray)) throw new Error("Expected a JSON rows array or { values: rows }.");
  const records = parseExecutiveRows(rows);
  const existing = await prisma.executive.findMany();
  const codes = new Set(existing.map(row => row.incumbentCode));
  const apply = process.argv.includes("--apply");
  if (apply) await prisma.$transaction(records.map(record => prisma.executive.upsert({
    where: { incumbentCode: record.incumbentCode },
    create: record, update: { ...record, syncedAt: new Date() }
  })));
  console.log(JSON.stringify({ applied: apply, records: records.length,
    inserted: records.filter(row => !codes.has(row.incumbentCode)).length,
    existing: records.filter(row => codes.has(row.incumbentCode)).length }, null, 2));
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Import failed."); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());

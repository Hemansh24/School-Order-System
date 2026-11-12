import { loadEnvConfig } from "@next/env";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import { parseBooksellerExecutiveRows } from "../lib/bookseller-executive-import";
import { prisma } from "../lib/prisma";

loadEnvConfig(process.cwd());

async function main() {
  const target = new URL(process.env.DATABASE_URL ?? "");
  if (!["localhost", "127.0.0.1", "[::1]"].includes(target.hostname)) {
    throw new Error("This importer only supports local PostgreSQL hosts.");
  }
  const fileIndex = process.argv.indexOf("--file");
  if (fileIndex < 0 || !process.argv[fileIndex + 1]) throw new Error("--file requires a saved sheet JSON path.");
  const source = JSON.parse(await readFile(process.argv[fileIndex + 1], "utf8"));
  if (source.spreadsheetId !== "1BZjfQ7JeK72Fc7aU3TZ8h6ZMmCNtTYT7JyWWM4x6hRE"
    || source.sheetId !== 485086527 || source.sheetName !== "Bookseller Incumbent"
    || !["A1:AA1000", "A1:Z1000"].includes(source.range)) {
    throw new Error("Expected the verified Bookseller Incumbent tab snapshot starting at row 1.");
  }
  const scope = { sourceSpreadsheetId: source.spreadsheetId as string, sourceSheetId: source.sheetId as number };
  const records = parseBooksellerExecutiveRows(source.values).map(row => ({ ...row, ...scope }));
  const replaceSource = process.argv.includes("--replace-source");
  const [existing, preBooksellers] = await Promise.all([
    prisma.booksellerExecutive.findMany({ where: scope }),
    prisma.preBookseller.findMany({ select: { pbsCode: true } })
  ]);
  const sourceRows = new Set(existing.map(row => row.sourceSheetRow));
  const incomingRows = new Set(records.map(row => row.sourceSheetRow));
  const incomingCodes = new Set(records.map(row => row.incumbentCode));
  const removedRows = existing.filter(row => !incomingRows.has(row.sourceSheetRow)
    && (replaceSource || incomingCodes.has(row.incumbentCode)));
  const existingByRow = new Map(existing.map(row => [row.sourceSheetRow, row]));
  const changed = records.filter(expected => {
    const actual = existingByRow.get(expected.sourceSheetRow);
    return actual && (Object.keys(expected) as Array<keyof typeof expected>)
      .some(key => !isDeepStrictEqual(actual[key], expected[key]));
  });
  const pbsCodes = new Set(preBooksellers.map(row => row.pbsCode));
  const unmatched = records.filter(row => !pbsCodes.has(row.pbsCode));
  const codeCounts = new Map<string, number>();
  for (const row of records) codeCounts.set(row.incumbentCode, (codeCounts.get(row.incumbentCode) ?? 0) + 1);
  const summary = { mode: process.argv.includes("--apply") ? "apply" : "preview",
    host: target.hostname, database: target.pathname.slice(1), records: records.length,
    distinctIncumbentCodes: codeCounts.size, repeatedIncumbentCodes: [...codeCounts.values()].filter(count => count > 1).length,
    replaceSource, updated: changed.length,
    removed: removedRows.length,
    inserted: records.filter(row => !sourceRows.has(row.sourceSheetRow)).length,
    existing: records.filter(row => sourceRows.has(row.sourceSheetRow)).length,
    matchedPbsRows: records.length - unmatched.length, unmatchedPbsRows: unmatched.length,
    unmatchedPbsCodes: [...new Set(unmatched.map(row => row.pbsCode))] };
  console.log(JSON.stringify(summary, null, 2));
  if (!process.argv.includes("--apply")) return;

  const backupDir = `tmp/bookseller-executive-import-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  await mkdir(backupDir, { recursive: true });
  await writeFile(`${backupDir}/before.json`, JSON.stringify(existing, null, 2));
  await writeFile(`${backupDir}/source.json`, JSON.stringify(source));
  await writeFile(`${backupDir}/report.json`, JSON.stringify(summary, null, 2));

  const verified = await prisma.$transaction(async tx => {
    if (replaceSource) {
      await tx.booksellerExecutive.deleteMany({
        where: { ...scope, sourceSheetRow: { notIn: records.map(row => row.sourceSheetRow) } }
      });
    } else if (removedRows.length) {
      await tx.booksellerExecutive.deleteMany({
        where: { ...scope, booksellerExecutiveId: { in: removedRows.map(row => row.booksellerExecutiveId) } }
      });
    }
    // The parser keeps the first spreadsheet row per incumbent code.
    for (const record of records) {
      const { sourceSpreadsheetId, sourceSheetId, sourceSheetRow } = record;
      await tx.booksellerExecutive.upsert({
        where: { sourceSpreadsheetId_sourceSheetId_sourceSheetRow: { sourceSpreadsheetId, sourceSheetId, sourceSheetRow } },
        create: record, update: { ...record, syncedAt: new Date() }
      });
    }
    const saved = await tx.booksellerExecutive.findMany({ where: scope });
    if (replaceSource && saved.length !== records.length) {
      throw new Error("Source row count differs after replacement; rolling back.");
    }
    const byRow = new Map(saved.map(row => [row.sourceSheetRow, row]));
    for (const expected of records) {
      const actual = byRow.get(expected.sourceSheetRow);
      for (const key of Object.keys(expected) as Array<keyof typeof expected>) {
        if (!actual || !isDeepStrictEqual(actual[key], expected[key])) {
          throw new Error(`Readback failed for source row ${expected.sourceSheetRow}, field ${key}; rolling back.`);
        }
      }
    }
    return records.length;
  }, { timeout: 60000 });
  console.log(JSON.stringify({ verifiedRows: verified, backupDir }));
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : "Bookseller executive import failed.");
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());

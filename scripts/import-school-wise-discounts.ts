import { loadEnvConfig } from "@next/env";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { prisma } from "../lib/prisma";
import { readGoogleSheetRows } from "../lib/googleSheets";
import { parseSchoolDiscountRows, schoolDiscountFields } from "../lib/school-wise-discounts";

loadEnvConfig(process.cwd());

const source = {
  sourceSpreadsheetId: "1IVrJWu0wPmvTp-BjCGuWivnm8R3N2VRYEUzouTAgoGs",
  sourceSheetId: 1161721439
};

async function main() {
  const args = process.argv.slice(2);
  const fileIndex = args.indexOf("--file");
  if (fileIndex >= 0 && (!args[fileIndex + 1] || args[fileIndex + 1].startsWith("--"))) {
    throw new Error("--file requires a JSON file containing formatted source rows.");
  }
  const allowedArgs = args.filter((_, index) => index !== fileIndex && (fileIndex < 0 || index !== fileIndex + 1));
  if (allowedArgs.some(arg => arg !== "--apply")) throw new Error("Usage: schools:discounts:import [--file rows.json] [--apply]");
  const target = new URL(process.env.DATABASE_URL ?? "");
  if (!["localhost", "127.0.0.1", "[::1]"].includes(target.hostname) ||
      (target.port && target.port !== "5432") || target.pathname !== "/school_order_management") {
    throw new Error("Import requires local school_order_management on port 5432.");
  }
  const values = fileIndex >= 0
    ? JSON.parse(await readFile(args[fileIndex + 1], "utf8"))
    : (await readGoogleSheetRows({ spreadsheetId: source.sourceSpreadsheetId,
        range: "'School wise Discount'!A1:J", valueRenderOption: "FORMATTED_VALUE" })).map(row => row.values);
  const rows = parseSchoolDiscountRows(values);
  const existing = await prisma.schoolWiseDiscount.findMany({ where: source, orderBy: { sourceRow: "asc" } });
  const incoming = new Set(rows.map(row => row.sourceRow));
  if (existing.some(row => !incoming.has(row.sourceRow))) {
    throw new Error("Source no longer contains some imported rows. Review before removing any local records.");
  }
  const byRow = new Map(existing.map(row => [row.sourceRow, row]));
  const changed = rows.filter(row => {
    const old = byRow.get(row.sourceRow);
    return !old || schoolDiscountFields.some(field => old[field] !== row[field]);
  });
  console.log(JSON.stringify({ mode: args.includes("--apply") ? "apply" : "preview",
    database: `${target.hostname}:5432${target.pathname}`, sourceRows: rows.length,
    existingRows: existing.length, inserts: rows.filter(row => !byRow.has(row.sourceRow)).length,
    updates: changed.filter(row => byRow.has(row.sourceRow)).length }, null, 2));
  if (!args.includes("--apply")) return;
  await mkdir("tmp/school-wise-discount-backups", { recursive: true });
  const backup = `tmp/school-wise-discount-backups/${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  await writeFile(backup, JSON.stringify({ source, existing, values }, null, 2));
  console.log(`Backup: ${backup}`);
  const importedAt = new Date();
  await prisma.$transaction(async tx => {
    for (const row of changed) {
      await tx.schoolWiseDiscount.upsert({
        where: { sourceSpreadsheetId_sourceSheetId_sourceRow: { ...source, sourceRow: row.sourceRow } },
        create: { ...source, ...row, importedAt }, update: { ...row, importedAt }
      });
    }
    const verified = await tx.schoolWiseDiscount.findMany({ where: source, orderBy: { sourceRow: "asc" } });
    if (verified.length !== rows.length || verified.some((row, index) =>
      row.sourceRow !== rows[index].sourceRow || schoolDiscountFields.some(field => row[field] !== rows[index][field]))) {
      throw new Error("Source readback mismatch; transaction rolled back.");
    }
  }, { timeout: 120000, isolationLevel: "Serializable" });
  console.log(`Verified ${rows.length} rows, all ten source columns. Discount logic unchanged.`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : "School discount import failed.");
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());

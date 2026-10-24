import { loadEnvConfig } from "@next/env";
import { readFile } from "node:fs/promises";
import { readGoogleSheetRows } from "../lib/googleSheets";
import { prisma } from "../lib/prisma";
import { parsePtCodeUsageHistory } from "../lib/pt-code-usage-history";

loadEnvConfig(process.cwd());

async function main() {
  const target = new URL(process.env.DATABASE_URL ?? "");
  if (!["localhost", "127.0.0.1", "[::1]"].includes(target.hostname)) {
    throw new Error("This importer only supports local PostgreSQL hosts.");
  }
  const fileIndex = process.argv.indexOf("--file");
  if (fileIndex >= 0 && !process.argv[fileIndex + 1]) throw new Error("--file requires a JSON file path.");
  const values: unknown = fileIndex >= 0
    ? JSON.parse(await readFile(process.argv[fileIndex + 1], "utf8"))
    : (await readGoogleSheetRows({
        spreadsheetId: "1IVrJWu0wPmvTp-BjCGuWivnm8R3N2VRYEUzouTAgoGs",
        range: "'Academic Year Implemented Schools'!A1:B10000"
      })).map(row => row.values);
  const rows = parsePtCodeUsageHistory(values);
  const excludedGroupRows = (values as unknown[][]).flatMap((row, index) =>
    index > 0 && String(row[0] ?? "").trim().toUpperCase() === "GROUP" ? [index + 1] : []);
  const perSession: Record<string, number> = {};
  for (const row of rows) perSession[row.sessionYear] = (perSession[row.sessionYear] ?? 0) + 1;
  const apply = process.argv.includes("--apply");
  console.log(JSON.stringify({ mode: apply ? "apply" : "preview", host: target.hostname,
    database: target.pathname.slice(1), uniquePairs: rows.length,
    distinctPtCodes: new Set(rows.map(row => row.ptCode)).size, excludedGroupRows, perSession }, null, 2));
  if (!apply) return;

  const result = await prisma.$transaction(async tx => {
    const inserted = await tx.ptCodeUsageHistory.createMany({ data: rows, skipDuplicates: true });
    const saved = await tx.ptCodeUsageHistory.findMany({
      where: { sessionYear: { in: Object.keys(perSession) } }
    });
    const savedPairs = new Set(saved.map(row => `${row.ptCode}|${row.sessionYear}`));
    if (rows.some(row => !savedPairs.has(`${row.ptCode}|${row.sessionYear}`))) {
      throw new Error("Imported history readback did not match the source; rolling back.");
    }
    return { inserted: inserted.count, alreadyPresent: rows.length - inserted.count, verifiedPairs: rows.length };
  });
  console.log(JSON.stringify(result, null, 2));
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : "PT usage import failed.");
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());

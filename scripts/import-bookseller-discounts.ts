import { loadEnvConfig } from "@next/env";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getDataConnect } from "firebase-admin/data-connect";
import { connectorConfig, listBooksellerDiscounts, setBooksellerActualDiscount } from "@dataconnect/admin-generated";
import { readGoogleSheetRows } from "../lib/googleSheets";
import { prisma } from "../lib/prisma";
import { assignDiscountVendorCodes, matchDiscountRows, parseDiscountRows } from "../lib/bookseller-discounts";

loadEnvConfig(process.cwd());

async function main() {
  const fileIndex = process.argv.indexOf("--file");
  if (fileIndex >= 0 && !process.argv[fileIndex + 1]) throw new Error("--file requires a JSON file path.");
  const values = fileIndex >= 0
    ? JSON.parse(await readFile(process.argv[fileIndex + 1], "utf8"))
    : (await readGoogleSheetRows({ spreadsheetId: "1IVrJWu0wPmvTp-BjCGuWivnm8R3N2VRYEUzouTAgoGs", range: "'Bookseller'!A1:S10000" })).map(row => row.values);
  const source = parseDiscountRows(values);
  if (!getApps().length) {
    const keyFile = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_FILE;
    initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID ?? "system-order-34c0a", ...(keyFile ? { credential: cert(JSON.parse(await readFile(keyFile, "utf8"))) } : {}) });
  }
  const dc = getDataConnect(connectorConfig);
  const shared: Awaited<ReturnType<typeof listBooksellerDiscounts>>["data"]["booksellers"] = [];
  for (let offset = 0; ; offset += 500) {
    const { data } = await listBooksellerDiscounts(dc, { limit: 500, offset });
    shared.push(...data.booksellers);
    if (data.booksellers.length < 500) break;
  }
  const existing = shared.map(row => ({ ...row, booksellerSubCode: row.booksellerSubCode ?? null, sourceRow: row.sourceRow ?? null, actualDiscount: row.actualDiscount ?? null }));
  const { matched, unmatched } = matchDiscountRows(source, existing);
  if (!matched.length) throw new Error("No existing shared booksellers matched; no changes applied.");
  const vendors = await prisma.vendor.findMany({ select: { vendorId: true, vendorCode: true, actualDiscount: true } });
  const vendorByCode = new Map(vendors.map(row => [row.vendorCode, row]));
  const sourceById = new Map(matched.map(pair => [pair.existing.id, pair.source]));
  const vendorChanges = assignDiscountVendorCodes(existing).flatMap(({ row, vendorCode }) => {
    const vendor = vendorByCode.get(vendorCode);
    const source = sourceById.get(row.id);
    return vendor && source ? [{ vendor, actualDiscount: source.actualDiscount }] : [];
  });
  const sharedChanges = matched.filter(pair => pair.existing.actualDiscount !== pair.source.actualDiscount);
  const changedVendors = vendorChanges.filter(pair => pair.vendor.actualDiscount !== pair.actualDiscount);
  const summary = { mode: process.argv.includes("--apply") ? "apply" : "preview", sourceRecords: source.length, sourceNonblank: source.filter(row => row.actualDiscount !== null).length,
    sharedRecords: shared.length, sharedMatched: matched.length, sharedChanges: sharedChanges.length, unmatchedSource: unmatched.length,
    unmatchedDiscounts: unmatched.filter(row => row.actualDiscount !== null).map(({ booksellerCode, booksellerSubCode, sourceRow, actualDiscount }) => ({ booksellerCode, booksellerSubCode, sourceRow, actualDiscount })),
    localVendors: vendors.length, matchedVendors: vendorChanges.length, vendorChanges: changedVendors.length, unmatchedVendors: vendors.length - vendorChanges.length };
  console.log(JSON.stringify(summary, null, 2));
  if (!process.argv.includes("--apply")) return;
  await mkdir("tmp/bookseller-discount-backups", { recursive: true });
  const backup = `tmp/bookseller-discount-backups/${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  await writeFile(backup, JSON.stringify({ shared: existing, vendors, source }, null, 2));
  console.log(`Backup: ${backup}`);
  let applied = 0;
  for (const { existing, source } of sharedChanges) {
    const { data } = await setBooksellerActualDiscount(dc, { id: existing.id, actualDiscount: source.actualDiscount });
    if (data.bookseller_updateMany !== 1) throw new Error(`Expected one shared row for id ${existing.id}; local update has not run. Re-run after resolving.`);
    applied++;
    if (applied % 50 === 0) console.log(`Updated ${applied}/${sharedChanges.length} shared discounts.`);
  }
  // Verify shared writes before propagating to local PostgreSQL.
  const verified = new Map<string, string | null>();
  for (let offset = 0; ; offset += 500) {
    const { data } = await listBooksellerDiscounts(dc, { limit: 500, offset });
    for (const row of data.booksellers) verified.set(row.id, row.actualDiscount ?? null);
    if (data.booksellers.length < 500) break;
  }
  for (const pair of matched) if (verified.get(pair.existing.id) !== pair.source.actualDiscount) throw new Error(`Shared verification failed for ${pair.existing.id}; local update has not run.`);
  await prisma.$transaction(changedVendors.map(({ vendor, actualDiscount }) => prisma.vendor.update({ where: { vendorId: vendor.vendorId }, data: { actualDiscount } })));
  const local = await prisma.vendor.findMany({ select: { vendorId: true, actualDiscount: true } });
  const localById = new Map(local.map(row => [row.vendorId, row.actualDiscount]));
  for (const pair of vendorChanges) if (localById.get(pair.vendor.vendorId) !== pair.actualDiscount) throw new Error(`Local verification failed for ${pair.vendor.vendorId}.`);
  console.log("Shared and local discount readback verified.");
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Discount import failed."); process.exitCode = 1; }).finally(() => prisma.$disconnect());

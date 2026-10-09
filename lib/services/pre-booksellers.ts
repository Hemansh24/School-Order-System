import { Prisma } from "@prisma/client";
import { readGoogleSheetRows } from "@/lib/googleSheets";
import { nextSequentialCompactCode } from "@/lib/reference-codes";
import { prisma } from "@/lib/prisma";

const PRE_BOOKSELLERS_SHEET_ID = "1IVrJWu0wPmvTp-BjCGuWivnm8R3N2VRYEUzouTAgoGs";
const PRE_BOOKSELLERS_RANGE = "Pre_Bookseller_Sheet!A:R";
type Tx = Prisma.TransactionClient;

function text(value: string | number | boolean | null | undefined) {
  const normalized = value === null || value === undefined ? "" : String(value).trim();
  return normalized || null;
}

export async function syncPreBooksellers() {
  const rows = await readGoogleSheetRows({ spreadsheetId: PRE_BOOKSELLERS_SHEET_ID, range: PRE_BOOKSELLERS_RANGE });
  const imported = await upsertPreBooksellerRows(rows.slice(1).map((row) => row.values));
  return { imported };
}

export async function upsertPreBooksellerRows(rows: Array<Array<string | number | boolean | null>>) {
  const records = rows.flatMap((row) => {
    const pbsCode = text(row[1]);
    const vendorName = text(row[2]);
    if (!pbsCode || !vendorName) return [];
    return [{
      pbsCode,
      sourceBsCode: text(row[0]),
      vendorName,
      address: text(row[3]),
      district: text(row[4]),
      state: text(row[5]),
      pinCode: text(row[6]),
      contactPerson: text(row[7]),
      email: text(row[8]),
      taxId: text(row[9]),
      schoolDealCount: text(row[10]),
      approximateStrength: text(row[11]),
      groupSchoolCount: text(row[12]),
      committedDiscount: text(row[13]),
      transportCollaboration: text(row[14]),
      bookingStation: text(row[15]),
      vendorType: text(row[16]),
      paymentStatus: text(row[17])
    }];
  });

  await prisma.$transaction(records.map((record) => prisma.preBookseller.upsert({
    where: { pbsCode: record.pbsCode }, create: record, update: record
  })));
  return records.length;
}

export async function getSuggestedBsCode(preBooksellerId: number) {
  const record = await prisma.preBookseller.findUniqueOrThrow({ where: { preBooksellerId } });
  if (record.conversionStatus === "converted" || record.assignedBsCode) return record.assignedBsCode ?? record.sourceBsCode;
  if (record.sourceBsCode) return record.sourceBsCode;
  const [vendors, preBooksellers] = await Promise.all([
    prisma.vendor.findMany({ select: { vendorCode: true } }),
    prisma.preBookseller.findMany({ where: { assignedBsCode: { not: null } }, select: { assignedBsCode: true } })
  ]);
  return nextSequentialCompactCode("BS", [...vendors.map((vendor) => vendor.vendorCode), ...preBooksellers.flatMap((row) => row.assignedBsCode ? [row.assignedBsCode] : [])], 5);
}

export async function convertPreBooksellerToVendor(preBooksellerId: number) {
  return prisma.$transaction(async (tx) => {
    const record = await tx.preBookseller.findUniqueOrThrow({ where: { preBooksellerId } });
    if (record.conversionStatus === "converted" || record.convertedVendorId) throw new Error("This PBS entry has already been converted.");
    const bsCode = record.sourceBsCode ?? await nextBsCodeTx(tx);
    if (await tx.vendor.findUnique({ where: { vendorCode: bsCode } })) throw new Error(`BS code ${bsCode} is already assigned to another vendor.`);
    const vendor = await tx.vendor.create({ data: {
      vendorCode: bsCode, vendorName: record.vendorName, vendorType: record.vendorType,
      address: record.address, district: record.district, state: record.state, pinCode: record.pinCode,
      contactPerson: record.contactPerson, email: record.email, taxId: record.taxId, paymentStatus: record.paymentStatus
    }});
    return tx.preBookseller.update({
      where: { preBooksellerId },
      data: { conversionStatus: "converted", assignedBsCode: bsCode, convertedAt: new Date(), convertedVendorId: vendor.vendorId },
      include: { convertedVendor: true }
    });
  });
}

async function nextBsCodeTx(tx: Tx) {
  const [vendors, preBooksellers] = await Promise.all([
    tx.vendor.findMany({ select: { vendorCode: true } }),
    tx.preBookseller.findMany({ where: { assignedBsCode: { not: null } }, select: { assignedBsCode: true } })
  ]);
  return nextSequentialCompactCode("BS", [...vendors.map((vendor) => vendor.vendorCode), ...preBooksellers.flatMap((row) => row.assignedBsCode ? [row.assignedBsCode] : [])], 5);
}

import { Prisma } from "@prisma/client";
import { readGoogleSheetRows } from "@/lib/googleSheets";
import { prisma } from "@/lib/prisma";
import { nextSequentialCompactCode } from "@/lib/reference-codes";

const PRE_BOOKSELLERS_SHEET_ID = "1IVrJWu0wPmvTp-BjCGuWivnm8R3N2VRYEUzouTAgoGs";
const PRE_BOOKSELLERS_RANGE = "Pre_Bookseller_Sheet!A:R";
type Tx = Prisma.TransactionClient;

function text(value: string | number | boolean | null | undefined) {
  const normalized = value === null || value === undefined ? "" : String(value).trim();
  return normalized || null;
}

export async function syncPreBooksellers() {
  const rows = await readGoogleSheetRows({
    spreadsheetId: PRE_BOOKSELLERS_SHEET_ID,
    range: PRE_BOOKSELLERS_RANGE
  });
  const records = rows.slice(1).flatMap((row) => {
    const preVendorCode = text(row.values[1]);
    const vendorName = text(row.values[2]);
    return preVendorCode && vendorName
      ? [{
          preVendorCode,
          booksellerCode: text(row.values[0]),
          vendorName,
          address: text(row.values[3]),
          district: text(row.values[4]),
          state: text(row.values[5]),
          pinCode: text(row.values[6]),
          contactPerson: text(row.values[7]),
          email: text(row.values[8]),
          taxId: text(row.values[9]),
          vendorType: text(row.values[16]),
          paymentStatus: text(row.values[17])
        }]
      : [];
  });

  await prisma.$transaction(
    records.map((record) =>
      prisma.vendor.upsert({
        where: { preVendorCode: record.preVendorCode },
        create: { ...record, vendorCode: record.preVendorCode },
        update: record
      })
    )
  );

  return { imported: records.length, awaitingBsCode: records.filter((record) => !record.booksellerCode).length };
}

export async function ensureBsCodesForVendorCodesTx(tx: Tx, vendorCodes: string[]) {
  const mappings = new Map<string, string>();
  const uniqueCodes = Array.from(new Set(vendorCodes.map((code) => code.trim()).filter(Boolean)));
  const vendors = await tx.vendor.findMany({
    where: { OR: [{ vendorCode: { in: uniqueCodes } }, { booksellerCode: { in: uniqueCodes } }] }
  });

  for (const vendor of vendors) {
    const booksellerCode = vendor.booksellerCode ?? nextSequentialCompactCode(
      "BS",
      (await tx.vendor.findMany({ where: { booksellerCode: { not: null } }, select: { booksellerCode: true } }))
        .flatMap((row) => (row.booksellerCode ? [row.booksellerCode] : [])),
      5
    );
    if (!vendor.booksellerCode) {
      await tx.vendor.update({ where: { vendorId: vendor.vendorId }, data: { booksellerCode } });
    }
    mappings.set(vendor.vendorCode, booksellerCode);
    mappings.set(booksellerCode, booksellerCode);
  }
  return mappings;
}

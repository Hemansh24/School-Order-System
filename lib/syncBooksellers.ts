import {
  getBooksellerByCode,
  listBooksellerSchoolMapping,
  listBooksellers,
  type GetBooksellerByCodeData,
  type ListBooksellerSchoolMappingData,
  type ListBooksellersData
} from "@dataconnect/generated";
import type { Prisma } from "@prisma/client";
import { getApp, getApps, initializeApp } from "firebase/app";
import { prisma } from "@/lib/prisma";

export type BooksellerSyncSummary = {
  importedBooksellers: number;
  replacedVendors: number;
  importedSchoolMappings: number;
  linkedSchoolMappings: number;
  unmatchedSchoolMappings: number;
  linkedVendors: number;
  unlinkedVendors: number;
};

const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ??
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
  "system-order-34c0a";

type ImportedBookseller = ListBooksellersData["booksellers"][number];
type ImportedBooksellerDetail = GetBooksellerByCodeData["booksellers"][number];
type ImportedBooksellerSchoolMapping =
  ListBooksellerSchoolMappingData["booksellerSchoolMappings"][number];

function ensureFirebaseApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp({
    projectId: FIREBASE_PROJECT_ID
  });
}

function normalizeText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function combineAddress(...parts: Array<string | null | undefined>) {
  const normalized = parts
    .map((part) => normalizeText(part))
    .filter((part): part is string => Boolean(part));

  return normalized.length > 0 ? normalized.join(", ") : null;
}

function preferredVendorCode(bookseller: {
  booksellerCode: string;
  booksellerSubCode?: string | null;
}) {
  const subCode = normalizeText(bookseller.booksellerSubCode);
  return subCode ? `${bookseller.booksellerCode}-${subCode}` : bookseller.booksellerCode;
}

function booksellerKey(input: {
  booksellerCode: string;
  booksellerSubCode?: string | null;
}) {
  return `${input.booksellerCode.trim()}|${normalizeText(input.booksellerSubCode) ?? ""}`;
}

function pickBooksellerDetail(
  source: ImportedBookseller,
  details: ImportedBooksellerDetail[]
) {
  return (
    details.find((detail) => detail.id === source.id) ??
    details.find((detail) => booksellerKey(detail) === booksellerKey(source)) ??
    details[0] ??
    null
  );
}

export async function replaceVendorsWithImportedBooksellers(): Promise<BooksellerSyncSummary> {
  ensureFirebaseApp();

  const [{ data }, { data: mappingData }, existingVendors] = await Promise.all([
    listBooksellers(),
    listBooksellerSchoolMapping(),
    prisma.vendor.findMany({
      include: {
        vendorSchools: true
      }
    })
  ]);
  const booksellers = [...data.booksellers].sort(
    (left, right) =>
      left.booksellerName.localeCompare(right.booksellerName) ||
      left.booksellerCode.localeCompare(right.booksellerCode)
  );

  if (booksellers.length === 0) {
    throw new Error("No imported bookseller rows were returned from Data Connect.");
  }

  const existingByCode = new Map(existingVendors.map((vendor) => [vendor.vendorCode, vendor]));
  const detailedBooksellers = (
    await Promise.all(
      booksellers.map(async (bookseller: ImportedBookseller) => {
        const { data: detailData } = await getBooksellerByCode({
          booksellerCode: bookseller.booksellerCode
        });

        return pickBooksellerDetail(bookseller, detailData.booksellers);
      })
    )
  ).filter((bookseller): bookseller is ImportedBooksellerDetail => Boolean(bookseller));

  const usedVendorCodes = new Map<string, number>();
  const vendorCodeByBooksellerKey = new Map<string, string>();
  const nextVendors = detailedBooksellers.map((bookseller) => {
    const preferredCode = preferredVendorCode(bookseller);
    const duplicateCount = usedVendorCodes.get(preferredCode) ?? 0;
    usedVendorCodes.set(preferredCode, duplicateCount + 1);

    const vendorCode =
      duplicateCount === 0
        ? preferredCode
        : `${preferredCode}-${String(duplicateCount + 1).padStart(2, "0")}`;
    const existingVendor =
      existingByCode.get(vendorCode) ?? existingByCode.get(preferredCode) ?? existingByCode.get(bookseller.booksellerCode);
    vendorCodeByBooksellerKey.set(booksellerKey(bookseller), vendorCode);

    return {
      vendorCode,
      vendorName: bookseller.booksellerName,
      vendorType: normalizeText(bookseller.vendorType),
      vendorRating: existingVendor?.vendorRating ?? null,
      address: combineAddress(
        bookseller.address01,
        bookseller.district,
        bookseller.state,
        bookseller.pinCode
      ),
      contactPerson: normalizeText(bookseller.incumbentName),
      phone: normalizeText(bookseller.contactNumber),
      email: normalizeText(bookseller.email)
    };
  });

  const mappingRows = mappingData.booksellerSchoolMappings;
  const schoolCodesByVendorCode = collectMappedSchoolCodes(
    mappingRows,
    vendorCodeByBooksellerKey
  );
  const mappedSchoolCodes = flattenMappedSchoolCodes(schoolCodesByVendorCode);

  if (mappingRows.length > 0 && mappedSchoolCodes.length > 0) {
    const matchingSchools = await prisma.school.count({
      where: {
        schoolCode: {
          in: mappedSchoolCodes
        }
      }
    });

    if (matchingSchools === 0) {
      throw new Error(
        "Imported school mappings were found, but none match local PT/PR school references. Sync organisations with PT codes before replacing vendors."
      );
    }
  }

  let linkedSchoolMappings = 0;
  let unmatchedSchoolMappings = mappingRows.length;
  let linkedVendors = 0;

  await prisma.$transaction(async (tx) => {
    await tx.vendorSchool.deleteMany();
    await tx.vendor.deleteMany();
    await tx.vendor.createMany({
      data: nextVendors
    });

    const vendorSchoolRows = await resolveVendorSchoolRows(tx, schoolCodesByVendorCode);
    linkedSchoolMappings = vendorSchoolRows.length;
    unmatchedSchoolMappings = Math.max(0, mappingRows.length - linkedSchoolMappings);
    linkedVendors = new Set(vendorSchoolRows.map((row) => row.vendorId)).size;

    if (vendorSchoolRows.length > 0) {
      await tx.vendorSchool.createMany({
        data: vendorSchoolRows,
        skipDuplicates: true
      });
    }
  });

  return {
    importedBooksellers: detailedBooksellers.length,
    replacedVendors: nextVendors.length,
    importedSchoolMappings: mappingRows.length,
    linkedSchoolMappings,
    unmatchedSchoolMappings,
    linkedVendors,
    unlinkedVendors: Math.max(0, nextVendors.length - linkedVendors)
  };
}

function collectMappedSchoolCodes(
  mappingRows: ImportedBooksellerSchoolMapping[],
  vendorCodeByBooksellerKey: Map<string, string>
) {
  const schoolCodesByVendorCode = new Map<string, Set<string>>();

  for (const mapping of mappingRows) {
    const vendorCode = vendorCodeByBooksellerKey.get(booksellerKey(mapping));
    const schoolCode = normalizeText(mapping.ptCode);

    if (!vendorCode || !schoolCode) {
      continue;
    }

    const schoolCodes = schoolCodesByVendorCode.get(vendorCode) ?? new Set<string>();
    schoolCodes.add(schoolCode);
    schoolCodesByVendorCode.set(vendorCode, schoolCodes);
  }

  return schoolCodesByVendorCode;
}

function flattenMappedSchoolCodes(schoolCodesByVendorCode: Map<string, Set<string>>) {
  return Array.from(
    new Set(
      Array.from(schoolCodesByVendorCode.values()).flatMap((schoolCodes) =>
        Array.from(schoolCodes)
      )
    )
  );
}

async function resolveVendorSchoolRows(
  tx: Prisma.TransactionClient,
  schoolCodesByVendorCode: Map<string, Set<string>>
) {
  const mappedVendorCodes = Array.from(schoolCodesByVendorCode.keys());
  const mappedSchoolCodes = flattenMappedSchoolCodes(schoolCodesByVendorCode);

  if (mappedVendorCodes.length === 0 || mappedSchoolCodes.length === 0) {
    return [];
  }

  const [vendors, schools] = await Promise.all([
    tx.vendor.findMany({
      where: { vendorCode: { in: mappedVendorCodes } },
      select: { vendorId: true, vendorCode: true }
    }),
    tx.school.findMany({
      where: { schoolCode: { in: mappedSchoolCodes } },
      select: { schoolId: true, schoolCode: true }
    })
  ]);

  const vendorIdByCode = new Map(vendors.map((vendor) => [vendor.vendorCode, vendor.vendorId]));
  const schoolIdByCode = new Map(schools.map((school) => [school.schoolCode, school.schoolId]));

  return mappedVendorCodes.flatMap((vendorCode) => {
    const vendorId = vendorIdByCode.get(vendorCode);
    const schoolCodes = schoolCodesByVendorCode.get(vendorCode);

    if (!vendorId || !schoolCodes) {
      return [];
    }

    return Array.from(schoolCodes)
      .map((schoolCode) => {
        const schoolId = schoolIdByCode.get(schoolCode);
        return schoolId ? { vendorId, schoolId } : null;
      })
      .filter((row): row is { vendorId: number; schoolId: number } => Boolean(row));
  });
}

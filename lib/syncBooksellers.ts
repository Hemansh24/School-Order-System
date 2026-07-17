import {
  getBooksellerByCode,
  listBooksellers,
  type GetBooksellerByCodeData,
  type ListBooksellersData
} from "@dataconnect/generated";
import { getApp, getApps, initializeApp } from "firebase/app";
import { prisma } from "@/lib/prisma";

export type BooksellerSyncSummary = {
  importedBooksellers: number;
  replacedVendors: number;
  preservedSchoolLinks: number;
};

const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ??
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
  "system-order-34c0a";

type ImportedBookseller = ListBooksellersData["booksellers"][number];
type ImportedBooksellerDetail = GetBooksellerByCodeData["booksellers"][number];

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

export async function replaceVendorsWithImportedBooksellers(): Promise<BooksellerSyncSummary> {
  ensureFirebaseApp();

  const [{ data }, existingVendors] = await Promise.all([
    listBooksellers(),
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

        return detailData.booksellers[0] ?? null;
      })
    )
  ).filter((bookseller): bookseller is ImportedBooksellerDetail => Boolean(bookseller));

  const usedVendorCodes = new Map<string, number>();
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
    const preservedSchoolIds = existingVendor?.vendorSchools.map((row) => row.schoolId) ?? [];

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
      email: normalizeText(bookseller.email),
      preservedSchoolIds
    };
  });

  await prisma.$transaction(async (tx) => {
    await tx.vendorSchool.deleteMany();
    await tx.vendor.deleteMany();
    await tx.vendor.createMany({
      data: nextVendors.map(({ preservedSchoolIds, ...vendor }) => vendor)
    });

    const createdVendors = await tx.vendor.findMany({
      where: {
        vendorCode: {
          in: nextVendors.map((vendor) => vendor.vendorCode)
        }
      },
      select: {
        vendorId: true,
        vendorCode: true
      }
    });

    const vendorIdByCode = new Map(
      createdVendors.map((vendor) => [vendor.vendorCode, vendor.vendorId])
    );

    const vendorSchoolRows = nextVendors.flatMap((vendor) => {
      const vendorId = vendorIdByCode.get(vendor.vendorCode);
      const schoolIds = vendor.preservedSchoolIds;

      if (!vendorId || schoolIds.length === 0) {
        return [];
      }

      return schoolIds.map((schoolId) => ({
        vendorId,
        schoolId
      }));
    });

    if (vendorSchoolRows.length > 0) {
      await tx.vendorSchool.createMany({
        data: vendorSchoolRows
      });
    }
  });

  return {
    importedBooksellers: detailedBooksellers.length,
    replacedVendors: nextVendors.length,
    preservedSchoolLinks: nextVendors.reduce(
      (total, vendor) => total + vendor.preservedSchoolIds.length,
      0
    )
  };
}

import {
  listBooksellerSchoolMapping,
  listBooksellers,
  listSharedVendorSchools,
  listSharedVendors,
  connectorConfig,
  type ListBooksellerSchoolMappingData,
  type ListBooksellersData,
  type ListSharedVendorSchoolsData,
  type ListSharedVendorsData
} from "@dataconnect/generated";
import type { Prisma } from "@prisma/client";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getDataConnect } from "firebase/data-connect";
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
type ImportedBooksellerSchoolMapping =
  ListBooksellerSchoolMappingData["booksellerSchoolMappings"][number];
type SharedVendor = ListSharedVendorsData["sharedVendors"][number];
type SharedVendorSchool = ListSharedVendorSchoolsData["sharedVendorSchools"][number];

const PAGE_SIZE = 500;

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

async function listAllBooksellers(dataConnect: ReturnType<typeof getDataConnect>) {
  const booksellers: ImportedBookseller[] = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data } = await listBooksellers(dataConnect, { limit: PAGE_SIZE, offset });
    booksellers.push(...data.booksellers);

    if (data.booksellers.length < PAGE_SIZE) {
      return booksellers;
    }
  }
}

async function listAllBooksellerSchoolMappings(dataConnect: ReturnType<typeof getDataConnect>) {
  const mappings: ImportedBooksellerSchoolMapping[] = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data } = await listBooksellerSchoolMapping(dataConnect, { limit: PAGE_SIZE, offset });
    mappings.push(...data.booksellerSchoolMappings);

    if (data.booksellerSchoolMappings.length < PAGE_SIZE) {
      return mappings;
    }
  }
}

async function listAllSharedVendors(dataConnect: ReturnType<typeof getDataConnect>) {
  const vendors: SharedVendor[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data } = await listSharedVendors(dataConnect, { limit: PAGE_SIZE, offset });
    vendors.push(...data.sharedVendors);
    if (data.sharedVendors.length < PAGE_SIZE) return vendors;
  }
}

async function listAllSharedVendorSchools(dataConnect: ReturnType<typeof getDataConnect>) {
  const mappings: SharedVendorSchool[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data } = await listSharedVendorSchools(dataConnect, { limit: PAGE_SIZE, offset });
    mappings.push(...data.sharedVendorSchools);
    if (data.sharedVendorSchools.length < PAGE_SIZE) return mappings;
  }
}

export async function replaceVendorsWithImportedBooksellers(): Promise<BooksellerSyncSummary> {
  const dataConnect = getDataConnect(ensureFirebaseApp(), connectorConfig);

  const [sharedVendors, sharedMappings] = await Promise.all([
    listAllSharedVendors(dataConnect),
    listAllSharedVendorSchools(dataConnect)
  ]);
  if (sharedVendors.length > 0) {
    return replaceVendorsWithSharedData(sharedVendors, sharedMappings);
  }

  const [importedBooksellers, mappingRows, existingVendors] = await Promise.all([
    listAllBooksellers(dataConnect),
    listAllBooksellerSchoolMappings(dataConnect),
    prisma.vendor.findMany({
      include: {
        vendorSchools: true,
        convertedPreBookseller: true
      }
    })
  ]);
  const booksellers = [...importedBooksellers].sort(
    (left, right) =>
      left.booksellerName.localeCompare(right.booksellerName) ||
      left.booksellerCode.localeCompare(right.booksellerCode)
  );

  if (booksellers.length === 0) {
    throw new Error("No imported bookseller rows were returned from Data Connect.");
  }

  const existingByCode = new Map(existingVendors.map((vendor) => [vendor.vendorCode, vendor]));
  const usedVendorCodes = new Map<string, number>();
  const vendorCodeByBooksellerKey = new Map<string, string>();
  const nextVendors = booksellers.map((bookseller) => {
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
      actualDiscount: normalizeText(bookseller.actualDiscount),
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
  }).filter((vendor) => !existingByCode.get(vendor.vendorCode)?.convertedPreBookseller);

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
    const convertedVendorIds = (await tx.preBookseller.findMany({
      where: { convertedVendorId: { not: null } },
      select: { convertedVendorId: true }
    })).flatMap((record) => record.convertedVendorId ? [record.convertedVendorId] : []);
    await tx.vendorSchool.deleteMany({ where: convertedVendorIds.length ? { vendorId: { notIn: convertedVendorIds } } : undefined });
    await tx.vendor.deleteMany({ where: convertedVendorIds.length ? { vendorId: { notIn: convertedVendorIds } } : undefined });
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
    importedBooksellers: booksellers.length,
    replacedVendors: nextVendors.length,
    importedSchoolMappings: mappingRows.length,
    linkedSchoolMappings,
    unmatchedSchoolMappings,
    linkedVendors,
    unlinkedVendors: Math.max(0, nextVendors.length - linkedVendors)
  };
}

async function replaceVendorsWithSharedData(vendors: SharedVendor[], mappings: SharedVendorSchool[]): Promise<BooksellerSyncSummary> {
  let linkedSchoolMappings = 0;
  let linkedVendors = 0;

  await prisma.$transaction(async (tx) => {
    for (const vendor of vendors) {
      await tx.vendor.upsert({
        where: { vendorCode: vendor.vendorCode },
        create: {
          vendorCode: vendor.vendorCode,
          preVendorCode: vendor.preVendorCode ?? null,
          booksellerCode: vendor.booksellerCode ?? null,
          vendorName: vendor.vendorName,
          vendorType: vendor.vendorType ?? null,
          vendorRating: vendor.vendorRating ?? null,
          actualDiscount: vendor.actualDiscount ?? null,
          address: vendor.address ?? null,
          district: vendor.district ?? null,
          state: vendor.state ?? null,
          pinCode: vendor.pinCode ?? null,
          contactPerson: vendor.contactPerson ?? null,
          phone: vendor.phone ?? null,
          email: vendor.email ?? null,
          taxId: vendor.taxId ?? null,
          paymentStatus: vendor.paymentStatus ?? null
        },
        update: {
          preVendorCode: vendor.preVendorCode ?? null,
          booksellerCode: vendor.booksellerCode ?? null,
          vendorName: vendor.vendorName,
          vendorType: vendor.vendorType ?? null,
          vendorRating: vendor.vendorRating ?? null,
          actualDiscount: vendor.actualDiscount ?? null,
          address: vendor.address ?? null,
          district: vendor.district ?? null,
          state: vendor.state ?? null,
          pinCode: vendor.pinCode ?? null,
          contactPerson: vendor.contactPerson ?? null,
          phone: vendor.phone ?? null,
          email: vendor.email ?? null,
          taxId: vendor.taxId ?? null,
          paymentStatus: vendor.paymentStatus ?? null
        }
      });
    }

    await tx.vendorSchool.deleteMany();
    const [localVendors, schools] = await Promise.all([
      tx.vendor.findMany({ where: { vendorCode: { in: vendors.map((vendor) => vendor.vendorCode) } }, select: { vendorId: true, vendorCode: true } }),
      tx.school.findMany({ where: { schoolCode: { in: mappings.map((mapping) => mapping.schoolCode) } }, select: { schoolId: true, schoolCode: true } })
    ]);
    const vendorIdByCode = new Map(localVendors.map((vendor) => [vendor.vendorCode, vendor.vendorId]));
    const schoolIdByCode = new Map(schools.map((school) => [school.schoolCode, school.schoolId]));
    const rows = mappings.flatMap((mapping) => {
      const vendorId = vendorIdByCode.get(mapping.vendorCode);
      const schoolId = schoolIdByCode.get(mapping.schoolCode);
      return vendorId && schoolId ? [{ vendorId, schoolId }] : [];
    });
    if (rows.length) await tx.vendorSchool.createMany({ data: rows, skipDuplicates: true });
    linkedSchoolMappings = rows.length;
    linkedVendors = new Set(rows.map((row) => row.vendorId)).size;
  });

  return {
    importedBooksellers: vendors.length,
    replacedVendors: vendors.length,
    importedSchoolMappings: mappings.length,
    linkedSchoolMappings,
    unmatchedSchoolMappings: Math.max(0, mappings.length - linkedSchoolMappings),
    linkedVendors,
    unlinkedVendors: Math.max(0, vendors.length - linkedVendors)
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

import {
  listOrganisations,
  type ListOrganisationsData
} from "@dataconnect/generated";
import type { Prisma } from "@prisma/client";
import { getApp, getApps, initializeApp } from "firebase/app";
import { prisma } from "@/lib/prisma";

export type SchoolSyncSummary = {
  importedOrganisations: number;
  replacedOrganisations: number;
  replacedSchools: number;
  preservedVendorLinks: number;
};

const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ??
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
  "system-order-34c0a";

const MASTER_DATA_TRANSACTION_TIMEOUT_MS = 120_000;

type OrganisationSource = {
  groupCode: string | null;
  prCode: string;
  ptCode: string | null;
  organisationName: string;
  address: string | null;
  district: string | null;
  state: string | null;
  pinCode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  actionStatus: string | null;
  remark: string | null;
  academicYear: string | null;
  strength: number | null;
  boardType: string | null;
  sessionStartFrom: string | null;
  minorityType: string | null;
  saturdayStatus: string | null;
  workingStatus: boolean | null;
};

type ImportedOrganisation = ListOrganisationsData["organisations"][number];

type ExistingVendor = Awaited<
  ReturnType<
    typeof prisma.vendor.findMany<{
      include: {
        vendorSchools: {
          include: {
            school: true;
          };
        };
      };
    }>
  >
>[number];

function normalizeText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function ensureFirebaseApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp({
    projectId: FIREBASE_PROJECT_ID
  });
}

function schoolIdentityKey(input: {
  schoolName: string;
  address?: string | null;
  district?: string | null;
  state?: string | null;
  pincode?: string | null;
}) {
  return [
    input.schoolName.trim().toLowerCase(),
    normalizeText(input.address)?.toLowerCase() ?? "",
    normalizeText(input.district)?.toLowerCase() ?? "",
    normalizeText(input.state)?.toLowerCase() ?? "",
    normalizeText(input.pincode)?.toLowerCase() ?? ""
  ].join("|");
}

function deriveSchoolCode(organisation: { ptCode: string | null; prCode: string }) {
  return organisation.ptCode?.trim() || organisation.prCode.trim();
}

function toSchoolData(organisation: {
  prCode: string;
  ptCode: string | null;
  organisationName: string;
  address: string | null;
  district: string | null;
  state: string | null;
  pinCode: string | null;
  phone: string | null;
  email: string | null;
}) {
  return {
    schoolCode: deriveSchoolCode(organisation),
    schoolName: organisation.organisationName.trim(),
    address: normalizeText(organisation.address),
    district: normalizeText(organisation.district),
    state: normalizeText(organisation.state),
    pincode: normalizeText(organisation.pinCode),
    phone: normalizeText(organisation.phone),
    email: normalizeText(organisation.email)
  };
}

function toOrganisationSource(organisation: ImportedOrganisation): OrganisationSource {
  return {
    groupCode: organisation.groupCode ?? null,
    prCode: organisation.prCode,
    ptCode: organisation.ptCode ?? null,
    organisationName: organisation.organisationName,
    address: organisation.address ?? null,
    district: organisation.district ?? null,
    state: organisation.state ?? null,
    pinCode: organisation.pinCode ?? null,
    phone: organisation.phone ?? null,
    email: organisation.email ?? null,
    website: organisation.website ?? null,
    actionStatus: organisation.actionStatus ?? null,
    remark: organisation.remark ?? null,
    academicYear: organisation.academicYear ?? null,
    strength: organisation.strength ?? null,
    boardType: organisation.boardType ?? null,
    sessionStartFrom: organisation.sessionStartFrom ?? null,
    minorityType: organisation.minorityType ?? null,
    saturdayStatus: organisation.saturdayStatus ?? null,
    workingStatus: organisation.workingStatus ?? null
  };
}

function toPrismaOrganisationData(
  organisation: OrganisationSource
): Prisma.OrganisationCreateManyInput {
  return {
    groupCode: normalizeText(organisation.groupCode),
    ptCode: normalizeText(organisation.ptCode),
    prCode: organisation.prCode.trim(),
    organisationName: organisation.organisationName.trim(),
    address: normalizeText(organisation.address),
    district: normalizeText(organisation.district),
    state: normalizeText(organisation.state),
    pinCode: normalizeText(organisation.pinCode),
    phone: normalizeText(organisation.phone),
    email: normalizeText(organisation.email),
    website: normalizeText(organisation.website),
    actionStatus: normalizeText(organisation.actionStatus),
    remark: normalizeText(organisation.remark),
    academicYear: normalizeText(organisation.academicYear),
    strength: organisation.strength,
    boardType: normalizeText(organisation.boardType),
    sessionStartFrom: organisation.sessionStartFrom,
    minorityType: normalizeText(organisation.minorityType),
    saturdayStatus: normalizeText(organisation.saturdayStatus),
    workingStatus: organisation.workingStatus,
    sourceSheetRow: null,
    sourceHash: null,
    syncedAt: new Date()
  };
}

async function loadImportedOrganisationsFromDataConnect(): Promise<OrganisationSource[]> {
  ensureFirebaseApp();

  const pageSize = 500;
  const organisations: ImportedOrganisation[] = [];

  for (let offset = 0; ; offset += pageSize) {
    const { data } = await listOrganisations({ limit: pageSize, offset });
    organisations.push(...data.organisations);

    if (data.organisations.length < pageSize) {
      break;
    }
  }

  return organisations
    .map(toOrganisationSource)
    .sort(
      (left, right) =>
        left.organisationName.localeCompare(right.organisationName) ||
        left.prCode.localeCompare(right.prCode)
    );
}

async function loadOrganisationSources(): Promise<OrganisationSource[]> {
  // Schools in the shared master-data workflow must use the Data Connect PT
  // codes. Local Organisation rows may be partial or manually maintained and
  // must not prevent vendor-to-school mappings from being resolved.
  return loadImportedOrganisationsFromDataConnect();
}

function collectPreservedVendorLinks(existingVendors: ExistingVendor[], nextSchools: ReturnType<typeof toSchoolData>[]) {
  const schoolCodeByIdentity = new Map(
    nextSchools.map((school) => [schoolIdentityKey(school), school.schoolCode])
  );

  return existingVendors.flatMap((vendor) => {
    const nextSchoolCodes = Array.from(
      new Set(
        vendor.vendorSchools
          .map((row) => schoolCodeByIdentity.get(schoolIdentityKey(row.school)))
          .filter((schoolCode): schoolCode is string => Boolean(schoolCode))
      )
    );

    return nextSchoolCodes.map((schoolCode) => ({
      vendorCode: vendor.vendorCode,
      schoolCode
    }));
  });
}

export async function replaceSchoolsWithImportedOrganisations(): Promise<SchoolSyncSummary> {
  const [organisations, existingVendors] = await Promise.all([
    loadOrganisationSources(),
    prisma.vendor.findMany({
      include: {
        vendorSchools: {
          include: {
            school: true
          }
        }
      }
    })
  ]);

  if (organisations.length === 0) {
    throw new Error("No imported organisations were found. Sync organisations first.");
  }

  const nextSchools = Array.from(
    new Map(
      organisations.map((organisation) => {
        const school = toSchoolData(organisation);
        return [school.schoolCode, school] as const;
      })
    ).values()
  );
  const nextOrganisations = Array.from(
    new Map(
      organisations.map((organisation) => [
        organisation.prCode.trim(),
        toPrismaOrganisationData(organisation)
      ])
    ).values()
  );

  const preservedLinks = collectPreservedVendorLinks(existingVendors, nextSchools);

  await prisma.$transaction(
    async (tx) => {
      await tx.vendorSchool.deleteMany();
      await tx.school.deleteMany();
      await tx.organisation.deleteMany();

      await tx.organisation.createMany({ data: nextOrganisations });
      await tx.school.createMany({
        data: nextSchools
      });

      if (preservedLinks.length === 0) {
        return;
      }

      const [vendors, schools] = await Promise.all([
        tx.vendor.findMany({
          where: {
            vendorCode: {
              in: Array.from(new Set(preservedLinks.map((row) => row.vendorCode)))
            }
          },
          select: {
            vendorId: true,
            vendorCode: true
          }
        }),
        tx.school.findMany({
          where: {
            schoolCode: {
              in: Array.from(new Set(preservedLinks.map((row) => row.schoolCode)))
            }
          },
          select: {
            schoolId: true,
            schoolCode: true
          }
        })
      ]);

      const vendorIdByCode = new Map(vendors.map((vendor) => [vendor.vendorCode, vendor.vendorId]));
      const schoolIdByCode = new Map(schools.map((school) => [school.schoolCode, school.schoolId]));

      const vendorSchoolRows = preservedLinks
        .map((row) => {
          const vendorId = vendorIdByCode.get(row.vendorCode);
          const schoolId = schoolIdByCode.get(row.schoolCode);

          if (!vendorId || !schoolId) {
            return null;
          }

          return { vendorId, schoolId };
        })
        .filter((row): row is { vendorId: number; schoolId: number } => Boolean(row));

      if (vendorSchoolRows.length > 0) {
        await tx.vendorSchool.createMany({
          data: vendorSchoolRows,
          skipDuplicates: true
        });
      }
    },
    { maxWait: 10_000, timeout: MASTER_DATA_TRANSACTION_TIMEOUT_MS }
  );

  return {
    importedOrganisations: organisations.length,
    replacedOrganisations: nextOrganisations.length,
    replacedSchools: nextSchools.length,
    preservedVendorLinks: preservedLinks.length
  };
}

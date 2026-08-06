import {
  getOrganisationByPrCode,
  listOrganisations,
  type GetOrganisationByPrCodeData
} from "@dataconnect/generated";
import { getApp, getApps, initializeApp } from "firebase/app";
import { prisma } from "@/lib/prisma";

export type SchoolSyncSummary = {
  importedOrganisations: number;
  replacedSchools: number;
  preservedVendorLinks: number;
};

const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ??
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
  "system-order-34c0a";

type OrganisationSource = {
  prCode: string;
  ptCode: string | null;
  organisationName: string;
  address: string | null;
  district: string | null;
  state: string | null;
  pinCode: string | null;
  phone: string | null;
  email: string | null;
};

type ImportedOrganisationDetail = GetOrganisationByPrCodeData["organisations"][number];

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

function toOrganisationSource(organisation: ImportedOrganisationDetail): OrganisationSource {
  return {
    prCode: organisation.prCode,
    ptCode: organisation.ptCode ?? null,
    organisationName: organisation.organisationName,
    address: organisation.address ?? null,
    district: organisation.district ?? null,
    state: organisation.state ?? null,
    pinCode: organisation.pinCode ?? null,
    phone: organisation.phone ?? null,
    email: organisation.email ?? null
  };
}

async function loadLocalOrganisations(): Promise<OrganisationSource[]> {
  return prisma.organisation.findMany({
    orderBy: [{ organisationName: "asc" }, { prCode: "asc" }],
    select: {
      prCode: true,
      ptCode: true,
      organisationName: true,
      address: true,
      district: true,
      state: true,
      pinCode: true,
      phone: true,
      email: true
    }
  });
}

async function loadImportedOrganisationsFromDataConnect(): Promise<OrganisationSource[]> {
  ensureFirebaseApp();

  const { data } = await listOrganisations();
  const details = await Promise.all(
    data.organisations.map(async (organisation) => {
      const { data: detailData } = await getOrganisationByPrCode({
        prCode: organisation.prCode
      });

      return detailData.organisations[0] ?? null;
    })
  );

  return details
    .filter((organisation): organisation is ImportedOrganisationDetail => Boolean(organisation))
    .map(toOrganisationSource)
    .sort(
      (left, right) =>
        left.organisationName.localeCompare(right.organisationName) ||
        left.prCode.localeCompare(right.prCode)
    );
}

async function loadOrganisationSources(): Promise<OrganisationSource[]> {
  const localOrganisations = await loadLocalOrganisations();

  if (localOrganisations.length > 0) {
    return localOrganisations;
  }

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

  const preservedLinks = collectPreservedVendorLinks(existingVendors, nextSchools);

  await prisma.$transaction(async (tx) => {
    await tx.vendorSchool.deleteMany();
    await tx.school.deleteMany();

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
  });

  return {
    importedOrganisations: organisations.length,
    replacedSchools: nextSchools.length,
    preservedVendorLinks: preservedLinks.length
  };
}

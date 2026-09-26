import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { nextCompactCode, nextSequentialCompactCode } from "@/lib/reference-codes";

const ORGANISATIONS_PAGE_SIZE = 25;
type Tx = Prisma.TransactionClient;

type OrganisationAddressInput = {
  organisationName: string;
  address?: string | null;
  district?: string | null;
  state?: string | null;
  pinCode?: string | null;
  phone?: string | null;
  email?: string | null;
};

type OrganisationMutationInput = OrganisationAddressInput & {
  prCode: string;
  groupCode?: string | null;
  website?: string | null;
  actionStatus?: string | null;
  remark?: string | null;
  academicYear?: string | null;
  strength?: number | null;
  boardType?: string | null;
  sessionStartFrom?: string | Date | null;
  minorityType?: string | null;
  saturdayStatus?: string | null;
  workingStatus?: boolean | null;
};

export type OrganisationListItem = {
  id: string;
  prCode: string;
  organisationName: string;
  district: string | null;
  state: string | null;
  pinCode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  actionStatus: string | null;
  workingStatus: boolean | null;
};

export type OrganisationDetail = {
  id: string;
  prCode: string;
  groupCode: string | null;
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

export type OrganisationLookupFilters = {
  prCode: string;
  organisationName: string;
  district: string;
  state: string;
  actionStatus: string;
  workingStatus: string;
  selected: string;
};

export type OrganisationLookupData = {
  filters: OrganisationLookupFilters;
  organisations: OrganisationListItem[];
  selectedOrganisation: OrganisationDetail | null;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  resultStart: number;
  resultEnd: number;
  usedFallbackSearch: boolean;
};

function normalizeValue(value: string | null) {
  return value?.trim() ?? "";
}

function normalizeText(value?: string | null) {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : null;
}

function normalizeMatchValue(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function sameOrganisationIdentity(
  organisation: {
    organisationName: string;
    address: string | null;
    district: string | null;
    state: string | null;
    pinCode: string | null;
  },
  input: OrganisationAddressInput
) {
  return (
    normalizeMatchValue(organisation.organisationName) ===
      normalizeMatchValue(input.organisationName) &&
    normalizeMatchValue(organisation.address) === normalizeMatchValue(input.address) &&
    normalizeMatchValue(organisation.district) === normalizeMatchValue(input.district) &&
    normalizeMatchValue(organisation.state) === normalizeMatchValue(input.state) &&
    normalizeMatchValue(organisation.pinCode) === normalizeMatchValue(input.pinCode)
  );
}

export function normalizeOrganisationInput(input: OrganisationMutationInput) {
  return {
    groupCode: normalizeText(input.groupCode),
    prCode: input.prCode.trim(),
    organisationName: input.organisationName.trim(),
    address: normalizeText(input.address),
    district: normalizeText(input.district),
    state: normalizeText(input.state),
    pinCode: normalizeText(input.pinCode),
    phone: normalizeText(input.phone),
    email: normalizeText(input.email),
    website: normalizeText(input.website),
    actionStatus: normalizeText(input.actionStatus),
    remark: normalizeText(input.remark),
    academicYear: normalizeText(input.academicYear),
    strength: input.strength ?? null,
    boardType: normalizeText(input.boardType),
    sessionStartFrom:
      input.sessionStartFrom instanceof Date
        ? input.sessionStartFrom
        : input.sessionStartFrom
          ? new Date(`${input.sessionStartFrom}T00:00:00.000Z`)
          : null,
    minorityType: normalizeText(input.minorityType),
    saturdayStatus: normalizeText(input.saturdayStatus),
    workingStatus: input.workingStatus ?? null
  };
}

function parsePage(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function toWorkingStatusFilter(value: string): boolean | null | undefined {
  if (value === "working") {
    return true;
  }

  if (value === "not_working") {
    return false;
  }

  if (value === "unknown") {
    return null;
  }

  return undefined;
}

function mapListItem(record: {
  id: bigint;
  prCode: string;
  organisationName: string;
  district: string | null;
  state: string | null;
  pinCode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  actionStatus: string | null;
  workingStatus: boolean | null;
}): OrganisationListItem {
  return {
    id: record.id.toString(),
    prCode: record.prCode,
    organisationName: record.organisationName,
    district: record.district ?? null,
    state: record.state ?? null,
    pinCode: record.pinCode ?? null,
    phone: record.phone ?? null,
    email: record.email ?? null,
    website: record.website ?? null,
    actionStatus: record.actionStatus ?? null,
    workingStatus: record.workingStatus ?? null
  };
}

function mapDetail(record: {
  id: bigint;
  prCode: string;
  groupCode: string | null;
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
  sessionStartFrom: Date | null;
  minorityType: string | null;
  saturdayStatus: string | null;
  workingStatus: boolean | null;
}): OrganisationDetail {
  return {
    id: record.id.toString(),
    prCode: record.prCode,
    groupCode: record.groupCode ?? null,
    ptCode: record.ptCode ?? null,
    organisationName: record.organisationName,
    address: record.address ?? null,
    district: record.district ?? null,
    state: record.state ?? null,
    pinCode: record.pinCode ?? null,
    phone: record.phone ?? null,
    email: record.email ?? null,
    website: record.website ?? null,
    actionStatus: record.actionStatus ?? null,
    remark: record.remark ?? null,
    academicYear: record.academicYear ?? null,
    strength: record.strength ?? null,
    boardType: record.boardType ?? null,
    sessionStartFrom: record.sessionStartFrom?.toISOString() ?? null,
    minorityType: record.minorityType ?? null,
    saturdayStatus: record.saturdayStatus ?? null,
    workingStatus: record.workingStatus ?? null
  };
}

export function isOrganisationPermissionError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.toLowerCase().includes("permission denied for table organisations")
  );
}

async function findMatchingOrganisation(
  tx: Tx,
  input: OrganisationAddressInput
) {
  const organisations = await tx.organisation.findMany({
    select: {
      id: true,
      prCode: true,
      ptCode: true,
      organisationName: true,
      address: true,
      district: true,
      state: true,
      pinCode: true
    }
  });

  return {
    organisations,
    match:
      organisations.find((organisation) => sameOrganisationIdentity(organisation, input)) ?? null
  };
}

export async function createOrReuseOrganisation(input: OrganisationMutationInput) {
  return prisma.$transaction(async (tx) => {
    const normalized = normalizeOrganisationInput(input);
    const { organisations, match } = await findMatchingOrganisation(tx, normalized);

    if (match) {
      return {
        created: false as const,
        organisation: match
      };
    }

    const organisation = await tx.organisation.create({
      data: {
        groupCode: normalized.groupCode,
        prCode: normalized.prCode,
        organisationName: normalized.organisationName,
        address: normalized.address,
        district: normalized.district,
        state: normalized.state,
        pinCode: normalized.pinCode,
        phone: normalized.phone,
        email: normalized.email,
        website: normalized.website,
        actionStatus: normalized.actionStatus,
        remark: normalized.remark,
        academicYear: normalized.academicYear,
        strength: normalized.strength,
        boardType: normalized.boardType,
        sessionStartFrom: normalized.sessionStartFrom,
        minorityType: normalized.minorityType,
        saturdayStatus: normalized.saturdayStatus,
        workingStatus: normalized.workingStatus
      },
      select: {
        id: true,
        prCode: true,
        ptCode: true,
        organisationName: true,
        address: true,
        district: true,
        state: true,
        pinCode: true
      }
    });

    return {
      created: true as const,
      organisation
    };
  });
}

export async function ensureOrganisationForSchoolTx(
  tx: Tx,
  school: {
    schoolName: string;
    address?: string | null;
    district?: string | null;
    state?: string | null;
    pincode?: string | null;
    phone?: string | null;
    email?: string | null;
  }
) {
  const { organisations, match } = await findMatchingOrganisation(tx, {
    organisationName: school.schoolName,
    address: school.address,
    district: school.district,
    state: school.state,
    pinCode: school.pincode,
    phone: school.phone,
    email: school.email
  });

  if (match) {
    return match;
  }

  return tx.organisation.create({
    data: {
      prCode: nextCompactCode(
        "PR",
        organisations.map((organisation) => organisation.prCode)
      ),
      organisationName: school.schoolName.trim(),
      address: normalizeText(school.address),
      district: normalizeText(school.district),
      state: normalizeText(school.state),
      pinCode: normalizeText(school.pincode),
      phone: normalizeText(school.phone),
      email: normalizeText(school.email)
    },
    select: {
      id: true,
      prCode: true,
      ptCode: true,
      organisationName: true,
      address: true,
      district: true,
      state: true,
      pinCode: true
    }
  });
}

export async function ensurePtCodesForSchoolCodesTx(tx: Tx, schoolCodes: string[]) {
  const ptCodeByOriginalCode = new Map<string, string>();
  const uniqueCodes = Array.from(new Set(schoolCodes.map((code) => code.trim()).filter(Boolean)));
  if (uniqueCodes.length === 0) {
    return ptCodeByOriginalCode;
  }

  const schools = await tx.school.findMany({
    where: { schoolCode: { in: uniqueCodes } },
    select: {
      schoolId: true,
      schoolCode: true,
      schoolName: true,
      address: true,
      district: true,
      state: true,
      pincode: true,
      phone: true,
      email: true
    }
  });

  const cache = await tx.organisation.findMany({
    select: {
      id: true,
      prCode: true,
      ptCode: true,
      organisationName: true,
      address: true,
      district: true,
      state: true,
      pinCode: true
    }
  });

  for (const school of schools) {
    let organisation =
      cache.find((candidate) => candidate.prCode === school.schoolCode) ??
      cache.find((candidate) => candidate.ptCode === school.schoolCode) ??
      cache.find((candidate) =>
        sameOrganisationIdentity(candidate, {
          organisationName: school.schoolName,
          address: school.address,
          district: school.district,
          state: school.state,
          pinCode: school.pincode
        })
      ) ?? null;

    if (!organisation) {
      organisation = await tx.organisation.create({
        data: {
          prCode: /^PR\d+$/i.test(school.schoolCode)
            ? school.schoolCode
            : nextCompactCode("PR", cache.map((candidate) => candidate.prCode)),
          organisationName: school.schoolName.trim(),
          address: normalizeText(school.address),
          district: normalizeText(school.district),
          state: normalizeText(school.state),
          pinCode: normalizeText(school.pincode),
          phone: normalizeText(school.phone),
          email: normalizeText(school.email)
        },
        select: {
          id: true,
          prCode: true,
          ptCode: true,
          organisationName: true,
          address: true,
          district: true,
          state: true,
          pinCode: true
        }
      });
      cache.push(organisation);
    }

    if (!organisation.ptCode) {
      const updated = await tx.organisation.update({
        where: { id: organisation.id },
        data: {
          ptCode: nextSequentialCompactCode(
            "PT",
            cache.flatMap((candidate) => (candidate.ptCode ? [candidate.ptCode] : [])),
            4
          )
        },
        select: {
          id: true,
          prCode: true,
          ptCode: true,
          organisationName: true,
          address: true,
          district: true,
          state: true,
          pinCode: true
        }
      });

      const index = cache.findIndex((candidate) => candidate.id === updated.id);
      cache[index] = updated;
      organisation = updated;
    }

    if (organisation.ptCode) {
      const targetSchool = await tx.school.findUnique({
        where: { schoolCode: organisation.ptCode },
        select: { schoolId: true }
      });

      // A school code is unique. Two legacy school records can resolve to the
      // same organisation/PT code, so do not overwrite one record's code with
      // the other's while an order is being created. Keep the selected
      // school's valid code in that case; it also keeps vendor-school links
      // and the order input in sync.
      if (targetSchool && targetSchool.schoolId !== school.schoolId) {
        ptCodeByOriginalCode.set(school.schoolCode, school.schoolCode);
        continue;
      }

      ptCodeByOriginalCode.set(school.schoolCode, organisation.ptCode);

      if (school.schoolCode !== organisation.ptCode) {
        await tx.school.update({
          where: { schoolId: school.schoolId },
          data: { schoolCode: organisation.ptCode }
        });
      }
    }
  }

  return ptCodeByOriginalCode;
}

async function loadFilteredOrganisations(filters: OrganisationLookupFilters) {
  const workingStatus = toWorkingStatusFilter(filters.workingStatus);
  const where: Prisma.OrganisationWhereInput = {
    ...(filters.prCode && { prCode: { contains: filters.prCode, mode: "insensitive" } }),
    ...(filters.organisationName && {
      organisationName: { contains: filters.organisationName, mode: "insensitive" }
    }),
    ...(filters.district && { district: { contains: filters.district, mode: "insensitive" } }),
    ...(filters.state && { state: { contains: filters.state, mode: "insensitive" } }),
    ...(filters.actionStatus && {
      actionStatus: { contains: filters.actionStatus, mode: "insensitive" }
    }),
    ...(workingStatus !== undefined && { workingStatus })
  };

  const organisations = await prisma.organisation.findMany({
    where,
    orderBy: [{ organisationName: "asc" }, { prCode: "asc" }],
    select: {
      id: true,
      prCode: true,
      organisationName: true,
      district: true,
      state: true,
      pinCode: true,
      phone: true,
      email: true,
      website: true,
      actionStatus: true,
      workingStatus: true
    }
  });

  return {
    organisations: organisations.map(mapListItem),
    usedFallbackSearch: false
  };
}

async function loadSelectedOrganisation(prCode: string) {
  if (!prCode) {
    return null;
  }

  const selected = await prisma.organisation.findUnique({
    where: { prCode },
    select: {
      id: true, prCode: true, groupCode: true, ptCode: true, organisationName: true,
      address: true, district: true, state: true, pinCode: true, phone: true, email: true,
      website: true, actionStatus: true, remark: true, academicYear: true, strength: true,
      boardType: true, sessionStartFrom: true, minorityType: true, saturdayStatus: true,
      workingStatus: true
    }
  });
  return selected ? mapDetail(selected) : null;
}

export async function getOrganisationLookupData(
  params: URLSearchParams
): Promise<OrganisationLookupData> {
  const filters: OrganisationLookupFilters = {
    prCode: normalizeValue(params.get("prCode")),
    organisationName: normalizeValue(params.get("organisationName")),
    district: normalizeValue(params.get("district")),
    state: normalizeValue(params.get("state")),
    actionStatus: normalizeValue(params.get("actionStatus")),
    workingStatus: normalizeValue(params.get("workingStatus")),
    selected: normalizeValue(params.get("selected"))
  };

  const requestedPage = parsePage(params.get("page"));

  const [listData, selectedOrganisation] = await Promise.all([
    loadFilteredOrganisations(filters),
    loadSelectedOrganisation(filters.selected)
  ]);

  const totalCount = listData.organisations.length;
  const totalPages = totalCount === 0 ? 1 : Math.ceil(totalCount / ORGANISATIONS_PAGE_SIZE);
  const page = Math.min(requestedPage, totalPages);
  const skip = (page - 1) * ORGANISATIONS_PAGE_SIZE;
  const organisations = listData.organisations.slice(skip, skip + ORGANISATIONS_PAGE_SIZE);

  return {
    filters,
    organisations,
    selectedOrganisation,
    page,
    pageSize: ORGANISATIONS_PAGE_SIZE,
    totalCount,
    totalPages,
    resultStart: totalCount === 0 ? 0 : skip + 1,
    resultEnd: totalCount === 0 ? 0 : skip + organisations.length,
    usedFallbackSearch: listData.usedFallbackSearch
  };
}

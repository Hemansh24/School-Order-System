import {
  getOrganisationByPrCode,
  listOrganisations,
  searchOrganisations,
  type GetOrganisationByPrCodeData,
  type SearchOrganisationsData,
  type SearchOrganisationsVariables
} from "@dataconnect/generated";
import { getApp, getApps, initializeApp } from "firebase/app";

const ORGANISATIONS_PAGE_SIZE = 25;
const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ??
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
  "system-order-34c0a";

type OrganisationListRecord = SearchOrganisationsData["organisations"][number];
type OrganisationDetailRecord = GetOrganisationByPrCodeData["organisations"][number];

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

function ensureFirebaseApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp({
    projectId: FIREBASE_PROJECT_ID
  });
}

function normalizeValue(value: string | null) {
  return value?.trim() ?? "";
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

function includesValue(source: string | null | undefined, entered: string) {
  if (!entered) {
    return true;
  }

  return (source ?? "").toLowerCase().includes(entered.toLowerCase());
}

function matchesFilters(record: OrganisationListRecord, filters: OrganisationLookupFilters) {
  if (!includesValue(record.prCode, filters.prCode)) {
    return false;
  }

  if (!includesValue(record.organisationName, filters.organisationName)) {
    return false;
  }

  if (!includesValue(record.district, filters.district)) {
    return false;
  }

  if (!includesValue(record.state, filters.state)) {
    return false;
  }

  if (!includesValue(record.actionStatus, filters.actionStatus)) {
    return false;
  }

  if (filters.workingStatus === "working" && record.workingStatus !== true) {
    return false;
  }

  if (filters.workingStatus === "not_working" && record.workingStatus !== false) {
    return false;
  }

  if (filters.workingStatus === "unknown" && record.workingStatus !== null) {
    return false;
  }

  return true;
}

function mapListItem(record: OrganisationListRecord): OrganisationListItem {
  return {
    id: record.id,
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

function mapDetail(record: OrganisationDetailRecord): OrganisationDetail {
  return {
    id: record.id,
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
    sessionStartFrom: record.sessionStartFrom ?? null,
    minorityType: record.minorityType ?? null,
    saturdayStatus: record.saturdayStatus ?? null,
    workingStatus: record.workingStatus ?? null
  };
}

function isOperationNotDeployed(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes('operation "SearchOrganisations" not found')
  );
}

async function loadFilteredOrganisations(filters: OrganisationLookupFilters) {
  ensureFirebaseApp();

  const workingStatus = toWorkingStatusFilter(filters.workingStatus);
  const vars: SearchOrganisationsVariables = {
    prCode: filters.prCode || undefined,
    organisationName: filters.organisationName || undefined,
    district: filters.district || undefined,
    state: filters.state || undefined,
    actionStatus: filters.actionStatus || undefined,
    workingStatus,
    limit: 1000,
    offset: 0
  };

  try {
    const { data } = await searchOrganisations(vars);
    return {
      organisations: data.organisations.map(mapListItem),
      usedFallbackSearch: false
    };
  } catch (error) {
    if (!isOperationNotDeployed(error)) {
      throw error;
    }
  }

  const { data } = await listOrganisations();
  const filtered = data.organisations.filter((record) => matchesFilters(record, filters));

  return {
    organisations: filtered.map(mapListItem),
    usedFallbackSearch: true
  };
}

async function loadSelectedOrganisation(prCode: string) {
  if (!prCode) {
    return null;
  }

  ensureFirebaseApp();
  const { data } = await getOrganisationByPrCode({ prCode });
  const selected = data.organisations[0];
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

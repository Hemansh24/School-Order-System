import { upsertImportedOrganisation } from "@/lib/services/organisation-import";
import {
  listOrganisations,
  connectorConfig,
  type ListOrganisationsData
} from "@dataconnect/generated";
import type { Prisma } from "@prisma/client";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getDataConnect } from "firebase/data-connect";
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
    sessionStartFrom: organisation.sessionStartFrom ? new Date(organisation.sessionStartFrom) : null,
    minorityType: normalizeText(organisation.minorityType),
    saturdayStatus: normalizeText(organisation.saturdayStatus),
    workingStatus: organisation.workingStatus,
    sourceSheetRow: null,
    sourceHash: null,
    syncedAt: new Date()
  };
}

async function loadImportedOrganisationsFromDataConnect(): Promise<OrganisationSource[]> {
  const dataConnect = getDataConnect(ensureFirebaseApp(), connectorConfig);

  const pageSize = 500;
  const organisations: ImportedOrganisation[] = [];

  for (let offset = 0; ; offset += pageSize) {
    const { data } = await listOrganisations(dataConnect, { limit: pageSize, offset });
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

export async function replaceSchoolsWithImportedOrganisations(): Promise<SchoolSyncSummary> {
  const organisations = await loadImportedOrganisationsFromDataConnect();
  if (!organisations.length) throw new Error("No imported organisations were found.");
  const rows = organisations.map(toPrismaOrganisationData);
  await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(741024)`;
    for (const row of rows) await upsertImportedOrganisation(tx, row);
  }, { maxWait: 10_000, timeout: MASTER_DATA_TRANSACTION_TIMEOUT_MS });
  return {
    importedOrganisations: rows.length, replacedOrganisations: rows.length,
    replacedSchools: 0, preservedVendorLinks: await prisma.vendorSchool.count()
  };
}

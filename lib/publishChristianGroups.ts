import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { loadEnvConfig } from "@next/env";
import {
  connectorConfig,
  setChristianGroupActive,
  upsertChristianGroup
} from "@dataconnect/admin-generated";
import { listSharedChristianGroups } from "@dataconnect/generated";
import { cert, getApps as getAdminApps, initializeApp as initializeAdminApp } from "firebase-admin/app";
import { getDataConnect } from "firebase-admin/data-connect";
import { getApp, getApps, initializeApp } from "firebase/app";
import { readGoogleSheetRows, type GoogleSheetCell, type GoogleSheetRow } from "@/lib/googleSheets";

const PAGE_SIZE = 500;

// npm scripts execute outside Next.js, so load .env before resolving publisher
// configuration. In a deployed app this is a no-op because the environment is
// already populated by the host.
loadEnvConfig(process.cwd());

const COLUMN = {
  groupCode: 0,
  organisationName: 1,
  religionDenomination: 2,
  category: 3,
  geographyType: 4,
  operationalAreas: 5,
  locationDistrict: 6,
  locationState: 7,
  pinCode: 8,
  address: 9,
  phoneEmail: 10,
  runsSchools: 11,
  totalSchools: 12,
  totalStudents: 13,
  centralizedDecision: 14,
  website: 15
} as const;

export type ChristianGroupPublishSummary = {
  totalRows: number;
  inserted: number;
  updated: number;
  unchanged: number;
  deactivated: number;
  failed: number;
};

export type ChristianGroupRow = {
  groupCode: string;
  organisationName: string;
  religionDenomination: string | null;
  category: string | null;
  geographyType: string | null;
  operationalAreas: string | null;
  locationDistrict: string | null;
  locationState: string | null;
  pinCode: string | null;
  address: string | null;
  phoneEmail: string | null;
  runsSchools: string | null;
  totalSchools: string | null;
  totalStudents: string | null;
  centralizedDecision: string | null;
  website: string | null;
  sourceSheetRow: number;
  sourceHash: string;
};

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function value(row: GoogleSheetRow, column: number) {
  const cell: GoogleSheetCell = row.values[column] ?? null;
  if (cell === null) return null;
  const normalized = String(cell).trim();
  return normalized || null;
}

function hasAnyValue(row: GoogleSheetRow) {
  return row.values.some((cell) => cell !== null && String(cell).trim() !== "");
}

function normalizeHeader(value: GoogleSheetCell) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function assertHeader(row: GoogleSheetRow) {
  const header = row.values.map(normalizeHeader);
  if (
    header[COLUMN.groupCode] !== "organisation code" ||
    header[COLUMN.organisationName] !== "organisation name" ||
    !header[COLUMN.religionDenomination].startsWith("religion type-") ||
    !header[COLUMN.category].startsWith("category -") ||
    header[COLUMN.website] !== "website"
  ) {
    throw new Error("Christian-Group Sheet headers do not match the expected master-data layout.");
  }
}

function rowToChristianGroup(row: GoogleSheetRow): ChristianGroupRow {
  const groupCode = value(row, COLUMN.groupCode);
  const organisationName = value(row, COLUMN.organisationName);
  if (!groupCode) throw new Error(`Row ${row.rowNumber}: Organisation Code is required.`);
  if (!organisationName) throw new Error(`Row ${row.rowNumber}: Organisation Name is required.`);

  const data = {
    groupCode,
    organisationName,
    religionDenomination: value(row, COLUMN.religionDenomination),
    category: value(row, COLUMN.category),
    geographyType: value(row, COLUMN.geographyType),
    operationalAreas: value(row, COLUMN.operationalAreas),
    locationDistrict: value(row, COLUMN.locationDistrict),
    locationState: value(row, COLUMN.locationState),
    pinCode: value(row, COLUMN.pinCode),
    address: value(row, COLUMN.address),
    phoneEmail: value(row, COLUMN.phoneEmail),
    runsSchools: value(row, COLUMN.runsSchools),
    totalSchools: value(row, COLUMN.totalSchools),
    totalStudents: value(row, COLUMN.totalStudents),
    centralizedDecision: value(row, COLUMN.centralizedDecision),
    website: value(row, COLUMN.website),
    sourceSheetRow: row.rowNumber
  };
  return {
    ...data,
    sourceHash: createHash("sha256").update(JSON.stringify(data)).digest("hex")
  };
}

function ensureWebFirebaseApp() {
  if (getApps().length > 0) return getApp();
  return initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID ?? "system-order-34c0a" });
}

function ensureAdminFirebaseApp() {
  if (getAdminApps().length === 0) {
    const keyFile = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_FILE;
    initializeAdminApp(
      keyFile
        ? { credential: cert(JSON.parse(readFileSync(keyFile, "utf8"))) }
        : undefined
    );
  }
  return getDataConnect(connectorConfig);
}

async function existingGroups() {
  ensureWebFirebaseApp();
  const groups = [] as Awaited<ReturnType<typeof listSharedChristianGroups>>["data"]["sharedChristianGroups"];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data } = await listSharedChristianGroups({ limit: PAGE_SIZE, offset });
    groups.push(...data.sharedChristianGroups);
    if (data.sharedChristianGroups.length < PAGE_SIZE) return groups;
  }
}

export async function publishChristianGroups(): Promise<ChristianGroupPublishSummary> {
  const parsed = await readChristianGroupSource();
  const existing = new Map((await existingGroups()).map((group) => [group.groupCode, group]));
  const adminDataConnect = ensureAdminFirebaseApp();
  const summary: ChristianGroupPublishSummary = { totalRows: parsed.length, inserted: 0, updated: 0, unchanged: 0, deactivated: 0, failed: 0 };

  for (const row of parsed) {
    const current = existing.get(row.groupCode);
    if (current?.sourceHash === row.sourceHash && current.active) {
      summary.unchanged += 1;
      continue;
    }
    await upsertChristianGroup(adminDataConnect, { ...row, active: true });
    if (current) summary.updated += 1;
    else summary.inserted += 1;
  }

  const sourceCodes = new Set(parsed.map((row) => row.groupCode));
  for (const group of existing.values()) {
    if (group.active && !sourceCodes.has(group.groupCode)) {
      await setChristianGroupActive(adminDataConnect, { groupCode: group.groupCode, active: false });
      summary.deactivated += 1;
    }
  }
  return summary;
}

export async function readChristianGroupSource(): Promise<ChristianGroupRow[]> {
  const rows = await readGoogleSheetRows({
    spreadsheetId: requiredEnv("CHRISTIAN_GROUPS_SHEET_ID"),
    range: requiredEnv("CHRISTIAN_GROUPS_SHEET_RANGE")
  });
  if (rows.length === 0) throw new Error("Christian-Group Sheet is empty.");
  assertHeader(rows[0]);

  const sourceRows = rows.slice(1).filter(hasAnyValue);
  const parsed = sourceRows.map(rowToChristianGroup);
  const duplicate = parsed.find((row, index) => parsed.findIndex((candidate) => candidate.groupCode === row.groupCode) !== index);
  if (duplicate) throw new Error(`Duplicate Christian Organisation Code: ${duplicate.groupCode}`);
  return parsed;
}

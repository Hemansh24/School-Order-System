import { createHash } from "node:crypto";

import { Prisma } from "@prisma/client";

import { readGoogleSheetRows, type GoogleSheetCell, type GoogleSheetRow } from "@/lib/googleSheets";
import { prisma } from "@/lib/prisma";

export type OrganisationSyncSummary = {
  totalRows: number;
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
};

type OrganisationRowData = Prisma.OrganisationUncheckedCreateInput;

const ORGANISATION_COLUMN_INDEX = {
  groupCode: 0,
  ptCode: 1,
  prCode: 2,
  organisationName: 3,
  address: 4,
  district: 5,
  state: 6,
  pinCode: 7,
  phone: 8,
  email: 9,
  website: 10,
  actionStatus: 11,
  remark: 12,
  academicYear: 13,
  strength: 14,
  boardType: 15,
  sessionStartFrom: 16,
  minorityType: 17,
  saturdayStatus: 18,
  workingStatus: 19
} as const;

function getCellValue(row: GoogleSheetRow, index: number) {
  return row.values[index] ?? null;
}

function isBlankCell(value: GoogleSheetCell) {
  return value === null || (typeof value === "string" && value.trim() === "");
}

function hasAnyValue(row: GoogleSheetRow) {
  return row.values.some((value) => !isBlankCell(value));
}

function normalizeString(value: GoogleSheetCell) {
  if (isBlankCell(value)) {
    return null;
  }

  return String(value).trim();
}

function parseInteger(value: GoogleSheetCell, fieldName: string) {
  if (isBlankCell(value)) {
    return null;
  }

  if (typeof value === "number") {
    if (!Number.isInteger(value)) {
      throw new Error(`${fieldName} must be an integer. Received: ${value}`);
    }

    return value;
  }

  const normalized = String(value).replace(/,/g, "").trim();
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  if (!Number.isInteger(parsed)) {
    throw new Error(`${fieldName} must be an integer. Received: ${value}`);
  }

  return parsed;
}

function parseBoolean(value: GoogleSheetCell, fieldName: string) {
  if (isBlankCell(value)) {
    return null;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) {
      return true;
    }

    if (value === 0) {
      return false;
    }
  }

  const normalized = String(value).trim().toLowerCase();

  if (["true", "yes", "y", "1"].includes(normalized)) {
    return true;
  }

  if (["false", "no", "n", "0"].includes(normalized)) {
    return false;
  }

  throw new Error(`${fieldName} must be a boolean-compatible value. Received: ${value}`);
}

function toUtcDate(year: number, monthIndex: number, day: number) {
  return new Date(Date.UTC(year, monthIndex, day));
}

function parseDate(value: GoogleSheetCell, fieldName: string) {
  if (isBlankCell(value)) {
    return null;
  }

  if (typeof value === "number") {
    const utcEpoch = Date.UTC(1899, 11, 30);
    return new Date(utcEpoch + Math.floor(value) * 24 * 60 * 60 * 1000);
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return null;
  }

  const isoMatch = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return toUtcDate(Number(year), Number(month) - 1, Number(day));
  }

  const slashMatch = normalized.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (slashMatch) {
    const [, first, second, year] = slashMatch;
    const firstNumber = Number(first);
    const secondNumber = Number(second);

    if (firstNumber > 12) {
      return toUtcDate(Number(year), secondNumber - 1, firstNumber);
    }

    return toUtcDate(Number(year), firstNumber - 1, secondNumber);
  }

  const parsedTimestamp = Date.parse(normalized);
  if (Number.isNaN(parsedTimestamp)) {
    throw new Error(`${fieldName} must be a valid date. Received: ${value}`);
  }

  const parsedDate = new Date(parsedTimestamp);
  return toUtcDate(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate());
}

function isHeaderRow(row: GoogleSheetRow) {
  const values = row.values.map((value) => normalizeString(value)?.toLowerCase() ?? "");

  return (
    values[ORGANISATION_COLUMN_INDEX.groupCode] === "group code" &&
    values[ORGANISATION_COLUMN_INDEX.ptCode] === "pt code" &&
    values[ORGANISATION_COLUMN_INDEX.prCode] === "pr code"
  );
}

function buildOrganisationData(row: GoogleSheetRow): OrganisationRowData {
  const prCode = normalizeString(getCellValue(row, ORGANISATION_COLUMN_INDEX.prCode));
  const organisationName = normalizeString(
    getCellValue(row, ORGANISATION_COLUMN_INDEX.organisationName)
  );

  if (!prCode) {
    throw new Error("PR Code is required.");
  }

  if (!organisationName) {
    throw new Error("School Name is required.");
  }

  return {
    groupCode: normalizeString(getCellValue(row, ORGANISATION_COLUMN_INDEX.groupCode)),
    ptCode: normalizeString(getCellValue(row, ORGANISATION_COLUMN_INDEX.ptCode)),
    prCode,
    organisationName,
    address: normalizeString(getCellValue(row, ORGANISATION_COLUMN_INDEX.address)),
    district: normalizeString(getCellValue(row, ORGANISATION_COLUMN_INDEX.district)),
    state: normalizeString(getCellValue(row, ORGANISATION_COLUMN_INDEX.state)),
    pinCode: normalizeString(getCellValue(row, ORGANISATION_COLUMN_INDEX.pinCode)),
    phone: normalizeString(getCellValue(row, ORGANISATION_COLUMN_INDEX.phone)),
    email: normalizeString(getCellValue(row, ORGANISATION_COLUMN_INDEX.email)),
    website: normalizeString(getCellValue(row, ORGANISATION_COLUMN_INDEX.website)),
    actionStatus: normalizeString(getCellValue(row, ORGANISATION_COLUMN_INDEX.actionStatus)),
    remark: normalizeString(getCellValue(row, ORGANISATION_COLUMN_INDEX.remark)),
    academicYear: normalizeString(getCellValue(row, ORGANISATION_COLUMN_INDEX.academicYear)),
    strength: parseInteger(getCellValue(row, ORGANISATION_COLUMN_INDEX.strength), "Strength"),
    boardType: normalizeString(getCellValue(row, ORGANISATION_COLUMN_INDEX.boardType)),
    sessionStartFrom: parseDate(
      getCellValue(row, ORGANISATION_COLUMN_INDEX.sessionStartFrom),
      "Session Start from"
    ),
    minorityType: normalizeString(getCellValue(row, ORGANISATION_COLUMN_INDEX.minorityType)),
    saturdayStatus: normalizeString(getCellValue(row, ORGANISATION_COLUMN_INDEX.saturdayStatus)),
    workingStatus: parseBoolean(
      getCellValue(row, ORGANISATION_COLUMN_INDEX.workingStatus),
      "Working Status"
    ),
    sourceSheetRow: row.rowNumber
  };
}

function buildSourceHash(data: OrganisationRowData) {
  const payload = {
    groupCode: data.groupCode ?? null,
    ptCode: data.ptCode ?? null,
    prCode: data.prCode,
    organisationName: data.organisationName,
    address: data.address ?? null,
    district: data.district ?? null,
    state: data.state ?? null,
    pinCode: data.pinCode ?? null,
    phone: data.phone ?? null,
    email: data.email ?? null,
    website: data.website ?? null,
    actionStatus: data.actionStatus ?? null,
    remark: data.remark ?? null,
    academicYear: data.academicYear ?? null,
    strength: data.strength ?? null,
    boardType: data.boardType ?? null,
    sessionStartFrom:
      data.sessionStartFrom instanceof Date ? data.sessionStartFrom.toISOString() : null,
    minorityType: data.minorityType ?? null,
    saturdayStatus: data.saturdayStatus ?? null,
    workingStatus: data.workingStatus ?? null,
    sourceSheetRow: data.sourceSheetRow ?? null
  };

  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export async function syncOrganisations(): Promise<OrganisationSyncSummary> {
  const sheetRows = await readGoogleSheetRows();
  const rowsToProcess = sheetRows.filter((row, index) => {
    if (!hasAnyValue(row)) {
      return false;
    }

    return !(index === 0 && isHeaderRow(row));
  });

  const summary: OrganisationSyncSummary = {
    totalRows: rowsToProcess.length,
    inserted: 0,
    updated: 0,
    skipped: 0,
    failed: 0
  };

  for (const row of rowsToProcess) {
    try {
      const data = buildOrganisationData(row);
      const sourceHash = buildSourceHash(data);
      const existingOrganisation = await prisma.organisation.findUnique({
        where: {
          prCode: data.prCode
        },
        select: {
          id: true,
          sourceHash: true
        }
      });

      if (existingOrganisation?.sourceHash === sourceHash) {
        summary.skipped += 1;
        continue;
      }

      await prisma.organisation.upsert({
        where: {
          prCode: data.prCode
        },
        create: {
          ...data,
          sourceHash,
          syncedAt: new Date()
        },
        update: {
          ...data,
          sourceHash,
          syncedAt: new Date()
        }
      });

      if (existingOrganisation) {
        summary.updated += 1;
      } else {
        summary.inserted += 1;
      }
    } catch (error) {
      summary.failed += 1;

      console.error("Failed to sync organisation row.", {
        rowNumber: row.rowNumber,
        prCode: normalizeString(getCellValue(row, ORGANISATION_COLUMN_INDEX.prCode)),
        error
      });
    }
  }

  return summary;
}

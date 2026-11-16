import { loadEnvConfig } from "@next/env";
import { readFileSync } from "node:fs";
import { connectorConfig, upsertSharedSchoolWiseDiscount } from "@dataconnect/admin-generated";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getDataConnect } from "firebase-admin/data-connect";
import { prisma } from "@/lib/prisma";

loadEnvConfig(process.cwd());

function dataConnect() {
  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "system-order-34c0a";
    const keyFile = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_FILE;
    initializeApp(keyFile ? { projectId, credential: cert(JSON.parse(readFileSync(keyFile, "utf8"))) } : { projectId });
  }
  return getDataConnect(connectorConfig);
}

export async function publishSchoolWiseDiscounts() {
  const records = await prisma.schoolWiseDiscount.findMany({ orderBy: [{ sourceSpreadsheetId: "asc" }, { sourceSheetId: "asc" }, { sourceRow: "asc" }] });
  const client = dataConnect();
  for (const record of records) {
    await upsertSharedSchoolWiseDiscount(client, {
      sourceSpreadsheetId: record.sourceSpreadsheetId,
      sourceSheetId: record.sourceSheetId,
      sourceRow: record.sourceRow,
      prCode: record.prCode,
      ptCode: record.ptCode,
      schoolName: record.schoolName,
      district: record.district,
      state: record.state,
      billingToWhom: record.billingToWhom,
      bookseller: record.bookseller,
      discount: record.discount,
      groupCode: record.groupCode,
      groupName: record.groupName,
      importedAt: record.importedAt.toISOString()
    });
  }
  return { published: records.length };
}

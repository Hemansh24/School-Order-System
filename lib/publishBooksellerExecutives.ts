import { loadEnvConfig } from "@next/env";
import { readFileSync } from "node:fs";
import { connectorConfig, upsertSharedBooksellerExecutive } from "@dataconnect/admin-generated";
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

export async function publishBooksellerExecutives() {
  const records = await prisma.booksellerExecutive.findMany({
    orderBy: [{ sourceSpreadsheetId: "asc" }, { sourceSheetId: "asc" }, { sourceSheetRow: "asc" }]
  });
  const client = dataConnect();
  for (const record of records) {
    await upsertSharedBooksellerExecutive(client, {
      pbsCode: record.pbsCode,
      incumbentCode: record.incumbentCode,
      name: record.name,
      designation: record.designation,
      contact1: record.contact1,
      contact2: record.contact2,
      email: record.email,
      sourceSpreadsheetId: record.sourceSpreadsheetId,
      sourceSheetId: record.sourceSheetId,
      sourceSheetRow: record.sourceSheetRow,
      sourceValues: record.sourceValues
    });
  }
  return { published: records.length };
}

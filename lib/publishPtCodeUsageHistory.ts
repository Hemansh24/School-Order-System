import { loadEnvConfig } from "@next/env";
import { readFileSync } from "node:fs";
import { connectorConfig, upsertSharedPtCodeUsageHistory } from "@dataconnect/admin-generated";
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

export async function publishPtCodeUsageHistory() {
  const records = await prisma.ptCodeUsageHistory.findMany({ orderBy: [{ ptCode: "asc" }, { sessionYear: "asc" }] });
  const client = dataConnect();
  for (const record of records) {
    await upsertSharedPtCodeUsageHistory(client, { ptCode: record.ptCode, sessionYear: record.sessionYear });
  }
  return { published: records.length };
}

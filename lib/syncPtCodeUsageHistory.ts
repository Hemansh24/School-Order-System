import { connectorConfig, listSharedPtCodeUsageHistory, type ListSharedPtCodeUsageHistoryData } from "@dataconnect/generated";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getDataConnect } from "firebase/data-connect";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 500;
const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "system-order-34c0a";

function dataConnect() {
  return getDataConnect(getApps().length ? getApp() : initializeApp({ projectId }), connectorConfig);
}

async function listAll() {
  const records: ListSharedPtCodeUsageHistoryData["sharedPtCodeUsageHistories"] = [];
  const client = dataConnect();
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data } = await listSharedPtCodeUsageHistory(client, { limit: PAGE_SIZE, offset });
    records.push(...data.sharedPtCodeUsageHistories);
    if (data.sharedPtCodeUsageHistories.length < PAGE_SIZE) return records;
  }
}

export async function replacePtCodeUsageHistoryWithSharedData() {
  const records = await listAll();
  if (!records.length) throw new Error("No shared PT-code usage-history rows were returned from Data Connect. Ask an administrator to publish the history.");
  await prisma.$transaction(async (tx) => {
    await tx.ptCodeUsageHistory.deleteMany();
    await tx.ptCodeUsageHistory.createMany({ data: records.map((record) => ({ ptCode: record.ptCode, sessionYear: record.sessionYear })) });
  });
  return { replaced: records.length };
}

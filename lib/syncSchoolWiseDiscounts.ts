import { connectorConfig, listSharedSchoolWiseDiscounts, type ListSharedSchoolWiseDiscountsData } from "@dataconnect/generated";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getDataConnect } from "firebase/data-connect";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 500;
const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "system-order-34c0a";

function dataConnect() {
  return getDataConnect(getApps().length ? getApp() : initializeApp({ projectId }), connectorConfig);
}

async function listAll() {
  const records: ListSharedSchoolWiseDiscountsData["sharedSchoolWiseDiscounts"] = [];
  const client = dataConnect();
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data } = await listSharedSchoolWiseDiscounts(client, { limit: PAGE_SIZE, offset });
    records.push(...data.sharedSchoolWiseDiscounts);
    if (data.sharedSchoolWiseDiscounts.length < PAGE_SIZE) return records;
  }
}

export async function replaceSchoolWiseDiscountsWithSharedData() {
  const records = await listAll();
  if (!records.length) throw new Error("No shared school-wise discount rows were returned from Data Connect. Ask an administrator to publish the discounts.");
  await prisma.$transaction(async (tx) => {
    await tx.schoolWiseDiscount.deleteMany();
    await tx.schoolWiseDiscount.createMany({ data: records.map((record) => ({
      sourceSpreadsheetId: record.sourceSpreadsheetId,
      sourceSheetId: record.sourceSheetId,
      sourceRow: record.sourceRow,
      prCode: record.prCode ?? null,
      ptCode: record.ptCode ?? null,
      schoolName: record.schoolName ?? null,
      district: record.district ?? null,
      state: record.state ?? null,
      billingToWhom: record.billingToWhom ?? null,
      bookseller: record.bookseller ?? null,
      discount: record.discount ?? null,
      groupCode: record.groupCode ?? null,
      groupName: record.groupName ?? null,
      importedAt: new Date(record.importedAt)
    })) });
  });
  return { replaced: records.length };
}

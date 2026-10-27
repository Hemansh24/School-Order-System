import { connectorConfig, listSharedExecutives, listSharedSchoolExecutiveDefaults, type ListSharedExecutivesData, type ListSharedSchoolExecutiveDefaultsData } from "@dataconnect/generated";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getDataConnect } from "firebase/data-connect";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 500;
const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "system-order-34c0a";

function dataConnect() {
  return getDataConnect(getApps().length ? getApp() : initializeApp({ projectId }), connectorConfig);
}

async function listAllExecutives() {
  const records: ListSharedExecutivesData["sharedExecutives"] = [];
  const client = dataConnect();
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data } = await listSharedExecutives(client, { limit: PAGE_SIZE, offset });
    records.push(...data.sharedExecutives);
    if (data.sharedExecutives.length < PAGE_SIZE) return records;
  }
}

async function listAllDefaults() {
  const records: ListSharedSchoolExecutiveDefaultsData["sharedSchoolExecutiveDefaults"] = [];
  const client = dataConnect();
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data } = await listSharedSchoolExecutiveDefaults(client, { limit: PAGE_SIZE, offset });
    records.push(...data.sharedSchoolExecutiveDefaults);
    if (data.sharedSchoolExecutiveDefaults.length < PAGE_SIZE) return records;
  }
}

export async function replaceExecutivesWithSharedData() {
  const [executives, defaults] = await Promise.all([listAllExecutives(), listAllDefaults()]);
  if (!executives.length) throw new Error("No shared executive rows were returned from Data Connect. Ask an administrator to publish the executive directory.");
  await prisma.$transaction(async (tx) => {
    await tx.executive.deleteMany();
    await tx.executive.createMany({ data: executives.map((record) => ({ incumbentCode: record.incumbentCode, name: record.name, mobile: record.mobile ?? null, email: record.email ?? null, baseLocation: record.baseLocation ?? null, syncedAt: new Date(record.syncedAt) })) });
    await tx.schoolExecutiveDefault.deleteMany();
    if (defaults.length) await tx.schoolExecutiveDefault.createMany({ data: defaults.map((record) => ({ prCode: record.prCode, incumbentCode: record.incumbentCode ?? null, name: record.name, updatedAt: new Date(record.updatedAt) })) });
  });
  return { executives: executives.length, defaults: defaults.length };
}

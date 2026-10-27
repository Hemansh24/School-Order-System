import { loadEnvConfig } from "@next/env";
import { readFileSync } from "node:fs";
import { connectorConfig, upsertSharedExecutive, upsertSharedOrderSchoolExecutive, upsertSharedSchoolExecutiveDefault } from "@dataconnect/admin-generated";
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

export async function publishExecutives() {
  const [executives, defaults, assignments] = await Promise.all([
    prisma.executive.findMany({ orderBy: { incumbentCode: "asc" } }),
    prisma.schoolExecutiveDefault.findMany({ orderBy: { prCode: "asc" } }),
    prisma.orderSchoolExecutive.findMany({ orderBy: [{ orderSheet1Id: "asc" }, { schoolCode: "asc" }] })
  ]);
  const client = dataConnect();
  for (const executive of executives) {
    await upsertSharedExecutive(client, {
      incumbentCode: executive.incumbentCode,
      name: executive.name,
      mobile: executive.mobile,
      email: executive.email,
      baseLocation: executive.baseLocation
    });
  }
  for (const value of defaults) {
    await upsertSharedSchoolExecutiveDefault(client, { prCode: value.prCode, incumbentCode: value.incumbentCode, name: value.name });
  }
  for (const assignment of assignments) {
    await upsertSharedOrderSchoolExecutive(client, {
      orderSheet1Id: assignment.orderSheet1Id,
      schoolCode: assignment.schoolCode,
      incumbentCode: assignment.incumbentCode,
      name: assignment.name
    });
  }
  return { executives: executives.length, defaults: defaults.length, orderAssignments: assignments.length };
}

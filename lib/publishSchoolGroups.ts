import { readFileSync } from "node:fs";

import { loadEnvConfig } from "@next/env";
import {
  connectorConfig,
  upsertSharedSchoolGroup,
  upsertSharedSchoolGroupLocation
} from "@dataconnect/admin-generated";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getDataConnect } from "firebase-admin/data-connect";
import { prisma } from "@/lib/prisma";

loadEnvConfig(process.cwd());

function getAdminDataConnect() {
  if (getApps().length === 0) {
    const keyFile = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_FILE;
    initializeApp(keyFile ? { credential: cert(JSON.parse(readFileSync(keyFile, "utf8"))) } : undefined);
  }
  return getDataConnect(connectorConfig);
}

export async function publishSchoolGroups() {
  const groups = await prisma.schoolGroup.findMany({
    where: { sourceType: "GS" },
    include: { locations: { orderBy: { subCode: "asc" } } },
    orderBy: { groupCode: "asc" }
  });

  if (groups.length === 0) throw new Error("No GS groups exist locally to publish.");

  const dataConnect = getAdminDataConnect();
  for (const group of groups) {
    await upsertSharedSchoolGroup(dataConnect, {
      id: String(group.schoolGroupId),
      groupCode: group.groupCode,
      groupName: group.groupName,
      active: group.active
    });

    for (const location of group.locations) {
      await upsertSharedSchoolGroupLocation(dataConnect, {
        id: String(location.schoolGroupLocationId),
        groupCode: group.groupCode,
        subCode: location.subCode,
        name: location.name,
        address: location.address,
        district: location.district,
        state: location.state,
        pincode: location.pincode,
        centralizedDecision: location.centralizedDecision
      });
    }
  }

  return { groups: groups.length, locations: groups.reduce((total, group) => total + group.locations.length, 0) };
}

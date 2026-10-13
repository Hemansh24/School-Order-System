import {
  connectorConfig,
  listSharedChristianGroups,
  type ListSharedChristianGroupsData
} from "@dataconnect/generated";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getDataConnect } from "firebase/data-connect";
import { prisma } from "@/lib/prisma";
import { importGsGroups } from "@/lib/importGsGroups";

const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ??
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
  "system-order-34c0a";
const PAGE_SIZE = 500;

function ensureFirebaseApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp({ projectId: FIREBASE_PROJECT_ID });
}

async function listAllChristianGroups(dataConnect: ReturnType<typeof getDataConnect>) {
  const groups: ListSharedChristianGroupsData["sharedChristianGroups"] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data } = await listSharedChristianGroups(dataConnect, { limit: PAGE_SIZE, offset });
    groups.push(...data.sharedChristianGroups);
    if (data.sharedChristianGroups.length < PAGE_SIZE) return groups;
  }
}

export async function syncGroups() {
  const gs = await importGsGroups(undefined, true);
  const christian = await syncChristianGroups();
  return { groups: gs.groups, locations: gs.locations, christianGroups: christian.christianGroups };
}

export async function syncChristianGroups() {
  const christianGroups = await listAllChristianGroups(getDataConnect(ensureFirebaseApp(), connectorConfig));
  if (!christianGroups.length) throw new Error("No Christian groups returned; existing local records were preserved.");
  for (const group of christianGroups) {
    await prisma.schoolGroup.upsert({
      where: { groupCode: group.groupCode },
      create: {
        groupCode: group.groupCode,
        groupName: group.organisationName,
        sourceType: "CHRISTIAN",
        active: group.active,
        address: group.address ?? null,
        district: group.locationDistrict ?? null,
        state: group.locationState ?? null,
        pincode: group.pinCode ?? null,
        phoneEmail: group.phoneEmail ?? null,
        website: group.website ?? null,
        sourceHash: group.sourceHash ?? null,
        syncedAt: group.syncedAt,
        metadata: {
          religionDenomination: group.religionDenomination ?? null,
          category: group.category ?? null,
          geographyType: group.geographyType ?? null,
          operationalAreas: group.operationalAreas ?? null,
          runsSchools: group.runsSchools ?? null,
          totalSchools: group.totalSchools ?? null,
          totalStudents: group.totalStudents ?? null,
          centralizedDecision: group.centralizedDecision ?? null,
          sourceSheetRow: group.sourceSheetRow ?? null
        }
      },
      update: {
        groupName: group.organisationName,
        sourceType: "CHRISTIAN",
        active: group.active,
        address: group.address ?? null,
        district: group.locationDistrict ?? null,
        state: group.locationState ?? null,
        pincode: group.pinCode ?? null,
        phoneEmail: group.phoneEmail ?? null,
        website: group.website ?? null,
        sourceHash: group.sourceHash ?? null,
        syncedAt: group.syncedAt,
        metadata: {
          religionDenomination: group.religionDenomination ?? null,
          category: group.category ?? null,
          geographyType: group.geographyType ?? null,
          operationalAreas: group.operationalAreas ?? null,
          runsSchools: group.runsSchools ?? null,
          totalSchools: group.totalSchools ?? null,
          totalStudents: group.totalStudents ?? null,
          centralizedDecision: group.centralizedDecision ?? null,
          sourceSheetRow: group.sourceSheetRow ?? null
        }
      }
    });
  }

  return { christianGroups: christianGroups.length };
}

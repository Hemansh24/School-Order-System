import {
  connectorConfig,
  listSharedChristianGroups,
  listSharedSchoolGroupLocations,
  listSharedSchoolGroups,
  type ListSharedChristianGroupsData,
  type ListSharedSchoolGroupLocationsData,
  type ListSharedSchoolGroupsData
} from "@dataconnect/generated";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getDataConnect } from "firebase/data-connect";
import { prisma } from "@/lib/prisma";

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

async function listAllSchoolGroups(dataConnect: ReturnType<typeof getDataConnect>) {
  const groups: ListSharedSchoolGroupsData["sharedSchoolGroups"] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data } = await listSharedSchoolGroups(dataConnect, { limit: PAGE_SIZE, offset });
    groups.push(...data.sharedSchoolGroups);
    if (data.sharedSchoolGroups.length < PAGE_SIZE) return groups;
  }
}

async function listAllSchoolGroupLocations(dataConnect: ReturnType<typeof getDataConnect>) {
  const locations: ListSharedSchoolGroupLocationsData["sharedSchoolGroupLocations"] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data } = await listSharedSchoolGroupLocations(dataConnect, { limit: PAGE_SIZE, offset });
    locations.push(...data.sharedSchoolGroupLocations);
    if (data.sharedSchoolGroupLocations.length < PAGE_SIZE) return locations;
  }
}

export async function syncGroups() {
  const dataConnect = getDataConnect(ensureFirebaseApp(), connectorConfig);
  const [groups, locations] = await Promise.all([
    listAllSchoolGroups(dataConnect),
    listAllSchoolGroupLocations(dataConnect)
  ]);
  if (!groups.length) throw new Error("No shared GS group rows were returned from Data Connect.");

  for (const group of groups) {
    const localGroup = await prisma.schoolGroup.upsert({
      where: { groupCode: group.groupCode },
      create: { groupCode: group.groupCode, groupName: group.groupName, sourceType: "GS", active: group.active, syncedAt: group.syncedAt },
      update: { groupName: group.groupName, sourceType: "GS", active: group.active, syncedAt: group.syncedAt }
    });
    for (const location of locations.filter((location) => location.groupCode === group.groupCode)) {
      await prisma.schoolGroupLocation.upsert({
        where: { schoolGroupId_subCode: { schoolGroupId: localGroup.schoolGroupId, subCode: location.subCode } },
        create: { schoolGroupId: localGroup.schoolGroupId, subCode: location.subCode, name: location.name, address: location.address ?? null, district: location.district ?? null, state: location.state ?? null, pincode: location.pincode ?? null, centralizedDecision: location.centralizedDecision ?? null, syncedAt: location.syncedAt },
        update: { name: location.name, address: location.address ?? null, district: location.district ?? null, state: location.state ?? null, pincode: location.pincode ?? null, centralizedDecision: location.centralizedDecision ?? null, syncedAt: location.syncedAt }
      });
    }
  }

  const christian = await syncChristianGroups();
  return { groups: groups.length, locations: locations.length, christianGroups: christian.christianGroups };
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

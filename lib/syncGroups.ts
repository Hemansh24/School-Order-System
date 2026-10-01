import {
  listSharedSchoolGroupLocations,
  listSharedSchoolGroups,
  type ListSharedSchoolGroupLocationsData,
  type ListSharedSchoolGroupsData
} from "@dataconnect/generated";
import { getApp, getApps, initializeApp } from "firebase/app";
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

async function listAllGroups() {
  const groups: ListSharedSchoolGroupsData["sharedSchoolGroups"] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data } = await listSharedSchoolGroups({ limit: PAGE_SIZE, offset });
    groups.push(...data.sharedSchoolGroups);
    if (data.sharedSchoolGroups.length < PAGE_SIZE) return groups;
  }
}

async function listAllLocations() {
  const locations: ListSharedSchoolGroupLocationsData["sharedSchoolGroupLocations"] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data } = await listSharedSchoolGroupLocations({ limit: PAGE_SIZE, offset });
    locations.push(...data.sharedSchoolGroupLocations);
    if (data.sharedSchoolGroupLocations.length < PAGE_SIZE) return locations;
  }
}

export async function syncGroups() {
  ensureFirebaseApp();
  const [sharedGroups, sharedLocations] = await Promise.all([listAllGroups(), listAllLocations()]);
  if (sharedGroups.length === 0) {
    throw new Error("No shared group rows were returned from Data Connect. Ask an administrator to publish the Group Sheet.");
  }

  const groupsByCode = new Map(sharedGroups.map((group) => [group.groupCode, group]));
  const locationsByGroupCode = new Map<string, typeof sharedLocations>();
  for (const location of sharedLocations) {
    const rows = locationsByGroupCode.get(location.groupCode) ?? [];
    rows.push(location);
    locationsByGroupCode.set(location.groupCode, rows);
  }

  for (const [groupCode, sharedGroup] of groupsByCode) {
    const group = await prisma.schoolGroup.upsert({
      where: { groupCode },
      create: { groupCode, groupName: sharedGroup.groupName, syncedAt: new Date() },
      update: { groupName: sharedGroup.groupName, syncedAt: new Date() }
    });
    for (const location of locationsByGroupCode.get(groupCode) ?? []) {
      const data = { name: location.name, address: location.address ?? null, district: location.district ?? null, state: location.state ?? null, pincode: location.pincode ?? null, centralizedDecision: location.centralizedDecision ?? null, syncedAt: new Date() };
      await prisma.schoolGroupLocation.upsert({
        where: { schoolGroupId_subCode: { schoolGroupId: group.schoolGroupId, subCode: location.subCode } },
        create: { schoolGroupId: group.schoolGroupId, subCode: location.subCode, ...data },
        update: data
      });
    }
  }

  const groups = await prisma.schoolGroup.findMany({ include: { locations: true } });
  const locationsByCode = new Map(groups.map((group) => [group.groupCode, group.locations]));
  const organisations = await prisma.organisation.findMany({
    where: { groupCode: { in: [...groupsByCode.keys()] }, ptCode: { not: null } },
    select: { groupCode: true, ptCode: true, pinCode: true }
  });

  let suggestions = 0;
  for (const organisation of organisations) {
    if (!organisation.groupCode || !organisation.ptCode) continue;
    const matches = (locationsByCode.get(organisation.groupCode) ?? []).filter(
      (location) => !!organisation.pinCode && location.pincode === organisation.pinCode
    );
    const suggestedLocationId = matches.length === 1 ? matches[0].schoolGroupLocationId : null;
    const existing = await prisma.schoolGroupSchool.findUnique({ where: { ptCode: organisation.ptCode } });
    if (existing?.reviewedAt) continue;
    await prisma.schoolGroupSchool.upsert({
      where: { ptCode: organisation.ptCode },
      create: { ptCode: organisation.ptCode, suggestedLocationId },
      update: { suggestedLocationId }
    });
    if (suggestedLocationId) suggestions += 1;
  }

  return { groups: sharedGroups.length, locations: sharedLocations.length, suggestions };
}

import { prisma } from "@/lib/prisma";
import { currentLocations, normalizeGroupCode } from "@/lib/group-membership";
import { formatSchoolAddress } from "@/lib/shipping";

function metadataText(metadata: unknown, key: string) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
}

export async function getChristianGroupData(query = "", page = 1) {
  const pageSize = 25;
  const search = query.trim();
  const where = {
    sourceType: "CHRISTIAN",
    active: true,
    ...(search
      ? {
          OR: [
            { groupCode: { contains: search, mode: "insensitive" as const } },
            { groupName: { contains: search, mode: "insensitive" as const } },
            { district: { contains: search, mode: "insensitive" as const } },
            { state: { contains: search, mode: "insensitive" as const } }
          ]
        }
      : {})
  };
  const [groups, total] = await Promise.all([
    prisma.schoolGroup.findMany({
      where,
      orderBy: { groupCode: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.schoolGroup.count({ where })
  ]);

  return {
    groups: groups.map((group) => ({
      groupCode: group.groupCode,
      groupName: group.groupName,
      religionDenomination: metadataText(group.metadata, "religionDenomination"),
      category: metadataText(group.metadata, "category"),
      geographyType: metadataText(group.metadata, "geographyType"),
      operationalAreas: metadataText(group.metadata, "operationalAreas"),
      runsSchools: metadataText(group.metadata, "runsSchools"),
      totalSchools: metadataText(group.metadata, "totalSchools"),
      totalStudents: metadataText(group.metadata, "totalStudents"),
      centralizedDecision: metadataText(group.metadata, "centralizedDecision"),
      address: group.address,
      district: group.district,
      state: group.state,
      pincode: group.pincode,
      phoneEmail: group.phoneEmail,
      website: group.website
    })),
    total,
    page,
    pageSize
  };
}

export async function getGroupMappingData(query = "", page = 1) {
  // Each row contains a server-action form. Keep the first payload small so
  // the browser can hydrate and become interactive promptly.
  const pageSize = 15;
  const where = query.trim()
    ? { ptCode: { contains: query.trim(), mode: "insensitive" as const } }
    : {};
  const [groups, christianGroupCount, mappings, total] = await Promise.all([
    prisma.schoolGroup.findMany({ where: { sourceType: "GS", active: true }, include: { locations: true }, orderBy: { groupCode: "asc" } }),
    prisma.schoolGroup.count({ where: { sourceType: "CHRISTIAN", active: true } }),
    prisma.schoolGroupSchool.findMany({
      where,
      include: {
        location: { include: { schoolGroup: true } },
        suggestedLocation: { include: { schoolGroup: true } }
      },
      orderBy: { ptCode: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.schoolGroupSchool.count({ where })
  ]);
  const organisations = await prisma.organisation.findMany({
    where: { ptCode: { in: mappings.map((mapping) => mapping.ptCode) } },
    select: { ptCode: true, organisationName: true, groupCode: true }
  });
  const organisationByPtCode = new Map(organisations.filter((row) => row.ptCode).map((row) => [row.ptCode!, row]));
  return { groups, christianGroupCount, mappings, organisationByPtCode, total, page, pageSize };
}

export async function confirmGroupMapping(ptCode: string, locationId: number | null) {
  await prisma.schoolGroupSchool.upsert({
    where: { ptCode },
    create: { ptCode, schoolGroupLocationId: locationId, reviewedAt: new Date() },
    update: { schoolGroupLocationId: locationId, reviewedAt: new Date() }
  });
}

export async function getGsMasterData(query = "", page = 1) {
  const pageSize = 20;
  const search = query.trim().toLowerCase();
  const [masters, organisations] = await Promise.all([
    prisma.schoolGroup.findMany({ where: { sourceType: "GS", active: true }, include: { locations: { orderBy: { subCode: "asc" } } }, orderBy: { groupCode: "asc" } }),
    prisma.organisation.findMany({ where: { groupCode: { not: null } }, orderBy: { prCode: "asc" }, select: { groupCode: true, ptCode: true, prCode: true, organisationName: true, district: true, state: true, pinCode: true } })
  ]);
  const all = masters.map(group => ({ ...group, locations: currentLocations(group.locations, group.metadata), members: organisations.filter(org => normalizeGroupCode(org.groupCode) === normalizeGroupCode(group.groupCode)) }));
  const matching = all.filter(group => !search || [group.groupCode, group.groupName, ...group.members.flatMap(member => [member.prCode, member.ptCode, member.organisationName]), ...group.locations.flatMap(location => [location.district, location.state])].some(value => value?.toLowerCase().includes(search)));
  const known = new Set(masters.map(group => normalizeGroupCode(group.groupCode)));
  const unresolved = organisations.filter(org => /^GS/.test(normalizeGroupCode(org.groupCode)) && !known.has(normalizeGroupCode(org.groupCode)));
  const total = matching.length;
  const safePage = Math.min(Math.max(1, page), Math.max(1, Math.ceil(total / pageSize)));
  return { groups: matching.slice((safePage - 1) * pageSize, safePage * pageSize), total, page: safePage, pageSize, unresolved };
}

export async function getGsOrderOptions() {
  const [groups, organisations] = await Promise.all([
    prisma.schoolGroup.findMany({ where: { sourceType: "GS", active: true }, include: { locations: { orderBy: { subCode: "asc" } } }, orderBy: { groupCode: "asc" } }),
    prisma.organisation.findMany({ where: { groupCode: { not: null } }, orderBy: { prCode: "asc" }, select: { groupCode: true, ptCode: true, prCode: true, organisationName: true } })
  ]);
  return groups.map(group => {
    const locations = currentLocations(group.locations, group.metadata);
    return { optionKey: group.groupCode, schoolCode: group.groupCode, schoolName: group.groupName, groupType: "GS" as const, schoolGroupId: group.schoolGroupId, addressSummary: locations.length === 1 ? formatSchoolAddress(locations[0]) : "", locations: locations.map(location => ({ schoolGroupLocationId: location.schoolGroupLocationId, subCode: location.subCode, addressSummary: formatSchoolAddress(location), usable: !!location.address })), members: organisations.filter(org => normalizeGroupCode(org.groupCode) === normalizeGroupCode(group.groupCode)).map(org => ({ schoolCode: org.ptCode ?? org.prCode, schoolName: org.organisationName, prCode: org.prCode, ptCode: org.ptCode })) };
  });
}

export async function getGroupOrderReferenceData() {
  const [groups, orders] = await Promise.all([
    getGsOrderOptions(),
    prisma.orderSheet1.findMany({ where: { classification: "normal", billingToType: "school", schoolGroupId: null, groupParentLinks: { none: {} } }, select: { orderSheet1Id: true, orderNo: true, billingToCode: true, shippingToSummary: true, groupParentLinks: { select: { orderGroupChildOrderId: true } } }, orderBy: { orderNo: "desc" } })
  ]);
  return { groups, items: [], orders };
}

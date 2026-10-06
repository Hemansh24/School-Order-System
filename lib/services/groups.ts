import { prisma } from "@/lib/prisma";

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

export async function getGroupOrderReferenceData() {
  const [groups, items, orders] = await Promise.all([
    prisma.schoolGroup.findMany({ where: { sourceType: "GS", active: true }, include: { locations: { include: { mappings: true } } }, orderBy: { groupCode: "asc" } }),
    prisma.item.findMany({ where: { active: true, obsolete: false }, select: { itemCode: true, itemName: true }, orderBy: { itemName: "asc" } }),
    prisma.orderSheet1.findMany({
      where: { classification: "normal" },
      select: { orderSheet1Id: true, orderNo: true, billingToCode: true, shippingToSummary: true, groupParentLinks: { select: { orderGroupChildOrderId: true } } },
      orderBy: { orderNo: "desc" }, take: 200
    })
  ]);
  return { groups, items, orders };
}

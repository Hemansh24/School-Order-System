import { prisma } from "@/lib/prisma";

export async function getGroupMappingData(query = "", page = 1) {
  // Each row contains a server-action form. Keep the first payload small so
  // the browser can hydrate and become interactive promptly.
  const pageSize = 15;
  const where = query.trim()
    ? { ptCode: { contains: query.trim(), mode: "insensitive" as const } }
    : {};
  const [groups, mappings, total] = await Promise.all([
    prisma.schoolGroup.findMany({ include: { locations: true }, orderBy: { groupCode: "asc" } }),
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
  return { groups, mappings, organisationByPtCode, total, page, pageSize };
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
    prisma.schoolGroup.findMany({ include: { locations: { include: { mappings: true } } }, orderBy: { groupCode: "asc" } }),
    prisma.item.findMany({ where: { active: true, obsolete: false }, select: { itemCode: true, itemName: true }, orderBy: { itemName: "asc" } }),
    prisma.orderSheet1.findMany({
      where: { classification: "normal" },
      select: { orderSheet1Id: true, orderNo: true, billingToCode: true, shippingToSummary: true, groupParentLinks: { select: { orderGroupChildOrderId: true } } },
      orderBy: { orderNo: "desc" }, take: 200
    })
  ]);
  return { groups, items, orders };
}

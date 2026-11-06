import { prisma } from "@/lib/prisma";
import { savedOrderEndUsers } from "@/lib/end-user-type";
import { reorderSearchQuery, type ReorderSearchResult } from "@/lib/reorder-search";
import { sameEndUsers } from "@/lib/order-match";

export async function findMatchingFinalizedOrder(input: { sessionYear: string; billingCode: string; orderType: "descriptive" | "ambiguous"; endUsers: string[] }) {
  const where = { sessionYear: input.sessionYear, billingToCode: { equals: input.billingCode, mode: "insensitive" as const }, orderType: input.orderType, orderStatus: "finalized" as const, classification: "normal" as const };
  if (input.orderType === "ambiguous") {
    const order = await prisma.orderSheet1.findFirst({ where, select: { orderSheet1Id: true }, orderBy: [{ createdAt: "desc" }, { orderSheet1Id: "desc" }] });
    return order?.orderSheet1Id ?? null;
  }
  const orders = await prisma.orderSheet1.findMany({
    where,
    select: { orderSheet1Id: true, descriptiveRows: { select: { schoolCode: true, schoolName: true } }, combinedSchools: { select: { schoolCode: true, schoolName: true } }, groupParticipants: { select: { ptCode: true, schoolName: true } } },
    orderBy: [{ createdAt: "desc" }, { orderSheet1Id: "desc" }]
  });
  return orders.find(order => sameEndUsers(savedOrderEndUsers(order).map(row => row.schoolCode), input.endUsers))?.orderSheet1Id ?? null;
}

export async function searchReorderOrders(search: string): Promise<{ orders: ReorderSearchResult[]; hasMore: boolean }> {
  if (!search.trim()) return { orders: [], hasMore: false };

  const matches = await prisma.$queryRaw<{ orderSheet1Id: number }[]>(reorderSearchQuery(search));
  const orders = await prisma.orderSheet1.findMany({
    where: { orderSheet1Id: { in: matches.slice(0, 20).map(row => row.orderSheet1Id) }, classification: "normal" },
    select: {
      orderSheet1Id: true, orderNo: true, sessionYear: true,
      billingToName: true, billingToCode: true, orderStatus: true,
      descriptiveRows: { select: { schoolCode: true, schoolName: true } },
      combinedSchools: { select: { schoolCode: true, schoolName: true } },
      groupParticipants: { select: { ptCode: true, schoolName: true } }
    },
    orderBy: [{ orderNo: "desc" }, { orderSheet1Id: "desc" }]
  });
  return {
    orders: orders.map(({ descriptiveRows, combinedSchools, groupParticipants, ...order }) => ({
      ...order, schools: savedOrderEndUsers({ descriptiveRows, combinedSchools, groupParticipants })
    })),
    hasMore: matches.length > 20
  };
}

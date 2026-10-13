import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getGroupMembers, normalizeGroupCode } from "@/lib/group-membership";

type GroupItem = { itemCode: string; itemName: string; quantity: number };
type GroupDates = { sessionYear: string; orderPlacedDate: string; orderReceivedDate: string; expectedDeliveryDate: string; notes?: string };
const date = (value: string) => new Date(`${value}T00:00:00.000Z`);

async function nextNo(tx: Prisma.TransactionClient) {
  await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(741026)`;
  const result = await tx.orderSheet1.aggregate({ _max: { orderNo: true } });
  return (result._max.orderNo ?? 0) + 1;
}

export async function createDirectGroupOrder(locationId: number, ptCodes: string[], items: GroupItem[], input: GroupDates): Promise<never> {
  throw new Error("Create GS combined orders from the Create Order screen.");
}

export async function createParentGroupOrder(groupId: number, childOrderIds: number[], input: GroupDates) {
  if (new Set(childOrderIds).size !== childOrderIds.length) throw new Error("An order can only be selected once.");
  if (!childOrderIds.length) throw new Error("A parent group order needs at least one PT-code order.");
  return prisma.$transaction(tx => createParentGroupOrderTx(tx, groupId, childOrderIds, input), { timeout: 120000 });
}

export async function createParentGroupOrderTx(tx: Prisma.TransactionClient, groupId: number, childOrderIds: number[], input: GroupDates) {
    if (!childOrderIds.length || new Set(childOrderIds).size !== childOrderIds.length) throw new Error("Select distinct PT-code orders.");
    const group = await tx.schoolGroup.findUnique({ where: { schoolGroupId: groupId } });
    if (!group || !group.active || group.sourceType !== "GS") throw new Error("Active GS group not found.");
    await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(741025)`;
    const children = await tx.orderSheet1.findMany({ where: { orderSheet1Id: { in: childOrderIds }, classification: "normal" } });
    if (children.length !== childOrderIds.length) throw new Error("Only normal PT-code orders can be linked.");
    const alreadyLinked = await tx.orderGroupChildOrder.findMany({ where: { childOrderId: { in: childOrderIds } }, select: { childOrderId: true } });
    if (alreadyLinked.length > 0) throw new Error("One or more selected PT orders already belong to a group order.");
    const members = await getGroupMembers(tx, group.groupCode);
    const codes = new Set(members.flatMap(member => member.ptCode ? [normalizeGroupCode(member.ptCode)] : []));
    if (children.some(child => child.billingToType !== "school" || !/^PT\d+$/i.test(child.billingToCode) || !codes.has(normalizeGroupCode(child.billingToCode)) || child.schoolGroupId !== null)) throw new Error("Each child must be an independent PT-code order belonging to this GS group.");
    const orderNo = await nextNo(tx);
    const order = await tx.orderSheet1.create({ data: { orderNo, sessionYear: input.sessionYear, orderPlacedDate: date(input.orderPlacedDate), orderReceivedDate: date(input.orderReceivedDate), expectedDeliveryDate: date(input.expectedDeliveryDate), billingToType: "school", billingToCode: group.groupCode, billingToName: group.groupName, shippingToType: "school", shippingToCode: group.groupCode, shippingToName: "Multiple PT destinations", shippingToSummary: "Child PT-code orders retain their own shipping destinations.", orderType: "combined", classification: "group_parent", schoolGroupId: groupId, notes: input.notes || null } });
    await tx.orderGroupChildOrder.createMany({ data: childOrderIds.map((childOrderId) => ({ groupParentOrderId: order.orderSheet1Id, childOrderId })) });
    return order;
}

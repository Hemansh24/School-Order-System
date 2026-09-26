import { Prisma, SourceType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatSchoolAddress } from "@/lib/shipping";

type GroupItem = { itemCode: string; itemName: string; quantity: number };
type GroupDates = { sessionYear: string; orderPlacedDate: string; orderReceivedDate: string; expectedDeliveryDate: string; notes?: string };
const date = (value: string) => new Date(`${value}T00:00:00.000Z`);

async function nextNo(tx: Prisma.TransactionClient) { const result = await tx.orderSheet1.aggregate({ _max: { orderNo: true } }); return (result._max.orderNo ?? 0) + 1; }

export async function createDirectGroupOrder(locationId: number, ptCodes: string[], items: GroupItem[], input: GroupDates) {
  if (!ptCodes.length || !items.length) throw new Error("A direct group order needs participating PT schools and at least one item.");
  return prisma.$transaction(async (tx) => {
    const location = await tx.schoolGroupLocation.findUnique({ where: { schoolGroupLocationId: locationId }, include: { schoolGroup: true, mappings: true } });
    if (!location) throw new Error("Group location not found.");
    const mapped = new Set(location.mappings.map((x) => x.ptCode));
    if (ptCodes.some((code) => !mapped.has(code))) throw new Error("Each participating PT code must be confirmed for this group location.");
    const schools = await tx.organisation.findMany({ where: { ptCode: { in: ptCodes } }, select: { ptCode: true, organisationName: true } });
    if (schools.length !== ptCodes.length) throw new Error("A participating PT school could not be found.");
    const orderNo = await nextNo(tx);
    const summary = formatSchoolAddress({ address: location.address, district: location.district, state: location.state, pincode: location.pincode });
    const order = await tx.orderSheet1.create({ data: { orderNo, sessionYear: input.sessionYear, orderPlacedDate: date(input.orderPlacedDate), orderReceivedDate: date(input.orderReceivedDate), expectedDeliveryDate: date(input.expectedDeliveryDate), billingToType: "school", billingToCode: location.schoolGroup.groupCode, billingToName: location.name, shippingToType: "school", shippingToCode: `${location.schoolGroup.groupCode}-${location.subCode}`, shippingToName: location.name, shippingToSummary: summary, orderType: "combined", classification: "direct_group", schoolGroupId: location.schoolGroupId, schoolGroupLocationId: locationId, notes: input.notes || null } });
    await tx.orderGroupParticipant.createMany({ data: schools.map((school) => ({ orderSheet1Id: order.orderSheet1Id, ptCode: school.ptCode!, schoolName: school.organisationName })) });
    await tx.orderGroupItem.createMany({ data: items.map((item) => ({ orderSheet1Id: order.orderSheet1Id, ...item })) });
    return order;
  });
}

export async function createParentGroupOrder(groupId: number, childOrderIds: number[], input: GroupDates) {
  if (!childOrderIds.length) throw new Error("A parent group order needs at least one PT-code order.");
  return prisma.$transaction(async (tx) => {
    const group = await tx.schoolGroup.findUnique({ where: { schoolGroupId: groupId } });
    if (!group) throw new Error("Group not found.");
    const children = await tx.orderSheet1.findMany({ where: { orderSheet1Id: { in: childOrderIds }, classification: "normal" } });
    if (children.length !== childOrderIds.length) throw new Error("Only normal PT-code orders can be linked.");
    const alreadyLinked = await tx.orderGroupChildOrder.findMany({ where: { childOrderId: { in: childOrderIds } }, select: { childOrderId: true } });
    if (alreadyLinked.length > 0) throw new Error("One or more selected PT orders already belong to a group order.");
    const maps = await tx.schoolGroupSchool.findMany({ where: { ptCode: { in: children.map((x) => x.billingToCode) }, location: { schoolGroupId: groupId } } });
    if (maps.length !== children.length) throw new Error("Every child billing PT code must be mapped to the selected GS code.");
    const orderNo = await nextNo(tx);
    const order = await tx.orderSheet1.create({ data: { orderNo, sessionYear: input.sessionYear, orderPlacedDate: date(input.orderPlacedDate), orderReceivedDate: date(input.orderReceivedDate), expectedDeliveryDate: date(input.expectedDeliveryDate), billingToType: "school", billingToCode: group.groupCode, billingToName: group.groupName, shippingToType: "school", shippingToCode: group.groupCode, shippingToName: "Multiple PT destinations", shippingToSummary: "Child PT-code orders retain their own shipping destinations.", orderType: "combined", classification: "group_parent", schoolGroupId: groupId, notes: input.notes || null } });
    await tx.orderGroupChildOrder.createMany({ data: childOrderIds.map((childOrderId) => ({ groupParentOrderId: order.orderSheet1Id, childOrderId })) });
    return order;
  });
}

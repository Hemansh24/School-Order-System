import type { Prisma } from "@prisma/client";
import { entryModeForOrder, isPooledOrder } from "./order-model";
import type { CreateOrderInput } from "./validation/orders";

export type SavedOrderInput = Prisma.OrderSheet1GetPayload<{
  include: { schoolExecutives: true; descriptiveRows: true; ambiguousItems: true; combinedSchools: true; combinedItems: true }
}>;

function toInputDate(value: Date | null) {
  return value?.toISOString().slice(0, 10) ?? "";
}

export function savedOrderToInput(order: SavedOrderInput): CreateOrderInput {
  return {
    schoolExecutives: order.schoolExecutives.map(row => ({ schoolCode: row.schoolCode, incumbentCode: row.incumbentCode, name: row.name })),
    sheet1: {
      sessionYear: order.sessionYear ?? "",
      orderPlacedDate: toInputDate(order.orderPlacedDate),
      orderReceivedDate: toInputDate(order.orderReceivedDate),
      expectedDeliveryDate: toInputDate(order.expectedDeliveryDate),
      billingToType: order.billingToType === "school" && /^(GS|C)\d/i.test(order.billingToCode ?? "") ? "group" : order.billingToType,
      billingToCode: order.billingToCode ?? "",
      billingToName: order.billingToName,
      shippingToType: order.shippingToType === "school" && /^(GS|C)\d/i.test(order.shippingToCode ?? "") ? "group" : order.shippingToType,
      shippingToCode: order.shippingToCode ?? "",
      shippingToName: order.shippingToName,
      shippingToSummary: order.shippingToSummary,
      orderType: order.orderType === "ambiguous" ? "ambiguous" : "descriptive",
      descriptiveMode: entryModeForOrder(order),
      endUserGroupCode: order.endUserGroupCode ?? "",
      schoolGroupId: order.schoolGroupId ?? undefined,
      schoolGroupLocationId: order.schoolGroupLocationId ?? undefined,
      booksellerType: order.booksellerType ?? "",
      booksellerRating: order.booksellerRating ?? "",
      booksellerDiscount: order.booksellerDiscount,
      pendingPayment: order.pendingPayment,
      commissionEnabled: order.commissionPartyCode !== null,
      commissionPartyType: order.commissionPartyType ?? undefined,
      commissionPartyCode: order.commissionPartyCode ?? "",
      commissionPercentage: order.commissionPercentage?.toNumber(),
      contactNumbers: order.contactNumbers,
      notes: order.notes ?? ""
    },
    descriptiveRows:
      order.orderType === "descriptive"
        ? order.descriptiveRows.map((row) => ({
            schoolCode: row.schoolCode,
            schoolName: row.schoolName,
            itemCode: row.itemCode,
            itemName: row.itemName,
            quantity: row.quantity,
            notes: row.notes ?? ""
          }))
        : [],
    ambiguousSchools: [],
    ambiguousItems:
      order.orderType === "ambiguous"
        ? order.ambiguousItems.map((row) => ({
            itemCode: row.itemCode,
            itemName: row.itemName,
            groupedQuantity: row.groupedQuantity,
            notes: row.notes ?? ""
        }))
        : [],
    combinedSchools:
      isPooledOrder(order)
        ? order.combinedSchools.map((row) => ({
            schoolCode: row.schoolCode,
            schoolName: row.schoolName,
            notes: row.notes ?? ""
          }))
        : [],
    combinedItems:
      isPooledOrder(order)
        ? order.combinedItems.map((row) => ({
            itemCode: row.itemCode,
            itemName: row.itemName,
            pooledQuantity: row.pooledQuantity,
            notes: row.notes ?? ""
          }))
        : []
  };
}

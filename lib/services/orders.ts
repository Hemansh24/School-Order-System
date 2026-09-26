import {
  BillingToType,
  OrderStatus,
  OrderType,
  Prisma,
  SourceType
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ensurePtCodesForSchoolCodesTx } from "@/lib/services/organisations";
import { ensureBsCodesForVendorCodesTx } from "@/lib/services/pre-booksellers";
import { formatSchoolAddress, formatVendorAddress } from "@/lib/shipping";
import { createOrderSchema, type CreateOrderInput } from "@/lib/validation/orders";

const orderInclude = {
  descriptiveRows: true,
  ambiguousSchools: true,
  ambiguousItems: true,
  combinedSchools: true,
  combinedItems: true,
  groupParticipants: true,
  groupItems: true,
  groupChildLinks: { include: { childOrder: true } },
  schoolGroup: true,
  schoolGroupLocation: true,
  finalRows: true
} satisfies Prisma.OrderSheet1Include;

type Tx = Prisma.TransactionClient;
type SearchOrder = Prisma.OrderSheet1GetPayload<{
  include: {
    descriptiveRows: true;
    ambiguousItems: true;
    combinedItems: true;
    finalRows: true;
  };
}>;

function toDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

async function nextParentOrderNo(tx: Tx): Promise<number> {
  const current = await tx.orderSheet1.aggregate({ _max: { orderNo: true } });
  return (current._max.orderNo ?? 0) + 1;
}

async function assertShippingDestinationExists(tx: Tx, input: CreateOrderInput): Promise<void> {
  if (input.sheet1.shippingToType === "school") {
    const school = await tx.school.findUnique({
      where: { schoolCode: input.sheet1.shippingToCode }
    });

    if (!school && !(await findGroupLocationByCode(tx, input.sheet1.shippingToCode))) throw new Error("Shipping school or GS-code location must exist.");

    return;
  }

  const vendor = await tx.vendor.findFirst({
    where: { OR: [{ vendorCode: input.sheet1.shippingToCode }, { booksellerCode: input.sheet1.shippingToCode }] }
  });

  if (!vendor) {
    throw new Error("Shipping vendor must exist.");
  }
}

async function resolveShippingSummary(tx: Tx, input: CreateOrderInput) {
  if (input.sheet1.shippingToType === "school") {
    const school = await tx.school.findUnique({
      where: { schoolCode: input.sheet1.shippingToCode }
    });

    if (school) return formatSchoolAddress(school);
    const groupLocation = await findGroupLocationByCode(tx, input.sheet1.shippingToCode);
    if (groupLocation) return formatSchoolAddress(groupLocation);
    throw new Error("Shipping school or GS-code location must exist.");
  }

  const vendor = await tx.vendor.findFirst({
    where: { OR: [{ vendorCode: input.sheet1.shippingToCode }, { booksellerCode: input.sheet1.shippingToCode }] }
  });

  if (!vendor) {
    throw new Error("Shipping vendor must exist.");
  }

  return formatVendorAddress(vendor.address);
}

async function findGroupLocationByCode(tx: Tx, code: string) {
  const match = code.trim().match(/^(GS\d+)-(\d+)$/i);
  if (!match) return null;
  const [, groupCode, subCode] = match;
  return tx.schoolGroupLocation.findFirst({
    where: { subCode, schoolGroup: { groupCode: { equals: groupCode, mode: "insensitive" } } },
    select: { address: true, district: true, state: true, pincode: true }
  });
}

function schoolCodesTouchedByOrder(input: CreateOrderInput) {
  const schoolCodes = new Set<string>();

  if (input.sheet1.billingToType === "school") {
    schoolCodes.add(input.sheet1.billingToCode);
  }

  if (input.sheet1.shippingToType === "school") {
    schoolCodes.add(input.sheet1.shippingToCode);
  }

  for (const row of input.descriptiveRows) {
    schoolCodes.add(row.schoolCode);
  }

  for (const row of input.ambiguousSchools) {
    schoolCodes.add(row.schoolCode);
  }

  for (const row of input.combinedSchools) {
    schoolCodes.add(row.schoolCode);
  }

  return Array.from(schoolCodes);
}

function applyPtCodesToOrder(
  input: CreateOrderInput,
  ptCodeByOriginalCode: Map<string, string>
): CreateOrderInput {
  function mappedCode(code: string) {
    return ptCodeByOriginalCode.get(code) ?? code;
  }

  return {
    sheet1: {
      ...input.sheet1,
      billingToCode:
        input.sheet1.billingToType === "school"
          ? mappedCode(input.sheet1.billingToCode)
          : input.sheet1.billingToCode,
      shippingToCode:
        input.sheet1.shippingToType === "school"
          ? mappedCode(input.sheet1.shippingToCode)
          : input.sheet1.shippingToCode
    },
    descriptiveRows: input.descriptiveRows.map((row) => ({
      ...row,
      schoolCode: mappedCode(row.schoolCode)
    })),
    ambiguousSchools: input.ambiguousSchools.map((row) => ({
      ...row,
      schoolCode: mappedCode(row.schoolCode)
    })),
    ambiguousItems: input.ambiguousItems,
    combinedSchools: input.combinedSchools.map((row) => ({
      ...row,
      schoolCode: mappedCode(row.schoolCode)
    })),
    combinedItems: input.combinedItems
  };
}

function vendorCodesTouchedByOrder(input: CreateOrderInput) {
  return [
    input.sheet1.billingToType === "vendor" ? input.sheet1.billingToCode : null,
    input.sheet1.shippingToType === "vendor" ? input.sheet1.shippingToCode : null
  ].filter((code): code is string => Boolean(code));
}

function applyBsCodesToOrder(input: CreateOrderInput, bsCodeByOriginalCode: Map<string, string>): CreateOrderInput {
  const mappedCode = (code: string) => bsCodeByOriginalCode.get(code) ?? code;
  return {
    ...input,
    sheet1: {
      ...input.sheet1,
      billingToCode: input.sheet1.billingToType === "vendor" ? mappedCode(input.sheet1.billingToCode) : input.sheet1.billingToCode,
      shippingToCode: input.sheet1.shippingToType === "vendor" ? mappedCode(input.sheet1.shippingToCode) : input.sheet1.shippingToCode
    }
  };
}

export async function getDashboardData() {
  const [
    totalOrders,
    draftOrders,
    pendingConfirmation,
    lockedOrders,
    finalizedOrders,
    cancelledOrders,
    descriptiveOrders,
    ambiguousOrders,
    combinedOrders,
    pendingPayments,
    onHoldOrders,
    recentOrders
  ] = await Promise.all([
    prisma.orderSheet1.count(),
    prisma.orderSheet1.count({ where: { orderStatus: "draft" } }),
    prisma.orderSheet1.count({
      where: { orderStatus: "pending_confirmation" }
    }),
    prisma.orderSheet1.count({ where: { orderStatus: "locked" } }),
    prisma.orderSheet1.count({ where: { orderStatus: "finalized" } }),
    prisma.orderSheet1.count({ where: { orderStatus: "cancelled" } }),
    prisma.orderSheet1.count({ where: { orderType: "descriptive" } }),
    prisma.orderSheet1.count({ where: { orderType: "ambiguous" } }),
    prisma.orderSheet1.count({ where: { orderType: "combined" } }),
    prisma.orderSheet1.count({ where: { pendingPayment: true } }),
    prisma.orderSheet3.count({
      where: { cancelOrOnHoldStatus: "on_hold" }
    }),
    prisma.orderSheet1.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: 8
    })
  ]);

  return {
    stats: {
      totalOrders,
      draftOrders,
      pendingConfirmation,
      lockedOrders,
      finalizedOrders,
      cancelledOrders,
      descriptiveOrders,
      ambiguousOrders,
      combinedOrders,
      pendingPayments,
      onHoldOrders
    },
    recentOrders
  };
}

export async function listOrders() {
  return prisma.orderSheet1.findMany({
    orderBy: { orderNo: "desc" },
    take: 100
  });
}

export async function getOrder(orderSheet1Id: number) {
  return prisma.orderSheet1.findUnique({
    where: { orderSheet1Id },
    include: orderInclude
  });
}

export async function createOrder(input: CreateOrderInput) {
  const parsed = createOrderSchema.parse(input);

  const created = await prisma.$transaction(async (tx) => {
    await assertShippingDestinationExists(tx, parsed);
    const ptCodeByOriginalCode = await ensurePtCodesForSchoolCodesTx(
      tx,
      schoolCodesTouchedByOrder(parsed)
    );
    const schoolCodeInput = applyPtCodesToOrder(parsed, ptCodeByOriginalCode);
    const bsCodeByOriginalCode = await ensureBsCodesForVendorCodesTx(tx, vendorCodesTouchedByOrder(schoolCodeInput));
    const orderInput = applyBsCodesToOrder(schoolCodeInput, bsCodeByOriginalCode);
    const orderNo = await nextParentOrderNo(tx);
    const shippingToSummary = await resolveShippingSummary(tx, orderInput);

    const order = await tx.orderSheet1.create({
      data: {
        orderNo,
        sessionYear: orderInput.sheet1.sessionYear,
        orderPlacedDate: toDate(orderInput.sheet1.orderPlacedDate),
        orderReceivedDate: toDate(orderInput.sheet1.orderReceivedDate),
        expectedDeliveryDate: toDate(orderInput.sheet1.expectedDeliveryDate),
        billingToType: orderInput.sheet1.billingToType as BillingToType,
        billingToCode: orderInput.sheet1.billingToCode,
        billingToName: orderInput.sheet1.billingToName,
        shippingToType: orderInput.sheet1.shippingToType as BillingToType,
        shippingToCode: orderInput.sheet1.shippingToCode,
        shippingToName: orderInput.sheet1.shippingToName,
        shippingToSummary,
        orderType: orderInput.sheet1.orderType as OrderType,
        orderStatus: "draft",
        booksellerType: orderInput.sheet1.booksellerType || null,
        booksellerRating: orderInput.sheet1.booksellerRating || null,
        pendingPayment: orderInput.sheet1.pendingPayment,
        notes: orderInput.sheet1.notes || null
      }
    });

    if (orderInput.sheet1.orderType === "descriptive") {
      await tx.orderSheet2A.createMany({
        data: orderInput.descriptiveRows.map((row) => ({
          orderSheet1Id: order.orderSheet1Id,
          orderNo,
          schoolCode: row.schoolCode,
          schoolName: row.schoolName,
          itemCode: row.itemCode,
          itemName: row.itemName,
          quantity: row.quantity,
          notes: row.notes || null
        }))
      });
    } else if (orderInput.sheet1.orderType === "ambiguous") {
      await tx.orderSheet2B1.createMany({
        data: orderInput.ambiguousSchools.map((row) => ({
          orderSheet1Id: order.orderSheet1Id,
          orderNo,
          schoolCode: row.schoolCode,
          schoolName: row.schoolName,
          notes: row.notes || null
        }))
      });
      await tx.orderSheet2B2.createMany({
        data: orderInput.ambiguousItems.map((row) => ({
          orderSheet1Id: order.orderSheet1Id,
          orderNo,
          itemCode: row.itemCode,
          itemName: row.itemName,
          groupedQuantity: row.groupedQuantity,
          notes: row.notes || null
        }))
      });
    } else {
      await tx.orderSheet2C1.createMany({
        data: orderInput.combinedSchools.map((row) => ({
          orderSheet1Id: order.orderSheet1Id,
          orderNo,
          schoolCode: row.schoolCode,
          schoolName: row.schoolName,
          notes: row.notes || null
        }))
      });
      await tx.orderSheet2C2.createMany({
        data: orderInput.combinedItems.map((row) => ({
          orderSheet1Id: order.orderSheet1Id,
          orderNo,
          itemCode: row.itemCode,
          itemName: row.itemName,
          pooledQuantity: row.pooledQuantity,
          notes: row.notes || null
        }))
      });
    }

    return tx.orderSheet1.findUniqueOrThrow({
      where: { orderSheet1Id: order.orderSheet1Id },
      include: orderInclude
    });
  });

  revalidatePath("/");
  revalidatePath("/orders");
  revalidatePath("/organisations");
  return created;
}

export async function updateOrder(orderSheet1Id: number, input: CreateOrderInput) {
  const parsed = createOrderSchema.parse(input);

  const updated = await prisma.$transaction(async (tx) => {
    await assertShippingDestinationExists(tx, parsed);
    const ptCodeByOriginalCode = await ensurePtCodesForSchoolCodesTx(
      tx,
      schoolCodesTouchedByOrder(parsed)
    );
    const schoolCodeInput = applyPtCodesToOrder(parsed, ptCodeByOriginalCode);
    const bsCodeByOriginalCode = await ensureBsCodesForVendorCodesTx(tx, vendorCodesTouchedByOrder(schoolCodeInput));
    const orderInput = applyBsCodesToOrder(schoolCodeInput, bsCodeByOriginalCode);

    const existing = await tx.orderSheet1.findUnique({
      where: { orderSheet1Id },
      include: orderInclude
    });

    if (!existing) {
      throw new Error("Order not found.");
    }
    if (
      existing.orderStatus === "finalized" || existing.orderStatus === "cancelled"
    ) {
    throw new Error("Finalized and cancelled orders cannot be edited.");
    }

    await Promise.all([
      tx.orderSheet3.deleteMany({ where: { orderSheet1Id } }),
      tx.orderSheet2A.deleteMany({ where: { orderSheet1Id } }),
      tx.orderSheet2B1.deleteMany({ where: { orderSheet1Id } }),
      tx.orderSheet2B2.deleteMany({ where: { orderSheet1Id } }),
      tx.orderSheet2C1.deleteMany({ where: { orderSheet1Id } }),
      tx.orderSheet2C2.deleteMany({ where: { orderSheet1Id } })
    ]);

    const shippingToSummary = await resolveShippingSummary(tx, orderInput);

    const order = await tx.orderSheet1.update({
      where: { orderSheet1Id },
      data: {
        sessionYear: orderInput.sheet1.sessionYear,
        orderPlacedDate: toDate(orderInput.sheet1.orderPlacedDate),
        orderReceivedDate: toDate(orderInput.sheet1.orderReceivedDate),
        expectedDeliveryDate: toDate(orderInput.sheet1.expectedDeliveryDate),
        billingToType: orderInput.sheet1.billingToType as BillingToType,
        billingToCode: orderInput.sheet1.billingToCode,
        billingToName: orderInput.sheet1.billingToName,
        shippingToType: orderInput.sheet1.shippingToType as BillingToType,
        shippingToCode: orderInput.sheet1.shippingToCode,
        shippingToName: orderInput.sheet1.shippingToName,
        shippingToSummary,
        orderType: orderInput.sheet1.orderType as OrderType,
        booksellerType: orderInput.sheet1.booksellerType || null,
        booksellerRating: orderInput.sheet1.booksellerRating || null,
        pendingPayment: orderInput.sheet1.pendingPayment,
        notes: orderInput.sheet1.notes || null
      }
    });

    if (orderInput.sheet1.orderType === "descriptive") {
      await tx.orderSheet2A.createMany({
        data: orderInput.descriptiveRows.map((row) => ({
          orderSheet1Id,
          orderNo: existing.orderNo,
          schoolCode: row.schoolCode,
          schoolName: row.schoolName,
          itemCode: row.itemCode,
          itemName: row.itemName,
          quantity: row.quantity,
          notes: row.notes || null
        }))
      });
    } else if (orderInput.sheet1.orderType === "ambiguous") {
      await tx.orderSheet2B1.createMany({
        data: orderInput.ambiguousSchools.map((row) => ({
          orderSheet1Id,
          orderNo: existing.orderNo,
          schoolCode: row.schoolCode,
          schoolName: row.schoolName,
          notes: row.notes || null
        }))
      });
      await tx.orderSheet2B2.createMany({
        data: orderInput.ambiguousItems.map((row) => ({
          orderSheet1Id,
          orderNo: existing.orderNo,
          itemCode: row.itemCode,
          itemName: row.itemName,
          groupedQuantity: row.groupedQuantity,
          notes: row.notes || null
        }))
      });
    } else {
      await tx.orderSheet2C1.createMany({
        data: orderInput.combinedSchools.map((row) => ({
          orderSheet1Id,
          orderNo: existing.orderNo,
          schoolCode: row.schoolCode,
          schoolName: row.schoolName,
          notes: row.notes || null
        }))
      });
      await tx.orderSheet2C2.createMany({
        data: orderInput.combinedItems.map((row) => ({
          orderSheet1Id,
          orderNo: existing.orderNo,
          itemCode: row.itemCode,
          itemName: row.itemName,
          pooledQuantity: row.pooledQuantity,
          notes: row.notes || null
        }))
      });
    }

    return tx.orderSheet1.findUniqueOrThrow({
      where: { orderSheet1Id: order.orderSheet1Id },
      include: orderInclude
    });
  });

  revalidatePath(`/orders/${orderSheet1Id}`);
  revalidatePath(`/orders/${orderSheet1Id}/edit`);
  revalidatePath("/");
  revalidatePath("/orders");
  revalidatePath("/organisations");
  return updated;
}

export async function lockOrder(orderSheet1Id: number) {
  const order = await prisma.orderSheet1.findUnique({
    where: { orderSheet1Id },
    include: orderInclude
  });

  if (!order) {
    throw new Error("Order not found.");
  }
  if (order.classification === "group_parent") {
    const updated = await prisma.orderSheet1.update({ where: { orderSheet1Id }, data: { orderStatus: "locked" } });
    revalidatePath(`/orders/${orderSheet1Id}`); revalidatePath("/orders"); return updated;
  }
  if (order.orderStatus === "finalized" || order.orderStatus === "cancelled") {
    throw new Error("Finalized or cancelled orders cannot be locked again.");
  }
  if (order.orderType === "descriptive" && order.descriptiveRows.length === 0) {
    throw new Error("Descriptive orders need Order Sheet 2A rows before locking.");
  }
  if (
    order.orderType === "ambiguous" &&
    (order.ambiguousSchools.length === 0 || order.ambiguousItems.length === 0)
  ) {
    throw new Error("Ambiguous orders need Order Sheet 2B1 and 2B2 rows before locking.");
  }
  if (
    order.classification !== "direct_group" &&
    order.orderType === "combined" &&
    (order.combinedSchools.length === 0 || order.combinedItems.length === 0)
  ) {
    throw new Error("Combined orders need participating schools and pooled items before locking.");
  }
  if (order.classification === "direct_group" && (order.groupParticipants.length === 0 || order.groupItems.length === 0)) {
    throw new Error("Direct group orders need participating schools and pooled items before locking.");
  }

  const updated = await prisma.orderSheet1.update({
    where: { orderSheet1Id },
    data: { orderStatus: "locked" }
  });

  revalidatePath(`/orders/${orderSheet1Id}`);
  revalidatePath("/orders");
  return updated;
}

export async function finalizeOrder(orderSheet1Id: number) {
  const finalized = await prisma.$transaction(async (tx) => {
    const order = await tx.orderSheet1.findUnique({
      where: { orderSheet1Id },
      include: orderInclude
    });

    if (!order) {
      throw new Error("Order not found.");
    }
    if (order.orderStatus !== "locked") {
      throw new Error("Only locked orders can be finalized.");
    }
    if (order.classification === "group_parent") {
      throw new Error("Parent group orders are tracking containers and cannot be finalized.");
    }

    if (order.classification === "direct_group") {
      if (order.groupParticipants.length === 0 || order.groupItems.length === 0) {
        throw new Error("Direct group orders require participants and pooled items.");
      }
      for (const row of order.groupItems) {
        await tx.orderSheet3.upsert({
          where: { sourceType_sourceId: { sourceType: SourceType.GROUP, sourceId: row.orderGroupItemId } },
          create: { orderSheet1Id, orderNo: order.orderNo, sourceType: SourceType.GROUP, sourceId: row.orderGroupItemId, itemCode: row.itemCode, itemName: row.itemName, quantity: row.quantity, paymentReceived: !order.pendingPayment },
          update: {}
        });
      }
      return tx.orderSheet1.update({ where: { orderSheet1Id }, data: { orderStatus: "finalized" }, include: orderInclude });
    }

    if (order.orderType === "descriptive") {
      if (order.ambiguousSchools.length > 0 || order.ambiguousItems.length > 0 || order.combinedSchools.length > 0 || order.combinedItems.length > 0) {
        throw new Error("Descriptive orders cannot finalize with ambiguous or combined rows.");
      }
      if (order.descriptiveRows.length === 0) {
        throw new Error("Descriptive orders require Order Sheet 2A rows.");
      }

      for (const row of order.descriptiveRows) {
        await tx.orderSheet3.upsert({
          where: {
            sourceType_sourceId: {
              sourceType: SourceType.TWO_A,
              sourceId: row.orderSheet2AId
            }
          },
          create: {
            orderSheet1Id,
            orderNo: order.orderNo,
            sourceType: SourceType.TWO_A,
            sourceId: row.orderSheet2AId,
            itemCode: row.itemCode,
            itemName: row.itemName,
            quantity: row.quantity,
            paymentReceived: !order.pendingPayment
          },
          update: {}
        });
      }
    }

    if (order.orderType === "ambiguous") {
      if (order.descriptiveRows.length > 0 || order.combinedSchools.length > 0 || order.combinedItems.length > 0) {
        throw new Error("Ambiguous orders cannot finalize with descriptive or combined rows.");
      }
      if (order.ambiguousSchools.length === 0 || order.ambiguousItems.length === 0) {
        throw new Error("Ambiguous orders require Order Sheet 2B1 and 2B2 rows.");
      }

      for (const row of order.ambiguousItems) {
        await tx.orderSheet3.upsert({
          where: {
            sourceType_sourceId: {
              sourceType: SourceType.TWO_B2,
              sourceId: row.orderSheet2B2Id
            }
          },
          create: {
            orderSheet1Id,
            orderNo: order.orderNo,
            sourceType: SourceType.TWO_B2,
            sourceId: row.orderSheet2B2Id,
            itemCode: row.itemCode,
            itemName: row.itemName,
            quantity: row.groupedQuantity,
            paymentReceived: !order.pendingPayment
          },
          update: {}
        });
      }
    }

    if (order.orderType === "combined") {
      if (order.descriptiveRows.length > 0 || order.ambiguousSchools.length > 0 || order.ambiguousItems.length > 0) {
        throw new Error("Combined orders cannot finalize with descriptive or ambiguous rows.");
      }
      if (order.combinedSchools.length === 0 || order.combinedItems.length === 0) {
        throw new Error("Combined orders require participating schools and pooled items.");
      }

      for (const row of order.combinedItems) {
        await tx.orderSheet3.upsert({
          where: {
            sourceType_sourceId: {
              sourceType: SourceType.TWO_C2,
              sourceId: row.orderSheet2C2Id
            }
          },
          create: {
            orderSheet1Id,
            orderNo: order.orderNo,
            sourceType: SourceType.TWO_C2,
            sourceId: row.orderSheet2C2Id,
            itemCode: row.itemCode,
            itemName: row.itemName,
            quantity: row.pooledQuantity,
            paymentReceived: !order.pendingPayment
          },
          update: {}
        });
      }
    }

    return tx.orderSheet1.update({
      where: { orderSheet1Id },
      data: { orderStatus: "finalized" },
      include: orderInclude
    });
  });

  revalidatePath(`/orders/${orderSheet1Id}`);
  revalidatePath("/");
  revalidatePath("/orders");
  return finalized;
}

export async function updateOrderStatus(
  orderSheet1Id: number,
  orderStatus: Exclude<OrderStatus, "finalized">
) {
  const order = await prisma.orderSheet1.findUnique({ where: { orderSheet1Id } });
  if (!order) {
    throw new Error("Order not found.");
  }
  if (order.orderStatus === "finalized") {
    throw new Error("Finalized orders cannot be changed.");
  }

  const updated = await prisma.orderSheet1.update({
    where: { orderSheet1Id },
    data: { orderStatus }
  });

  revalidatePath(`/orders/${orderSheet1Id}`);
  revalidatePath("/orders");
  return updated;
}

export async function markPaymentReceived(orderSheet1Id: number) {
  const order = await prisma.orderSheet1.findUnique({ where: { orderSheet1Id } });
  if (!order) {
    throw new Error("Order not found.");
  }

  await prisma.$transaction([
    prisma.orderSheet1.update({
      where: { orderSheet1Id },
      data: { pendingPayment: false }
    }),
    prisma.orderSheet3.updateMany({
      where: { orderSheet1Id },
      data: { paymentReceived: true }
    })
  ]);

  revalidatePath(`/orders/${orderSheet1Id}`);
  revalidatePath("/");
}

export async function putOrderOnHold(orderSheet1Id: number) {
  const order = await prisma.orderSheet1.findUnique({
    where: { orderSheet1Id },
    include: { finalRows: true }
  });

  if (!order) {
    throw new Error("Order not found.");
  }
  if (order.finalRows.length === 0) {
    throw new Error("Only finalized orders can be put on hold.");
  }
  if (order.finalRows.some((row) => row.cancelOrOnHoldStatus === "cancelled")) {
    throw new Error("Cancelled fulfillment rows cannot be put on hold.");
  }

  await prisma.orderSheet3.updateMany({
    where: { orderSheet1Id, cancelOrOnHoldStatus: "active" },
    data: { cancelOrOnHoldStatus: "on_hold" }
  });

  revalidatePath(`/orders/${orderSheet1Id}`);
  revalidatePath(`/orders/${orderSheet1Id}/finalization`);
  revalidatePath("/");
  revalidatePath("/orders");
  revalidatePath("/reports");
}

export async function cancelHeldOrder(orderSheet1Id: number) {
  const order = await prisma.orderSheet1.findUnique({
    where: { orderSheet1Id },
    include: { finalRows: true }
  });

  if (!order) {
    throw new Error("Order not found.");
  }
  if (!order.finalRows.some((row) => row.cancelOrOnHoldStatus === "on_hold")) {
    throw new Error("Only on-hold orders can be cancelled from this action.");
  }

  await prisma.$transaction([
    prisma.orderSheet3.updateMany({
      where: { orderSheet1Id, cancelOrOnHoldStatus: "on_hold" },
      data: { cancelOrOnHoldStatus: "cancelled" }
    }),
    prisma.orderSheet1.update({
      where: { orderSheet1Id },
      data: { orderStatus: "cancelled" }
    })
  ]);

  revalidatePath(`/orders/${orderSheet1Id}`);
  revalidatePath(`/orders/${orderSheet1Id}/finalization`);
  revalidatePath("/");
  revalidatePath("/orders");
  revalidatePath("/reports");
}

export async function searchOrders(params: URLSearchParams): Promise<SearchOrder[]> {
  const orderNo = params.get("order_no");
  const billingToType = params.get("billing_to_type");
  const billing = params.get("billing");
  const shipping = params.get("shipping");
  const orderType = params.get("order_type");
  const classification = params.get("classification");
  const orderStatus = params.get("order_status");
  const sessionYear = params.get("session_year");
  const paymentStatus = params.get("payment_status");
  const item = params.get("item");
  const expectedFrom = params.get("expected_from");
  const expectedTo = params.get("expected_to");
  const dispatchFrom = params.get("dispatch_from");
  const dispatchTo = params.get("dispatch_to");
  const holdStatus = params.get("hold_status");

  const and: Prisma.OrderSheet1WhereInput[] = [];
  if (item) {
    and.push({
      OR: [
        {
          descriptiveRows: {
            some: {
              OR: [
                { itemCode: { contains: item, mode: "insensitive" } },
                { itemName: { contains: item, mode: "insensitive" } }
              ]
            }
          }
        },
        {
          ambiguousItems: {
            some: {
              OR: [
                { itemCode: { contains: item, mode: "insensitive" } },
                { itemName: { contains: item, mode: "insensitive" } }
              ]
            }
          }
        },
        {
          combinedItems: {
            some: {
              OR: [
                { itemCode: { contains: item, mode: "insensitive" } },
                { itemName: { contains: item, mode: "insensitive" } }
              ]
            }
          }
        }
      ]
    });
  }

  if (holdStatus || dispatchFrom || dispatchTo) {
    and.push({
      finalRows: {
        some: {
          cancelOrOnHoldStatus: holdStatus
            ? (holdStatus as "active" | "cancelled" | "on_hold")
            : undefined,
          dispatchDate:
            dispatchFrom || dispatchTo
              ? {
                  gte: dispatchFrom ? toDate(dispatchFrom) : undefined,
                  lte: dispatchTo ? toDate(dispatchTo) : undefined
                }
              : undefined
        }
      }
    });
  }

  if (shipping) {
    and.push({
      OR: [
        { shippingToCode: { contains: shipping, mode: "insensitive" } },
        { shippingToName: { contains: shipping, mode: "insensitive" } },
        { shippingToSummary: { contains: shipping, mode: "insensitive" } }
      ]
    });
  }

  const where: Prisma.OrderSheet1WhereInput = {
    orderNo: orderNo ? Number(orderNo) : undefined,
    billingToType: billingToType ? (billingToType as BillingToType) : undefined,
    orderType: orderType ? (orderType as OrderType) : undefined,
    classification: classification ? (classification as "normal" | "direct_group" | "group_parent") : undefined,
    orderStatus: orderStatus ? (orderStatus as OrderStatus) : undefined,
    sessionYear: sessionYear || undefined,
    expectedDeliveryDate:
      expectedFrom || expectedTo
        ? {
            gte: expectedFrom ? toDate(expectedFrom) : undefined,
            lte: expectedTo ? toDate(expectedTo) : undefined
          }
        : undefined,
    pendingPayment:
      paymentStatus === "pending"
        ? true
        : paymentStatus === "received"
          ? false
          : undefined,
    OR: billing
      ? [
          { billingToCode: { contains: billing, mode: "insensitive" } },
          { billingToName: { contains: billing, mode: "insensitive" } }
        ]
      : undefined,
    AND: and.length > 0 ? and : undefined
  };

  return prisma.orderSheet1.findMany({
    where,
    include: {
      descriptiveRows: true,
      ambiguousItems: true,
      combinedItems: true,
      finalRows: true
    },
    orderBy: { orderNo: "desc" },
    take: 100
  });
}

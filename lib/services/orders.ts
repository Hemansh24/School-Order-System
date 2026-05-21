import {
  BillingToType,
  OrderStatus,
  OrderType,
  Prisma,
  SourceType
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createOrderSchema, type CreateOrderInput } from "@/lib/validation/orders";
import { parseDisplayOrderNo } from "@/lib/order-number";

const orderInclude = {
  descriptiveRows: true,
  ambiguousSchools: true,
  ambiguousItems: true,
  finalRows: true
} satisfies Prisma.OrderSheet1Include;

type Tx = Prisma.TransactionClient;
type SearchOrder = Prisma.OrderSheet1GetPayload<{
  include: {
    descriptiveRows: true;
    ambiguousItems: true;
    finalRows: true;
  };
}>;

async function currentOrderWhere(): Promise<Prisma.OrderSheet1WhereInput> {
  const [latestOrders, latestActiveOrders] = await Promise.all([
    prisma.orderSheet1.groupBy({
      by: ["orderNo"],
      _max: { subOrderNo: true }
    }),
    prisma.orderSheet1.groupBy({
      by: ["orderNo"],
      where: { orderStatus: { not: "cancelled" } },
      _max: { subOrderNo: true }
    })
  ]);

  if (latestOrders.length === 0) {
    return { orderSheet1Id: -1 };
  }

  const activeByOrderNo = new Map(
    latestActiveOrders.map((order) => [order.orderNo, order._max.subOrderNo ?? 0])
  );

  return {
    OR: latestOrders.map((order) => ({
      orderNo: order.orderNo,
      subOrderNo: activeByOrderNo.get(order.orderNo) ?? order._max.subOrderNo ?? 0
    }))
  };
}

function toDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

async function nextParentOrderNo(tx: Tx): Promise<number> {
  const current = await tx.orderSheet1.aggregate({ _max: { orderNo: true } });
  return (current._max.orderNo ?? 0) + 1;
}

async function nextSubOrderNo(tx: Tx, orderNo: number): Promise<number> {
  const current = await tx.orderSheet1.aggregate({
    where: { orderNo },
    _max: { subOrderNo: true }
  });
  return (current._max.subOrderNo ?? -1) + 1;
}

async function assertVendorHasSchool(tx: Tx, input: CreateOrderInput): Promise<void> {
  if (input.sheet1.billingToType !== "vendor") {
    return;
  }

  const vendor = await tx.vendor.findUnique({
    where: { vendorCode: input.sheet1.billingToCode },
    include: { vendorSchools: true }
  });

  if (!vendor || vendor.vendorSchools.length === 0) {
    throw new Error("Billing vendor must exist and be linked to at least one school.");
  }
}

export async function getDashboardData() {
  const currentWhere = await currentOrderWhere();
  const [
    totalOrders,
    draftOrders,
    pendingConfirmation,
    lockedOrders,
    finalizedOrders,
    cancelledOrders,
    descriptiveOrders,
    ambiguousOrders,
    pendingPayments,
    onHoldOrders,
    recentOrders
  ] = await Promise.all([
    prisma.orderSheet1.count({ where: currentWhere }),
    prisma.orderSheet1.count({ where: { AND: [currentWhere, { orderStatus: "draft" }] } }),
    prisma.orderSheet1.count({
      where: { AND: [currentWhere, { orderStatus: "pending_confirmation" }] }
    }),
    prisma.orderSheet1.count({ where: { AND: [currentWhere, { orderStatus: "locked" }] } }),
    prisma.orderSheet1.count({ where: { AND: [currentWhere, { orderStatus: "finalized" }] } }),
    prisma.orderSheet1.count({ where: { AND: [currentWhere, { orderStatus: "cancelled" }] } }),
    prisma.orderSheet1.count({ where: { AND: [currentWhere, { orderType: "descriptive" }] } }),
    prisma.orderSheet1.count({ where: { AND: [currentWhere, { orderType: "ambiguous" }] } }),
    prisma.orderSheet1.count({ where: { AND: [currentWhere, { pendingPayment: true }] } }),
    prisma.orderSheet3.count({
      where: { cancelOrOnHoldStatus: "on_hold", order: currentWhere }
    }),
    prisma.orderSheet1.findMany({
      where: currentWhere,
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
      pendingPayments,
      onHoldOrders
    },
    recentOrders
  };
}

export async function listOrders() {
  const currentWhere = await currentOrderWhere();
  return prisma.orderSheet1.findMany({
    where: currentWhere,
    orderBy: [{ orderNo: "desc" }, { subOrderNo: "desc" }],
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
    await assertVendorHasSchool(tx, parsed);
    const orderNo = await nextParentOrderNo(tx);
    const subOrderNo = 0;

    const order = await tx.orderSheet1.create({
      data: {
        orderNo,
        subOrderNo,
        sessionYear: parsed.sheet1.sessionYear,
        orderReceivedDate: toDate(parsed.sheet1.orderReceivedDate),
        expectedDeliveryDate: toDate(parsed.sheet1.expectedDeliveryDate),
        billingToType: parsed.sheet1.billingToType as BillingToType,
        billingToCode: parsed.sheet1.billingToCode,
        billingToName: parsed.sheet1.billingToName,
        shippingToSummary: parsed.sheet1.shippingToSummary,
        orderType: parsed.sheet1.orderType as OrderType,
        orderStatus: "draft",
        booksellerType: parsed.sheet1.booksellerType || null,
        booksellerRating: parsed.sheet1.booksellerRating || null,
        pendingPayment: parsed.sheet1.pendingPayment,
        notes: parsed.sheet1.notes || null
      }
    });

    if (parsed.sheet1.orderType === "descriptive") {
      await tx.orderSheet2A.createMany({
        data: parsed.descriptiveRows.map((row) => ({
          orderSheet1Id: order.orderSheet1Id,
          orderNo,
          subOrderNo,
          schoolCode: row.schoolCode,
          schoolName: row.schoolName,
          itemCode: row.itemCode,
          itemName: row.itemName,
          quantity: row.quantity,
          notes: row.notes || null
        }))
      });
    } else {
      await tx.orderSheet2B1.createMany({
        data: parsed.ambiguousSchools.map((row) => ({
          orderSheet1Id: order.orderSheet1Id,
          orderNo,
          subOrderNo,
          schoolCode: row.schoolCode,
          schoolName: row.schoolName,
          notes: row.notes || null
        }))
      });
      await tx.orderSheet2B2.createMany({
        data: parsed.ambiguousItems.map((row) => ({
          orderSheet1Id: order.orderSheet1Id,
          orderNo,
          subOrderNo,
          itemCode: row.itemCode,
          itemName: row.itemName,
          groupedQuantity: row.groupedQuantity,
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
  return created;
}

export async function updateOrder(orderSheet1Id: number, input: CreateOrderInput) {
  const parsed = createOrderSchema.parse(input);

  const updated = await prisma.$transaction(async (tx) => {
    await assertVendorHasSchool(tx, parsed);

    const existing = await tx.orderSheet1.findUnique({
      where: { orderSheet1Id },
      include: orderInclude
    });

    if (!existing) {
      throw new Error("Order not found.");
    }
    if (
      existing.orderStatus !== "draft" &&
      existing.orderStatus !== "revision_requested" &&
      existing.orderStatus !== "pending_confirmation"
    ) {
      throw new Error("Only draft or revision-requested orders can be edited.");
    }

    await Promise.all([
      tx.orderSheet3.deleteMany({ where: { orderSheet1Id } }),
      tx.orderSheet2A.deleteMany({ where: { orderSheet1Id } }),
      tx.orderSheet2B1.deleteMany({ where: { orderSheet1Id } }),
      tx.orderSheet2B2.deleteMany({ where: { orderSheet1Id } })
    ]);

    const order = await tx.orderSheet1.update({
      where: { orderSheet1Id },
      data: {
        sessionYear: parsed.sheet1.sessionYear,
        orderReceivedDate: toDate(parsed.sheet1.orderReceivedDate),
        expectedDeliveryDate: toDate(parsed.sheet1.expectedDeliveryDate),
        billingToType: parsed.sheet1.billingToType as BillingToType,
        billingToCode: parsed.sheet1.billingToCode,
        billingToName: parsed.sheet1.billingToName,
        shippingToSummary: parsed.sheet1.shippingToSummary,
        orderType: parsed.sheet1.orderType as OrderType,
        booksellerType: parsed.sheet1.booksellerType || null,
        booksellerRating: parsed.sheet1.booksellerRating || null,
        pendingPayment: parsed.sheet1.pendingPayment,
        notes: parsed.sheet1.notes || null
      }
    });

    if (parsed.sheet1.orderType === "descriptive") {
      await tx.orderSheet2A.createMany({
        data: parsed.descriptiveRows.map((row) => ({
          orderSheet1Id,
          orderNo: existing.orderNo,
          subOrderNo: existing.subOrderNo,
          schoolCode: row.schoolCode,
          schoolName: row.schoolName,
          itemCode: row.itemCode,
          itemName: row.itemName,
          quantity: row.quantity,
          notes: row.notes || null
        }))
      });
    } else {
      await tx.orderSheet2B1.createMany({
        data: parsed.ambiguousSchools.map((row) => ({
          orderSheet1Id,
          orderNo: existing.orderNo,
          subOrderNo: existing.subOrderNo,
          schoolCode: row.schoolCode,
          schoolName: row.schoolName,
          notes: row.notes || null
        }))
      });
      await tx.orderSheet2B2.createMany({
        data: parsed.ambiguousItems.map((row) => ({
          orderSheet1Id,
          orderNo: existing.orderNo,
          subOrderNo: existing.subOrderNo,
          itemCode: row.itemCode,
          itemName: row.itemName,
          groupedQuantity: row.groupedQuantity,
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

    if (order.orderType === "descriptive") {
      if (order.ambiguousSchools.length > 0 || order.ambiguousItems.length > 0) {
        throw new Error("Descriptive orders cannot finalize with ambiguous rows.");
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
            subOrderNo: order.subOrderNo,
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
      if (order.descriptiveRows.length > 0) {
        throw new Error("Ambiguous orders cannot finalize with Order Sheet 2A rows.");
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
            subOrderNo: order.subOrderNo,
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
    throw new Error("Finalized orders require a revision/sub-order for changes.");
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

export async function createRevision(orderSheet1Id: number) {
  const revision = await prisma.$transaction(async (tx) => {
    const parent = await tx.orderSheet1.findUnique({
      where: { orderSheet1Id },
      include: orderInclude
    });

    if (!parent) {
      throw new Error("Order not found.");
    }

    const subOrderNo = await nextSubOrderNo(tx, parent.orderNo);
    const newOrder = await tx.orderSheet1.create({
      data: {
        orderNo: parent.orderNo,
        subOrderNo,
        sessionYear: parent.sessionYear,
        orderReceivedDate: parent.orderReceivedDate,
        expectedDeliveryDate: parent.expectedDeliveryDate,
        billingToType: parent.billingToType,
        billingToCode: parent.billingToCode,
        billingToName: parent.billingToName,
        shippingToSummary: parent.shippingToSummary,
        orderType: parent.orderType,
        orderStatus: "revision_requested",
        booksellerType: parent.booksellerType,
        booksellerRating: parent.booksellerRating,
        pendingPayment: parent.pendingPayment,
        notes: parent.notes
      }
    });

    if (parent.orderType === "descriptive") {
      await tx.orderSheet2A.createMany({
        data: parent.descriptiveRows.map((row) => ({
          orderSheet1Id: newOrder.orderSheet1Id,
          orderNo: parent.orderNo,
          subOrderNo,
          orderModificationNo: row.orderModificationNo,
          schoolCode: row.schoolCode,
          schoolName: row.schoolName,
          itemCode: row.itemCode,
          itemName: row.itemName,
          quantity: row.quantity,
          notes: row.notes
        }))
      });
    } else {
      await tx.orderSheet2B1.createMany({
        data: parent.ambiguousSchools.map((row) => ({
          orderSheet1Id: newOrder.orderSheet1Id,
          orderNo: parent.orderNo,
          subOrderNo,
          schoolCode: row.schoolCode,
          schoolName: row.schoolName,
          notes: row.notes
        }))
      });
      await tx.orderSheet2B2.createMany({
        data: parent.ambiguousItems.map((row) => ({
          orderSheet1Id: newOrder.orderSheet1Id,
          orderNo: parent.orderNo,
          subOrderNo,
          orderModificationNo: row.orderModificationNo,
          itemCode: row.itemCode,
          itemName: row.itemName,
          groupedQuantity: row.groupedQuantity,
          notes: row.notes
        }))
      });
    }

    return newOrder;
  });

  revalidatePath("/orders");
  return revision;
}

export async function searchOrders(params: URLSearchParams): Promise<SearchOrder[]> {
  const display = params.get("display_order_no");
  const parsedDisplay = display ? parseDisplayOrderNo(display) : {};
  const orderNo = params.get("order_no");
  const subOrderNo = params.get("sub_order_no");
  const billingToType = params.get("billing_to_type");
  const billing = params.get("billing");
  const shipping = params.get("shipping");
  const orderType = params.get("order_type");
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
  const hasExactSubOrder = Boolean(subOrderNo) || Boolean(display && parsedDisplay.subOrderNo !== undefined);

  if (!hasExactSubOrder) {
    and.push(await currentOrderWhere());
  }

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

  const where: Prisma.OrderSheet1WhereInput = {
    orderNo: orderNo ? Number(orderNo) : parsedDisplay.orderNo,
    subOrderNo: subOrderNo ? Number(subOrderNo) : parsedDisplay.subOrderNo,
    billingToType: billingToType ? (billingToType as BillingToType) : undefined,
    orderType: orderType ? (orderType as OrderType) : undefined,
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
    shippingToSummary: shipping ? { contains: shipping, mode: "insensitive" } : undefined,
    AND: and.length > 0 ? and : undefined
  };

  return prisma.orderSheet1.findMany({
    where,
    include: {
      descriptiveRows: true,
      ambiguousItems: true,
      finalRows: true
    },
    orderBy: [{ orderNo: "desc" }, { subOrderNo: "desc" }],
    take: 100
  });
}

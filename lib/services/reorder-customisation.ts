import type { Prisma } from "@prisma/client";
import type { CreateOrderInput } from "@/lib/validation/orders";

export type ReorderCustomisation = {
  customisationCode: string;
  customisationName: string | null;
  categoryCodes: string[];
};

type Database = Pick<Prisma.TransactionClient, "orderSheet1" | "item">;
type Source = { orderSheet1Id: number; orderType: string };

/** Resolve from saved history, including inactive items, never from browser metadata. */
export async function getReorderCustomisation(db: Database, source: Source): Promise<ReorderCustomisation | null> {
  if (source.orderType === "ambiguous") return null;
  const seen = new Set<number>();
  let id = source.orderSheet1Id;
  let itemCodes: string[];
  while (true) {
    if (seen.has(id)) throw new Error("This reorder chain contains a cycle. Correct the source orders before reordering.");
    seen.add(id);
    const order = await db.orderSheet1.findUnique({
      where: { orderSheet1Id: id },
      select: {
        reorderOfOrderId: true, orderType: true, classification: true,
        descriptiveRows: { select: { itemCode: true } },
        combinedItems: { select: { itemCode: true } }
      }
    });
    if (!order) throw new Error("The original order in this reorder chain is missing. Correct the source before reordering.");
    if (order.classification !== "normal" || order.orderType === "ambiguous") {
      throw new Error("This reorder chain has an incompatible source. Create a separate order or correct the source.");
    }
    if (order.reorderOfOrderId !== null) {
      id = order.reorderOfOrderId;
      continue;
    }
    itemCodes = [...new Set([...order.descriptiveRows, ...order.combinedItems].map(row => row.itemCode))];
    break;
  }
  if (!itemCodes.length) throw new Error("The original order has no items to establish its customisation. Correct the source before reordering.");
  const items = await db.item.findMany({
    where: { itemCode: { in: itemCodes } },
    select: { itemCode: true, categoryCode: true, customisationCode: true, customisationName: true }
  });
  const found = new Set(items.map(item => item.itemCode));
  if (itemCodes.some(code => !found.has(code)) || items.some(item => !item.categoryCode || !item.customisationCode)) {
    throw new Error("Some original items are missing category or customisation records. Restore their item records before reordering.");
  }
  if (new Set(items.map(item => item.customisationCode)).size !== 1) {
    throw new Error("The original order contains multiple customisations. Create separate orders or correct the source before reordering.");
  }
  return {
    customisationCode: items[0].customisationCode,
    customisationName: items[0].customisationName,
    categoryCodes: [...new Set(items.map(item => item.categoryCode))].sort()
  };
}

export async function assertReorderCustomisation(db: Database, source: Source, values: CreateOrderInput) {
  const restriction = await getReorderCustomisation(db, source);
  if (!restriction) return;
  const codes = [...new Set([...values.descriptiveRows, ...values.combinedItems].map(row => row.itemCode))];
  const items = await db.item.findMany({
    where: { itemCode: { in: codes } },
    select: { itemCode: true, categoryCode: true, customisationCode: true }
  });
  const byCode = new Map(items.map(item => [item.itemCode, item]));
  for (const code of codes) {
    const item = byCode.get(code);
    if (!item) throw new Error(`Item ${code} has no item record. Choose an available item before reordering.`);
    if (item.customisationCode !== restriction.customisationCode || !restriction.categoryCodes.includes(item.categoryCode)) {
      throw new Error("Reorders must use the original order's customisation and categories. Create a separate order for different choices.");
    }
  }
}

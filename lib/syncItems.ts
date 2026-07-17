import { getItemByCode, listItems, type GetItemByCodeData, type ListItemsData } from "@dataconnect/generated";
import { getApp, getApps, initializeApp } from "firebase/app";
import { DEFAULT_LANGUAGE_CODE, generateItemCode } from "@/lib/item-code";
import { prisma } from "@/lib/prisma";

export type ItemSyncSummary = {
  importedItems: number;
  replacedItems: number;
};

const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ??
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
  "system-order-34c0a";

type ImportedItem = ListItemsData["items"][number];
type ImportedItemDetail = GetItemByCodeData["items"][number];

function ensureFirebaseApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp({
    projectId: FIREBASE_PROJECT_ID
  });
}

function normalizeText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeCode(value: string | null | undefined, fallback: string) {
  const trimmed = value?.trim().toUpperCase();
  return trimmed || fallback;
}

function normalizeMrp(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(2) : null;
}

function normalizeBoolean(value: boolean | null | undefined, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function deriveItemName(item: { title: string }) {
  return item.title.trim();
}

function toPrismaItemData(item: ImportedItemDetail) {
  const categoryCode = normalizeCode(item.categoryCode, "LEGACY");
  const subCategoryCode = normalizeCode(item.subCategoryCode, "00");
  const languageCode = normalizeCode(item.languageCode, DEFAULT_LANGUAGE_CODE);
  const customisationCode = normalizeCode(item.customisationCode, "00");
  const editionCode = normalizeCode(item.editionCode, "01");

  return {
    itemCode: generateItemCode({
      categoryCode,
      subCategoryCode,
      languageCode,
      customisationCode,
      editionCode
    }),
    itemName: deriveItemName(item),
    categoryCode,
    categoryType: normalizeText(item.categoryType),
    subCategoryCode,
    languageCode,
    customisationCode,
    customisationName: normalizeText(item.customisationType),
    editionCode,
    isbnNumber: normalizeText(item.isbnNo),
    mrp: normalizeMrp(item.mrp),
    obsolete: normalizeBoolean(item.obsolete, false),
    active: true
  };
}

export async function replaceItemsWithImportedItems(): Promise<ItemSyncSummary> {
  ensureFirebaseApp();

  const { data } = await listItems();
  const importedItems = [...data.items].sort(
    (left, right) => left.itemCode.localeCompare(right.itemCode) || left.title.localeCompare(right.title)
  );

  if (importedItems.length === 0) {
    throw new Error("No imported item rows were returned from Data Connect.");
  }

  const detailedItems = (
    await Promise.all(
      importedItems.map(async (item: ImportedItem) => {
        const { data: detailData } = await getItemByCode({
          itemCode: item.itemCode
        });

        return detailData.items[0] ?? null;
      })
    )
  ).filter((item): item is ImportedItemDetail => Boolean(item));

  const nextItemsByCode = new Map(
    detailedItems.map((item) => {
      const normalized = toPrismaItemData(item);
      return [normalized.itemCode, normalized] as const;
    })
  );

  const nextItems = [...nextItemsByCode.values()].sort((left, right) =>
    left.itemCode.localeCompare(right.itemCode)
  );

  if (nextItems.length === 0) {
    throw new Error("Imported items could not be normalized into application item rows.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.item.deleteMany();
    await tx.item.createMany({
      data: nextItems
    });
  });

  return {
    importedItems: detailedItems.length,
    replacedItems: nextItems.length
  };
}

"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { DEFAULT_LANGUAGE_CODE, generateItemCode } from "@/lib/item-code";
import { validateItemCodeUnique } from "@/lib/services/reference";
import { createItemSchema } from "@/lib/validation/reference";

export type ReferenceActionState = {
  ok: boolean;
  message?: string;
};

function duplicateMessage(error: unknown, fallback: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return fallback;
  }

  return error instanceof Error ? error.message : "Could not save.";
}

function normalizeItemData(parsed: ReturnType<typeof createItemSchema.parse>) {
  const normalized = {
    ...parsed,
    categoryCode: parsed.categoryCode.toUpperCase(),
    subCategoryCode: parsed.subCategoryCode.toUpperCase(),
    languageCode: parsed.languageCode.toUpperCase(),
    customisationCode: parsed.customisationCode.toUpperCase(),
    editionCode: parsed.editionCode.toUpperCase()
  };

  return { ...normalized, itemCode: generateItemCode(normalized) };
}

export async function createItemAction(
  _previousState: ReferenceActionState,
  formData: FormData
): Promise<ReferenceActionState> {
  try {
    const parsed = createItemSchema.parse({
      itemCode: formData.get("itemCode"),
      itemName: formData.get("itemName"),
      categoryCode: formData.get("categoryCode"),
      categoryType: formData.get("categoryType"),
      subCategoryCode: formData.get("subCategoryCode"),
      languageCode: formData.get("languageCode") || DEFAULT_LANGUAGE_CODE,
      customisationCode: formData.get("customisationCode"),
      customisationName: formData.get("customisationName"),
      editionCode: formData.get("editionCode"),
      isbnNumber: formData.get("isbnNumber"),
      mrp: formData.get("mrp"),
      obsolete: formData.get("obsolete") === "on",
      active: formData.get("active") === "on"
    });

    const data = normalizeItemData(parsed);
    if (!(await validateItemCodeUnique(data.itemCode))) {
      throw new Error("An item with this code already exists.");
    }

    await prisma.item.create({ data });
    revalidatePath("/items");
    revalidatePath("/orders/new");
    return { ok: true, message: "Item added." };
  } catch (error) {
    return {
      ok: false,
      message: duplicateMessage(error, "An item with this code already exists.")
    };
  }
}

export async function updateItemAction(
  itemId: number,
  _previousState: ReferenceActionState,
  formData: FormData
): Promise<ReferenceActionState> {
  try {
    const parsed = createItemSchema.parse({
      itemCode: formData.get("itemCode"),
      itemName: formData.get("itemName"),
      categoryCode: formData.get("categoryCode"),
      categoryType: formData.get("categoryType"),
      subCategoryCode: formData.get("subCategoryCode"),
      languageCode: formData.get("languageCode") || DEFAULT_LANGUAGE_CODE,
      customisationCode: formData.get("customisationCode"),
      customisationName: formData.get("customisationName"),
      editionCode: formData.get("editionCode"),
      isbnNumber: formData.get("isbnNumber"),
      mrp: formData.get("mrp"),
      obsolete: formData.get("obsolete") === "on",
      active: formData.get("active") === "on"
    });

    const data = normalizeItemData(parsed);
    if (!(await validateItemCodeUnique(data.itemCode, itemId))) {
      throw new Error("An item with this code already exists.");
    }

    await prisma.item.update({
      where: { itemId },
      data
    });

    revalidatePath("/items");
    revalidatePath(`/items/${itemId}/edit`);
    revalidatePath("/orders/new");
    return { ok: true, message: "Item saved." };
  } catch (error) {
    return {
      ok: false,
      message: duplicateMessage(error, "An item with this code already exists.")
    };
  }
}

export async function deleteItemAction(itemId: number): Promise<void> {
  await prisma.item.delete({
    where: { itemId }
  });

  revalidatePath("/items");
  revalidatePath(`/items/${itemId}/edit`);
  revalidatePath("/orders/new");
}

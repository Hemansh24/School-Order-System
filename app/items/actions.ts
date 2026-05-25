"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
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

export async function createItemAction(
  _previousState: ReferenceActionState,
  formData: FormData
): Promise<ReferenceActionState> {
  try {
    const parsed = createItemSchema.parse({
      itemCode: formData.get("itemCode"),
      itemName: formData.get("itemName"),
      itemType: formData.get("itemType"),
      subject: formData.get("subject"),
      classLevel: formData.get("classLevel"),
      publisher: formData.get("publisher"),
      price: formData.get("price"),
      active: formData.get("active") === "on"
    });

    await prisma.item.create({ data: parsed });
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
      itemType: formData.get("itemType"),
      subject: formData.get("subject"),
      classLevel: formData.get("classLevel"),
      publisher: formData.get("publisher"),
      price: formData.get("price"),
      active: formData.get("active") === "on"
    });

    await prisma.item.update({
      where: { itemId },
      data: parsed
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

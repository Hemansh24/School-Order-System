"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createSchoolSchema } from "@/lib/validation/reference";

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

export async function createSchoolAction(
  _previousState: ReferenceActionState,
  formData: FormData
): Promise<ReferenceActionState> {
  try {
    const parsed = createSchoolSchema.parse({
      schoolCode: formData.get("schoolCode"),
      schoolName: formData.get("schoolName"),
      address: formData.get("address"),
      contactPerson: formData.get("contactPerson"),
      phone: formData.get("phone"),
      email: formData.get("email")
    });

    await prisma.school.create({ data: parsed });
    revalidatePath("/schools");
    revalidatePath("/orders/new");
    return { ok: true, message: "School added." };
  } catch (error) {
    return {
      ok: false,
      message: duplicateMessage(error, "A school with this code already exists.")
    };
  }
}


"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createVendorSchema } from "@/lib/validation/reference";

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

export async function createVendorAction(
  _previousState: ReferenceActionState,
  formData: FormData
): Promise<ReferenceActionState> {
  try {
    const parsed = createVendorSchema.parse({
      vendorCode: formData.get("vendorCode"),
      vendorName: formData.get("vendorName"),
      vendorType: formData.get("vendorType"),
      vendorRating: formData.get("vendorRating"),
      address: formData.get("address"),
      contactPerson: formData.get("contactPerson"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      schoolIds: formData.getAll("schoolIds")
    });

    const { schoolIds, ...vendorData } = parsed;

    await prisma.vendor.create({
      data: {
        ...vendorData,
        vendorSchools: {
          create: schoolIds.map((schoolId) => ({
            school: { connect: { schoolId } }
          }))
        }
      }
    });

    revalidatePath("/vendors");
    revalidatePath("/orders/new");
    return { ok: true, message: "Vendor added." };
  } catch (error) {
    return {
      ok: false,
      message: duplicateMessage(error, "A vendor with this code already exists.")
    };
  }
}


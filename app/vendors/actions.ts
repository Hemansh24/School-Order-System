"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { nextVendorCode } from "@/lib/reference-codes";
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
    const vendorCode = await nextVendorCode();
    const parsed = createVendorSchema.parse({
      vendorCode,
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

export async function updateVendorAction(
  vendorId: number,
  _previousState: ReferenceActionState,
  formData: FormData
): Promise<ReferenceActionState> {
  try {
    const existing = await prisma.vendor.findUnique({
      where: { vendorId },
      select: { vendorCode: true }
    });
    if (!existing) {
      throw new Error("Vendor not found.");
    }

    const parsed = createVendorSchema.parse({
      vendorCode: existing.vendorCode,
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

    await prisma.$transaction([
      prisma.vendor.update({
        where: { vendorId },
        data: vendorData
      }),
      prisma.vendorSchool.deleteMany({ where: { vendorId } }),
      prisma.vendorSchool.createMany({
        data: schoolIds.map((schoolId) => ({ vendorId, schoolId }))
      })
    ]);

    revalidatePath("/vendors");
    revalidatePath(`/vendors/${vendorId}/edit`);
    revalidatePath("/orders/new");
    return { ok: true, message: "Vendor saved." };
  } catch (error) {
    return {
      ok: false,
      message: duplicateMessage(error, "A vendor with this code already exists.")
    };
  }
}

export async function deleteVendorAction(vendorId: number): Promise<void> {
  await prisma.vendor.delete({
    where: { vendorId }
  });

  revalidatePath("/vendors");
  revalidatePath(`/vendors/${vendorId}/edit`);
  revalidatePath("/orders/new");
}

"use server";

import { revalidatePath } from "next/cache";
import { formatActionError } from "@/lib/action-errors";
import { prisma } from "@/lib/prisma";
import { nextVendorCode } from "@/lib/reference-codes";
import { replaceVendorsWithImportedBooksellers } from "@/lib/syncBooksellers";
import { createVendorSchema } from "@/lib/validation/reference";

export type ReferenceActionState = {
  ok: boolean;
  message?: string;
};

function duplicateMessage(error: unknown, fallback: string) {
  return formatActionError(error, {
    fallback: "Could not save this vendor. Please review the form and try again.",
    duplicate: fallback
  });
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

export async function deleteVendorAction(
  vendorId: number,
  _previousState: ReferenceActionState,
  _formData: FormData
): Promise<ReferenceActionState> {
  try {
    await prisma.vendor.delete({
      where: { vendorId }
    });

    revalidatePath("/vendors");
    revalidatePath(`/vendors/${vendorId}/edit`);
    revalidatePath("/orders/new");
    return { ok: true, message: "Vendor deleted." };
  } catch (error) {
    return {
      ok: false,
      message: formatActionError(error, {
        fallback: "Could not delete this vendor. Please try again."
      })
    };
  }
}

export async function syncImportedBooksellersAction(
  _previousState: ReferenceActionState,
  _formData: FormData
): Promise<ReferenceActionState> {
  try {
    const summary = await replaceVendorsWithImportedBooksellers();

    revalidatePath("/vendors");
    revalidatePath("/orders/new");
    revalidatePath("/orders");
    return {
      ok: true,
      message: `Replaced vendors with ${summary.importedBooksellers} imported booksellers and linked ${summary.linkedSchoolMappings} of ${summary.importedSchoolMappings} imported school mappings (${summary.unmatchedSchoolMappings} unmatched).`
    };
  } catch (error) {
    return {
      ok: false,
      message: formatActionError(error, {
        fallback: "Could not replace vendors from the imported booksellers table."
      })
    };
  }
}

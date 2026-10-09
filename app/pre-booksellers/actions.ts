"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formatActionError } from "@/lib/action-errors";
import { prisma } from "@/lib/prisma";
import { convertPreBooksellerToVendor, syncPreBooksellers } from "@/lib/services/pre-booksellers";

export type PreBooksellerActionState = { ok: boolean; message?: string };

export async function importPreBooksellersAction(_state: PreBooksellerActionState, _formData: FormData): Promise<PreBooksellerActionState> {
  try {
    const summary = await syncPreBooksellers();
    revalidatePath("/pre-booksellers");
    revalidatePath("/pre-booksellers/conversion");
    return { ok: true, message: `Imported ${summary.imported} PBS records into the database.` };
  } catch (error) {
    return { ok: false, message: formatActionError(error, { fallback: "Could not import the PBS sheet." }) };
  }
}

export async function convertPreBooksellerAction(preBooksellerId: number, _state: PreBooksellerActionState, _formData: FormData): Promise<PreBooksellerActionState> {
  try {
    const record = await convertPreBooksellerToVendor(preBooksellerId);
    revalidatePath("/pre-booksellers");
    revalidatePath("/pre-booksellers/conversion");
    revalidatePath("/vendors");
    revalidatePath("/orders/new");
    return { ok: true, message: `${record.pbsCode} converted to ${record.assignedBsCode}.` };
  } catch (error) {
    return { ok: false, message: formatActionError(error, { fallback: "Could not convert this PBS entry." }) };
  }
}

const optional = (formData: FormData, key: string) => {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
};

export async function updatePreBooksellerAction(preBooksellerId: number, formData: FormData) {
  const pbsCode = optional(formData, "pbsCode");
  const vendorName = optional(formData, "vendorName");
  if (!pbsCode || !vendorName) throw new Error("PBS code and organisation name are required.");
  await prisma.preBookseller.update({
    where: { preBooksellerId },
    data: {
      pbsCode, vendorName, sourceBsCode: optional(formData, "sourceBsCode"), address: optional(formData, "address"),
      district: optional(formData, "district"), state: optional(formData, "state"), pinCode: optional(formData, "pinCode"),
      contactPerson: optional(formData, "contactPerson"), email: optional(formData, "email"), taxId: optional(formData, "taxId"),
      schoolDealCount: optional(formData, "schoolDealCount"), approximateStrength: optional(formData, "approximateStrength"),
      groupSchoolCount: optional(formData, "groupSchoolCount"), committedDiscount: optional(formData, "committedDiscount"),
      transportCollaboration: optional(formData, "transportCollaboration"), bookingStation: optional(formData, "bookingStation"),
      vendorType: optional(formData, "vendorType"), paymentStatus: optional(formData, "paymentStatus")
    }
  });
  revalidatePath("/pre-booksellers");
  revalidatePath("/pre-booksellers/conversion");
  revalidatePath("/vendors");
  redirect("/pre-booksellers");
}

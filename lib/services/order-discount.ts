import type { Prisma } from "@prisma/client";
import type { CreateOrderInput } from "../validation/orders";
import { defaultBooksellerDiscount } from "../bookseller-discount";

type SavedDiscount = { billingToType: string; billingToCode: string | null; booksellerDiscount: string | null };

/** Called inside the order transaction. Unrelated edits never replay an older default. */
export async function resolveOrderDiscount(tx: Prisma.TransactionClient, sheet1: CreateOrderInput["sheet1"], current?: SavedDiscount): Promise<string | null> {
  if (sheet1.billingToType !== "vendor") return null;
  const submitted = sheet1.booksellerDiscount;
  const sameVendor = current?.billingToType === "vendor" && current.billingToCode === sheet1.billingToCode;
  if (sameVendor && (submitted === undefined || submitted === current.booksellerDiscount)) return current.booksellerDiscount;
  if (submitted === null) return null;
  const vendor = await tx.vendor.findUnique({ where: { vendorCode: sheet1.billingToCode } });
  if (!vendor) throw new Error("Billing bookseller must exist.");
  // Match the reference picker precedence, including older PBS/BS code mappings.
  const matches = vendor.actualDiscount !== null ? [] : await tx.preBookseller.findMany({ where: { OR: [
    { convertedVendorId: vendor.vendorId },
    ...(vendor.preVendorCode ? [{ pbsCode: vendor.preVendorCode }] : []),
    { assignedBsCode: vendor.vendorCode }, { sourceBsCode: vendor.vendorCode }
  ] } });
  const committed = matches.find(row => row.convertedVendorId === vendor.vendorId)
    ?? matches.find(row => vendor.preVendorCode && row.pbsCode === vendor.preVendorCode)
    ?? matches.find(row => row.assignedBsCode === vendor.vendorCode)
    ?? matches.find(row => row.sourceBsCode === vendor.vendorCode);
  const currentDefault = defaultBooksellerDiscount(vendor.actualDiscount, committed?.committedDiscount);
  if (submitted === undefined) return currentDefault;
  // Merely accepting a committed suggestion must not turn it into an actual override.
  if (submitted !== currentDefault) await tx.vendor.update({ where: { vendorId: vendor.vendorId }, data: { actualDiscount: submitted } });
  return submitted;
}

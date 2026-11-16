import type { Prisma } from "@prisma/client";
import type { CreateOrderInput } from "../validation/orders";
import { defaultBooksellerDiscount } from "../bookseller-discount";
import { schoolCodeWhere, organisationCodes } from "../school-reference";
import { selectSchoolDiscount, normalizeDiscountCode } from "../order-discount-selection";

type SavedDiscount = { billingToType: string; billingToCode: string | null; booksellerDiscount: string | null };

/** Called inside the order transaction. Unrelated edits never replay an older default. */
export async function resolveOrderDiscount(tx: Prisma.TransactionClient, sheet1: CreateOrderInput["sheet1"], current?: SavedDiscount, endUserCodes: string[] = []): Promise<string | null> {
  const submitted = sheet1.booksellerDiscount;
  if (sheet1.discountMode !== "auto" && submitted !== undefined) return submitted;
  if (sheet1.discountMode !== "auto" && current?.billingToType === sheet1.billingToType && current.billingToCode === sheet1.billingToCode) return current.booksellerDiscount;
  return (await suggestOrderDiscount(tx, sheet1, endUserCodes)).discount;
}

export async function suggestOrderDiscount(tx: Prisma.TransactionClient, billing: Pick<CreateOrderInput["sheet1"], "billingToType" | "billingToCode">, endUserCodes: string[]) {
  const { billingToType, billingToCode } = billing;
  if (endUserCodes.length && billingToCode) {
    const codes = [...new Set([...endUserCodes, ...(billingToType === "school" ? [billingToCode] : [])].map(normalizeDiscountCode))];
    const organisations = await tx.organisation.findMany({ where: schoolCodeWhere(codes) });
    const aliases = (code: string) => {
      const normalized = normalizeDiscountCode(code);
      const matches = organisations.filter(org => organisationCodes(org).some(alias => normalizeDiscountCode(alias) === normalized));
      if (matches.length > 1) throw new Error(`Ambiguous school code ${code}.`);
      return matches.length ? organisationCodes(matches[0]) : [normalized];
    };
    const rows = await tx.schoolWiseDiscount.findMany({ where: {
      sourceSpreadsheetId: "1IVrJWu0wPmvTp-BjCGuWivnm8R3N2VRYEUzouTAgoGs", sourceSheetId: 1161721439
    } });
    const discount = selectSchoolDiscount(rows, endUserCodes.map(aliases), billingToType === "school" ? aliases(billingToCode) : [billingToCode]);
    if (discount !== null) return { discount, source: "school" as const };
  }
  if (billingToType !== "vendor" || !billingToCode) return { discount: null, source: "none" as const };
  const vendor = await tx.vendor.findUnique({ where: { vendorCode: billingToCode } });
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
  return { discount: currentDefault, source: "bookseller" as const };
}

import { findSchoolByCode } from "@/lib/school-reference";
import type { Prisma } from "@prisma/client";
import type { CreateOrderInput } from "../validation/orders";

type SavedCommission = {
  commissionPartyType: string | null;
  commissionPartyCode: string | null;
  commissionBooksellerExecutiveId?: number | null;
  commissionPartyName?: string | null;
  commissionPbsCode?: string | null;
};

/** Accept manual parties and validate explicitly selected existing references. */
export async function resolveCommissionData(
  tx: Prisma.TransactionClient,
  sheet1: CreateOrderInput["sheet1"],
  current?: SavedCommission
) {
  const emptyBookseller = { commissionBooksellerExecutiveId: null, commissionPartyName: null, commissionPbsCode: null };
  if (!sheet1.commissionEnabled) {
    return { ...emptyBookseller, commissionPartyType: null, commissionPartyCode: null, commissionPercentage: null };
  }
  const type = sheet1.commissionPartyType ?? "individual";
  const code = sheet1.commissionPartyCode?.trim();
  const percentage = sheet1.commissionPercentage;
  if (!code || percentage === undefined || !Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
    throw new Error("Enter a commissioned party name or code and a percentage from 0 to 100.");
  }
  if (type === "bookseller_executive") {
    const id = sheet1.commissionBooksellerExecutiveId;
    if (!id || !Number.isInteger(id) || id < 1) throw new Error("Select a bookseller executive from the existing records.");
    const unchanged = current?.commissionPartyType === type && current.commissionPartyCode === code
      && current.commissionBooksellerExecutiveId === id && current.commissionPartyName != null && current.commissionPbsCode != null;
    if (unchanged) return { commissionPartyType: type, commissionPartyCode: code, commissionPercentage: percentage,
      commissionBooksellerExecutiveId: id, commissionPartyName: current.commissionPartyName!, commissionPbsCode: current.commissionPbsCode! };
    const executive = await tx.booksellerExecutive.findUnique({ where: { booksellerExecutiveId: id } });
    if (!executive || executive.incumbentCode !== code) throw new Error("Commissioned bookseller executive must exist. Select a party from the existing records.");
    return { commissionPartyType: type, commissionPartyCode: executive.incumbentCode, commissionPercentage: percentage,
      commissionBooksellerExecutiveId: id, commissionPartyName: executive.name, commissionPbsCode: executive.pbsCode };
  }
  if (type !== "individual" && (current?.commissionPartyType !== type || current?.commissionPartyCode !== code)) {
    let exists: unknown;
    if (type === "school") {
      exists = await findSchoolByCode(tx, code);
    } else if (type === "vendor") {
      exists = await tx.vendor.findFirst({ where: { vendorCode: code }, select: { vendorId: true } });
    } else if (type === "executive") {
      exists = await tx.executive.findUnique({ where: { incumbentCode: code }, select: { incumbentCode: true } });
    } else {
      exists = await tx.schoolGroup.findUnique({ where: { groupCode: code }, select: { schoolGroupId: true } });
      const location = code.match(/^(GS\d+)-(\d+)$/i);
      if (!exists && location) {
        exists = await tx.schoolGroupLocation.findFirst({
          where: { subCode: location[2], schoolGroup: { groupCode: location[1] } },
          select: { schoolGroupLocationId: true }
        });
      }
    }
    if (!exists) throw new Error("Commissioned party must exist. Select a party from the existing records.");
  }
  return { ...emptyBookseller, commissionPartyType: type, commissionPartyCode: code, commissionPercentage: percentage };
}

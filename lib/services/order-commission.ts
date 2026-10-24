import type { Prisma } from "@prisma/client";
import type { CreateOrderInput } from "../validation/orders";

type SavedCommission = {
  commissionPartyType: string | null;
  commissionPartyCode: string | null;
};

/** Accept manual parties and validate explicitly selected existing references. */
export async function resolveCommissionData(
  tx: Prisma.TransactionClient,
  sheet1: CreateOrderInput["sheet1"],
  current?: SavedCommission
) {
  if (!sheet1.commissionEnabled) {
    return { commissionPartyType: null, commissionPartyCode: null, commissionPercentage: null };
  }
  const type = sheet1.commissionPartyType ?? "individual";
  const code = sheet1.commissionPartyCode?.trim();
  const percentage = sheet1.commissionPercentage;
  if (!code || percentage === undefined || !Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
    throw new Error("Enter a commissioned party name or code and a percentage from 0 to 100.");
  }
  if (type !== "individual" && (current?.commissionPartyType !== type || current?.commissionPartyCode !== code)) {
    let exists: unknown;
    if (type === "school") {
      exists = await tx.school.findUnique({ where: { schoolCode: code }, select: { schoolId: true } });
    } else if (type === "vendor") {
      exists = await tx.vendor.findFirst({ where: { vendorCode: code }, select: { vendorId: true } });
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
  return { commissionPartyType: type, commissionPartyCode: code, commissionPercentage: percentage };
}

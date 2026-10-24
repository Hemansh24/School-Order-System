import type { Prisma } from "@prisma/client";
import { moveSchoolGroupCodeTx } from "@/lib/pt-codes";

export const schoolReferenceSelect = {
  billingToType: true, billingToCode: true,
  shippingToType: true, shippingToCode: true,
  descriptiveRows: { select: { schoolCode: true } },
  ambiguousSchools: { select: { schoolCode: true } },
  combinedSchools: { select: { schoolCode: true } },
  groupParticipants: { select: { ptCode: true } }
} satisfies Prisma.OrderSheet1Select;

type SchoolReferences = Prisma.OrderSheet1GetPayload<{ select: typeof schoolReferenceSelect }>;

export function orderSchoolCodes(order: SchoolReferences): string[] {
  return [...new Set([
    ...(order.billingToType === "school" && order.billingToCode ? [order.billingToCode] : []),
    ...(order.shippingToType === "school" && order.shippingToCode ? [order.shippingToCode] : []),
    ...order.descriptiveRows.map(row => row.schoolCode),
    ...order.ambiguousSchools.map(row => row.schoolCode),
    ...order.combinedSchools.map(row => row.schoolCode),
    ...order.groupParticipants.map(row => row.ptCode)
  ])];
}

// Caller holds advisory lock 741024 and has marked the order cancelled in this
// transaction. Fulfillment rows refer to these school rows through sourceId;
// they do not store separate school codes.
export async function reverseUnusedPtCodesTx(tx: Prisma.TransactionClient, codes: string[]) {
  const organisations = await tx.organisation.findMany({
    where: { OR: [{ ptCode: { in: codes } }, { prCode: { in: codes } }] }
  });
  for (const organisation of organisations) {
    const { ptCode, prCode } = organisation;
    if (!ptCode) continue;
    // Imported usage is an existing order relationship even without local orders.
    if (await tx.ptCodeUsageHistory.findFirst({ where: { ptCode }, select: { ptCode: true } })) continue;
    const aliases = [ptCode, prCode];
    const otherOrder = await tx.orderSheet1.findFirst({
      where: {
        orderStatus: { not: "cancelled" },
        OR: [
          { billingToType: "school", billingToCode: { in: aliases } },
          { shippingToType: "school", shippingToCode: { in: aliases } },
          { descriptiveRows: { some: { schoolCode: { in: aliases } } } },
          { ambiguousSchools: { some: { schoolCode: { in: aliases } } } },
          { combinedSchools: { some: { schoolCode: { in: aliases } } } },
          { groupParticipants: { some: { ptCode: { in: aliases } } } }
        ]
      }, select: { orderSheet1Id: true }
    });
    if (otherOrder) continue;

    if (await tx.organisation.count({ where: { ptCode } }) !== 1) {
      throw new Error(`Cannot restore ${prCode}: ${ptCode} belongs to multiple organisations. Resolve the duplicate PT code and retry.`);
    }
    const schools = await tx.school.findMany({ where: { schoolCode: { in: aliases } } });
    if (schools.length > 1) {
      throw new Error(`Cannot restore ${prCode}: separate school records use ${prCode} and ${ptCode}. Resolve the duplicate schools and retry.`);
    }
    await moveSchoolGroupCodeTx(tx, ptCode, prCode);
    if (schools[0]?.schoolCode === ptCode) {
      await tx.school.update({ where: { schoolId: schools[0].schoolId }, data: { schoolCode: prCode } });
    }
    await tx.organisation.update({ where: { id: organisation.id }, data: { ptCode: null } });
  }
}

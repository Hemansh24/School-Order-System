import type { Prisma } from "@prisma/client";

// Cancelled orders retain their PT snapshots. Reserve those codes as well as
// current master codes so a later allocation cannot give them to another school.
export async function reservedPtCodes(tx: Prisma.TransactionClient): Promise<string[]> {
  const rows = await tx.$queryRaw<Array<{ code: string }>>`
    SELECT code FROM (
      SELECT pt_code AS code FROM organisations
      UNION SELECT school_code FROM schools
      UNION SELECT pt_code FROM school_group_schools
      UNION SELECT billing_to_code FROM order_sheet_1 WHERE billing_to_type = 'school'
      UNION SELECT shipping_to_code FROM order_sheet_1 WHERE shipping_to_type = 'school'
      UNION SELECT school_code FROM order_sheet_2a
      UNION SELECT school_code FROM order_sheet_2b1
      UNION SELECT school_code FROM order_sheet_2c1
      UNION SELECT pt_code FROM order_group_participants
    ) AS reserved WHERE code ~* '^PT-?[0-9]+$'
  `;
  return rows.map(row => row.code);
}

export async function moveSchoolGroupCodeTx(tx: Prisma.TransactionClient, from: string, to: string) {
  if (from === to) return;
  const mappings = await tx.schoolGroupSchool.findMany({ where: { ptCode: { in: [from, to] } } });
  if (!mappings.some(row => row.ptCode === from)) return;
  if (mappings.some(row => row.ptCode === to)) {
    throw new Error(`Cannot change ${from} to ${to}: both codes have group mappings. Resolve the duplicate mappings and retry.`);
  }
  await tx.schoolGroupSchool.updateMany({ where: { ptCode: from }, data: { ptCode: to } });
}

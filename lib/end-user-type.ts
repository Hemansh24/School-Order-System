export type EndUserType = "new" | "old" | "gap";
export type EndUserClassification = { ptCode: string | null; type: EndUserType | null };
export type EndUser = { schoolCode: string; schoolName: string };

export function sessionStartYear(sessionYear: string): number | null {
  const match = /^(\d{4})-(\d{4})$/.exec(sessionYear.trim());
  return match && Number(match[2]) === Number(match[1]) + 1 ? Number(match[1]) : null;
}

export function classifyEndUser(sessionYear: string, usageSessions: Iterable<string>): EndUserType | null {
  const current = sessionStartYear(sessionYear);
  if (current === null) return null;
  let earlierUsage = false;
  for (const session of usageSessions) {
    const year = sessionStartYear(session);
    if (year === null || year >= current) continue;
    if (year === current - 1) return "old";
    earlierUsage = true;
  }
  return earlierUsage ? "gap" : "new";
}

export function distinctEndUsers(rows: EndUser[]): EndUser[] {
  return [...new Map(rows.filter(row => /^(PT-?\d+|PR-?\d+)$/i.test(row.schoolCode.trim()))
    .map(row => {
      const schoolCode = row.schoolCode.trim().toUpperCase();
      return [schoolCode, { ...row, schoolCode }] as const;
    })).values()];
}

export function savedOrderEndUsers(order: {
  descriptiveRows: EndUser[];
  ambiguousSchools: EndUser[];
  combinedSchools: EndUser[];
  groupParticipants: { ptCode: string; schoolName: string }[];
  groupChildLinks: { childOrder: { billingToType: string; billingToCode: string | null; billingToName: string } }[];
}): EndUser[] {
  return distinctEndUsers([
    ...order.descriptiveRows, ...order.ambiguousSchools, ...order.combinedSchools,
    ...order.groupParticipants.map(row => ({ schoolCode: row.ptCode, schoolName: row.schoolName })),
    ...order.groupChildLinks.flatMap(({ childOrder }) => childOrder.billingToType === "school" && childOrder.billingToCode
      ? [{ schoolCode: childOrder.billingToCode, schoolName: childOrder.billingToName }] : [])
  ]);
}

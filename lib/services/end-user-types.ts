import { schoolCodeWhere } from "@/lib/school-reference";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { classifyEndUser, sessionStartYear, type EndUserClassification } from "@/lib/end-user-type";

export async function getEndUserTypes(
  codes: string[], sessionYear: string, excludeOrderId?: number,
  db: Prisma.TransactionClient = prisma
): Promise<Record<string, EndUserClassification>> {
  const requested = [...new Set(codes.map(code => code.trim().toUpperCase()))];
  if (!requested.length) return {};
  if (sessionStartYear(sessionYear) === null) {
    return Object.fromEntries(requested.map(code => [code, { ptCode: null, type: null }]));
  }
  const organisations = await db.organisation.findMany({
    where: schoolCodeWhere(requested),
    select: { ptCode: true, prCode: true, legacySchoolCodes: true }
  });
  const canonical = new Map<string, string>();
  for (const row of organisations) {
    if (!row.ptCode) continue;
    for (const alias of [row.prCode, ...(row.legacySchoolCodes ?? [])]) {
      canonical.set(alias.trim().toUpperCase(), row.ptCode.trim().toUpperCase());
    }
    canonical.set(row.ptCode.trim().toUpperCase(), row.ptCode.trim().toUpperCase());
  }
  const allCodes = [...new Set([...requested, ...canonical.keys()])];
  // Historical usage can still be stored under an organisation's former PT code.
  const ptCodes = allCodes.filter(code => /^PT-?\d+$/.test(code));
  const [history, orders] = await Promise.all([
    db.ptCodeUsageHistory.findMany({ where: { ptCode: { in: ptCodes } } }),
    db.orderSheet1.findMany({
      where: {
        orderStatus: { not: "cancelled" },
        ...(excludeOrderId === undefined ? {} : { orderSheet1Id: { not: excludeOrderId } }),
        sessionYear: { lt: sessionYear.trim() },
        OR: [
          { descriptiveRows: { some: { schoolCode: { in: allCodes } } } },
          { combinedSchools: { some: { schoolCode: { in: allCodes } } } },
          { groupParticipants: { some: { ptCode: { in: allCodes } } } }
        ]
      },
      select: {
        sessionYear: true,
        descriptiveRows: { select: { schoolCode: true } },
        combinedSchools: { select: { schoolCode: true } },
        groupParticipants: { select: { ptCode: true } }
      }
    })
  ]);
  const sessions = new Map<string, Set<string>>();
  const addUsage = (code: string, session: string) => {
    const normalized = code.trim().toUpperCase();
    const ptCode = canonical.get(normalized) ?? normalized;
    if (!sessions.has(ptCode)) sessions.set(ptCode, new Set());
    sessions.get(ptCode)!.add(session);
  };
  for (const row of history) addUsage(row.ptCode, row.sessionYear);
  for (const order of orders) {
    // Billing and shipping are independent of the schools using the books.
    if (order.sessionYear) for (const code of [
      ...order.descriptiveRows.map(row => row.schoolCode),
      ...order.combinedSchools.map(row => row.schoolCode),
      ...order.groupParticipants.map(row => row.ptCode)
    ]) addUsage(code, order.sessionYear);
  }
  return Object.fromEntries(requested.map(code => {
    const resolved = canonical.get(code) ?? code;
    const ptCode = /^PT-?\d+$/.test(resolved) ? resolved : null;
    return [code, { ptCode, type: classifyEndUser(sessionYear, sessions.get(resolved) ?? []) }];
  }));
}

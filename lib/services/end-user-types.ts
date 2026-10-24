import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { classifyEndUser, sessionStartYear, type EndUserClassification } from "@/lib/end-user-type";
import { orderSchoolCodes, schoolReferenceSelect } from "./school-code-reversal";

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
    where: { OR: [{ ptCode: { in: requested } }, { prCode: { in: requested } }] },
    select: { ptCode: true, prCode: true }
  });
  const canonical = new Map<string, string>();
  for (const row of organisations) {
    if (!row.ptCode) continue;
    canonical.set(row.prCode.trim().toUpperCase(), row.ptCode.trim().toUpperCase());
    canonical.set(row.ptCode.trim().toUpperCase(), row.ptCode.trim().toUpperCase());
  }
  const ptCodes = [...new Set(requested.map(code => canonical.get(code) ?? code).filter(code => /^PT-?\d+$/.test(code)))];
  const aliases = new Set([...requested, ...ptCodes]);
  for (const row of organisations) if (row.ptCode) aliases.add(row.prCode);
  const allCodes = [...aliases];
  const [history, orders] = await Promise.all([
    db.ptCodeUsageHistory.findMany({ where: { ptCode: { in: ptCodes } } }),
    db.orderSheet1.findMany({
      where: {
        orderStatus: { not: "cancelled" },
        ...(excludeOrderId === undefined ? {} : { orderSheet1Id: { not: excludeOrderId } }),
        sessionYear: { lt: sessionYear.trim() },
        OR: [
          { billingToType: "school", billingToCode: { in: allCodes } },
          { shippingToType: "school", shippingToCode: { in: allCodes } },
          { descriptiveRows: { some: { schoolCode: { in: allCodes } } } },
          { ambiguousSchools: { some: { schoolCode: { in: allCodes } } } },
          { combinedSchools: { some: { schoolCode: { in: allCodes } } } },
          { groupParticipants: { some: { ptCode: { in: allCodes } } } }
        ]
      },
      select: { ...schoolReferenceSelect, sessionYear: true }
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
    if (order.sessionYear) for (const code of orderSchoolCodes(order)) addUsage(code, order.sessionYear);
  }
  return Object.fromEntries(requested.map(code => {
    const resolved = canonical.get(code) ?? code;
    const ptCode = /^PT-?\d+$/.test(resolved) ? resolved : null;
    return [code, { ptCode, type: classifyEndUser(sessionYear, sessions.get(resolved) ?? []) }];
  }));
}

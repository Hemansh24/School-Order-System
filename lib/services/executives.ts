import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreateOrderInput } from "@/lib/validation/orders";

export async function getExecutiveReferenceData() {
  const [executives, defaults, organisations] = await Promise.all([
    prisma.executive.findMany({ select: { incumbentCode: true, name: true }, orderBy: { name: "asc" } }),
    prisma.schoolExecutiveDefault.findMany(),
    prisma.organisation.findMany({ select: { prCode: true, ptCode: true } })
  ]);
  const byPr = new Map(defaults.map(row => [row.prCode, row]));
  return { executives, executiveDefaults: organisations.flatMap(org => {
    const value = byPr.get(org.prCode);
    return value ? [org.prCode, org.ptCode].filter((code): code is string => !!code)
      .map(schoolCode => ({ schoolCode, incumbentCode: value.incumbentCode, name: value.name })) : [];
  }) };
}

export async function saveOrderExecutives(tx: Prisma.TransactionClient, orderSheet1Id: number, input: CreateOrderInput) {
  // Missing payload from older callers preserves assignments on retained schools.
  if (input.schoolExecutives === undefined) {
    const codes = [...input.descriptiveRows, ...input.combinedSchools].map(row => row.schoolCode);
    await tx.orderSchoolExecutive.deleteMany({ where: { orderSheet1Id, schoolCode: { notIn: codes } } });
    return;
  }
  const resolved = [];
  for (const assignment of input.schoolExecutives) {
    let name = assignment.name;
    if (assignment.incumbentCode) {
      const executive = await tx.executive.findUnique({ where: { incumbentCode: assignment.incumbentCode } });
      if (!executive) throw new Error(`Unknown incumbent code: ${assignment.incumbentCode}`);
      // Preserve a saved name snapshot when the selection was not changed.
      const saved = await tx.orderSchoolExecutive.findUnique({ where: { orderSheet1Id_schoolCode: { orderSheet1Id, schoolCode: assignment.schoolCode } } });
      name = !assignment.updateDefault && saved?.incumbentCode === assignment.incumbentCode ? saved.name : executive.name;
    }
    const data = { schoolCode: assignment.schoolCode, incumbentCode: assignment.incumbentCode ?? null, name };
    resolved.push(data);
    if (assignment.updateDefault) {
      const org = await tx.organisation.findFirst({ where: { OR: [{ prCode: data.schoolCode }, { ptCode: data.schoolCode }] }, select: { prCode: true } });
      if (!org) throw new Error(`Cannot save the executive default: organisation not found for ${data.schoolCode}.`);
      if (!name) await tx.schoolExecutiveDefault.deleteMany({ where: { prCode: org.prCode } });
      else await tx.schoolExecutiveDefault.upsert({ where: { prCode: org.prCode }, create: { prCode: org.prCode, incumbentCode: data.incumbentCode, name }, update: { incumbentCode: data.incumbentCode, name } });
    }
  }
  await tx.orderSchoolExecutive.deleteMany({ where: { orderSheet1Id } });
  const nonblank = resolved.filter(row => row.name);
  if (nonblank.length) await tx.orderSchoolExecutive.createMany({ data: nonblank.map(row => ({ ...row, orderSheet1Id })) });
}

import { isGroupOrder } from "@/lib/order-model";
import type { Prisma } from '@prisma/client';
import type { CreateOrderInput } from '@/lib/validation/orders';
import { getGroupMembers, normalizeGroupCode } from '@/lib/group-membership';
import { nextSequentialCompactCode } from '@/lib/reference-codes';

type Existing = {
  schoolGroupId: number | null;
  schoolGroupLocationId: number | null;
  endUserGroupCode: string | null;
  combinedSchools: { schoolCode: string; schoolName: string; notes: string | null }[];
};

export async function prepareGsOrder(tx: Prisma.TransactionClient, input: CreateOrderInput, existing?: Existing): Promise<CreateOrderInput> {
  const code = normalizeGroupCode(input.sheet1.endUserGroupCode ?? '');
  const sheet1 = { ...input.sheet1, schoolGroupId: undefined as number | undefined, schoolGroupLocationId: undefined as number | undefined };
  if (!isGroupOrder(sheet1)) return { ...input, sheet1: { ...sheet1, endUserGroupCode: '' } };
  const sameGroup = !!existing && normalizeGroupCode(existing.endUserGroupCode ?? '') === code;
  // Historical group and membership snapshots remain editable if the master disappears.
  if (sameGroup && /^GS\d/i.test(code)) {
    return { ...input, sheet1: { ...sheet1, endUserGroupCode: code, schoolGroupId: existing.schoolGroupId ?? undefined, schoolGroupLocationId: existing.schoolGroupLocationId ?? undefined }, combinedSchools: existing.combinedSchools.map(row => ({ ...row, notes: row.notes ?? '' })) };
  }
  const group = await tx.schoolGroup.findUnique({ where: { groupCode: code } });
  if (!group || !group.active) {
    if (sameGroup) return { ...input, sheet1: { ...sheet1, endUserGroupCode: code, schoolGroupId: existing.schoolGroupId ?? undefined } };
    throw new Error('Choose an active end-school group.');
  }
  if (group.sourceType !== 'GS') {
    if (group.sourceType !== 'CHRISTIAN') throw new Error('Unsupported end-school group.');
    return { ...input, sheet1: { ...sheet1, endUserGroupCode: group.groupCode, schoolGroupId: group.schoolGroupId } };
  }
  let participants: CreateOrderInput['combinedSchools'] | undefined;
  if (!participants) {
    const members = await getGroupMembers(tx, code);
    if (!members.length) throw new Error('This GS group has no member organisations.');
    // Serialize code allocation with the existing maximum-sequence allocator.
    await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(741024)`;
    const used = (await tx.organisation.findMany({ where: { ptCode: { not: null } }, select: { ptCode: true } })).flatMap(row => row.ptCode ? [row.ptCode] : []);
    participants = [];
    for (const member of members) {
      const fresh = await tx.organisation.findUniqueOrThrow({ where: { id: member.id } });
      const ptCode = fresh.ptCode ?? nextSequentialCompactCode('PT', used, 4);
      if (!fresh.ptCode) { await tx.organisation.update({ where: { id: member.id }, data: { ptCode } }); used.push(ptCode); }
      await tx.school.upsert({ where: { schoolCode: ptCode }, create: { schoolCode: ptCode, schoolName: member.organisationName, address: member.address, district: member.district, state: member.state, pincode: member.pinCode, phone: member.phone, email: member.email }, update: {} });
      participants.push({ schoolCode: ptCode, schoolName: member.organisationName, notes: '' });
    }
    if (new Set(participants.map(row => row.schoolCode)).size !== participants.length) throw new Error('Duplicate PT codes exist in the GS membership; correct them before ordering.');
  }
  return { ...input, combinedSchools: participants, sheet1: { ...sheet1, endUserGroupCode: group.groupCode, schoolGroupId: group.schoolGroupId } };
}

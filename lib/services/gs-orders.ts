import { isGroupOrder } from "@/lib/order-model";
import type { Prisma } from '@prisma/client';
import type { CreateOrderInput } from '@/lib/validation/orders';
import { getGroupMembers, normalizeGroupCode } from '@/lib/group-membership';
import { nextSequentialCompactCode } from '@/lib/reference-codes';
import { moveSchoolGroupCodeTx, reservedPtCodes } from '@/lib/pt-codes';

type Existing = {
  schoolGroupId: number | null;
  schoolGroupLocationId: number | null;
  endUserGroupCode: string | null;
  combinedSchools: { schoolCode: string; schoolName: string; notes: string | null }[];
};

// Call inside a transaction so allocation and school mappings commit together.
async function ensureGsMemberPtCode(tx: Prisma.TransactionClient, id: bigint, reservedCodes?: string[]) {
  await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(741024)`;
  const fresh = await tx.organisation.findUniqueOrThrow({ where: { id } });
  const used = reservedCodes ?? (fresh.ptCode ? [] : await reservedPtCodes(tx));
  const ptCode = fresh.ptCode ?? nextSequentialCompactCode('PT', used, 4);
  const prSchool = await tx.school.findUnique({ where: { schoolCode: fresh.prCode } });
  if (prSchool) {
    if (await tx.school.findUnique({ where: { schoolCode: ptCode } })) {
      throw new Error(`Separate school records use ${fresh.prCode} and ${ptCode}. Resolve the duplicate schools and retry.`);
    }
    await tx.school.update({ where: { schoolId: prSchool.schoolId }, data: { schoolCode: ptCode } });
  }
  await moveSchoolGroupCodeTx(tx, fresh.prCode, ptCode);
  if (!fresh.ptCode) {
    await tx.organisation.update({ where: { id }, data: { ptCode } });
    used.push(ptCode);
  }
  await tx.school.upsert({ where: { schoolCode: ptCode }, create: { schoolCode: ptCode, schoolName: fresh.organisationName, address: fresh.address, district: fresh.district, state: fresh.state, pincode: fresh.pinCode, phone: fresh.phone, email: fresh.email }, update: {} });
  return { prCode: fresh.prCode, ptCode, schoolName: fresh.organisationName };
}

export async function convertGsMemberTx(tx: Prisma.TransactionClient, groupCode: string, prCode: string) {
  await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(741024)`;
  const code = normalizeGroupCode(groupCode);
  const group = await tx.schoolGroup.findUnique({ where: { groupCode: code } });
  if (!group?.active || group.sourceType !== 'GS') throw new Error('Choose an active GS group.');
  const members = await getGroupMembers(tx, code);
  const member = members.find(row => normalizeGroupCode(row.prCode) === normalizeGroupCode(prCode));
  if (!member) throw new Error('This school no longer belongs to the selected GS group.');
  return ensureGsMemberPtCode(tx, member.id);
}

export async function prepareGsOrder(tx: Prisma.TransactionClient, input: CreateOrderInput, existing?: Existing): Promise<CreateOrderInput> {
  const code = normalizeGroupCode(input.sheet1.endUserGroupCode ?? '');
  const sheet1 = { ...input.sheet1, schoolGroupId: undefined as number | undefined, schoolGroupLocationId: undefined as number | undefined };
  if (!isGroupOrder(sheet1)) return { ...input, sheet1: { ...sheet1, endUserGroupCode: '' } };
  const sameGroup = !!existing && normalizeGroupCode(existing.endUserGroupCode ?? '') === code;
  const savedGs = sameGroup && /^GS\d/i.test(code) ? existing : undefined;
  const savedParticipants = new Map((savedGs?.combinedSchools ?? []).map(row => [normalizeGroupCode(row.schoolCode), row]));
  const group = await tx.schoolGroup.findUnique({ where: { groupCode: code } });
  if (!group || !group.active) {
    // Allow a subset of the historical snapshot if the master disappears.
    if (savedGs) {
      const participants = input.combinedSchools.map(row => {
        const saved = savedParticipants.get(normalizeGroupCode(row.schoolCode));
        if (!saved) throw new Error('Choose participating schools from the saved GS group.');
        return { ...saved, notes: row.notes ?? '' };
      });
      return { ...input, combinedSchools: participants, sheet1: { ...sheet1, endUserGroupCode: code, schoolGroupId: savedGs.schoolGroupId ?? undefined, schoolGroupLocationId: savedGs.schoolGroupLocationId ?? undefined } };
    }
    if (sameGroup) return { ...input, sheet1: { ...sheet1, endUserGroupCode: code, schoolGroupId: existing.schoolGroupId ?? undefined } };
    throw new Error('Choose an active end-school group.');
  }
  if (group.sourceType !== 'GS') {
    if (group.sourceType !== 'CHRISTIAN') throw new Error('Unsupported end-school group.');
    return { ...input, sheet1: { ...sheet1, endUserGroupCode: group.groupCode, schoolGroupId: group.schoolGroupId } };
  }
  const participants: CreateOrderInput['combinedSchools'] = [];
  const executiveCodes = new Map<string, string>();
  {
    const members = await getGroupMembers(tx, code);
    if (!members.length && !savedParticipants.size) throw new Error('This GS group has no member organisations.');
    const selected = input.combinedSchools.map(row => {
      const key = normalizeGroupCode(row.schoolCode);
      const member = members.find(member => normalizeGroupCode(member.prCode) === key || (member.ptCode && normalizeGroupCode(member.ptCode) === key));
      const saved = savedParticipants.get(key);
      if (!member && !saved) throw new Error('Choose participating schools from the selected GS group.');
      return { row, member, saved };
    });
    // Serialize code allocation with the existing maximum-sequence allocator.
    await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(741024)`;
    const used = await reservedPtCodes(tx);
    for (const { row, member, saved } of selected) {
      if (!member) {
        participants.push({ ...saved!, notes: row.notes ?? '' });
        continue;
      }
      const { ptCode } = await ensureGsMemberPtCode(tx, member.id, used);
      executiveCodes.set(row.schoolCode, ptCode);
      participants.push({ schoolCode: ptCode, schoolName: saved?.schoolName ?? member.organisationName, notes: row.notes ?? '' });
    }
    if (new Set(participants.map(row => row.schoolCode)).size !== participants.length) throw new Error('Duplicate PT codes exist in the GS membership; correct them before ordering.');
  }
  return { ...input, schoolExecutives: input.schoolExecutives?.map(row => ({ ...row, schoolCode: executiveCodes.get(row.schoolCode) ?? row.schoolCode })), combinedSchools: participants, sheet1: { ...sheet1, endUserGroupCode: group.groupCode, schoolGroupId: group.schoolGroupId, schoolGroupLocationId: savedGs?.schoolGroupLocationId ?? undefined } };
}

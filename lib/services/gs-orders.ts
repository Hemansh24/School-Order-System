import type { Prisma } from '@prisma/client';
import type { CreateOrderInput } from '@/lib/validation/orders';
import { currentLocations, getGroupMembers, normalizeGroupCode, normalizeSheetText } from '@/lib/group-membership';
import { nextSequentialCompactCode } from '@/lib/reference-codes';
import { formatSchoolAddress } from '@/lib/shipping';

type Existing = { schoolGroupId: number | null; schoolGroupLocationId: number | null; billingToCode: string; shippingToCode: string; billingToName: string; shippingToName: string; shippingToSummary: string; combinedSchools: { schoolCode: string; schoolName: string; notes: string | null }[] };

export async function prepareGsOrder(tx: Prisma.TransactionClient, input: CreateOrderInput, existing?: Existing): Promise<CreateOrderInput> {
  const code = normalizeGroupCode(input.sheet1.billingToCode);
  if (!/^GS\d+(?:-\d+)?$/.test(code) && !input.sheet1.schoolGroupId) return { ...input, sheet1: { ...input.sheet1, schoolGroupId: undefined, schoolGroupLocationId: undefined } };
  // Existing location-code orders are editable without migrating their historical representation.
  if (existing && normalizeGroupCode(existing.billingToCode) === code && /^GS\d+-\d+$/.test(code)) {
    return { ...input, sheet1: { ...input.sheet1, schoolGroupId: existing.schoolGroupId ?? undefined, schoolGroupLocationId: existing.schoolGroupLocationId ?? undefined, shippingToCode: existing.shippingToCode, billingToName: existing.billingToName, shippingToName: existing.shippingToName, shippingToSummary: existing.shippingToSummary }, combinedSchools: existing.combinedSchools.map(row => ({ ...row, notes: row.notes ?? '' })) };
  }
  if (input.sheet1.orderType !== 'combined' || input.sheet1.billingToType !== 'school' || input.sheet1.shippingToType !== 'school') throw new Error('GS orders must be combined orders with shared billing and shipping.');
  const group = await tx.schoolGroup.findUnique({ where: { groupCode: code }, include: { locations: true } });
  if (!group || group.sourceType !== 'GS') throw new Error('GS group master not found.');
  if (input.sheet1.schoolGroupId && input.sheet1.schoolGroupId !== group.schoolGroupId) throw new Error('GS group ID does not match billing code.');
  const sameGroup = existing && existing.schoolGroupId === group.schoolGroupId && normalizeGroupCode(existing.billingToCode) === code;
  const chosenId = input.sheet1.schoolGroupLocationId;
  if (sameGroup && (!chosenId || chosenId === existing.schoolGroupLocationId)) {
    return { ...input, sheet1: { ...input.sheet1, schoolGroupId: group.schoolGroupId, schoolGroupLocationId: existing.schoolGroupLocationId ?? undefined, billingToCode: existing.billingToCode, shippingToCode: existing.shippingToCode, billingToName: existing.billingToName, shippingToName: existing.shippingToName, shippingToSummary: existing.shippingToSummary }, combinedSchools: existing.combinedSchools.map(row => ({ ...row, notes: row.notes ?? '' })) };
  }
  if (!group.active) throw new Error('This GS group is inactive.');
  const locations = currentLocations(group.locations, group.metadata);
  const location = locations.find(row => row.schoolGroupLocationId === chosenId) ?? (!chosenId && locations.length === 1 ? locations[0] : undefined);
  if (!location || !normalizeSheetText(location.address)) throw new Error('Choose a usable address belonging to the selected GS group.');
  // Retain saved members when only the destination is changed.
  let participants = sameGroup ? existing.combinedSchools.map(row => ({ ...row, notes: row.notes ?? '' })) : undefined;
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
  return { ...input, combinedSchools: participants, sheet1: { ...input.sheet1, schoolGroupId: group.schoolGroupId, schoolGroupLocationId: location.schoolGroupLocationId, billingToCode: group.groupCode, shippingToCode: group.groupCode, billingToName: group.groupName, shippingToName: group.groupName, shippingToSummary: formatSchoolAddress(location) } };
}

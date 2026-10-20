import assert from 'node:assert/strict';
import type { OrderSheet1 } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { prepareGsOrder } from '../lib/services/gs-orders';
import { createParentGroupOrderTx } from '../lib/services/group-orders';
import { parseGsRows } from '../lib/importGsGroups';
import { createOrderSchema, type CreateOrderInput } from '../lib/validation/orders';

const rollback = new Error('Verification rollback');
const code = 'GS99999999';
const dates = { sessionYear: '2026-2027', orderPlacedDate: '2026-10-13', orderReceivedDate: '2026-10-13', expectedDeliveryDate: '2026-10-14' };
const input = (groupId: number, locationId?: number): CreateOrderInput => ({
  sheet1: { ...dates, billingToType: 'individual', billingToCode: '', billingToName: 'Manual payer', shippingToType: 'individual', shippingToCode: '', shippingToName: 'Test group', shippingToSummary: 'Test address', orderType: 'descriptive', descriptiveMode: 'group', endUserGroupCode: code, pendingPayment: false, schoolGroupId: groupId, schoolGroupLocationId: locationId },
  descriptiveRows: [], ambiguousSchools: [], ambiguousItems: [],
  combinedSchools: [{ schoolCode: 'PT-UNRELATED', schoolName: 'Forged participant' }],
  combinedItems: [{ itemCode: 'TEST', itemName: 'Test', pooledQuantity: 1 }]
});
async function main() {
  const before = { orders: await prisma.orderSheet1.count(), organisations: await prisma.organisation.count(), schools: await prisma.school.count(), groups: await prisma.schoolGroup.count() };
  let completed = false;
  try {
    await prisma.$transaction(async tx => {
      const group = await tx.schoolGroup.create({ data: { groupCode: code, groupName: 'Verification', sourceType: 'GS' } });
      const location = await tx.schoolGroupLocation.create({ data: { schoolGroupId: group.schoolGroupId, subCode: '1', name: 'Test address', address: 'One shared address' } });
      await assert.rejects(() => prepareGsOrder(tx, input(group.schoolGroupId)), /no member/);
      const pr = 'PR999999991';
      await tx.organisation.create({ data: { prCode: pr, organisationName: 'PR-only test school', groupCode: ' gs99999999 ' } });
      await tx.organisation.create({ data: { prCode: 'PR999999992', organisationName: 'Independent test school' } });
      const prepared = await prepareGsOrder(tx, input(group.schoolGroupId));
      assert.equal(prepared.combinedSchools.length, 1);
      assert.match(prepared.combinedSchools[0].schoolCode, /^PT\d+$/);
      assert.equal(prepared.sheet1.shippingToCode, '');
      assert.equal(prepared.sheet1.billingToName, 'Manual payer');
      assert.equal(prepared.sheet1.schoolGroupLocationId, undefined);
      assert.equal(prepared.sheet1.shippingToSummary, 'Test address');
      const member = await tx.organisation.findUniqueOrThrow({ where: { prCode: pr } });
      assert.equal(member.prCode, pr);
      assert.equal(member.ptCode, prepared.combinedSchools[0].schoolCode);
      const independent = await tx.organisation.findUniqueOrThrow({ where: { prCode: 'PR999999992' } });
      assert.equal(independent.ptCode, null);
      await tx.schoolGroupLocation.create({ data: { schoolGroupId: group.schoolGroupId, subCode: '2', name: 'Second address', address: 'Second shared address' } });
      assert.equal((await prepareGsOrder(tx, input(group.schoolGroupId))).sheet1.shippingToSummary, 'Test address');
      assert.equal((await prepareGsOrder(tx, input(group.schoolGroupId, -1))).sheet1.schoolGroupLocationId, undefined);
      const snapshot = { endUserGroupCode: code, schoolGroupId: group.schoolGroupId, schoolGroupLocationId: location.schoolGroupLocationId, billingToCode: code, shippingToCode: code, billingToName: 'Saved name', shippingToName: 'Saved name', shippingToSummary: 'Saved address', combinedSchools: prepared.combinedSchools.map(row => ({ ...row, notes: null })) };
      await tx.organisation.update({ where: { prCode: pr }, data: { groupCode: null } });
      const preserved = await prepareGsOrder(tx, input(group.schoolGroupId, location.schoolGroupLocationId), snapshot);
      assert.equal(preserved.sheet1.shippingToSummary, 'Test address');
      assert.deepEqual(preserved.combinedSchools.map(row => row.schoolCode), prepared.combinedSchools.map(row => row.schoolCode));
      await tx.organisation.update({ where: { prCode: pr }, data: { groupCode: code } });
      const children: OrderSheet1[] = [];
      for (let index = 0; index < 2; index++) {
        const child = await tx.orderSheet1.create({ data: { orderNo: -99999991 - index, sessionYear: dates.sessionYear, orderPlacedDate: new Date(dates.orderPlacedDate), orderReceivedDate: new Date(dates.orderReceivedDate), expectedDeliveryDate: new Date(dates.expectedDeliveryDate), billingToType: 'school', billingToCode: member.ptCode!, billingToName: member.organisationName, shippingToType: 'school', shippingToCode: member.ptCode!, shippingToName: member.organisationName, shippingToSummary: 'Separate address ' + index, orderType: 'descriptive' } });
        children.push(child);
      }
      await assert.rejects(() => createParentGroupOrderTx(tx, group.schoolGroupId, [children[0].orderSheet1Id, children[0].orderSheet1Id], dates), /distinct/);
      const parent = await createParentGroupOrderTx(tx, group.schoolGroupId, children.map(child => child.orderSheet1Id), dates);
      assert.equal(parent.classification, 'group_parent');
      for (const child of children) {
        const after = await tx.orderSheet1.findUniqueOrThrow({ where: { orderSheet1Id: child.orderSheet1Id } });
        assert.equal(after.shippingToSummary, child.shippingToSummary);
        assert.equal(after.billingToCode, member.ptCode);
        assert.equal(after.orderStatus, child.orderStatus);
      }
      assert.equal(await tx.orderSheet3.count({ where: { orderSheet1Id: parent.orderSheet1Id } }), 0);
      await assert.rejects(() => createParentGroupOrderTx(tx, group.schoolGroupId, [children[0].orderSheet1Id], dates), /already belong/);
      const c1 = { ...input(group.schoolGroupId), sheet1: { ...input(group.schoolGroupId).sheet1, schoolGroupId: undefined, schoolGroupLocationId: undefined, descriptiveMode: 'school' as const, endUserGroupCode: '', billingToCode: 'C1-001', shippingToCode: 'C1-001' } };
      assert.deepEqual(await prepareGsOrder(tx, c1), c1);
      const legacy = { ...snapshot, endUserGroupCode: code + '-1', billingToCode: code + '-1', shippingToCode: code + '-1', schoolGroupId: null, schoolGroupLocationId: null };
      const oldInput = { ...input(group.schoolGroupId), sheet1: { ...input(group.schoolGroupId).sheet1, schoolGroupId: undefined, endUserGroupCode: code + '-1', billingToCode: code + '-1', shippingToCode: code + '-1' } };
      assert.equal((await prepareGsOrder(tx, oldInput, legacy)).sheet1.shippingToSummary, 'Test address');
      assert.equal(createOrderSchema.safeParse(prepared).success, true);
      completed = true;
      throw rollback;
    }, { timeout: 120000 });
  } catch (error) { if (error !== rollback) throw error; }
  assert.equal(completed, true);
  assert.deepEqual({ orders: await prisma.orderSheet1.count(), organisations: await prisma.organisation.count(), schools: await prisma.school.count(), groups: await prisma.schoolGroup.count() }, before);
  const headers = ['GS Code', 'GS Sub Code', 'Name', '', '', '', '', 'Address'];
  assert.throws(() => parseGsRows([headers]), /empty/);
  assert.throws(() => parseGsRows([headers, [code, '1', 'Name'], [code, '1', 'Other name']]), /Duplicate/);
  assert.equal(parseGsRows([headers, [code, '1', 'Name', '', '', '', '', 'NA']])[0].address, null);
  console.log('Passed GS membership, PR conversion, snapshots, independent manual billing/shipping, reporting groups, C1 compatibility, legacy orders, and import validation. All fixtures rolled back.');
}
main().catch(error => { console.error(error instanceof Error ? error.message : 'Verification failed'); process.exitCode = 1; }).finally(() => prisma.$disconnect());

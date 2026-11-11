import { Prisma, SourceType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { a2dSchema, a2dSchoolBelongsToGroup, calculateA2DBalance, type A2DInput } from "@/lib/a2d";
import { savedOrderToInput } from "@/lib/order-input";
import { createOrderSchema } from "@/lib/validation/orders";
import { findSchoolByCode, asSchool } from "@/lib/school-reference";
import { ensurePtCodesForSchoolCodesTx } from "./organisations";
import { prepareGsOrder } from "./gs-orders";
import { saveOrderExecutives } from "./executives";
import { applyPtCodesToOrder, nextParentOrderNo } from "./orders";

export async function convertAmbiguousOrder(sourceOrderId: number, raw: A2DInput) {
  const input = a2dSchema.parse(raw);
  const result = await prisma.$transaction(async tx => {
    // Use the same lock as ordinary edits/finalisation and PT code allocation.
    await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(741024)`;
    const previous = await tx.a2DConversion.findUnique({ where: { id: input.requestId }, include: { resultOrder: true } });
    if (previous) {
      if (previous.sourceOrderId !== sourceOrderId) throw new Error("This conversion request was already used for another order.");
      return previous.resultOrder;
    }
    // Protect tracking snapshots against concurrent fulfilment edits as well.
    await tx.$queryRaw`SELECT order_sheet_1_id FROM order_sheet_1 WHERE order_sheet_1_id = ${sourceOrderId} FOR UPDATE`;
    await tx.$queryRaw`SELECT order_sheet_3_id FROM order_sheet_3 WHERE order_sheet_1_id = ${sourceOrderId} FOR UPDATE`;
    const source = await tx.orderSheet1.findUniqueOrThrow({ where: { orderSheet1Id: sourceOrderId }, include: { schoolExecutives: true, descriptiveRows: true, ambiguousItems: true, combinedSchools: true, combinedItems: true, finalRows: true } });
    if (source.orderType !== "ambiguous" || source.classification !== "normal" || source.orderStatus === "cancelled" || source.finalRows.some(row => row.cancelOrOnHoldStatus === "cancelled")) throw new Error("Only active ambiguous orders can be converted.");
    if (source.updatedAt.toISOString() !== input.expectedUpdatedAt) throw new Error("This order changed. Reload the conversion page to review its latest balance.");
    const { balances, full } = calculateA2DBalance(source.ambiguousItems, input.rows);
    const group = input.mode === "multiple_group" ? await tx.schoolGroup.findUnique({ where: { groupCode: input.groupCode.toUpperCase() } }) : null;
    if (input.mode === "multiple_group" && (!group?.active || !["GS", "CHRISTIAN"].includes(group.sourceType))) throw new Error("Choose an active end-school group.");
    const schools = new Map<string, { schoolCode: string; schoolName: string }>();
    for (const code of input.schools) {
      const org = await findSchoolByCode(tx, code);
      if (!org) throw new Error(`Unknown end-user school: ${code}`);
      if (group && !a2dSchoolBelongsToGroup(org.groupCode, group)) throw new Error(`School ${code} does not belong to the selected group.`);
      const school = asSchool(org);
      schools.set(code, { schoolCode: school.schoolCode, schoolName: school.schoolName });
    }
    if (new Set([...schools.values()].map(row => row.schoolCode)).size !== schools.size) throw new Error("Select each end-user school only once.");
    const pooled = input.mode === "multiple_schools" || input.mode === "multiple_group";
    const items = new Map(source.ambiguousItems.map(row => [row.itemCode, row]));
    const base = savedOrderToInput(source);
    const values = createOrderSchema.parse({
      ...base,
      sheet1: { ...base.sheet1, orderType: "descriptive", descriptiveMode: input.mode, endUserGroupCode: input.groupCode },
      ambiguousItems: [], combinedSchools: pooled ? [...schools.values()] : [],
      combinedItems: pooled ? input.rows.map(row => ({ itemCode: row.itemCode, itemName: items.get(row.itemCode)!.itemName, pooledQuantity: row.quantity, notes: items.get(row.itemCode)!.notes ?? "" })) : [],
      descriptiveRows: pooled ? [] : input.rows.map(row => ({ ...schools.get(row.schoolCode!)!, itemCode: row.itemCode, itemName: items.get(row.itemCode)!.itemName, quantity: row.quantity, notes: items.get(row.itemCode)!.notes ?? "" })),
      schoolExecutives: (input.schoolExecutives ?? []).map(row => ({ ...row, schoolCode: schools.get(row.schoolCode)!.schoolCode }))
    });
    const prepared = await prepareGsOrder(tx, values);
    const codes = [...prepared.descriptiveRows, ...prepared.combinedSchools].map(row => row.schoolCode);
    const ptCodes = await ensurePtCodesForSchoolCodesTx(tx, codes);
    const mapped = createOrderSchema.parse(applyPtCodesToOrder(prepared, ptCodes));
    let target;
    const shape = { orderType: "descriptive" as const, descriptiveMode: input.mode, endUserGroupCode: mapped.sheet1.endUserGroupCode || null, schoolGroupId: mapped.sheet1.schoolGroupId ?? null, schoolGroupLocationId: mapped.sheet1.schoolGroupLocationId ?? null };
    if (full) {
      target = await tx.orderSheet1.update({ where: { orderSheet1Id: sourceOrderId }, data: shape });
    } else {
      const scalar = await tx.orderSheet1.findUniqueOrThrow({ where: { orderSheet1Id: sourceOrderId } });
      const { orderSheet1Id: _id, orderNo: _no, createdAt: _created, updatedAt: _updated, ...inherited } = scalar;
      target = await tx.orderSheet1.create({ data: { ...inherited, ...shape, orderNo: await nextParentOrderNo(tx) } });
      await tx.orderSheet1.update({ where: { orderSheet1Id: sourceOrderId }, data: { updatedAt: new Date(Math.max(Date.now(), source.updatedAt.getTime() + 1)) } });
    }
    const identity = { orderSheet1Id: target.orderSheet1Id, orderNo: target.orderNo };
    const allocationRecords: Prisma.InputJsonObject[] = [];
    async function inheritTracking(itemCode: string, sourceType: SourceType, sourceId: number, quantity: number) {
      if (source.orderStatus !== "finalized") return;
      const ambiguous = items.get(itemCode)!;
      const tracking = source.finalRows.find(row => row.sourceType === "TWO_B2" && row.sourceId === ambiguous.orderSheet2B2Id);
      if (!tracking) throw new Error(`Finalised item ${itemCode} has no Sheet 3 tracking record.`);
      const { orderSheet3Id: _id, orderSheet1Id: _orderId, orderNo: _no, sourceType: _type, sourceId: _source, quantity: _quantity, createdAt: _created, updatedAt: _updated, ...fields } = tracking;
      await tx.orderSheet3.create({ data: { ...fields, ...identity, sourceType, sourceId, quantity } });
    }
    for (const row of mapped.descriptiveRows) {
      const saved = await tx.orderSheet2A.create({ data: { ...row, ...identity } });
      allocationRecords.push({ schoolCode: row.schoolCode, schoolName: row.schoolName, itemCode: row.itemCode, quantity: row.quantity });
      await inheritTracking(row.itemCode, SourceType.TWO_A, saved.orderSheet2AId, row.quantity);
    }
    if (mapped.combinedSchools.length) await tx.orderSheet2C1.createMany({ data: mapped.combinedSchools.map(row => ({ ...row, ...identity })) });
    for (const row of mapped.combinedItems) {
      const saved = await tx.orderSheet2C2.create({ data: { ...row, ...identity } });
      allocationRecords.push({ itemCode: row.itemCode, quantity: row.pooledQuantity, schools: mapped.combinedSchools.map(school => school.schoolCode) });
      await inheritTracking(row.itemCode, SourceType.TWO_C2, saved.orderSheet2C2Id, row.pooledQuantity);
    }
    await saveOrderExecutives(tx, target.orderSheet1Id, mapped);
    for (const balance of balances) {
      const item = items.get(balance.itemCode)!;
      const where = { sourceType: SourceType.TWO_B2, sourceId: item.orderSheet2B2Id };
      if (!balance.remaining) {
        await tx.orderSheet3.deleteMany({ where });
        await tx.orderSheet2B2.delete({ where: { orderSheet2B2Id: item.orderSheet2B2Id } });
      } else if (balance.allocated) {
        await tx.orderSheet2B2.update({ where: { orderSheet2B2Id: item.orderSheet2B2Id }, data: { groupedQuantity: balance.remaining } });
        await tx.orderSheet3.updateMany({ where, data: { quantity: balance.remaining } });
      }
    }
    await tx.a2DConversion.create({ data: { id: input.requestId, sourceOrderId, resultOrderId: target.orderSheet1Id, fullConversion: full, allocations: allocationRecords, balances } });
    return target;
  }, { timeout: 120000 });
  for (const path of ["/", "/orders", "/orders/a2d", "/reports", "/schools", "/organisations", `/orders/${sourceOrderId}`, `/orders/${result.orderSheet1Id}`]) revalidatePath(path, "layout");
  return result;
}

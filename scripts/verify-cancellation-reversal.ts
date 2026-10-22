import assert from "node:assert/strict";
import { prisma } from "../lib/prisma";
import { createOrderSchema } from "../lib/validation/orders";
import { nextOrganisationPtCode } from "../lib/reference-codes";
import { getGroupMappingData } from "../lib/services/groups";

async function main() {
  // Service calls commit transactions: never run this against a shared database.
  const url = new URL(process.env.DATABASE_URL ?? "");
  assert.equal(url.hostname, "127.0.0.1");
  assert.equal(url.port, "55439");
  assert.equal(url.pathname, "/order_revamp_verify");
  require("next/cache").revalidatePath = () => {};
  const { createOrder, updateOrderStatus, lockOrder, finalizeOrder, putOrderOnHold, cancelHeldOrder } = await import("../lib/services/orders");
  const suffix = Date.now().toString();
  const item = await prisma.item.findFirstOrThrow();
  const vendor = await prisma.vendor.findFirstOrThrow({ select: { vendorId: true } });
  const itemRef = { itemCode: item.itemCode, itemName: item.itemName };
  const sheet1 = {
    orderPlacedDate: "2026-10-22", orderType: "descriptive", descriptiveMode: "individual",
    billingToType: "individual", billingToName: "Cancellation verification",
    shippingToType: "individual", shippingToName: "Cancellation verification", shippingToSummary: "Test address"
  };
  let fixtureNo = 0;
  async function school(imported = false) {
    const prCode = `PR${suffix}${++fixtureNo}`;
    const ptCode = imported ? await nextOrganisationPtCode() : null;
    const organisation = await prisma.organisation.create({ data: { prCode, ptCode, organisationName: `Cancellation ${prCode}` } });
    const school = await prisma.school.create({ data: { schoolCode: ptCode ?? prCode, schoolName: organisation.organisationName } });
    return { organisation, school };
  }
  const individual = (schoolCode: string) => createOrderSchema.parse({
    sheet1, descriptiveRows: [{ schoolCode, schoolName: "Verification school", ...itemRef, quantity: 2 }]
  });
  const currentOrganisation = (prCode: string) => prisma.organisation.findUniqueOrThrow({ where: { prCode } });

  const first = await school();
  await prisma.vendorSchool.create({ data: { vendorId: vendor.vendorId, schoolId: first.school.schoolId } });
  await prisma.schoolGroupSchool.create({ data: { ptCode: first.organisation.prCode } });
  const firstOrder = await createOrder(individual(first.organisation.prCode));
  const ptCode = firstOrder.descriptiveRows[0].schoolCode;
  assert.match(ptCode, /^PT\d+$/);
  const secondOrder = await createOrder(individual(ptCode));
  await updateOrderStatus(firstOrder.orderSheet1Id, "cancelled");
  assert.equal((await currentOrganisation(first.organisation.prCode)).ptCode, ptCode);
  await lockOrder(secondOrder.orderSheet1Id);
  await finalizeOrder(secondOrder.orderSheet1Id);
  await putOrderOnHold(secondOrder.orderSheet1Id);
  assert.equal((await currentOrganisation(first.organisation.prCode)).ptCode, ptCode);
  await cancelHeldOrder(secondOrder.orderSheet1Id);
  assert.equal((await currentOrganisation(first.organisation.prCode)).ptCode, null);
  assert.equal((await prisma.school.findUniqueOrThrow({ where: { schoolId: first.school.schoolId } })).schoolCode, first.organisation.prCode);
  assert.equal(await prisma.vendorSchool.count({ where: { schoolId: first.school.schoolId, vendorId: vendor.vendorId } }), 1);
  assert.ok(await prisma.schoolGroupSchool.findUnique({ where: { ptCode: first.organisation.prCode } }));
  assert.equal((await prisma.orderSheet2A.findFirstOrThrow({ where: { orderSheet1Id: firstOrder.orderSheet1Id } })).schoolCode, ptCode);
  assert.equal((await prisma.orderSheet3.findFirstOrThrow({ where: { orderSheet1Id: secondOrder.orderSheet1Id } })).cancelOrOnHoldStatus, "cancelled");
  await updateOrderStatus(firstOrder.orderSheet1Id, "cancelled");
  await assert.rejects(() => lockOrder(firstOrder.orderSheet1Id), /cancelled/);
  await assert.rejects(() => createOrder(individual(ptCode)), /changed or no longer exists/);
  const nextOrder = await createOrder(individual(first.organisation.prCode));
  assert.notEqual(nextOrder.descriptiveRows[0].schoolCode, ptCode);
  assert.ok(await prisma.schoolGroupSchool.findUnique({ where: { ptCode: nextOrder.descriptiveRows[0].schoolCode } }));

  // Imported PT schools are eligible too. Billing/shipping alone retain PT.
  const imported = await school(true);
  const importedCode = imported.organisation.ptCode!;
  const headerOrder = await createOrder(createOrderSchema.parse({ sheet1: {
    ...sheet1, orderType: "ambiguous", billingToType: "school", billingToCode: importedCode,
    shippingToType: "school", shippingToCode: importedCode
  }, ambiguousItems: [{ ...itemRef, groupedQuantity: 2 }] }));
  const importedOrder = await createOrder(individual(importedCode));
  await updateOrderStatus(importedOrder.orderSheet1Id, "cancelled");
  assert.equal((await currentOrganisation(imported.organisation.prCode)).ptCode, importedCode);
  await updateOrderStatus(headerOrder.orderSheet1Id, "cancelled");
  assert.equal((await currentOrganisation(imported.organisation.prCode)).ptCode, null);
  assert.equal((await prisma.orderSheet1.findUniqueOrThrow({ where: { orderSheet1Id: headerOrder.orderSheet1Id } })).billingToCode, importedCode);

  // Only the eligible member of a pooled order reverts.
  const a = await school();
  const b = await school();
  const pooled = await createOrder(createOrderSchema.parse({ sheet1: { ...sheet1, descriptiveMode: "multiple_schools" },
    combinedSchools: [a, b].map(row => ({ schoolCode: row.organisation.prCode, schoolName: row.school.schoolName })),
    combinedItems: [{ ...itemRef, pooledQuantity: 5 }]
  }));
  const bCode = (await currentOrganisation(b.organisation.prCode)).ptCode!;
  const ambiguous = await createOrder(createOrderSchema.parse({ sheet1: { ...sheet1, orderType: "ambiguous" },
    ambiguousItems: [{ ...itemRef, groupedQuantity: 1 }]
  }));
  // Historical school links still retain PT; new ambiguous submissions cannot add them.
  await prisma.orderSheet2B1.create({ data: {
    orderSheet1Id: ambiguous.orderSheet1Id, orderNo: ambiguous.orderNo,
    schoolCode: bCode, schoolName: b.school.schoolName
  } });
  await updateOrderStatus(pooled.orderSheet1Id, "cancelled");
  assert.equal((await currentOrganisation(a.organisation.prCode)).ptCode, null);
  assert.equal((await currentOrganisation(b.organisation.prCode)).ptCode, bCode);
  await updateOrderStatus(ambiguous.orderSheet1Id, "cancelled");
  assert.equal((await currentOrganisation(b.organisation.prCode)).ptCode, null);

  // GS membership and the school ID survive cancellation and re-promotion.
  const gs = await prisma.schoolGroup.create({ data: { groupCode: `GS${suffix}`, groupName: "Cancellation GS", sourceType: "GS" } });
  const member = await school();
  await prisma.organisation.update({ where: { id: member.organisation.id }, data: { groupCode: gs.groupCode } });
  await prisma.schoolGroupSchool.create({ data: { ptCode: member.organisation.prCode } });
  const gsInput = createOrderSchema.parse({ sheet1: { ...sheet1, descriptiveMode: "multiple_group", endUserGroupCode: gs.groupCode },
    combinedSchools: [{ schoolCode: member.organisation.prCode, schoolName: member.school.schoolName }],
    combinedItems: [{ ...itemRef, pooledQuantity: 3 }] });
  const gsOrder = await createOrder(gsInput);
  const gsPt = gsOrder.combinedSchools[0].schoolCode;
  await updateOrderStatus(gsOrder.orderSheet1Id, "cancelled");
  assert.equal((await currentOrganisation(member.organisation.prCode)).ptCode, null);
  assert.equal((await currentOrganisation(member.organisation.prCode)).groupCode, gs.groupCode);
  assert.ok((await getGroupMappingData(member.organisation.prCode)).organisationByPtCode.get(member.organisation.prCode));
  const gsAgain = await createOrder(gsInput);
  assert.notEqual(gsAgain.combinedSchools[0].schoolCode, gsPt);
  assert.equal((await prisma.school.findUniqueOrThrow({ where: { schoolCode: gsAgain.combinedSchools[0].schoolCode } })).schoolId, member.school.schoolId);

  // A legacy participant snapshot keeps PT even without sheet-2 school rows.
  const direct = await school(true);
  const directCode = direct.organisation.ptCode!;
  const ordinary = await createOrder(individual(directCode));
  const snapshot = await prisma.orderSheet1.create({ data: {
    orderNo: -Number(suffix.slice(-8)), orderPlacedDate: new Date("2026-10-22"),
    billingToType: "individual", billingToName: "Legacy", shippingToType: "individual", shippingToName: "Legacy", shippingToSummary: "Test",
    orderType: "descriptive", classification: "direct_group",
    groupParticipants: { create: { ptCode: directCode, schoolName: "Legacy participant" } }
  } });
  await updateOrderStatus(ordinary.orderSheet1Id, "cancelled");
  assert.equal((await currentOrganisation(direct.organisation.prCode)).ptCode, directCode);
  await updateOrderStatus(snapshot.orderSheet1Id, "cancelled");
  assert.equal((await currentOrganisation(direct.organisation.prCode)).ptCode, null);

  // Duplicate school and organisation codes abort the whole cancellation.
  const duplicate = await school(true);
  const duplicateOrder = await createOrder(individual(duplicate.organisation.ptCode!));
  const duplicatePrSchool = await prisma.school.create({ data: { schoolCode: duplicate.organisation.prCode, schoolName: "Duplicate" } });
  await assert.rejects(() => updateOrderStatus(duplicateOrder.orderSheet1Id, "cancelled"), /duplicate schools/);
  assert.equal((await prisma.orderSheet1.findUniqueOrThrow({ where: { orderSheet1Id: duplicateOrder.orderSheet1Id } })).orderStatus, "draft");
  assert.equal((await currentOrganisation(duplicate.organisation.prCode)).ptCode, duplicate.organisation.ptCode);
  await prisma.school.delete({ where: { schoolId: duplicatePrSchool.schoolId } });
  const duplicateOrganisation = await school();
  await prisma.organisation.update({ where: { id: duplicateOrganisation.organisation.id }, data: { ptCode: duplicate.organisation.ptCode } });
  await assert.rejects(() => updateOrderStatus(duplicateOrder.orderSheet1Id, "cancelled"), /multiple organisations/);
  await prisma.organisation.update({ where: { id: duplicateOrganisation.organisation.id }, data: { ptCode: null } });
  await updateOrderStatus(duplicateOrder.orderSheet1Id, "cancelled");

  // Concurrent last-order cancellations serialize and restore PR once.
  const concurrent = await school(true);
  const concurrentCode = concurrent.organisation.ptCode!;
  const c1 = await createOrder(individual(concurrentCode));
  const c2 = await createOrder(individual(concurrentCode));
  await Promise.all([updateOrderStatus(c1.orderSheet1Id, "cancelled"), updateOrderStatus(c2.orderSheet1Id, "cancelled")]);
  assert.equal((await currentOrganisation(concurrent.organisation.prCode)).ptCode, null);

  // A simultaneous new order either preserves PT or rejects a stale selection.
  const racing = await school(true);
  const racingCode = racing.organisation.ptCode!;
  const old = await createOrder(individual(racingCode));
  const [cancellation, creation] = await Promise.allSettled([
    updateOrderStatus(old.orderSheet1Id, "cancelled"), createOrder(individual(racingCode))
  ]);
  assert.equal(cancellation.status, "fulfilled");
  if (creation.status === "fulfilled") {
    assert.equal((await currentOrganisation(racing.organisation.prCode)).ptCode, racingCode);
  } else {
    assert.match(String(creation.reason), /changed or no longer exists/);
    assert.equal((await currentOrganisation(racing.organisation.prCode)).ptCode, null);
  }
  console.log("Passed cancellation reversal: regular/held, other orders, imported PT, history, links, pooled/ambiguous/GS/legacy participants, re-promotion, duplicate rollback, concurrent cancellations and creation.");
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());

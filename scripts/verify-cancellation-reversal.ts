import { asSchool, findSchoolByCode } from "../lib/school-reference";
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
  assert.ok(["/order_revamp_verify", "/school_consolidation_verify"].includes(url.pathname));
  require("next/cache").revalidatePath = () => {};
  const { createOrder, updateOrderStatus, lockOrder, finalizeOrder, putOrderOnHold } = await import("../lib/services/orders");
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
    const school = asSchool(organisation);
    return { organisation, school };
  }
  const individual = (schoolCode: string) => createOrderSchema.parse({
    sheet1, descriptiveRows: [{ schoolCode, schoolName: "Verification school", ...itemRef, quantity: 2 }]
  });
  const currentOrganisation = (prCode: string) => prisma.organisation.findUniqueOrThrow({ where: { prCode } });

  const first = await school();
  await prisma.vendorSchool.create({ data: { vendorId: vendor.vendorId, organisationId: first.organisation.id } });
  await prisma.schoolGroupSchool.create({ data: { ptCode: first.organisation.prCode } });
  const firstOrder = await createOrder(individual(first.organisation.prCode));
  const ptCode = firstOrder.descriptiveRows[0].schoolCode;
  assert.match(ptCode, /^PT\d+$/);
  const secondOrder = await createOrder(individual(ptCode));
  await updateOrderStatus(firstOrder.orderSheet1Id, "cancelled");
  assert.equal((await currentOrganisation(first.organisation.prCode)).ptCode, ptCode);
  await updateOrderStatus(secondOrder.orderSheet1Id, "cancelled");
  assert.equal((await currentOrganisation(first.organisation.prCode)).ptCode, null);
  assert.equal(asSchool(await prisma.organisation.findUniqueOrThrow({ where: { id: first.organisation.id } })).schoolCode, first.organisation.prCode);
  assert.equal(await prisma.vendorSchool.count({ where: { organisationId: first.organisation.id, vendorId: vendor.vendorId } }), 1);
  assert.ok(await prisma.schoolGroupSchool.findUnique({ where: { ptCode: first.organisation.prCode } }));
  assert.equal((await prisma.orderSheet2A.findFirstOrThrow({ where: { orderSheet1Id: firstOrder.orderSheet1Id } })).schoolCode, ptCode);
  await updateOrderStatus(firstOrder.orderSheet1Id, "cancelled");
  await assert.rejects(() => lockOrder(firstOrder.orderSheet1Id), /cancelled/);
  await assert.rejects(() => createOrder(individual(ptCode)), /changed or no longer exists/);
  const nextOrder = await createOrder(individual(first.organisation.prCode));
  assert.notEqual(nextOrder.descriptiveRows[0].schoolCode, ptCode);
  assert.ok(await prisma.schoolGroupSchool.findUnique({ where: { ptCode: nextOrder.descriptiveRows[0].schoolCode } }));

  // Finalized orders retain their status and school codes, including while on hold.
  await lockOrder(nextOrder.orderSheet1Id);
  await finalizeOrder(nextOrder.orderSheet1Id);
  await assert.rejects(() => updateOrderStatus(nextOrder.orderSheet1Id, "cancelled"), /Finalized orders cannot be changed/);
  await putOrderOnHold(nextOrder.orderSheet1Id);
  await assert.rejects(() => updateOrderStatus(nextOrder.orderSheet1Id, "cancelled"), /Finalized orders cannot be changed/);
  assert.equal((await prisma.orderSheet1.findUniqueOrThrow({ where: { orderSheet1Id: nextOrder.orderSheet1Id } })).orderStatus, "finalized");
  assert.equal((await prisma.orderSheet3.findFirstOrThrow({ where: { orderSheet1Id: nextOrder.orderSheet1Id } })).cancelOrOnHoldStatus, "on_hold");
  assert.equal((await currentOrganisation(first.organisation.prCode)).ptCode, nextOrder.descriptiveRows[0].schoolCode);

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
  const ambiguous = await createOrder(createOrderSchema.parse({ sheet1: { ...sheet1, orderType: "ambiguous", billingToType: "school", billingToCode: bCode, billingToName: b.school.schoolName },
    ambiguousItems: [{ ...itemRef, groupedQuantity: 1 }]
  }));
  // A school billing reference on another order retains PT.
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
  assert.equal((await findSchoolByCode(prisma, gsAgain.combinedSchools[0].schoolCode))?.id, member.organisation.id);

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

  // The database rejects duplicate PT ownership before it can corrupt cancellation.
  const duplicate = await school(true);
  const duplicateOrganisation = await school();
  await assert.rejects(() => prisma.organisation.update({
    where: { id: duplicateOrganisation.organisation.id }, data: { ptCode: duplicate.organisation.ptCode }
  }), /Unique constraint/);

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
  console.log("Passed cancellation reversal: regular, finalized/held protection, other orders, imported PT, history, links, pooled/ambiguous/GS/legacy participants, re-promotion, duplicate rollback, concurrent cancellations and creation.");
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());

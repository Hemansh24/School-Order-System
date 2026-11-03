import assert from "node:assert/strict";
import { prisma } from "../lib/prisma";
import { asSchool, findSchoolByCode } from "../lib/school-reference";
import { upsertImportedOrganisation } from "../lib/services/organisation-import";
import { deleteOrganisation } from "../lib/services/organisations";
import { createOrReuseSchool } from "../lib/services/schools";
import { createOrderSchema } from "../lib/validation/orders";

async function main() {
  const url = new URL(process.env.DATABASE_URL ?? "");
  assert.equal(url.hostname, "127.0.0.1");
  assert.equal(url.port, "55439");
  assert.equal(url.pathname, "/school_consolidation_verify");
  require("next/cache").revalidatePath = () => {};
  const { createOrder, updateOrderStatus } = await import("../lib/services/orders");
  const item = await prisma.item.findFirstOrThrow();
  const vendor = await prisma.vendor.findFirstOrThrow();
  const name = `Organisation consolidation ${Date.now()}`;
  const created = await createOrReuseSchool({ schoolName: name, address: "Road", contactPerson: "Local contact" });
  const reused = await createOrReuseSchool({ schoolName: name, address: "Road" });
  assert.equal(reused.created, false);
  assert.equal(created.school.organisationId, reused.school.organisationId);
  const id = BigInt(created.school.organisationId);
  const org = await prisma.organisation.update({ where: { id }, data: { legacySchoolCodes: [`LEGACY-${id}`] } });
  const link = await prisma.vendorSchool.create({ data: { vendorId: vendor.vendorId, organisationId: id } });
  const input = createOrderSchema.parse({
    sheet1: { orderPlacedDate: "2026-11-02", orderType: "descriptive", descriptiveMode: "individual",
      billingToType: "school", billingToCode: org.prCode, billingToName: name,
      shippingToType: "school", shippingToCode: org.prCode, shippingToName: name, shippingToSummary: "Road",
      commissionEnabled: true, commissionPartyType: "school", commissionPartyCode: org.prCode, commissionPercentage: 5 },
    descriptiveRows: [{ schoolCode: `LEGACY-${id}`, schoolName: name, itemCode: item.itemCode, itemName: item.itemName, quantity: 2 }]
  });
  const orders = await Promise.all([createOrder(input), createOrder(input)]);
  const ptCode = orders[0].descriptiveRows[0].schoolCode;
  assert.match(ptCode, /^PT\d+$/);
  assert.equal(orders[1].descriptiveRows[0].schoolCode, ptCode, "Concurrent allocations reuse the same PT");
  assert.equal(orders[0].shippingToCode, ptCode);
  assert.equal(orders[0].commissionPartyCode, ptCode);
  await assert.rejects(deleteOrganisation(id), /bookseller links/);
  assert.equal((await findSchoolByCode(prisma, org.prCode))?.id, id);
  assert.equal((await findSchoolByCode(prisma, ptCode))?.id, id);
  assert.equal((await findSchoolByCode(prisma, `LEGACY-${id}`))?.id, id);

  const importRow = { prCode: org.prCode, organisationName: `${name} updated`, ptCode: null };
  for (let i = 0; i < 2; i++) {
    await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(741024)`;
      const imported = await upsertImportedOrganisation(tx, importRow);
      assert.equal(imported.id, id);
      assert.equal(imported.ptCode, ptCode);
      assert.equal(imported.contactPerson, "Local contact");
    });
  }
  await assert.rejects(prisma.$transaction(tx => upsertImportedOrganisation(tx, { ...importRow, ptCode: "PT999999999" })), /Cannot reassign/);
  assert.equal((await prisma.vendorSchool.findUniqueOrThrow({ where: { vendorSchoolId: link.vendorSchoolId } })).organisationId, id);
  await assert.rejects(prisma.organisation.delete({ where: { id } }), /foreign key constraint/i);
  await updateOrderStatus(orders[0].orderSheet1Id, "cancelled");
  assert.equal((await prisma.organisation.findUniqueOrThrow({ where: { id } })).ptCode, ptCode);
  await updateOrderStatus(orders[1].orderSheet1Id, "cancelled");
  assert.equal((await prisma.organisation.findUniqueOrThrow({ where: { id } })).ptCode, null);
  assert.equal(await findSchoolByCode(prisma, ptCode), null, "Cancelled PT selection becomes stale");
  assert.equal((await prisma.vendorSchool.findUniqueOrThrow({ where: { vendorSchoolId: link.vendorSchoolId } })).organisationId, id);
  const next = await createOrder(input);
  assert.notEqual(next.descriptiveRows[0].schoolCode, ptCode, "Historical PT remains reserved");
  await prisma.vendorSchool.delete({ where: { vendorSchoolId: link.vendorSchoolId } });
  await assert.rejects(deleteOrganisation(id), /referenced by an order/);
  const unused = await prisma.organisation.create({ data: { prCode: `UNUSED-${id}`, organisationName: "Unused" } });
  await deleteOrganisation(unused.id);
  const mapped = asSchool({ ...org, id: BigInt("9007199254740993") });
  assert.equal(mapped.organisationId, "9007199254740993");
  const tables = await prisma.$queryRaw<Array<{ name: string | null }>>`SELECT to_regclass('public.schools')::text AS name`;
  assert.equal(tables[0].name, null);
  console.log("Passed organisation-only creation/reuse, legacy lookup, concurrent PT allocation, shipping, commission, repeated imports, contact preservation, stable vendor links, cancellation, PT reservation and BigInt serialization.");
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());

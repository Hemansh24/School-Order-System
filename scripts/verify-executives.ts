import assert from "node:assert/strict";
import { prisma } from "../lib/prisma";
import { saveOrderExecutives, getExecutiveReferenceData } from "../lib/services/executives";
import { createOrderSchema } from "../lib/validation/orders";

async function main() {
  const url = new URL(process.env.DATABASE_URL ?? "");
  assert.ok(["localhost", "127.0.0.1"].includes(url.hostname), "Verification requires local Postgres");
  const directory = await prisma.executive.findMany();
  assert.equal(directory.length, 41);
  assert.equal(directory.find(row => row.incumbentCode === "IN21788")?.name, "Akshaya Iyer");
  assert.equal(directory.find(row => row.incumbentCode === "IN00347")?.name, "Pradeep");
  const rollback = new Error("verification rollback");
  await assert.rejects(prisma.$transaction(async tx => {
    const prCode = "PR-EXECUTIVE-VERIFY";
    const ptCode = "PT-EXECUTIVE-VERIFY";
    await tx.organisation.create({ data: { prCode, ptCode, organisationName: "Executive verification" } });
    const order = await tx.orderSheet1.create({ data: {
      orderNo: -270001, orderPlacedDate: new Date("2026-10-27"),
      orderType: "descriptive", billingToType: "individual", billingToName: "Verification",
      shippingToType: "individual", shippingToName: "Verification", shippingToSummary: "Verification"
    } });
    const input = createOrderSchema.parse({ sheet1: { orderPlacedDate: "2026-10-27", orderType: "descriptive", descriptiveMode: "individual",
      billingToType: "individual", billingToName: "Payer", shippingToType: "individual", shippingToName: "Recipient", shippingToSummary: "Address" },
      descriptiveRows: [{ schoolCode: ptCode, schoolName: "School", itemCode: "ITEM", itemName: "Item", quantity: 1 }],
      schoolExecutives: [{ schoolCode: ptCode, incumbentCode: "IN21788", name: "Untrusted submitted name", updateDefault: true }]
    });
    await saveOrderExecutives(tx, order.orderSheet1Id, input);
    const assignment = () => tx.orderSchoolExecutive.findFirstOrThrow({ where: { orderSheet1Id: order.orderSheet1Id } });
    const savedDefault = () => tx.schoolExecutiveDefault.findUnique({ where: { prCode } });
    assert.equal((await assignment()).name, "Akshaya Iyer");
    assert.equal((await savedDefault())?.name, "Akshaya Iyer");
    await tx.executive.update({ where: { incumbentCode: "IN21788" }, data: { name: "Renamed directory entry" } });
    await tx.schoolExecutiveDefault.update({ where: { prCode }, data: { name: "Newer default", incumbentCode: null } });
    input.schoolExecutives![0].updateDefault = false;
    await saveOrderExecutives(tx, order.orderSheet1Id, input);
    assert.equal((await assignment()).name, "Akshaya Iyer", "Saved snapshot survives directory changes");
    assert.equal((await savedDefault())?.name, "Newer default", "Unchanged assignment does not overwrite newer defaults");
    input.schoolExecutives = [{ schoolCode: ptCode, name: "Custom name", incumbentCode: null, updateDefault: true }];
    await saveOrderExecutives(tx, order.orderSheet1Id, input);
    assert.equal((await assignment()).name, "Custom name");
    assert.equal((await savedDefault())?.name, "Custom name");
    // Replacing school masters cannot cascade into PR-keyed defaults.
    await tx.school.create({ data: { schoolCode: ptCode, schoolName: "Temporary school" } });
    await tx.school.delete({ where: { schoolCode: ptCode } });
    await tx.organisation.update({ where: { prCode }, data: { ptCode: null } });
    assert.equal((await savedDefault())?.name, "Custom name");
    input.schoolExecutives = [{ schoolCode: prCode, name: "", incumbentCode: null, updateDefault: true }];
    await saveOrderExecutives(tx, order.orderSheet1Id, input);
    assert.equal(await savedDefault(), null);
    assert.equal(await tx.orderSchoolExecutive.count({ where: { orderSheet1Id: order.orderSheet1Id } }), 0);
    input.schoolExecutives = [{ schoolCode: prCode, name: "Custom", updateDefault: true }];
    await saveOrderExecutives(tx, order.orderSheet1Id, input);
    await saveOrderExecutives(tx, order.orderSheet1Id, { ...input, schoolExecutives: [] });
    assert.equal(await tx.orderSchoolExecutive.count({ where: { orderSheet1Id: order.orderSheet1Id } }), 0);
    assert.equal((await savedDefault())?.name, "Custom", "Removing a participant does not clear its default");
    throw rollback;
  }), error => error === rollback);
  assert.equal(await prisma.organisation.count({ where: { prCode: "PR-EXECUTIVE-VERIFY" } }), 0);
  const reference = await getExecutiveReferenceData();
  assert.equal(reference.executives.length, 41);
  console.log("Passed: 41 imported executives; canonical names, snapshots, custom names, defaults, clear/remove, school refresh and PR/PT identity. Database verification rolled back.");
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());

import { loadEnvConfig } from "@next/env";
import assert from "node:assert/strict";
import { prisma } from "../lib/prisma";
import { createOrderSchema } from "../lib/validation/orders";
import { savedOrderToInput } from "../lib/order-input";
import { reorderDefaults } from "../lib/reorder";

loadEnvConfig(process.cwd());

async function main() {
  const target = new URL(process.env.DATABASE_URL ?? "");
  assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(target.hostname), "Local PostgreSQL required");
  require("next/cache").revalidatePath = () => {};
  const { createOrder, updateOrder, createReorder } = await import("../lib/services/orders");
  const transaction = prisma.$transaction.bind(prisma);
  const rollback = new Error("Verification rollback");
  try {
    await transaction(async tx => {
      // Route service transactions through this outer transaction so all fixtures roll back.
      prisma.$transaction = ((callback: (client: typeof tx) => unknown) => callback(tx)) as typeof prisma.$transaction;
      const executive = await tx.booksellerExecutive.findFirstOrThrow();
      const item = await tx.item.findFirstOrThrow({ where: { active: true, obsolete: false } });
      const input = createOrderSchema.parse({ sheet1: {
        orderPlacedDate: "2026-11-12", orderType: "ambiguous", billingToType: "individual", billingToName: "Verification payer",
        shippingToType: "individual", shippingToName: "Verification recipient", shippingToSummary: "Verification address",
        commissionEnabled: true, commissionPartyType: "bookseller_executive", commissionPartyCode: executive.incumbentCode,
        commissionBooksellerExecutiveId: executive.booksellerExecutiveId, commissionPartyName: "Untrusted", commissionPercentage: 7.5
      }, ambiguousItems: [{ itemCode: item.itemCode, itemName: item.itemName, groupedQuantity: 1 }] });
      const created = await createOrder(input);
      assert.equal(created.commissionPartyName, executive.name);
      assert.equal(created.commissionPbsCode, executive.pbsCode);
      assert.equal(created.commissionBooksellerExecutiveId, executive.booksellerExecutiveId);
      const loaded = await tx.orderSheet1.findUnique({ where: { orderSheet1Id: created.orderSheet1Id },
        include: { schoolExecutives: true, descriptiveRows: true, ambiguousItems: true, combinedSchools: true, combinedItems: true } });
      assert.ok(loaded);
      const edit = savedOrderToInput(loaded);
      await tx.booksellerExecutive.update({ where: { booksellerExecutiveId: executive.booksellerExecutiveId }, data: { name: "Changed directory name" } });
      const updated = await updateOrder(created.orderSheet1Id, { ...edit, sheet1: { ...edit.sheet1, commissionPercentage: 12.5 } });
      assert.equal(updated.commissionPartyName, executive.name);
      assert.equal(updated.commissionPercentage?.toNumber(), 12.5);
      const defaults = reorderDefaults(updated).values;
      assert.equal(defaults.sheet1.commissionPartyName, executive.name);
      const reordered = await createReorder(created.orderSheet1Id, {
        shipping: { shippingToType: "individual", shippingToCode: "", shippingToName: "Reorder recipient", shippingToSummary: "Address", expectedDeliveryDate: "" },
        ambiguousItems: input.ambiguousItems, descriptiveItems: [], combinedItems: []
      });
      assert.equal(reordered.commissionPartyName, executive.name);
      assert.equal(reordered.commissionPbsCode, executive.pbsCode);
      assert.equal(reordered.commissionBooksellerExecutiveId, executive.booksellerExecutiveId);
      assert.equal(reordered.commissionPercentage?.toNumber(), 12.5);
      const manual = await updateOrder(created.orderSheet1Id, { ...edit, sheet1: { ...edit.sheet1, commissionPartyType: "individual", commissionPartyCode: "Manual recipient" } });
      assert.equal(manual.commissionPartyName, null);
      assert.equal(manual.commissionBooksellerExecutiveId, null);
      const cleared = await updateOrder(created.orderSheet1Id, { ...edit, sheet1: { ...edit.sheet1, commissionEnabled: false } });
      assert.equal(cleared.commissionPartyCode, null);
      assert.equal(cleared.commissionPartyName, null);
      assert.equal(cleared.commissionPbsCode, null);
      console.log("Verified create, reload, edit, immutable snapshots, reorder inheritance, manual recipients and clearing.");
      throw rollback;
    }, { timeout: 120000 });
  } catch (error) { if (error !== rollback) throw error; }
  finally { prisma.$transaction = transaction; }
  console.log("Verification fixtures rolled back.");
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());

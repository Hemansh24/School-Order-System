import assert from "node:assert/strict";
import { test } from "node:test";
import type { Prisma } from "@prisma/client";
import type { CreateOrderInput } from "@/lib/validation/orders";
import { assertReorderCustomisation, getReorderCustomisation } from "./reorder-customisation";

const item = (itemCode: string, categoryCode = "diary", customisationCode = "CMS") => ({ itemCode, categoryCode, customisationCode, customisationName: customisationCode });
const order = (codes = ["old"], reorderOfOrderId: number | null = null, pooled = false) => ({
  reorderOfOrderId, orderType: "descriptive", classification: "normal",
  descriptiveRows: pooled ? [] : codes.map(itemCode => ({ itemCode })),
  combinedItems: pooled ? codes.map(itemCode => ({ itemCode })) : []
});
const source = { orderSheet1Id: 2, orderType: "descriptive" };
function database(orders = new Map([[2, order(["later"], 1)], [1, order()]]), items = [item("old"), item("new"), item("later", "notebook", "OTHER")]) {
  return {
    orderSheet1: { findUnique: async ({ where }: { where: { orderSheet1Id: number } }) => orders.get(where.orderSheet1Id) ?? null },
    item: { findMany: async ({ where }: { where: { itemCode: { in: string[] } } }) => items.filter(item => where.itemCode.in.includes(item.itemCode)) }
  } as unknown as Pick<Prisma.TransactionClient, "orderSheet1" | "item">;
}
const values = (codes: string[], pooled = false) => ({
  descriptiveRows: pooled ? [] : codes.map(itemCode => ({ itemCode })),
  combinedItems: pooled ? codes.map(itemCode => ({ itemCode })) : []
}) as CreateOrderInput;

test("chain resolves the first order, ignoring later choices", async () => {
  assert.deepEqual(await getReorderCustomisation(database(), source), { customisationCode: "CMS", customisationName: "CMS", categoryCodes: ["diary"] });
});

test("individual, allocated and pooled reorders validate every item against original choices", async () => {
  for (const pooled of [false, true]) {
    const db = database(new Map([[2, order(["old"], null, pooled)]]), [item("old"), item("new"), item("wrong", "diary", "OTHER"), item("category", "notebook")]);
    await assertReorderCustomisation(db, source, values(["new", "new"], pooled));
    for (const code of ["wrong", "category"]) {
      await assert.rejects(assertReorderCustomisation(db, source, values(["new", code], pooled)), /original order's customisation and categories/);
    }
    await assert.rejects(assertReorderCustomisation(db, source, values(["missing"], pooled)), /no item record/);
  }
});

test("original categories remain available but cannot expand", async () => {
  const db = database(new Map([[2, order(["old", "notebook"])]]), [item("old"), item("notebook", "notebook"), item("newNotebook", "notebook")]);
  assert.deepEqual((await getReorderCustomisation(db, source))?.categoryCodes, ["diary", "notebook"]);
  await assertReorderCustomisation(db, source, values(["newNotebook"]));
});

test("mixed original customisations require separate orders", async () => {
  const db = database(new Map([[2, order(["old", "other"])]]), [item("old"), item("other", "notebook", "OTHER")]);
  await assert.rejects(getReorderCustomisation(db, source), /multiple customisations/);
});

test("missing item metadata, empty originals, missing ancestors and cycles fail clearly", async () => {
  await assert.rejects(getReorderCustomisation(database(undefined, []), source), /Restore their item records/);
  await assert.rejects(getReorderCustomisation(database(undefined, [item("old", "")]), source), /Restore their item records/);
  await assert.rejects(getReorderCustomisation(database(new Map([[2, order([])]])), source), /no items/);
  await assert.rejects(getReorderCustomisation(database(new Map([[2, order(["old"], 1)]])), source), /missing/);
  await assert.rejects(getReorderCustomisation(database(new Map([[2, order(["old"], 2)]])), source), /cycle/);
});

test("ambiguous reorders do not consult history or restrict items", async () => {
  const db = database(new Map());
  const ambiguous = { ...source, orderType: "ambiguous" };
  assert.equal(await getReorderCustomisation(db, ambiguous), null);
  await assertReorderCustomisation(db, ambiguous, values(["anything"]));
});

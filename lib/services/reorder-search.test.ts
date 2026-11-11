import assert from "node:assert/strict";
import { test } from "node:test";
import type { Prisma, PrismaClient } from "@prisma/client";
import { getReorderReminder } from "./reorder-search";

const school = (schoolCode: string) => ({ schoolCode, schoolName: schoolCode });
const source = {
  sessionYear: "2026-2027", billingToCode: "BS1", billingToName: "Bookseller",
  orderType: "descriptive" as const,
  descriptiveRows: [school("PT1"), school("PT2")], combinedSchools: [], groupParticipants: []
};
const candidate = (id: number, codes: string[]) => ({
  orderSheet1Id: id, orderNo: 100 + id, createdAt: new Date("2026-11-11T00:00:00Z"),
  descriptiveRows: codes.map(school), combinedSchools: [], groupParticipants: []
});

function database(findMany: (args: Prisma.OrderSheet1FindManyArgs) => Promise<unknown[]>) {
  return { orderSheet1: { findMany } } as unknown as Pick<PrismaClient, "orderSheet1">;
}

test("reminder queries finalized normal orders and selects the first exact end-user match", async t => {
  const query = t.mock.fn(async (_args: Prisma.OrderSheet1FindManyArgs) => [
    candidate(9, ["PT1"]), candidate(8, ["pt2", "PT1", "PT1"]), candidate(7, ["PT1", "PT2"])
  ]);
  const before = Date.now();
  const result = await getReorderReminder(source, database(query));
  assert.equal(result?.orderId, 8);
  assert.equal(result?.orderNo, 108);
  assert.equal(result?.createdAt, "2026-11-11T00:00:00.000Z");
  assert.ok(Date.parse(result!.checkedAt) >= before && Date.parse(result!.checkedAt) <= Date.now());
  const args = query.mock.calls[0].arguments[0];
  assert.deepEqual(args.where, {
    sessionYear: "2026-2027", billingToCode: { equals: "BS1", mode: "insensitive" },
    orderType: "descriptive", orderStatus: "finalized", classification: "normal"
  });
  assert.deepEqual(args.orderBy, [{ createdAt: "desc" }, { orderSheet1Id: "desc" }]);
});

test("no matching history returns null without falling back to an unrelated order", async t => {
  const db = database(async () => [candidate(9, ["PT9"])]);
  assert.equal(await getReorderReminder(source, db), null);
});

test("uncoded billing parties match by name and null sessions stay null", async t => {
  const query = t.mock.fn(async (_args: Prisma.OrderSheet1FindManyArgs) => []);
  assert.equal(await getReorderReminder({ ...source, sessionYear: null, billingToCode: null }, database(query)), null);
  const where = query.mock.calls[0].arguments[0].where!;
  assert.equal(where.billingToCode, null);
  assert.equal(where.sessionYear, null);
  assert.deepEqual(where.billingToName, { equals: "Bookseller", mode: "insensitive" });
});

test("combined and ambiguous orders use saved participant sets, including an empty set", async t => {
  const db = database(async () => [
    { ...candidate(5, []), groupParticipants: [{ ptCode: "PT2", schoolName: "Two" }], combinedSchools: [school("PT1")] },
    candidate(4, [])
  ]);
  assert.equal((await getReorderReminder({ ...source, orderType: "combined" }, db))?.orderId, 5);
  assert.equal((await getReorderReminder({ ...source, orderType: "ambiguous", descriptiveRows: [] }, db))?.orderId, 4);
});

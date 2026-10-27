import assert from "node:assert/strict";
import test from "node:test";
import type { Prisma } from "@prisma/client";
import { convertGsMemberTx, prepareGsOrder } from "./gs-orders";
import { createOrderSchema, type CreateOrderInput } from "../validation/orders";

const members = [
  { id: 1, prCode: "PR1", ptCode: "PT0001", organisationName: "First school", groupCode: "GS1" },
  { id: 2, prCode: "PR2", ptCode: null, organisationName: "Second school", groupCode: "GS1" }
];
function input(codes: string[]): CreateOrderInput {
  return {
    sheet1: { sessionYear: "", orderPlacedDate: "2026-10-22", orderReceivedDate: "", expectedDeliveryDate: "", billingToType: "individual", billingToCode: "", billingToName: "Payer", shippingToType: "individual", shippingToCode: "", shippingToName: "Recipient", shippingToSummary: "Address", orderType: "descriptive", descriptiveMode: "multiple_group", endUserGroupCode: "GS1", pendingPayment: false },
    descriptiveRows: [], ambiguousSchools: [], ambiguousItems: [],
    combinedSchools: codes.map(schoolCode => ({ schoolCode, schoolName: "Submitted name", notes: "Order note" })),
    combinedItems: [{ itemCode: "ITEM1", itemName: "Book", pooledQuantity: 5 }]
  };
}
function fixture(masterExists = true) {
  const touched: number[] = [];
  const tx = {
    schoolGroup: { findUnique: async () => masterExists ? { active: true, sourceType: "GS", groupCode: "GS1", schoolGroupId: 1 } : null },
    organisation: {
      findMany: async () => members,
      findUniqueOrThrow: async ({ where }: { where: { id: number } }) => { touched.push(where.id); return members.find(member => member.id === where.id)!; }
    },
    school: { findUnique: async () => null, upsert: async () => ({}) },
    schoolGroupSchool: { findMany: async () => [] },
    $queryRaw: async () => []
  } as unknown as Prisma.TransactionClient;
  return { tx, touched };
}
const saved = { schoolGroupId: 1, schoolGroupLocationId: null, endUserGroupCode: "GS1", combinedSchools: members.map(member => ({ schoolCode: member.ptCode ?? member.prCode, schoolName: member.organisationName, notes: null })) };

test("GS creation saves only selected members and leaves excluded PR-only schools untouched", async () => {
  const { tx, touched } = fixture();
  const result = await prepareGsOrder(tx, input(["PR1"]));
  assert.deepEqual(result.combinedSchools, [{ schoolCode: "PT0001", schoolName: "First school", notes: "Order note" }]);
  assert.deepEqual(touched, [1]);
});

test("GS preparation remaps executive assignments alongside selected schools", async () => {
  const { tx } = fixture();
  const result = await prepareGsOrder(tx, { ...input(["PR1"]), schoolExecutives: [{ schoolCode: "PR1", incumbentCode: "IN01", name: "Executive", updateDefault: true }] });
  assert.equal(result.schoolExecutives?.[0].schoolCode, "PT0001");
  assert.equal(result.schoolExecutives?.[0].updateDefault, true);
});

test("GS edits honor deselection and allow current members to be reselected", async () => {
  const { tx } = fixture();
  const result = await prepareGsOrder(tx, input(["PT0001"]), saved);
  assert.deepEqual(result.combinedSchools.map(row => row.schoolCode), ["PT0001"]);
  const reselected = await prepareGsOrder(tx, input(["PT0001"]), { ...saved, combinedSchools: [] });
  assert.equal(reselected.combinedSchools.length, 1);
});

test("GS selections reject unrelated schools", async () => {
  const { tx } = fixture();
  await assert.rejects(() => prepareGsOrder(tx, input(["PT9999"])), /selected GS group/);
});

test("missing GS masters allow deselecting historical participants", async () => {
  const { tx } = fixture(false);
  const result = await prepareGsOrder(tx, input(["PT0001"]), saved);
  assert.deepEqual(result.combinedSchools.map(row => row.schoolCode), ["PT0001"]);
  await assert.rejects(() => prepareGsOrder(tx, input(["PT9999"]), saved), /saved GS group/);
});

test("group orders still require at least one participating school", () => {
  assert.equal(createOrderSchema.safeParse(input([])).success, false);
  assert.equal(createOrderSchema.safeParse(input(["PT0001"])).success, true);
});

function conversionFixture() {
  const organisations = members.map(member => ({ ...member }));
  const writes: string[] = [];
  const state = { active: true, sourceType: "GS", conflict: false };
  const calls: string[] = [];
  const tx = {
    schoolGroup: { findUnique: async () => { calls.push("group"); return { ...state, groupCode: "GS1", schoolGroupId: 1 }; } },
    organisation: {
      findMany: async () => organisations,
      findUniqueOrThrow: async ({ where }: { where: { id: number } }) => organisations.find(member => member.id === where.id)!,
      update: async ({ where, data }: { where: { id: number }; data: { ptCode: string } }) => {
        writes.push("organisation");
        Object.assign(organisations.find(member => member.id === where.id)!, data);
      }
    },
    school: {
      findUnique: async () => state.conflict ? { schoolId: 1 } : null,
      upsert: async () => { writes.push("school"); }
    },
    schoolGroupSchool: { findMany: async () => [] },
    $queryRaw: async (query: TemplateStringsArray) => {
      calls.push(query.join("").includes("pg_advisory") ? "lock" : "reserved");
      return organisations.flatMap(member => member.ptCode ? [{ code: member.ptCode }] : []);
    }
  } as unknown as Prisma.TransactionClient;
  return { tx, organisations, writes, state, calls };
}

test("explicit conversion assigns a PT code, retains PR, and reuses it on retries and order save", async () => {
  const { tx, organisations, writes, calls } = conversionFixture();
  const result = await convertGsMemberTx(tx, " gs1 ", "pr2");
  assert.deepEqual(result, { prCode: "PR2", ptCode: "PT0002", schoolName: "Second school" });
  assert.equal(organisations[1].prCode, "PR2");
  assert.equal(organisations[0].ptCode, "PT0001");
  assert.equal(calls[0], "lock");
  assert.deepEqual(await convertGsMemberTx(tx, "GS1", "PR2"), result);
  const order = await prepareGsOrder(tx, input(["PR2"]));
  assert.equal(order.combinedSchools[0].schoolCode, result.ptCode);
  assert.equal(writes.filter(write => write === "organisation").length, 1);
});

test("explicit conversion rejects unrelated schools and inactive or non-GS groups without writes", async () => {
  const { tx, writes, state } = conversionFixture();
  await assert.rejects(() => convertGsMemberTx(tx, "GS1", "PR999"), /no longer belongs/);
  state.active = false;
  await assert.rejects(() => convertGsMemberTx(tx, "GS1", "PR2"), /active GS group/);
  state.active = true;
  state.sourceType = "CHRISTIAN";
  await assert.rejects(() => convertGsMemberTx(tx, "GS1", "PR2"), /active GS group/);
  assert.deepEqual(writes, []);
});

test("explicit conversion detects school conflicts before assigning a code", async () => {
  const { tx, writes, organisations, state } = conversionFixture();
  state.conflict = true;
  await assert.rejects(() => convertGsMemberTx(tx, "GS1", "PR2"), /Separate school records/);
  assert.equal(organisations[1].ptCode, null);
  assert.deepEqual(writes, []);
});

test("explicit conversion rejects a missing group", async () => {
  const { tx } = fixture(false);
  await assert.rejects(() => convertGsMemberTx(tx, "GS1", "PR2"), /active GS group/);
});

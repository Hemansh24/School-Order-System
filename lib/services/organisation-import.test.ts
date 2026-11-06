import assert from "node:assert/strict";
import { test } from "node:test";
import type { Prisma, PrismaClient } from "@prisma/client";
import { upsertImportedOrganisationsInBatches } from "./organisation-import";

type Row = Prisma.OrganisationUncheckedCreateInput;
type SavedRow = Row & { id: bigint };

function rows(count: number): Row[] {
  return Array.from({ length: count }, (_, index) => ({
    prCode: `PR${index + 1}`,
    organisationName: `School ${index + 1}`,
    ptCode: null
  }));
}

function fixture(initial: SavedRow[] = []) {
  let saved = new Map(initial.map(row => [row.prCode, row]));
  let nextId = BigInt(initial.length + 1);
  const transactions: Array<{ writes: number; committed: boolean }> = [];
  const state = {
    failAt: "",
    get saved() { return saved; },
    transactions,
    db: {
      $transaction: async (
        run: (tx: Prisma.TransactionClient) => Promise<unknown>,
        options: { maxWait: number; timeout: number }
      ) => {
        assert.equal(options.timeout, 120_000);
        const pending = new Map(saved);
        const transaction = { writes: 0, committed: false };
        transactions.push(transaction);
        let locked = false;
        const tx = {
          $queryRaw: async (sql: TemplateStringsArray) => {
            assert.match(sql.join(""), /pg_advisory_xact_lock\(741024\)/);
            locked = true;
          },
          organisation: {
            findUnique: async ({ where }: { where: { prCode: string } }) => {
              assert.ok(locked, "Identity checks must hold the allocation lock");
              return pending.get(where.prCode) ?? null;
            },
            findFirst: async () => null,
            upsert: async ({ where, create, update }: {
              where: { prCode: string }; create: Row; update: Row;
            }) => {
              if (where.prCode === state.failAt) throw new Error("Simulated database failure");
              transaction.writes++;
              // Model a device where processing the full dataset in one transaction expires.
              if (transaction.writes > 100) throw new Error("Transaction expired");
              const existing = pending.get(where.prCode);
              const row = existing
                ? { ...existing, ...update, id: existing.id }
                : { ...create, id: nextId++ };
              pending.set(where.prCode, row);
              return row;
            }
          }
        } as unknown as Prisma.TransactionClient;
        const result = await run(tx);
        saved = pending;
        transaction.committed = true;
        return result;
      }
    } as unknown as Pick<PrismaClient, "$transaction">
  };
  return state;
}

test("large imports commit bounded transactions and report only committed progress", async () => {
  const state = fixture();
  const progress: number[] = [];
  await upsertImportedOrganisationsInBatches(state.db, rows(203), (imported, total) => {
    assert.equal(total, 203);
    assert.equal(state.saved.size, imported);
    assert.ok(state.transactions.at(-1)?.committed);
    progress.push(imported);
  });
  assert.deepEqual(progress, [100, 200, 203]);
  assert.deepEqual(state.transactions.map(tx => tx.writes), [100, 100, 3]);
  assert.equal(state.saved.size, 203);
});

test("failed batch rolls back, stops subsequent batches and supports a safe rerun", async () => {
  const state = fixture();
  state.failAt = "PR102";
  const progress: number[] = [];
  await assert.rejects(
    upsertImportedOrganisationsInBatches(state.db, rows(203), count => progress.push(count)),
    (error: Error) => {
      assert.match(error.message, /PR102.*batch rows 101-200/);
      assert.match(error.message, /100 of 203 rows were committed/);
      assert.match(error.message, /This batch was rolled back/);
      assert.match(error.message, /Simulated database failure/);
      assert.equal((error.cause as Error).message, "Simulated database failure");
      return true;
    }
  );
  assert.deepEqual(progress, [100]);
  assert.equal(state.transactions.length, 2);
  assert.equal(state.saved.size, 100);
  assert.equal(state.saved.has("PR101"), false, "Earlier writes in the failed batch roll back");
  const originalIds = [...state.saved.values()].map(row => row.id);

  state.failAt = "";
  await upsertImportedOrganisationsInBatches(state.db, rows(203));
  assert.equal(state.saved.size, 203);
  assert.deepEqual([...state.saved.values()].slice(0, 100).map(row => row.id), originalIds);
});

test("batch imports preserve local identity, PT codes and contacts and reject PT reassignment", async () => {
  const original = {
    id: BigInt(1), prCode: "PR1", ptCode: "PT123", organisationName: "Old name",
    contactPerson: "Local contact", legacySchoolCodes: ["OLD1"]
  };
  const state = fixture([original]);
  await upsertImportedOrganisationsInBatches(state.db, rows(1));
  assert.deepEqual(state.saved.get("PR1"), { ...original, organisationName: "School 1" });
  await assert.rejects(
    upsertImportedOrganisationsInBatches(state.db, [{ ...rows(1)[0], ptCode: "PT999" }]),
    /Cannot reassign PR1 from PT123 to PT999/
  );
  assert.equal(state.saved.get("PR1")?.ptCode, "PT123");
});

test("empty import does not start transactions or report progress", async () => {
  const state = fixture();
  await upsertImportedOrganisationsInBatches(state.db, [], () => assert.fail("Unexpected progress"));
  assert.equal(state.transactions.length, 0);
});

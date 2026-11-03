import assert from "node:assert/strict";
import { Prisma, PrismaClient } from "@prisma/client";
import { reorderSearchQuery } from "../lib/reorder-search";

const prisma = new PrismaClient();

// CTEs shadow the real tables so these checks never create or change saved orders.
const fixtures = Prisma.sql`WITH order_sheet_1 AS (
  SELECT n AS order_sheet_1_id, n AS order_no, 'normal' AS classification,
    'Common Billing' AS billing_to_name, 'BS1' AS billing_to_code FROM generate_series(1, 25) n
  UNION ALL SELECT 101, 81234, 'normal', 'Unique Payer', 'BS99'
  UNION ALL SELECT 102, 81235, 'group_parent', 'Unique Payer', 'BS99'
  UNION ALL SELECT 103, 81236, 'direct_group', 'Unique Payer', 'BS99'
  UNION ALL SELECT 104, 91, 'normal', '100%_Books', NULL
), order_sheet_2a AS (
  SELECT 101 AS order_sheet_1_id, 'Saint Mary Academy' AS school_name, 'PT10' AS school_code
  UNION ALL SELECT 101, 'Saint Mary Academy', 'PT10'
), order_sheet_2c1 AS (
  SELECT 101 AS order_sheet_1_id, 'Second School' AS school_name, 'PT20' AS school_code
  UNION ALL SELECT 1, 'Old School', 'PT1'
), order_group_participants AS (
  SELECT 101 AS order_sheet_1_id, 'Third School' AS school_name, 'PT30' AS pt_code
)`;

async function search(query: string) {
  const rows = await prisma.$queryRaw<{ orderSheet1Id: number }[]>(Prisma.sql`${fixtures} ${reorderSearchQuery(query)}`);
  return rows.map(row => row.orderSheet1Id);
}

async function main() {
  assert.deepEqual(await search("123"), [101], "partial numeric order number and eligible classification");
  for (const query of ["MARY", "pt10", "second", "PT20", "third", "pt30", "payer", "bs99"]) {
    assert.deepEqual(await search(query), [101], query);
  }
  assert.deepEqual(await search("  mary   BS99  123  "), [101], "terms can match different fields");
  assert.deepEqual(await search("mary missing"), [], "all terms must match");
  assert.deepEqual(await search("old school"), [1], "older orders remain discoverable");
  assert.deepEqual(await search("common"), Array.from({ length: 21 }, (_, index) => 25 - index), "newest first with one extra match for overflow");
  assert.deepEqual(await search("100%_"), [104], "wildcards are literal");
  assert.deepEqual(await search("%"), [104]);
  assert.deepEqual(await search("' OR TRUE --"), [], "input is parameterized");
  assert.deepEqual(await search("   "), []);
  console.log("Reorder search: partial numbers, every school source, billing, combined terms, deduplication, older orders, eligibility, overflow, and literal input passed.");
}

main().finally(() => prisma.$disconnect()).catch(error => { console.error(error); process.exitCode = 1; });

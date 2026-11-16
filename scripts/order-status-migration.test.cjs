require('@next/env').loadEnvConfig(process.cwd());
const test = require('node:test');
const assert = require('node:assert/strict');
const { Client } = require('pg');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

test('status migration preserves orders and converts unfinished states to pending', async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
  await client.connect();
  try {
    await client.query('BEGIN');
    // Isolate both enum types and tables from the application; roll back the whole fixture.
    await client.query('CREATE SCHEMA order_status_migration_test; SET LOCAL search_path TO order_status_migration_test');
    await client.query(`CREATE TYPE "OrderStatus" AS ENUM ('draft', 'pending_confirmation', 'locked', 'finalized', 'cancelled');
      CREATE TABLE order_sheet_1 (order_no INT PRIMARY KEY, order_status "OrderStatus" NOT NULL DEFAULT 'draft');
      INSERT INTO order_sheet_1 VALUES (1,'draft'),(2,'pending_confirmation'),(3,'locked'),(4,'finalized'),(5,'cancelled');`);
    const sql = readFileSync(join(__dirname, '../prisma/migrations/202611140002_order_statuses/migration.sql'), 'utf8')
      .replace(/^BEGIN;\s*/, '').replace(/COMMIT;\s*$/, '');
    await client.query(sql);
    assert.deepEqual((await client.query('SELECT order_no, order_status FROM order_sheet_1 ORDER BY order_no')).rows,
      ['pending','pending','pending','finalized','cancelled'].map((order_status, i) => ({ order_no: i + 1, order_status })));
    await client.query('INSERT INTO order_sheet_1(order_no) VALUES (6)');
    assert.equal((await client.query('SELECT order_status FROM order_sheet_1 WHERE order_no=6')).rows[0].order_status, 'pending');
    assert.deepEqual((await client.query('SELECT unnest(enum_range(NULL::"OrderStatus"))::text AS status')).rows.map(row => row.status),
      ['pending','finalized','dispatched','cancelled']);
  } finally {
    await client.query('ROLLBACK');
    await client.end();
  }
});

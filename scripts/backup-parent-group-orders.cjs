const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { Client } = require('pg');
require('@next/env').loadEnvConfig(process.cwd());

const tables = [
  'order_sheet_1', 'order_sheet_2a', 'order_sheet_2b2', 'order_sheet_2c1',
  'order_sheet_2c2', 'order_sheet_3', 'order_school_executives',
  'order_group_participants', 'order_group_items'
];
const parentIdsQuery = "SELECT order_sheet_1_id FROM order_sheet_1 WHERE classification = 'group_parent'";
const pointer = path.resolve('tmp/parent-group-removal-backup-path.txt');
const client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });

async function jsonRows(table, where = '') {
  // Table names are from the fixed allowlist above, not user input.
  return (await client.query(`SELECT coalesce(json_agg(row_data ORDER BY row_data::text), '[]'::json)::text AS data FROM (SELECT row_to_json(t) AS row_data FROM "${table}" t ${where}) rows`)).rows[0].data;
}

async function fingerprints(parentIds) {
  const result = {};
  for (const table of tables) {
    const data = await jsonRows(table, parentIds.length ? `WHERE order_sheet_1_id NOT IN (${parentIds.map(Number).join(',')})` : '');
    result[table] = { count: JSON.parse(data).length, sha256: createHash('sha256').update(data).digest('hex') };
  }
  return result;
}

async function main() {
  await client.connect();
  await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  const target = (await client.query('SELECT current_database() AS database, inet_server_addr()::text AS server, inet_server_port() AS port')).rows[0];
  if (process.argv[2] === 'verify') {
    const directory = fs.readFileSync(pointer, 'utf8').trim();
    const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
    assert.deepEqual(target, manifest.target, 'Database target changed');
    assert.equal((await client.query("SELECT to_regclass('public.order_group_child_orders') AS table_name")).rows[0].table_name, null);
    assert.equal((await client.query(`SELECT count(*)::int AS count FROM order_sheet_1 WHERE classification = 'group_parent'`)).rows[0].count, 0);
    assert.deepEqual(await fingerprints(manifest.parentIds), manifest.preserved, 'Preserved order data changed');
    await client.query('COMMIT');
    console.log(JSON.stringify({ verified: true, preserved: manifest.preserved, backup: directory }, null, 2));
    return;
  }
  assert.equal(process.argv[2], 'backup', 'Use backup or verify');
  const parentIds = (await client.query(parentIdsQuery)).rows.map(row => row.order_sheet_1_id);
  const directory = path.resolve('backups', `parent-group-removal-${new Date().toISOString().replace(/[:.]/g, '-')}`);
  fs.mkdirSync(directory, { recursive: true });
  for (const table of tables) {
    const parentData = await jsonRows(table, `WHERE order_sheet_1_id IN (${parentIdsQuery})`);
    if (!['order_sheet_1', 'order_school_executives'].includes(table)) {
      assert.equal(JSON.parse(parentData).length, 0, `Parent has real data in ${table}; inspect before deletion`);
    }
    fs.writeFileSync(path.join(directory, `${table}.json`), parentData);
  }
  const links = await jsonRows('order_group_child_orders');
  fs.writeFileSync(path.join(directory, 'order_group_child_orders.json'), links);
  const manifest = { createdAt: new Date().toISOString(), target, parentIds, linkCount: JSON.parse(links).length, preserved: await fingerprints(parentIds) };
  fs.writeFileSync(path.join(directory, 'manifest.json'), JSON.stringify(manifest, null, 2));
  await client.query('COMMIT');
  fs.mkdirSync(path.dirname(pointer), { recursive: true });
  fs.writeFileSync(pointer, directory);
  console.log(JSON.stringify({ backup: directory, parentCount: parentIds.length, linkCount: manifest.linkCount, preserved: manifest.preserved }, null, 2));
}

main().catch(async error => {
  await client.query('ROLLBACK').catch(() => {});
  console.error(error.message);
  process.exitCode = 1;
}).finally(() => client.end());

require('@next/env').loadEnvConfig(process.cwd());
const { Client } = require('pg');
const { mkdir, writeFile } = require('node:fs/promises');
const assert = require('node:assert/strict');

async function main() {
  const target = new URL(process.env.DATABASE_URL);
  assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(target.hostname), 'Deduplication requires local PostgreSQL.');
  const client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query('LOCK TABLE bookseller_executives IN SHARE ROW EXCLUSIVE MODE');
    const rows = (await client.query('SELECT * FROM bookseller_executives ORDER BY source_sheet_row, bookseller_executive_id')).rows;
    const firstByCode = new Map();
    const removed = [];
    for (const row of rows) {
      if (firstByCode.has(row.incumbent_code)) removed.push(row);
      else firstByCode.set(row.incumbent_code, row);
    }
    const retained = [...firstByCode.values()];
    const apply = process.argv.includes('--apply');
    console.log(JSON.stringify({ mode: apply ? 'apply' : 'preview', before: rows.length, removed: removed.length, retained: retained.length }));
    if (!apply || !removed.length) { await client.query('ROLLBACK'); return; }

    const backupDir = `tmp/bookseller-executive-dedupe-${new Date().toISOString().replace(/[:.]/g, '-')}`;
    await mkdir(backupDir, { recursive: true });
    const affectedCodes = new Set(removed.map(row => row.incumbent_code));
    await writeFile(`${backupDir}/affected-rows.json`, JSON.stringify({
      database: target.pathname.slice(1), rule: 'First source_sheet_row, then bookseller_executive_id per incumbent_code',
      kept: retained.filter(row => affectedCodes.has(row.incumbent_code)), deleted: removed
    }, null, 2));

    const result = await client.query('DELETE FROM bookseller_executives WHERE bookseller_executive_id = ANY($1::int[])', [removed.map(row => row.bookseller_executive_id)]);
    assert.equal(result.rowCount, removed.length);
    const saved = (await client.query('SELECT * FROM bookseller_executives ORDER BY source_sheet_row, bookseller_executive_id')).rows;
    assert.deepEqual(saved, retained, 'Retained rows must match their original first instances in every field.');
    assert.equal(new Set(saved.map(row => row.incumbent_code)).size, saved.length);
    await client.query('COMMIT');
    console.log(JSON.stringify({ verifiedRows: saved.length, backupDir }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { await client.end(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });

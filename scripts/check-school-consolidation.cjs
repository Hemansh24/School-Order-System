// Preview runs the actual migration in a transaction and always rolls it back.
// --backup additionally creates a full pg_dump before a separately run migrate deploy.
require('@next/env').loadEnvConfig(process.cwd());
const { Client } = require('pg');
const { readFileSync, mkdirSync, writeFileSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const { join } = require('node:path');
const migrationPath = join(__dirname, '../prisma/migrations/202611020001_organisation_school_master/migration.sql');
const migration = readFileSync(migrationPath, 'utf8').replace(/^BEGIN;\s*/, '').replace(/COMMIT;\s*$/, '');

async function orderDigests(client) {
  const tables = (await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'order_%' ORDER BY tablename")).rows;
  const digests = {};
  for (const { tablename } of tables) {
    if (!/^order_[a-z0-9_]+$/.test(tablename)) throw new Error('Unexpected order table name.');
    digests[tablename] = (await client.query(`SELECT md5(string_agg(row_to_json(t)::text,'' ORDER BY row_to_json(t)::text)) AS digest FROM "${tablename}" t`)).rows[0].digest;
  }
  return digests;
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
  await client.connect();
  try {
    if (!(await client.query("SELECT to_regclass('public.schools') AS table_name")).rows[0].table_name) {
      console.log('Already consolidated: public.schools does not exist.'); return;
    }
    if (process.argv.includes('--backup')) {
      const url = new URL(process.env.DATABASE_URL);
      const dir = join(process.cwd(), 'backups', `school-consolidation-${new Date().toISOString().replace(/[:.]/g, '-')}`);
      mkdirSync(dir, { recursive: true });
      const result = spawnSync('pg_dump', ['--format=custom', '--file', join(dir, 'database.dump'),
        '--host', url.hostname, '--port', url.port || '5432', '--username', decodeURIComponent(url.username),
        '--dbname', decodeURIComponent(url.pathname.slice(1))], {
        env: { ...process.env, PGPASSWORD: decodeURIComponent(url.password) }, encoding: 'utf8'
      });
      if (result.error || result.status !== 0) throw new Error(`Database backup failed: ${result.error?.message ?? result.stderr}`);
      console.log(`Full database backup: ${dir}`);
      // Preserve differing nonempty values for review and rollback.
      const differences = await client.query(`SELECT s.school_id, s.school_code, o.id::text organisation_id,
        row_to_json(s) school_record, row_to_json(o) organisation_record
        FROM schools s JOIN organisations o ON s.school_code = o.pr_code OR s.school_code = o.pt_code
        WHERE ROW(s.school_name,s.address,s.district,s.state,s.pincode,s.phone,s.email)
          IS DISTINCT FROM ROW(o.organisation_name,o.address,o.district,o.state,o.pin_code,o.phone,o.email)`);
      writeFileSync(join(dir, 'differences.json'), JSON.stringify(differences.rows, null, 2));
    }
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '10s'");
    await client.query("SET LOCAL statement_timeout = '180s'");
    const before = (await client.query(`SELECT (SELECT count(*)::int FROM schools) schools,
      (SELECT count(*)::int FROM organisations) organisations,
      (SELECT count(*)::int FROM vendor_schools) links,
      (SELECT count(*)::int FROM order_sheet_1) orders`)).rows[0];
    const snapshots = await orderDigests(client);
    await client.query(`CREATE TEMP TABLE original_vendor_links ON COMMIT DROP AS
      SELECT vendor_id, school_id FROM vendor_schools`);
    await client.query(migration);
    const after = (await client.query(`SELECT (SELECT count(*)::int FROM organisations) organisations,
      (SELECT count(*)::int FROM vendor_schools) links,
      (SELECT count(*)::int FROM order_sheet_1) orders,
      (SELECT sum(cardinality(legacy_school_ids))::int FROM organisations) migrated_schools,
      (SELECT count(*)::int FROM original_vendor_links l WHERE NOT EXISTS
        (SELECT 1 FROM vendor_schools v JOIN organisations o ON o.id = v.organisation_id
         WHERE v.vendor_id = l.vendor_id AND l.school_id = ANY(o.legacy_school_ids))) lost_links`)).rows[0];
    if (after.migrated_schools !== before.schools || after.lost_links || after.orders !== before.orders) {
      throw new Error('Migration reconciliation failed.');
    }
    if (JSON.stringify(snapshots) !== JSON.stringify(await orderDigests(client))) throw new Error('Order snapshots changed.');
    console.log(JSON.stringify({ before, after, result: 'PASS; preview rolled back' }, null, 2));
  } finally {
    await client.query('ROLLBACK').catch(() => {});
    await client.end();
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });

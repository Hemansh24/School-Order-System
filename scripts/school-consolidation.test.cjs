require('@next/env').loadEnvConfig(process.cwd());
const test = require('node:test');
const assert = require('node:assert/strict');
const { Client } = require('pg');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const sql = readFileSync(join(__dirname, '../prisma/migrations/202611020001_organisation_school_master/migration.sql'), 'utf8')
  .replace(/^BEGIN;\s*/, '').replace(/COMMIT;\s*$/, '');

async function fixture(run) {
  const client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
  await client.connect();
  try {
    await client.query('BEGIN');
    // Temp tables shadow production names; every fixture is rolled back.
    await client.query(`CREATE TEMP TABLE organisations (id BIGSERIAL PRIMARY KEY, pr_code TEXT UNIQUE NOT NULL,
      pt_code TEXT, organisation_name TEXT NOT NULL, address TEXT, district TEXT, state TEXT, pin_code TEXT,
      phone TEXT, email TEXT, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());
      CREATE TEMP TABLE schools (school_id SERIAL PRIMARY KEY, school_code TEXT UNIQUE NOT NULL,
      school_name TEXT NOT NULL, address TEXT, district TEXT, state TEXT, pincode TEXT,
      contact_person TEXT, phone TEXT, email TEXT, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());
      CREATE TEMP TABLE vendor_schools(vendor_school_id SERIAL PRIMARY KEY, vendor_id INT NOT NULL,
      school_id INT NOT NULL REFERENCES schools(school_id), UNIQUE(vendor_id,school_id));`);
    await run(client);
  } finally {
    await client.query('ROLLBACK'); await client.end();
  }
}

test('consolidates PR/PT duplicates, preserves contact data, unmatched schools, aliases and vendor links', async () => fixture(async c => {
  await c.query(`INSERT INTO organisations(pr_code,pt_code,organisation_name,address) VALUES
    ('PR1','PT0001','Master','Authoritative'), ('PR2',NULL,'Identity school','Road');
    INSERT INTO schools(school_code,school_name,address,contact_person,phone) VALUES
    ('PR1','Old master','Old address','Contact','111'), ('PT0001','Master','Authoritative',NULL,NULL),
    ('LEGACY','Identity school','Road',NULL,'222'), ('PT0009','Unmatched',NULL,'Local contact',NULL),
    ('PR7','PR only',NULL,NULL,NULL);
    INSERT INTO vendor_schools(vendor_id,school_id) VALUES (1,1),(1,2),(2,3),(3,4),(4,5);`);
  await c.query(sql);
  const orgs = (await c.query('SELECT * FROM organisations ORDER BY id')).rows;
  assert.equal(orgs.length, 4);
  assert.equal(orgs[0].address, 'Authoritative');
  assert.equal(orgs[0].contact_person, 'Contact');
  assert.equal(orgs[0].phone, '111');
  assert.deepEqual(orgs[0].legacy_school_ids, [1, 2]);
  assert.deepEqual(orgs[1].legacy_school_codes, ['LEGACY']);
  assert.equal(orgs[2].pt_code, 'PT0009');
  assert.equal(orgs[2].contact_person, 'Local contact');
  assert.equal(orgs[3].pr_code, 'PR7');
  assert.equal((await c.query('SELECT count(*)::int n FROM vendor_schools')).rows[0].n, 4);
  assert.equal((await c.query("SELECT to_regclass('pg_temp.schools') AS t")).rows[0].t, null);
  await c.query('SAVEPOINT deletion');
  await assert.rejects(c.query('DELETE FROM organisations WHERE id = $1', [orgs[0].id]), /foreign key/);
  await c.query('ROLLBACK TO SAVEPOINT deletion');
}));

for (const scenario of [
  { name: 'duplicate PT codes', setup: "INSERT INTO organisations(pr_code,pt_code,organisation_name) VALUES ('PR1','PT1','One'),('PR2',' pt1 ','Two')", error: /Duplicate PT/ },
  { name: 'ambiguous identity', setup: "INSERT INTO organisations(pr_code,organisation_name) VALUES ('PR1','Same'),('PR2','Same'); INSERT INTO schools(school_code,school_name) VALUES ('OLD','Same')", error: /Ambiguous/ },
  { name: 'conflicting PT reassignment', setup: "INSERT INTO organisations(pr_code,pt_code,organisation_name) VALUES ('PR1','PT1','Same'); INSERT INTO schools(school_code,school_name) VALUES ('PT2','Same')", error: /conflicts/ },
  { name: 'cross-owned PR/PT codes', setup: "INSERT INTO organisations(pr_code,pt_code,organisation_name) VALUES ('PR1','PT1','One'),('PT1',NULL,'Two'); INSERT INTO schools(school_code,school_name) VALUES ('PT1','One')", error: /multiple organisations/ }
]) test(`rejects ${scenario.name} atomically`, async () => fixture(async c => {
  await c.query(scenario.setup);
  await c.query('SAVEPOINT migration');
  await assert.rejects(c.query(sql), scenario.error);
  await c.query('ROLLBACK TO SAVEPOINT migration');
  assert.ok((await c.query("SELECT to_regclass('pg_temp.schools') AS t")).rows[0].t);
  assert.equal((await c.query("SELECT count(*)::int n FROM information_schema.columns WHERE table_schema LIKE 'pg_temp_%' AND table_name='organisations' AND column_name='contact_person'")).rows[0].n, 0);
}));

BEGIN;
-- Stop all school-master writers during this coordinated application cutover.
SELECT pg_advisory_xact_lock(741024);
LOCK TABLE organisations, schools, vendor_schools IN ACCESS EXCLUSIVE MODE;

ALTER TABLE organisations
  ADD COLUMN contact_person TEXT,
  ADD COLUMN legacy_school_ids INTEGER[] NOT NULL DEFAULT '{}',
  ADD COLUMN legacy_school_codes TEXT[] NOT NULL DEFAULT '{}';

-- A PT code must identify exactly one organisation, including case/space variants.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM organisations WHERE nullif(trim(pt_code), '') IS NOT NULL
    GROUP BY lower(trim(pt_code)) HAVING count(*) > 1) THEN
    RAISE EXCEPTION 'Duplicate PT codes in organisations. Resolve them before consolidation.';
  END IF;
END $$;
UPDATE organisations SET pt_code = NULL WHERE trim(pt_code) = '';
CREATE UNIQUE INDEX organisations_pt_code_key ON organisations(pt_code);
CREATE INDEX idx_organisations_legacy_codes ON organisations USING GIN(legacy_school_codes);
CREATE INDEX idx_organisations_legacy_ids ON organisations USING GIN(legacy_school_ids);

CREATE TEMP TABLE school_organisation_map (
  school_id INTEGER PRIMARY KEY, organisation_id BIGINT NOT NULL
) ON COMMIT DROP;
CREATE TEMP TABLE organisation_code_candidates ON COMMIT DROP AS
  SELECT id, lower(trim(pr_code)) AS code FROM organisations
  UNION SELECT id, lower(trim(pt_code)) FROM organisations WHERE pt_code IS NOT NULL;
CREATE INDEX ON organisation_code_candidates(code);

DO $$ BEGIN
  IF EXISTS (SELECT s.school_id FROM schools s JOIN organisation_code_candidates c
    ON c.code = lower(trim(s.school_code)) GROUP BY s.school_id HAVING count(DISTINCT c.id) > 1) THEN
    RAISE EXCEPTION 'A school code matches multiple organisations. Resolve conflicting PR/PT ownership.';
  END IF;
END $$;
INSERT INTO school_organisation_map
SELECT s.school_id, min(c.id) FROM schools s JOIN organisation_code_candidates c
  ON c.code = lower(trim(s.school_code)) GROUP BY s.school_id;

CREATE TEMP TABLE organisation_identities ON COMMIT DROP AS
SELECT id, ARRAY[lower(trim(organisation_name)), lower(trim(coalesce(address,''))),
  lower(trim(coalesce(district,''))), lower(trim(coalesce(state,''))),
  lower(trim(coalesce(pin_code,'')))] AS identity FROM organisations;
CREATE INDEX ON organisation_identities(identity);
CREATE TEMP TABLE school_identity_candidates ON COMMIT DROP AS
SELECT s.school_id, o.id FROM schools s JOIN organisation_identities o
  ON o.identity = ARRAY[lower(trim(s.school_name)), lower(trim(coalesce(s.address,''))),
    lower(trim(coalesce(s.district,''))), lower(trim(coalesce(s.state,''))),
    lower(trim(coalesce(s.pincode,'')))]
WHERE NOT EXISTS (SELECT 1 FROM school_organisation_map m WHERE m.school_id = s.school_id);
DO $$ BEGIN
  IF EXISTS (SELECT school_id FROM school_identity_candidates GROUP BY school_id HAVING count(*) > 1) THEN
    RAISE EXCEPTION 'Ambiguous school name/address match. Resolve duplicate organisation identities.';
  END IF;
END $$;
INSERT INTO school_organisation_map SELECT school_id, id FROM school_identity_candidates;

-- Preserve schools that were created locally or are absent from the shared source.
DO $$ DECLARE rec RECORD; target_id BIGINT; next_pr TEXT; n BIGINT := 1;
BEGIN
  FOR rec IN SELECT s.* FROM schools s LEFT JOIN school_organisation_map m USING (school_id)
    WHERE m.school_id IS NULL ORDER BY s.school_id LOOP
    IF rec.school_code ~* '^PR-?[0-9]+$' THEN next_pr := rec.school_code;
    ELSE
      LOOP
        next_pr := 'PR' || lpad(n::text, greatest(6, length(n::text)), '0'); n := n + 1;
        EXIT WHEN NOT EXISTS (SELECT 1 FROM organisations WHERE lower(pr_code) = lower(next_pr))
          AND NOT EXISTS (SELECT 1 FROM schools WHERE lower(school_code) = lower(next_pr));
      END LOOP;
    END IF;
    INSERT INTO organisations(pr_code, pt_code, organisation_name, address, district, state,
      pin_code, contact_person, phone, email, created_at, updated_at)
    VALUES(next_pr, CASE WHEN rec.school_code ~* '^PT-?[0-9]+$' THEN rec.school_code ELSE NULL END,
      rec.school_name, rec.address, rec.district, rec.state, rec.pincode, rec.contact_person,
      rec.phone, rec.email, rec.created_at, rec.updated_at) RETURNING id INTO target_id;
    INSERT INTO school_organisation_map VALUES(rec.school_id, target_id);
  END LOOP;
END $$;

DO $$ DECLARE r RECORD; o RECORD;
BEGIN
  FOR r IN SELECT s.*, m.organisation_id FROM schools s JOIN school_organisation_map m USING(school_id)
    ORDER BY s.school_id LOOP
    SELECT * INTO o FROM organisations WHERE id = r.organisation_id;
    -- Code-based matches are authoritative; identity-based matches cannot silently change a PT.
    IF r.school_code ~* '^PT-?[0-9]+$' AND o.pt_code IS NOT NULL
      AND lower(trim(o.pt_code)) <> lower(trim(r.school_code)) THEN
      RAISE EXCEPTION 'School % conflicts with organisation % PT %', r.school_code, o.pr_code, o.pt_code;
    END IF;
    UPDATE organisations SET
      pt_code = CASE WHEN pt_code IS NULL AND r.school_code ~* '^PT-?[0-9]+$' THEN r.school_code ELSE pt_code END,
      address = coalesce(nullif(trim(address),''), r.address),
      district = coalesce(nullif(trim(district),''), r.district),
      state = coalesce(nullif(trim(state),''), r.state),
      pin_code = coalesce(nullif(trim(pin_code),''), r.pincode),
      phone = coalesce(nullif(trim(phone),''), r.phone),
      email = coalesce(nullif(trim(email),''), r.email),
      contact_person = coalesce(nullif(trim(contact_person),''), r.contact_person),
      legacy_school_ids = array_append(legacy_school_ids, r.school_id),
      legacy_school_codes = CASE WHEN r.school_code = pr_code OR r.school_code = coalesce(pt_code,'')
        OR r.school_code ~* '^PT-?[0-9]+$' OR r.school_code = ANY(legacy_school_codes) THEN legacy_school_codes
        ELSE array_append(legacy_school_codes, r.school_code) END
    WHERE id = r.organisation_id;
  END LOOP;
END $$;

DO $$ BEGIN
  IF (SELECT count(*) FROM schools) <> (SELECT count(*) FROM school_organisation_map) THEN
    RAISE EXCEPTION 'Not every school was mapped. Consolidation aborted.';
  END IF;
  IF EXISTS (SELECT 1 FROM (
    SELECT id, lower(trim(pr_code)) code FROM organisations
    UNION SELECT id, lower(trim(pt_code)) FROM organisations WHERE pt_code IS NOT NULL
    UNION SELECT id, lower(trim(unnest(legacy_school_codes))) FROM organisations
  ) codes GROUP BY code HAVING count(DISTINCT id) > 1) THEN
    RAISE EXCEPTION 'Conflicting organisation code aliases. Consolidation aborted.';
  END IF;
END $$;

ALTER TABLE vendor_schools ADD COLUMN organisation_id BIGINT;
UPDATE vendor_schools v SET organisation_id = m.organisation_id
  FROM school_organisation_map m WHERE m.school_id = v.school_id;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM vendor_schools WHERE organisation_id IS NULL) THEN
    RAISE EXCEPTION 'An unmapped bookseller relationship exists. Consolidation aborted.';
  END IF;
END $$;
-- Two legacy school rows may legitimately resolve to one organisation.
DELETE FROM vendor_schools v USING vendor_schools keep
WHERE v.vendor_id = keep.vendor_id AND v.organisation_id = keep.organisation_id
  AND v.vendor_school_id > keep.vendor_school_id;
ALTER TABLE vendor_schools ALTER COLUMN organisation_id SET NOT NULL;
ALTER TABLE vendor_schools DROP COLUMN school_id CASCADE;
ALTER TABLE vendor_schools ADD CONSTRAINT vendor_schools_organisation_id_fkey
  FOREIGN KEY(organisation_id) REFERENCES organisations(id) ON DELETE RESTRICT ON UPDATE NO ACTION;
CREATE UNIQUE INDEX vendor_schools_vendor_id_organisation_id_key ON vendor_schools(vendor_id, organisation_id);
DROP TABLE schools;
COMMIT;

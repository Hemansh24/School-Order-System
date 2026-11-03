BEGIN;

-- Serialize against the old parent creation flow and ordinary order changes.
SELECT pg_advisory_xact_lock(741024);
SELECT pg_advisory_xact_lock(741025);
LOCK TABLE "order_sheet_1", "order_group_child_orders" IN ACCESS EXCLUSIVE MODE;

-- Parent containers must not contain independently fulfillable order data.
DO $$
DECLARE
  table_name TEXT;
  row_count BIGINT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'order_sheet_2a', 'order_sheet_2b2', 'order_sheet_2c1',
    'order_sheet_2c2', 'order_sheet_3', 'order_group_participants', 'order_group_items'
  ] LOOP
    EXECUTE format('SELECT count(*) FROM %I WHERE order_sheet_1_id IN (SELECT order_sheet_1_id FROM order_sheet_1 WHERE classification = %L)', table_name, 'group_parent') INTO row_count;
    IF row_count > 0 THEN
      RAISE EXCEPTION 'Parent group containers have records in %. Inspect before deleting.', table_name;
    END IF;
  END LOOP;
  IF EXISTS (
    SELECT 1 FROM "order_sheet_1"
    WHERE "classification" <> 'group_parent'
      AND "reorder_of_order_id" IN (SELECT "order_sheet_1_id" FROM "order_sheet_1" WHERE "classification" = 'group_parent')
  ) THEN
    RAISE EXCEPTION 'A child order references a group parent as its reorder source. Inspect before deleting.';
  END IF;
END $$;

-- Deleting a parent removes its links, never the child orders they reference.
DELETE FROM "order_sheet_1" WHERE "classification" = 'group_parent';
DROP TABLE "order_group_child_orders";

COMMIT;

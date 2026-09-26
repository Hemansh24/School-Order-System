ALTER TABLE "order_sheet_1"
  ADD COLUMN "order_placed_date" DATE;

UPDATE "order_sheet_1"
SET "order_placed_date" = "order_received_date"
WHERE "order_placed_date" IS NULL;

ALTER TABLE "order_sheet_1"
  ALTER COLUMN "order_placed_date" SET NOT NULL;

-- Additive enum changes are not used by the data backfill in this migration.
ALTER TYPE "BillingToType" ADD VALUE IF NOT EXISTS 'group';
ALTER TYPE "BillingToType" ADD VALUE IF NOT EXISTS 'individual';
ALTER TABLE "order_sheet_1"
  ADD COLUMN "descriptive_mode" TEXT,
  ADD COLUMN "end_user_group_code" TEXT,
  ALTER COLUMN "session_year" DROP NOT NULL,
  ALTER COLUMN "order_received_date" DROP NOT NULL,
  ALTER COLUMN "expected_delivery_date" DROP NOT NULL,
  ALTER COLUMN "billing_to_code" DROP NOT NULL,
  ALTER COLUMN "shipping_to_code" DROP NOT NULL;
-- Keep legacy enum/source values and all row IDs for fulfillment compatibility.
UPDATE "order_sheet_1" SET "descriptive_mode" = 'school' WHERE "order_type" = 'descriptive';
UPDATE "order_sheet_1" o SET
  "order_type" = 'descriptive', "descriptive_mode" = 'group',
  "end_user_group_code" = COALESCE(
    (SELECT g."group_code" FROM "school_groups" g WHERE g."school_group_id" = o."school_group_id"),
    NULLIF(o."billing_to_code", '')
  ) WHERE o."order_type" = 'combined';

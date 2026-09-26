-- A revision was previously represented by a second Order Sheet 1 record.  Orders now
-- retain one stable order number until finalization, so the revision status and all
-- sub-order fields are retired.  Existing revision-requested records remain editable
-- as drafts after this migration.
UPDATE "order_sheet_1"
SET "order_status" = 'draft'
WHERE "order_status" = 'revision_requested';

CREATE TYPE "OrderStatus_new" AS ENUM ('draft', 'pending_confirmation', 'locked', 'finalized', 'cancelled');
ALTER TABLE "order_sheet_1"
  ALTER COLUMN "order_status" DROP DEFAULT,
  ALTER COLUMN "order_status" TYPE "OrderStatus_new" USING ("order_status"::text::"OrderStatus_new"),
  ALTER COLUMN "order_status" SET DEFAULT 'draft';
DROP TYPE "OrderStatus";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";

ALTER TABLE "order_sheet_1" DROP COLUMN "sub_order_no";
ALTER TABLE "order_sheet_2a" DROP COLUMN "sub_order_no";
ALTER TABLE "order_sheet_2b1" DROP COLUMN "sub_order_no";
ALTER TABLE "order_sheet_2b2" DROP COLUMN "sub_order_no";
ALTER TABLE "order_sheet_3" DROP COLUMN "sub_order_no";

CREATE INDEX "order_sheet_2a_order_no_idx" ON "order_sheet_2a"("order_no");
CREATE INDEX "order_sheet_2b1_order_no_idx" ON "order_sheet_2b1"("order_no");
CREATE INDEX "order_sheet_2b2_order_no_idx" ON "order_sheet_2b2"("order_no");
CREATE INDEX "order_sheet_3_order_no_idx" ON "order_sheet_3"("order_no");

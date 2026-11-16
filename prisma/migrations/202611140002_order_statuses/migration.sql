BEGIN;

CREATE TYPE "OrderStatus_new" AS ENUM ('pending', 'finalized', 'dispatched', 'cancelled');
ALTER TABLE "order_sheet_1"
  ALTER COLUMN "order_status" DROP DEFAULT,
  ALTER COLUMN "order_status" TYPE "OrderStatus_new"
    USING ((CASE WHEN "order_status"::text IN ('draft', 'pending_confirmation', 'locked')
      THEN 'pending' ELSE "order_status"::text END)::"OrderStatus_new"),
  ALTER COLUMN "order_status" SET DEFAULT 'pending';
DROP TYPE "OrderStatus";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";

COMMIT;

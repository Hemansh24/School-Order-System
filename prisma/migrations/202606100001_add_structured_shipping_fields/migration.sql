ALTER TABLE "order_sheet_1"
ADD COLUMN "shipping_to_type" "BillingToType",
ADD COLUMN "shipping_to_code" TEXT,
ADD COLUMN "shipping_to_name" TEXT;

UPDATE "order_sheet_1"
SET
  "shipping_to_type" = "billing_to_type",
  "shipping_to_code" = "billing_to_code",
  "shipping_to_name" = "billing_to_name";

ALTER TABLE "order_sheet_1"
ALTER COLUMN "shipping_to_type" SET NOT NULL,
ALTER COLUMN "shipping_to_code" SET NOT NULL,
ALTER COLUMN "shipping_to_name" SET NOT NULL;

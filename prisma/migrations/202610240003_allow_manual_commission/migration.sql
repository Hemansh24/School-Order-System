ALTER TABLE "order_sheet_1" DROP CONSTRAINT "order_commission_valid";

ALTER TABLE "order_sheet_1" ADD CONSTRAINT "order_commission_valid" CHECK (
  ("commission_party_type" IS NULL AND "commission_party_code" IS NULL AND "commission_percentage" IS NULL)
  OR
  ("commission_party_type" IS NOT NULL
    AND "commission_party_code" IS NOT NULL AND length(trim("commission_party_code")) > 0
    AND "commission_percentage" IS NOT NULL AND "commission_percentage" BETWEEN 0 AND 100)
);

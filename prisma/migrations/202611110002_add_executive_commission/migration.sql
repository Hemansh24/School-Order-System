CREATE TYPE "CommissionPartyType" AS ENUM ('school', 'vendor', 'group', 'individual', 'executive');

ALTER TABLE "order_sheet_1"
  ALTER COLUMN "commission_party_type" TYPE "CommissionPartyType"
  USING "commission_party_type"::text::"CommissionPartyType";

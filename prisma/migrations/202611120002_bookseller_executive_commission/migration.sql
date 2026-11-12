ALTER TYPE "CommissionPartyType" ADD VALUE 'bookseller_executive';
ALTER TABLE "order_sheet_1"
  ADD COLUMN "commission_bookseller_executive_id" INTEGER,
  ADD COLUMN "commission_party_name" TEXT,
  ADD COLUMN "commission_pbs_code" TEXT;

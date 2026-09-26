ALTER TABLE "vendors"
  ADD COLUMN "pre_vendor_code" TEXT,
  ADD COLUMN "bookseller_code" TEXT,
  ADD COLUMN "district" TEXT,
  ADD COLUMN "state" TEXT,
  ADD COLUMN "pin_code" TEXT,
  ADD COLUMN "tax_id" TEXT,
  ADD COLUMN "payment_status" TEXT;

CREATE UNIQUE INDEX "vendors_pre_vendor_code_key"
  ON "vendors"("pre_vendor_code");

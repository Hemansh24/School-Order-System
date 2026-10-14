ALTER TABLE "order_sheet_1"
  ADD COLUMN "contact_numbers" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

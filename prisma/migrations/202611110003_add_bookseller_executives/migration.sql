CREATE TABLE "bookseller_executives" (
  "bookseller_executive_id" SERIAL PRIMARY KEY,
  "pbs_code" TEXT NOT NULL,
  "incumbent_code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "designation" TEXT,
  "contact_1" TEXT,
  "contact_2" TEXT,
  "email" TEXT,
  "aadhaar_card_no" TEXT,
  "source_spreadsheet_id" TEXT NOT NULL,
  "source_sheet_id" INTEGER NOT NULL,
  "source_sheet_row" INTEGER NOT NULL,
  "source_values" JSONB NOT NULL,
  "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "bookseller_executives_source_key"
  ON "bookseller_executives"("source_spreadsheet_id", "source_sheet_id", "source_sheet_row");
CREATE INDEX "bookseller_executives_pbs_code_idx" ON "bookseller_executives"("pbs_code");
CREATE INDEX "bookseller_executives_incumbent_code_idx" ON "bookseller_executives"("incumbent_code");

CREATE TABLE "school_wise_discounts" (
    "id" SERIAL PRIMARY KEY,
    "source_spreadsheet_id" TEXT NOT NULL,
    "source_sheet_id" INTEGER NOT NULL,
    "source_row" INTEGER NOT NULL,
    "pr_code" TEXT,
    "pt_code" TEXT,
    "school_name" TEXT,
    "district" TEXT,
    "state" TEXT,
    "billing_to_whom" TEXT,
    "bookseller" TEXT,
    "discount" TEXT,
    "group_code" TEXT,
    "group_name" TEXT,
    "imported_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "school_wise_discounts_source_key"
ON "school_wise_discounts"("source_spreadsheet_id", "source_sheet_id", "source_row");

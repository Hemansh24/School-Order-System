CREATE TABLE "pre_booksellers" (
  "pre_bookseller_id" SERIAL PRIMARY KEY,
  "pbs_code" TEXT NOT NULL UNIQUE,
  "source_bs_code" TEXT,
  "vendor_name" TEXT NOT NULL,
  "address" TEXT,
  "district" TEXT,
  "state" TEXT,
  "pin_code" TEXT,
  "contact_person" TEXT,
  "email" TEXT,
  "tax_id" TEXT,
  "school_deal_count" TEXT,
  "approximate_strength" TEXT,
  "group_school_count" TEXT,
  "committed_discount" TEXT,
  "transport_collaboration" TEXT,
  "booking_station" TEXT,
  "vendor_type" TEXT,
  "payment_status" TEXT,
  "conversion_status" TEXT NOT NULL DEFAULT 'pending',
  "assigned_bs_code" TEXT UNIQUE,
  "converted_at" TIMESTAMP(3),
  "converted_vendor_id" INTEGER UNIQUE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pre_booksellers_converted_vendor_id_fkey"
    FOREIGN KEY ("converted_vendor_id") REFERENCES "vendors"("vendor_id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "pre_booksellers" (
  "pbs_code", "source_bs_code", "vendor_name", "address", "district", "state", "pin_code",
  "contact_person", "email", "tax_id", "vendor_type", "payment_status", "conversion_status",
  "assigned_bs_code", "converted_at", "converted_vendor_id", "created_at", "updated_at"
)
SELECT
  "pre_vendor_code", "bookseller_code", "vendor_name", "address", "district", "state", "pin_code",
  "contact_person", "email", "tax_id", "vendor_type", "payment_status",
  CASE WHEN "bookseller_code" IS NULL THEN 'pending' ELSE 'converted' END,
  "bookseller_code", CASE WHEN "bookseller_code" IS NULL THEN NULL ELSE CURRENT_TIMESTAMP END,
  CASE WHEN "bookseller_code" IS NULL THEN NULL ELSE "vendor_id" END, "created_at", "updated_at"
FROM "vendors"
WHERE "pre_vendor_code" IS NOT NULL
ON CONFLICT ("pbs_code") DO NOTHING;

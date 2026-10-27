CREATE TABLE "executives" (
  "incumbent_code" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "mobile" TEXT,
  "email" TEXT,
  "base_location" TEXT,
  "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "school_executive_defaults" (
  "pr_code" TEXT PRIMARY KEY,
  "incumbent_code" TEXT,
  "name" TEXT NOT NULL,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "order_school_executives" (
  "order_sheet_1_id" INTEGER NOT NULL,
  "school_code" TEXT NOT NULL,
  "incumbent_code" TEXT,
  "name" TEXT NOT NULL,
  PRIMARY KEY ("order_sheet_1_id", "school_code"),
  FOREIGN KEY ("order_sheet_1_id") REFERENCES "order_sheet_1"("order_sheet_1_id") ON DELETE CASCADE ON UPDATE CASCADE
);

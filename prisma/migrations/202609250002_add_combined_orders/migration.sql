ALTER TYPE "OrderType" ADD VALUE IF NOT EXISTS 'combined';
ALTER TYPE "SourceType" ADD VALUE IF NOT EXISTS '2C2';

CREATE TABLE "order_sheet_2c1" (
  "order_sheet_2c1_id" SERIAL PRIMARY KEY,
  "order_sheet_1_id" INTEGER NOT NULL REFERENCES "order_sheet_1"("order_sheet_1_id") ON DELETE CASCADE,
  "order_no" INTEGER NOT NULL,
  "school_code" TEXT NOT NULL,
  "school_name" TEXT NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "order_sheet_2c1_order_sheet_1_id_school_code_key" UNIQUE ("order_sheet_1_id", "school_code")
);

CREATE TABLE "order_sheet_2c2" (
  "order_sheet_2c2_id" SERIAL PRIMARY KEY,
  "order_sheet_1_id" INTEGER NOT NULL REFERENCES "order_sheet_1"("order_sheet_1_id") ON DELETE CASCADE,
  "order_no" INTEGER NOT NULL,
  "item_code" TEXT NOT NULL,
  "item_name" TEXT NOT NULL,
  "pooled_quantity" INTEGER NOT NULL CHECK ("pooled_quantity" > 0),
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "order_sheet_2c2_order_sheet_1_id_item_code_key" UNIQUE ("order_sheet_1_id", "item_code")
);

CREATE INDEX "order_sheet_2c1_order_no_idx" ON "order_sheet_2c1"("order_no");
CREATE INDEX "order_sheet_2c2_order_no_idx" ON "order_sheet_2c2"("order_no");

CREATE TYPE "BillingToType" AS ENUM ('school', 'vendor');
CREATE TYPE "OrderType" AS ENUM ('descriptive', 'ambiguous');
CREATE TYPE "OrderStatus" AS ENUM ('draft', 'revision_requested', 'pending_confirmation', 'locked', 'finalized', 'cancelled');
CREATE TYPE "SourceType" AS ENUM ('2A', '2B2');
CREATE TYPE "CancelOrOnHoldStatus" AS ENUM ('active', 'cancelled', 'on_hold');

CREATE TABLE "schools" (
  "school_id" SERIAL PRIMARY KEY,
  "school_code" TEXT NOT NULL UNIQUE,
  "school_name" TEXT NOT NULL,
  "address" TEXT,
  "contact_person" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "vendors" (
  "vendor_id" SERIAL PRIMARY KEY,
  "vendor_code" TEXT NOT NULL UNIQUE,
  "vendor_name" TEXT NOT NULL,
  "vendor_type" TEXT,
  "vendor_rating" TEXT,
  "address" TEXT,
  "contact_person" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "vendor_schools" (
  "vendor_school_id" SERIAL PRIMARY KEY,
  "vendor_id" INTEGER NOT NULL REFERENCES "vendors"("vendor_id") ON DELETE CASCADE,
  "school_id" INTEGER NOT NULL REFERENCES "schools"("school_id") ON DELETE CASCADE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "vendor_schools_vendor_id_school_id_key" UNIQUE ("vendor_id", "school_id")
);

CREATE TABLE "items" (
  "item_id" SERIAL PRIMARY KEY,
  "item_code" TEXT NOT NULL UNIQUE,
  "item_name" TEXT NOT NULL,
  "item_type" TEXT,
  "subject" TEXT,
  "class_level" TEXT,
  "publisher" TEXT,
  "price" DECIMAL(10,2),
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "order_sheet_1" (
  "order_sheet_1_id" SERIAL PRIMARY KEY,
  "order_no" INTEGER NOT NULL,
  "sub_order_no" INTEGER NOT NULL DEFAULT 0,
  "session_year" TEXT NOT NULL,
  "order_received_date" DATE NOT NULL,
  "expected_delivery_date" DATE NOT NULL,
  "billing_to_type" "BillingToType" NOT NULL,
  "billing_to_code" TEXT NOT NULL,
  "billing_to_name" TEXT NOT NULL,
  "shipping_to_summary" TEXT NOT NULL,
  "order_type" "OrderType" NOT NULL,
  "order_status" "OrderStatus" NOT NULL DEFAULT 'draft',
  "bookseller_type" TEXT,
  "bookseller_rating" TEXT,
  "pending_payment" BOOLEAN NOT NULL DEFAULT false,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "order_sheet_1_order_no_sub_order_no_key" UNIQUE ("order_no", "sub_order_no")
);

CREATE TABLE "order_sheet_2a" (
  "order_sheet_2a_id" SERIAL PRIMARY KEY,
  "order_sheet_1_id" INTEGER NOT NULL REFERENCES "order_sheet_1"("order_sheet_1_id") ON DELETE CASCADE,
  "order_no" INTEGER NOT NULL,
  "sub_order_no" INTEGER NOT NULL,
  "order_modification_no" INTEGER,
  "school_code" TEXT NOT NULL,
  "school_name" TEXT NOT NULL,
  "item_code" TEXT NOT NULL,
  "item_name" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL CHECK ("quantity" > 0),
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "order_sheet_2b1" (
  "order_sheet_2b1_id" SERIAL PRIMARY KEY,
  "order_sheet_1_id" INTEGER NOT NULL REFERENCES "order_sheet_1"("order_sheet_1_id") ON DELETE CASCADE,
  "order_no" INTEGER NOT NULL,
  "sub_order_no" INTEGER NOT NULL,
  "school_code" TEXT NOT NULL,
  "school_name" TEXT NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "order_sheet_2b2" (
  "order_sheet_2b2_id" SERIAL PRIMARY KEY,
  "order_sheet_1_id" INTEGER NOT NULL REFERENCES "order_sheet_1"("order_sheet_1_id") ON DELETE CASCADE,
  "order_no" INTEGER NOT NULL,
  "sub_order_no" INTEGER NOT NULL,
  "order_modification_no" INTEGER,
  "item_code" TEXT NOT NULL,
  "item_name" TEXT NOT NULL,
  "grouped_quantity" INTEGER NOT NULL CHECK ("grouped_quantity" > 0),
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "order_sheet_3" (
  "order_sheet_3_id" SERIAL PRIMARY KEY,
  "order_sheet_1_id" INTEGER NOT NULL REFERENCES "order_sheet_1"("order_sheet_1_id") ON DELETE CASCADE,
  "order_no" INTEGER NOT NULL,
  "sub_order_no" INTEGER NOT NULL,
  "source_type" "SourceType" NOT NULL,
  "source_id" INTEGER NOT NULL,
  "item_code" TEXT NOT NULL,
  "item_name" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL CHECK ("quantity" > 0),
  "parts" TEXT,
  "transit_id" TEXT,
  "material_transit_time" TEXT,
  "dispatch_date" DATE,
  "feasible_delivery_date" DATE,
  "possible_delivery_date" DATE,
  "accepted_by_client" BOOLEAN NOT NULL DEFAULT false,
  "discount_percentage" DECIMAL(5,2) CHECK ("discount_percentage" IS NULL OR ("discount_percentage" >= 0 AND "discount_percentage" <= 100)),
  "payment_received" BOOLEAN NOT NULL DEFAULT false,
  "cancel_or_on_hold_status" "CancelOrOnHoldStatus" NOT NULL DEFAULT 'active',
  "pl_number" TEXT,
  "pl_date" DATE,
  "bin" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "order_sheet_3_source_type_source_id_key" UNIQUE ("source_type", "source_id")
);

CREATE INDEX "order_sheet_1_order_type_order_status_idx" ON "order_sheet_1"("order_type", "order_status");
CREATE INDEX "order_sheet_2a_order_no_sub_order_no_idx" ON "order_sheet_2a"("order_no", "sub_order_no");
CREATE INDEX "order_sheet_2b1_order_no_sub_order_no_idx" ON "order_sheet_2b1"("order_no", "sub_order_no");
CREATE INDEX "order_sheet_2b2_order_no_sub_order_no_idx" ON "order_sheet_2b2"("order_no", "sub_order_no");
CREATE INDEX "order_sheet_3_order_no_sub_order_no_idx" ON "order_sheet_3"("order_no", "sub_order_no");

CREATE TYPE "OrderClassification" AS ENUM ('normal', 'direct_group', 'group_parent');
ALTER TYPE "SourceType" ADD VALUE IF NOT EXISTS 'GROUP';

CREATE TABLE "school_groups" (
  "school_group_id" SERIAL PRIMARY KEY,
  "group_code" TEXT NOT NULL UNIQUE,
  "group_name" TEXT NOT NULL,
  "source_hash" TEXT,
  "synced_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "school_group_locations" (
  "school_group_location_id" SERIAL PRIMARY KEY,
  "school_group_id" INTEGER NOT NULL REFERENCES "school_groups"("school_group_id") ON DELETE CASCADE,
  "sub_code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT,
  "district" TEXT,
  "state" TEXT,
  "pincode" TEXT,
  "centralized_decision" TEXT,
  "source_hash" TEXT,
  "synced_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "school_group_locations_school_group_id_sub_code_key" UNIQUE ("school_group_id", "sub_code")
);

CREATE TABLE "school_group_schools" (
  "school_group_school_id" SERIAL PRIMARY KEY,
  "school_group_location_id" INTEGER REFERENCES "school_group_locations"("school_group_location_id") ON DELETE SET NULL,
  "pt_code" TEXT NOT NULL UNIQUE,
  "suggested_location_id" INTEGER REFERENCES "school_group_locations"("school_group_location_id") ON DELETE SET NULL,
  "reviewed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "order_sheet_1" ADD COLUMN "classification" "OrderClassification" NOT NULL DEFAULT 'normal';
ALTER TABLE "order_sheet_1" ADD COLUMN "school_group_id" INTEGER REFERENCES "school_groups"("school_group_id");
ALTER TABLE "order_sheet_1" ADD COLUMN "school_group_location_id" INTEGER REFERENCES "school_group_locations"("school_group_location_id");

CREATE TABLE "order_group_participants" (
  "order_group_participant_id" SERIAL PRIMARY KEY,
  "order_sheet_1_id" INTEGER NOT NULL REFERENCES "order_sheet_1"("order_sheet_1_id") ON DELETE CASCADE,
  "pt_code" TEXT NOT NULL,
  "school_name" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "order_group_participants_order_sheet_1_id_pt_code_key" UNIQUE ("order_sheet_1_id", "pt_code")
);

CREATE TABLE "order_group_items" (
  "order_group_item_id" SERIAL PRIMARY KEY,
  "order_sheet_1_id" INTEGER NOT NULL REFERENCES "order_sheet_1"("order_sheet_1_id") ON DELETE CASCADE,
  "item_code" TEXT NOT NULL,
  "item_name" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL CHECK ("quantity" > 0),
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "order_group_items_order_sheet_1_id_item_code_key" UNIQUE ("order_sheet_1_id", "item_code")
);

CREATE TABLE "order_group_child_orders" (
  "order_group_child_order_id" SERIAL PRIMARY KEY,
  "group_parent_order_id" INTEGER NOT NULL REFERENCES "order_sheet_1"("order_sheet_1_id") ON DELETE CASCADE,
  "child_order_id" INTEGER NOT NULL REFERENCES "order_sheet_1"("order_sheet_1_id") ON DELETE CASCADE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "order_group_child_orders_group_parent_order_id_child_order_id_key" UNIQUE ("group_parent_order_id", "child_order_id"),
  CONSTRAINT "order_group_child_orders_child_order_id_key" UNIQUE ("child_order_id")
);

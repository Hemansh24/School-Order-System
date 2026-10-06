ALTER TABLE "school_groups"
  ADD COLUMN "source_type" TEXT NOT NULL DEFAULT 'GS',
  ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN "address" TEXT,
  ADD COLUMN "district" TEXT,
  ADD COLUMN "state" TEXT,
  ADD COLUMN "pincode" TEXT,
  ADD COLUMN "phone_email" TEXT,
  ADD COLUMN "website" TEXT,
  ADD COLUMN "metadata" JSONB;

CREATE INDEX "idx_school_groups_source_type_active"
  ON "school_groups" ("source_type", "active");

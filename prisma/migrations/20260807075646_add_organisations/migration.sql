CREATE TABLE IF NOT EXISTS "organisations" (
  "id" BIGSERIAL NOT NULL,
  "group_code" TEXT,
  "pt_code" TEXT,
  "pr_code" TEXT NOT NULL,
  "organisation_name" TEXT NOT NULL,
  "address" TEXT,
  "district" TEXT,
  "state" TEXT,
  "pin_code" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "website" TEXT,
  "action_status" TEXT,
  "remark" TEXT,
  "academic_year" TEXT,
  "strength" INTEGER,
  "board_type" TEXT,
  "session_start_from" DATE,
  "minority_type" TEXT,
  "saturday_status" TEXT,
  "working_status" BOOLEAN,
  "source_sheet_row" INTEGER,
  "source_hash" TEXT,
  "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
  "synced_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "organisations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "organisations_pr_code_key" UNIQUE ("pr_code")
);

CREATE INDEX IF NOT EXISTS "idx_organisations_district" ON "organisations"("district");
CREATE INDEX IF NOT EXISTS "idx_organisations_name" ON "organisations"("organisation_name");
CREATE INDEX IF NOT EXISTS "idx_organisations_pr_code" ON "organisations"("pr_code");
CREATE INDEX IF NOT EXISTS "idx_organisations_state" ON "organisations"("state");

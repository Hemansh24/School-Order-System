CREATE TABLE "school_branches" (
  "school_branch_id" SERIAL PRIMARY KEY,
  "school_id" INTEGER NOT NULL REFERENCES "schools"("school_id") ON DELETE CASCADE,
  "branch_name" TEXT NOT NULL,
  "address" TEXT,
  "contact_person" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "school_branches_school_id_branch_name_key"
  ON "school_branches"("school_id", "branch_name");

CREATE INDEX "school_branches_school_id_idx"
  ON "school_branches"("school_id");

INSERT INTO "school_branches" (
  "school_id",
  "branch_name",
  "address",
  "contact_person",
  "phone",
  "email",
  "created_at",
  "updated_at"
)
SELECT
  "school_id",
  'Main',
  "address",
  "contact_person",
  "phone",
  "email",
  "created_at",
  "updated_at"
FROM "schools";

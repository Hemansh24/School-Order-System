ALTER TABLE "schools"
  ADD COLUMN "district" TEXT,
  ADD COLUMN "state" TEXT,
  ADD COLUMN "pincode" TEXT;

WITH first_branch AS (
  SELECT DISTINCT ON ("school_id")
    "school_id",
    "address",
    "contact_person",
    "phone",
    "email"
  FROM "school_branches"
  ORDER BY "school_id", "school_branch_id"
)
UPDATE "schools" AS s
SET
  "address" = COALESCE(s."address", fb."address"),
  "contact_person" = COALESCE(s."contact_person", fb."contact_person"),
  "phone" = COALESCE(s."phone", fb."phone"),
  "email" = COALESCE(s."email", fb."email")
FROM first_branch AS fb
WHERE s."school_id" = fb."school_id";

DROP TABLE "school_branches";

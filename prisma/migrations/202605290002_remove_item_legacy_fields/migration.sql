ALTER TABLE "items"
  DROP COLUMN IF EXISTS "sub_category_name",
  DROP COLUMN IF EXISTS "item_type",
  DROP COLUMN IF EXISTS "subject",
  DROP COLUMN IF EXISTS "class_level",
  DROP COLUMN IF EXISTS "publisher",
  DROP COLUMN IF EXISTS "price";

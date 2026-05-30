ALTER TABLE "items"
  ADD COLUMN "category_code" TEXT NOT NULL DEFAULT 'LEGACY',
  ADD COLUMN "category_type" TEXT,
  ADD COLUMN "sub_category_code" TEXT NOT NULL DEFAULT '00',
  ADD COLUMN "sub_category_name" TEXT,
  ADD COLUMN "language_code" TEXT NOT NULL DEFAULT 'ENG',
  ADD COLUMN "customisation_code" TEXT NOT NULL DEFAULT '00',
  ADD COLUMN "customisation_name" TEXT,
  ADD COLUMN "edition_code" TEXT NOT NULL DEFAULT '01',
  ADD COLUMN "isbn_number" TEXT,
  ADD COLUMN "mrp" DECIMAL(10,2),
  ADD COLUMN "obsolete" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "items_category_code_idx" ON "items"("category_code");
CREATE INDEX "items_customisation_code_idx" ON "items"("customisation_code");
CREATE INDEX "items_language_code_idx" ON "items"("language_code");
CREATE INDEX "items_edition_code_idx" ON "items"("edition_code");

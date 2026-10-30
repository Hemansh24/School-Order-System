-- NULL means the historical discount was not recorded. Do not infer it from today's vendor default.
ALTER TABLE "order_sheet_1" ADD COLUMN "bookseller_discount" TEXT;

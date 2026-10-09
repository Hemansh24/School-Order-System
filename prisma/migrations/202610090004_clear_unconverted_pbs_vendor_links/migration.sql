UPDATE "pre_booksellers"
SET "converted_vendor_id" = NULL
WHERE "conversion_status" = 'pending';

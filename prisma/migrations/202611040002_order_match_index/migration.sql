CREATE INDEX "order_match_lookup_idx" ON "order_sheet_1" ("session_year", "order_type", "order_status", "classification", "created_at" DESC, "order_sheet_1_id" DESC);

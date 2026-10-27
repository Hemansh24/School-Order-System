ALTER TABLE "order_sheet_1" ADD COLUMN "reorder_of_order_id" INTEGER;
CREATE INDEX "order_sheet_1_reorder_of_order_id_idx" ON "order_sheet_1"("reorder_of_order_id");
ALTER TABLE "order_sheet_1" ADD CONSTRAINT "order_sheet_1_reorder_of_order_id_fkey"
  FOREIGN KEY ("reorder_of_order_id") REFERENCES "order_sheet_1"("order_sheet_1_id") ON DELETE SET NULL ON UPDATE CASCADE;

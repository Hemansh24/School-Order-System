CREATE TABLE "a2d_conversions" (
  "id" TEXT NOT NULL,
  "source_order_id" INTEGER NOT NULL,
  "result_order_id" INTEGER NOT NULL,
  "full_conversion" BOOLEAN NOT NULL,
  "allocations" JSONB NOT NULL,
  "balances" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "a2d_conversions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "a2d_conversions_source_order_id_fkey" FOREIGN KEY ("source_order_id") REFERENCES "order_sheet_1"("order_sheet_1_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "a2d_conversions_result_order_id_fkey" FOREIGN KEY ("result_order_id") REFERENCES "order_sheet_1"("order_sheet_1_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "a2d_conversions_source_order_id_idx" ON "a2d_conversions"("source_order_id");
CREATE INDEX "a2d_conversions_result_order_id_idx" ON "a2d_conversions"("result_order_id");

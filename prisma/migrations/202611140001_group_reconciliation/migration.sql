CREATE TABLE "group_reconciliation" (
 "id" SERIAL PRIMARY KEY,
 "groupCode" TEXT NOT NULL,
 "subCode" TEXT NOT NULL,
 "sourceText" TEXT NOT NULL,
 "nameKey" TEXT NOT NULL,
 "prCode" TEXT,
 "status" TEXT NOT NULL,
 "reason" TEXT NOT NULL,
 "reviewedAt" TIMESTAMP(3),
 "active" BOOLEAN NOT NULL DEFAULT true,
 "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "group_reconciliation_groupCode_subCode_nameKey_key" ON "group_reconciliation"("groupCode", "subCode", "nameKey");
CREATE INDEX "group_reconciliation_prCode_idx" ON "group_reconciliation"("prCode");

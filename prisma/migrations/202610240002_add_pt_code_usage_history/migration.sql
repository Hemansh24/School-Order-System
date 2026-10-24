CREATE TABLE "pt_code_usage_history" (
    "pt_code" TEXT NOT NULL,
    "session_year" TEXT NOT NULL,
    CONSTRAINT "pt_code_usage_history_pkey" PRIMARY KEY ("pt_code", "session_year")
);

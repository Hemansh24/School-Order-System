CREATE TABLE "school_group_schools" (
  "school_group_school_id" SERIAL PRIMARY KEY,
  "school_group_location_id" INTEGER REFERENCES "school_group_locations"("school_group_location_id") ON DELETE SET NULL,
  "pt_code" TEXT NOT NULL UNIQUE,
  "suggested_location_id" INTEGER REFERENCES "school_group_locations"("school_group_location_id") ON DELETE SET NULL,
  "reviewed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

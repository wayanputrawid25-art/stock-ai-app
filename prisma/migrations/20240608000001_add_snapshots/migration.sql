-- Migration: Add Snapshots System
-- Version: 2.0 Snapshot System for OCR History 4D Analytics
-- Description: Adds snapshot-based data isolation for multi-dataset analysis

-- Create snapshots table
CREATE TABLE IF NOT EXISTS "snapshots" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "title" VARCHAR(100) NOT NULL,
    "color" VARCHAR(7) DEFAULT '#3B82F6',
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("user_id", "title")
);

-- Create index for snapshots
CREATE INDEX IF NOT EXISTS "snapshots_user_id_title_idx" ON "snapshots"("user_id", "title");

-- Add snapshot_id to results table
ALTER TABLE "results" ADD COLUMN IF NOT EXISTS "snapshot_id" UUID;

-- Drop old unique constraint if exists
DO $$
BEGIN
    ALTER TABLE "results" DROP CONSTRAINT IF EXISTS "results_user_id_result_number_draw_date_key";
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Add foreign key constraint for results
ALTER TABLE "results" ALTER COLUMN "snapshot_id" SET NOT NULL;
ALTER TABLE "results" ADD CONSTRAINT "results_snapshot_id_fkey" 
    FOREIGN KEY ("snapshot_id") REFERENCES "snapshots"("id") ON DELETE CASCADE;

-- Add new unique constraint with snapshot_id
ALTER TABLE "results" ADD CONSTRAINT "results_snapshot_id_result_number_draw_date_key" 
    UNIQUE ("snapshot_id", "result_number", "draw_date");

-- Create index for results by snapshot
CREATE INDEX IF NOT EXISTS "results_snapshot_id_draw_date_idx" ON "results"("snapshot_id", "draw_date");

-- Add snapshot_id to analysis_history table
ALTER TABLE "analysis_history" ADD COLUMN IF NOT EXISTS "snapshot_id" UUID;

-- Add foreign key constraint for analysis_history
ALTER TABLE "analysis_history" ALTER COLUMN "snapshot_id" SET NOT NULL;
ALTER TABLE "analysis_history" ADD CONSTRAINT "analysis_history_snapshot_id_fkey" 
    FOREIGN KEY ("snapshot_id") REFERENCES "snapshots"("id") ON DELETE CASCADE;

-- Create index for analysis_history by snapshot
CREATE INDEX IF NOT EXISTS "analysis_history_snapshot_id_created_at_idx" ON "analysis_history"("snapshot_id", "created_at");
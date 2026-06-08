-- Migration: Migrate old data without snapshot_id to Default snapshot
-- Version: 2.0.1 - Fix snapshot data isolation

-- Create default snapshot for users who have results without snapshot_id
INSERT INTO "snapshots" ("id", "user_id", "title", "color", "created_at", "updated_at")
SELECT 
    gen_random_uuid(),
    "user_id",
    'Default',
    '#6B7280',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "results"
WHERE "snapshot_id" IS NULL
GROUP BY "user_id"
ON CONFLICT ("user_id", "title") DO NOTHING;

-- Update results without snapshot_id to use Default snapshot
UPDATE "results"
SET "snapshot_id" = (
    SELECT s."id" 
    FROM "snapshots" s 
    WHERE s."user_id" = "results"."user_id" AND s."title" = 'Default'
    LIMIT 1
)
WHERE "snapshot_id" IS NULL;

-- Update analysis_history without snapshot_id to use Default snapshot
UPDATE "analysis_history"
SET "snapshot_id" = (
    SELECT s."id" 
    FROM "snapshots" s 
    WHERE s."user_id" = "analysis_history"."user_id" AND s."title" = 'Default'
    LIMIT 1
)
WHERE "snapshot_id" IS NULL;
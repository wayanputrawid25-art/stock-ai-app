CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');
CREATE TYPE "Plan" AS ENUM ('MONTHLY', 'YEARLY', 'LIFETIME');

CREATE TABLE "users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(120) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "password_hash" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'USER',
  "plan" "Plan" NOT NULL DEFAULT 'MONTHLY',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "expired_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "results" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "result_number" VARCHAR(4) NOT NULL,
  "draw_date" DATE NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "analysis_history" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "analysis_type" VARCHAR(80) NOT NULL,
  "result_json" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "analysis_history_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "activity_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID,
  "action" VARCHAR(180) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "results_user_id_result_number_draw_date_key" ON "results"("user_id", "result_number", "draw_date");
CREATE INDEX "results_user_id_draw_date_idx" ON "results"("user_id", "draw_date");
CREATE INDEX "analysis_history_user_id_created_at_idx" ON "analysis_history"("user_id", "created_at");
CREATE INDEX "activity_logs_user_id_created_at_idx" ON "activity_logs"("user_id", "created_at");

ALTER TABLE "results" ADD CONSTRAINT "results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "analysis_history" ADD CONSTRAINT "analysis_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

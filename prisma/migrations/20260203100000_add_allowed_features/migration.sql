-- AlterTable (IF NOT EXISTS for PostgreSQL 9.5+)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "allowedFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[];

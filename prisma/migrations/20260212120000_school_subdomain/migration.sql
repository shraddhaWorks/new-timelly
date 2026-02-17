-- AlterTable
ALTER TABLE "School" ADD COLUMN IF NOT EXISTS "subdomain" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "School_subdomain_key" ON "School"("subdomain");

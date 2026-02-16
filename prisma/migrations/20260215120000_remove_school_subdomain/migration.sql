-- DropIndex
DROP INDEX IF EXISTS "School_subdomain_key";

-- AlterTable
ALTER TABLE "School" DROP COLUMN IF EXISTS "subdomain";

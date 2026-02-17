-- Add HyperPG credentials per school (each school has unique merchant id and api key)
ALTER TABLE "SchoolSettings" ADD COLUMN IF NOT EXISTS "hyperpgMerchantId" TEXT;
ALTER TABLE "SchoolSettings" ADD COLUMN IF NOT EXISTS "hyperpgApiKey" TEXT;

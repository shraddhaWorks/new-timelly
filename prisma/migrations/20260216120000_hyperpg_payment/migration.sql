-- HyperPG payment: add sub-merchant id to SchoolSettings, add HyperPG fields to Payment

-- SchoolSettings: add HyperPG sub-merchant ID (for split settlement per school)
ALTER TABLE "SchoolSettings" ADD COLUMN IF NOT EXISTS "hyperpgSubMid" TEXT;

-- Payment: add HyperPG-specific columns and set default gateway to HYPERPG for new rows
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "hyperpgOrderId" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "hyperpgPaymentId" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "hyperpgStatus" TEXT;
ALTER TABLE "Payment" ALTER COLUMN "gateway" SET DEFAULT 'HYPERPG';

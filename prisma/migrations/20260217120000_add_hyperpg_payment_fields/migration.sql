-- AlterTable Payment: add HyperPG fields, set default gateway to HYPERPG
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "hyperpgOrderId" TEXT;
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "hyperpgTxnId" TEXT;
ALTER TABLE "Payment" ALTER COLUMN "gateway" SET DEFAULT 'HYPERPG';

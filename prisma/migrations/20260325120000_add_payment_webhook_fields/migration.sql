-- Add fields for HyperPG webhook-driven status tracking + webhook event log

ALTER TABLE "Payment"
  ADD COLUMN IF NOT EXISTS "hyperpgStatus" TEXT,
  ADD COLUMN IF NOT EXISTS "hyperpgStatusId" INTEGER,
  ADD COLUMN IF NOT EXISTS "hyperpgRefunded" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "hyperpgAmountRefunded" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "hyperpgEffectiveAmount" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "hyperpgLastUpdatedAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "PaymentWebhookEvent" (
  "id" TEXT NOT NULL,
  "eventName" TEXT,
  "orderId" TEXT,
  "hyperpgOrderId" TEXT,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "payload" JSONB NOT NULL,
  CONSTRAINT "PaymentWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PaymentWebhookEvent_orderId_idx" ON "PaymentWebhookEvent" ("orderId");
CREATE INDEX IF NOT EXISTS "PaymentWebhookEvent_hyperpgOrderId_idx" ON "PaymentWebhookEvent" ("hyperpgOrderId");

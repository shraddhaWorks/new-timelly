-- Add SaaS / subscription-related database columns & table.
-- Run this once on your Postgres (e.g. Supabase SQL editor) before using the SaaS features.

-- 1) School-level SaaS configuration
ALTER TABLE "School"
  ADD COLUMN IF NOT EXISTS "billingMode" TEXT NOT NULL DEFAULT 'PARENT_SUBSCRIPTION',
  ADD COLUMN IF NOT EXISTS "parentSubscriptionAmount" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "parentSubscriptionTrialDays" INTEGER NOT NULL DEFAULT 0;

-- 2) Payment purpose: FEES | EVENT | PARENT_SUBSCRIPTION | OTHER
ALTER TABLE "Payment"
  ADD COLUMN IF NOT EXISTS "purpose" TEXT NOT NULL DEFAULT 'FEES';

-- 3) ParentSubscription table (per-parent/child subscription records)
CREATE TABLE IF NOT EXISTS "ParentSubscription" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "isTrial" BOOLEAN NOT NULL DEFAULT FALSE,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "trialEndsAt" TIMESTAMP(3),
  "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "paymentId" TEXT,
  "invoiceUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ParentSubscription_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX IF NOT EXISTS "ParentSubscription_studentId_status_idx"
  ON "ParentSubscription"("studentId", "status");
CREATE INDEX IF NOT EXISTS "ParentSubscription_schoolId_idx"
  ON "ParentSubscription"("schoolId");

-- Foreign keys
ALTER TABLE "ParentSubscription"
  ADD CONSTRAINT IF NOT EXISTS "ParentSubscription_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ParentSubscription"
  ADD CONSTRAINT IF NOT EXISTS "ParentSubscription_schoolId_fkey"
  FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ParentSubscription"
  ADD CONSTRAINT IF NOT EXISTS "ParentSubscription_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;


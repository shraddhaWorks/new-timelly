-- Add amount to Event (workshop fee)
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "amount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Add eventRegistrationId to Payment (for workshop payments)
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "eventRegistrationId" TEXT;

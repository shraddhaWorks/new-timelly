-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "eventId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Certificate_eventId_idx" ON "Certificate"("eventId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Certificate_eventId_fkey'
  ) THEN
    ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_eventId_fkey" 
    FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

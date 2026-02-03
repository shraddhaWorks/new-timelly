-- Migrate PRINCIPAL and HOD to SCHOOLADMIN before altering enum
UPDATE "User" SET role = 'SCHOOLADMIN' WHERE role IN ('PRINCIPAL', 'HOD');

-- NOTE:
-- Some Postgres providers (including some managed instances) do not support
-- dropping enum values. We keep the enum values for compatibility and only
-- migrate existing users to SCHOOLADMIN above.

-- CreateTable SchoolSettings
CREATE TABLE IF NOT EXISTS "SchoolSettings" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "admissionPrefix" TEXT NOT NULL DEFAULT 'ADM',
    "rollNoPrefix" TEXT NOT NULL DEFAULT '',
    "admissionCounter" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SchoolSettings_schoolId_key" ON "SchoolSettings"("schoolId");

-- CreateTable Circular
CREATE TABLE IF NOT EXISTS "Circular" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "issuedById" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "importanceLevel" TEXT NOT NULL DEFAULT 'Medium',
    "recipients" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "classId" TEXT,
    "publishStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Circular_pkey" PRIMARY KEY ("id")
);

-- CreateTable StudentLeaveRequest
CREATE TABLE IF NOT EXISTS "StudentLeaveRequest" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "approverId" TEXT,
    "schoolId" TEXT NOT NULL,
    "leaveType" "LeaveType" NOT NULL,
    "reason" TEXT NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentLeaveRequest_pkey" PRIMARY KEY ("id")
);

-- Add admissionNumber to Student (nullable first for backfill)
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "admissionNumber" TEXT;

-- Backfill admissionNumber: use User.email where set, else unique legacy id
UPDATE "Student" s
SET "admissionNumber" = COALESCE(
    (SELECT u.email FROM "User" u WHERE u.id = s."userId"),
    'LEGACY-' || s.id
);

-- Resolve duplicate emails by appending student id
UPDATE "Student" s
SET "admissionNumber" = s."admissionNumber" || '-' || s.id
WHERE EXISTS (
    SELECT 1 FROM "Student" s2
    WHERE s2."admissionNumber" = s."admissionNumber" AND s2.id != s.id
);

ALTER TABLE "Student" ALTER COLUMN "admissionNumber" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Student_admissionNumber_key" ON "Student"("admissionNumber");

-- Add foreign keys and indexes
CREATE INDEX IF NOT EXISTS "SchoolSettings_schoolId_idx" ON "SchoolSettings"("schoolId");
CREATE INDEX IF NOT EXISTS "Circular_schoolId_idx" ON "Circular"("schoolId");
CREATE INDEX IF NOT EXISTS "Circular_publishStatus_idx" ON "Circular"("publishStatus");
CREATE INDEX IF NOT EXISTS "Circular_date_idx" ON "Circular"("date");
CREATE INDEX IF NOT EXISTS "StudentLeaveRequest_studentId_idx" ON "StudentLeaveRequest"("studentId");
CREATE INDEX IF NOT EXISTS "StudentLeaveRequest_schoolId_idx" ON "StudentLeaveRequest"("schoolId");
CREATE INDEX IF NOT EXISTS "StudentLeaveRequest_status_idx" ON "StudentLeaveRequest"("status");

DO $$
BEGIN
  ALTER TABLE "SchoolSettings"
    ADD CONSTRAINT "SchoolSettings_schoolId_fkey"
    FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "Circular"
    ADD CONSTRAINT "Circular_issuedById_fkey"
    FOREIGN KEY ("issuedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "Circular"
    ADD CONSTRAINT "Circular_schoolId_fkey"
    FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "StudentLeaveRequest"
    ADD CONSTRAINT "StudentLeaveRequest_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "StudentLeaveRequest"
    ADD CONSTRAINT "StudentLeaveRequest_approverId_fkey"
    FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "StudentLeaveRequest"
    ADD CONSTRAINT "StudentLeaveRequest_schoolId_fkey"
    FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

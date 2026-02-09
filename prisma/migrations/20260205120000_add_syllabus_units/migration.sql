-- Create enum for ExamTerm (if not exists)
DO $$ BEGIN
  CREATE TYPE "ExamTermStatus" AS ENUM ('UPCOMING', 'COMPLETED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable ExamTerm (required by SyllabusTracking)
CREATE TABLE IF NOT EXISTS "ExamTerm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ExamTermStatus" NOT NULL DEFAULT 'UPCOMING',
    "classId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamTerm_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ExamTerm_schoolId_idx" ON "ExamTerm"("schoolId");
CREATE INDEX IF NOT EXISTS "ExamTerm_classId_idx" ON "ExamTerm"("classId");
CREATE INDEX IF NOT EXISTS "ExamTerm_status_idx" ON "ExamTerm"("status");

DO $$ BEGIN
  ALTER TABLE "ExamTerm" ADD CONSTRAINT "ExamTerm_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ExamTerm" ADD CONSTRAINT "ExamTerm_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateTable ExamSchedule (depends on ExamTerm)
CREATE TABLE IF NOT EXISTS "ExamSchedule" (
    "id" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "examDate" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamSchedule_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ExamSchedule_termId_idx" ON "ExamSchedule"("termId");
CREATE INDEX IF NOT EXISTS "ExamSchedule_examDate_idx" ON "ExamSchedule"("examDate");

DO $$ BEGIN
  ALTER TABLE "ExamSchedule" ADD CONSTRAINT "ExamSchedule_termId_fkey" FOREIGN KEY ("termId") REFERENCES "ExamTerm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateTable SyllabusTracking (required by SyllabusUnit)
CREATE TABLE IF NOT EXISTS "SyllabusTracking" (
    "id" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "completedPercent" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyllabusTracking_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SyllabusTracking_termId_subject_key" ON "SyllabusTracking"("termId", "subject");
CREATE INDEX IF NOT EXISTS "SyllabusTracking_termId_idx" ON "SyllabusTracking"("termId");

DO $$ BEGIN
  ALTER TABLE "SyllabusTracking" ADD CONSTRAINT "SyllabusTracking_termId_fkey" FOREIGN KEY ("termId") REFERENCES "ExamTerm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CreateTable SyllabusUnit
CREATE TABLE "SyllabusUnit" (
    "id" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "unitName" TEXT NOT NULL,
    "completedPercent" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyllabusUnit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SyllabusUnit_trackingId_idx" ON "SyllabusUnit"("trackingId");

ALTER TABLE "SyllabusUnit" ADD CONSTRAINT "SyllabusUnit_trackingId_fkey" FOREIGN KEY ("trackingId") REFERENCES "SyllabusTracking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

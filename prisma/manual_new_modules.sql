-- Manual patch for NEW MODULES (does not modify existing UI)
-- Adds: User profile/settings fields, Notification, TeacherAuditRecord, Exams tables

-- 1) User extra fields
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "photoUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "language" TEXT DEFAULT 'English';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "teacherId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subject" TEXT;

-- 2) Enums (create if missing)
DO $$ BEGIN
  CREATE TYPE "NotificationType" AS ENUM ('LEAVE','FEES','CERTIFICATES','ATTENDANCE','WORKSHOPS');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ExamTermStatus" AS ENUM ('UPCOMING','COMPLETED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "TeacherAuditCategory" AS ENUM ('TEACHING_METHOD','PUNCTUALITY','STUDENT_ENGAGEMENT','INNOVATION','EXTRA_CURRICULAR','RESULTS','CUSTOM');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3) Notification
CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "Notification_userId_isRead_idx" ON "Notification"("userId","isRead");
CREATE INDEX IF NOT EXISTS "Notification_userId_type_idx" ON "Notification"("userId","type");
CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "Notification"("createdAt");

DO $$ BEGIN
  ALTER TABLE "Notification"
    ADD CONSTRAINT "Notification_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 4) TeacherAuditRecord
CREATE TABLE IF NOT EXISTS "TeacherAuditRecord" (
  "id" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "category" "TeacherAuditCategory" NOT NULL,
  "customCategory" TEXT,
  "description" TEXT NOT NULL,
  "scoreImpact" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TeacherAuditRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "TeacherAuditRecord_teacherId_idx" ON "TeacherAuditRecord"("teacherId");
CREATE INDEX IF NOT EXISTS "TeacherAuditRecord_createdById_idx" ON "TeacherAuditRecord"("createdById");
CREATE INDEX IF NOT EXISTS "TeacherAuditRecord_category_idx" ON "TeacherAuditRecord"("category");
CREATE INDEX IF NOT EXISTS "TeacherAuditRecord_createdAt_idx" ON "TeacherAuditRecord"("createdAt");

DO $$ BEGIN
  ALTER TABLE "TeacherAuditRecord"
    ADD CONSTRAINT "TeacherAuditRecord_teacherId_fkey"
    FOREIGN KEY ("teacherId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "TeacherAuditRecord"
    ADD CONSTRAINT "TeacherAuditRecord_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 5) Exams tables
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
  ALTER TABLE "ExamTerm"
    ADD CONSTRAINT "ExamTerm_classId_fkey"
    FOREIGN KEY ("classId") REFERENCES "Class"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "ExamTerm"
    ADD CONSTRAINT "ExamTerm_schoolId_fkey"
    FOREIGN KEY ("schoolId") REFERENCES "School"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

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
  ALTER TABLE "ExamSchedule"
    ADD CONSTRAINT "ExamSchedule_termId_fkey"
    FOREIGN KEY ("termId") REFERENCES "ExamTerm"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "SyllabusTracking" (
  "id" TEXT NOT NULL,
  "termId" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "completedPercent" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SyllabusTracking_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SyllabusTracking_termId_subject_key" ON "SyllabusTracking"("termId","subject");
CREATE INDEX IF NOT EXISTS "SyllabusTracking_termId_idx" ON "SyllabusTracking"("termId");

DO $$ BEGIN
  ALTER TABLE "SyllabusTracking"
    ADD CONSTRAINT "SyllabusTracking_termId_fkey"
    FOREIGN KEY ("termId") REFERENCES "ExamTerm"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;


-- CreateTable
CREATE TABLE "TeacherDailyAttendance" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherDailyAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeacherDailyAttendance_teacherId_date_key" ON "TeacherDailyAttendance"("teacherId", "date");

-- CreateIndex
CREATE INDEX "TeacherDailyAttendance_schoolId_date_idx" ON "TeacherDailyAttendance"("schoolId", "date");

-- CreateIndex
CREATE INDEX "TeacherDailyAttendance_teacherId_idx" ON "TeacherDailyAttendance"("teacherId");

-- AddForeignKey
ALTER TABLE "TeacherDailyAttendance" ADD CONSTRAINT "TeacherDailyAttendance_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherDailyAttendance" ADD CONSTRAINT "TeacherDailyAttendance_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

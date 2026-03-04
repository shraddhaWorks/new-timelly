import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user.role === "SCHOOLADMIN" || session.user.role === "SUPERADMIN";
  if (!isAdmin) {
    return NextResponse.json(
      { message: "Only admins can view analysis" },
      { status: 403 }
    );
  }

  try {
    let schoolId = session.user.schoolId;
    if (!schoolId) {
      const adminSchool = await prisma.school.findFirst({
        where: { admins: { some: { id: session.user.id } } },
        select: { id: true },
      });
      schoolId = adminSchool?.id ?? null;
    }

    if (!schoolId) {
      return NextResponse.json(
        { message: "School not found in session" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get("year");
    const classIdParam = searchParams.get("classId");
    const classId = classIdParam && classIdParam.trim() ? classIdParam.trim() : null;
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
    const currentYear = new Date().getFullYear();
    const validYear = Number.isNaN(year) ? currentYear : Math.max(currentYear - 5, Math.min(currentYear + 1, year));

    const yearStart = new Date(validYear, 0, 1);
    const yearEnd = new Date(validYear, 11, 31, 23, 59, 59);
    const availableYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];

    const baseStudentWhere = {
      schoolId,
      ...(classId ? { classId } : {}),
    };

    // Monthly fees collection for the selected year
    const payments = await prisma.payment.findMany({
      where: {
        status: "SUCCESS",
        student: baseStudentWhere,
        createdAt: { gte: yearStart, lte: yearEnd },
      },
      select: { amount: true, createdAt: true },
    });

    const byMonth: Record<number, number> = {};
    MONTHS.forEach((_, i) => { byMonth[i] = 0; });
    payments.forEach((p) => {
      const m = new Date(p.createdAt).getMonth();
      byMonth[m] = (byMonth[m] ?? 0) + p.amount;
    });
    const monthlyFeesCollection = MONTHS.map((name, i) => ({
      month: name,
      amount: byMonth[i] ?? 0,
    }));

    // Enrollment growth - student count by year (createdAt)
    const enrollmentByYear: { year: number; count: number }[] = [];
    for (let y = currentYear - 3; y <= currentYear; y++) {
      const yEnd = new Date(y, 11, 31, 23, 59, 59);
      const count = await prisma.student.count({
        where: {
          ...baseStudentWhere,
          createdAt: { lte: yEnd },
        },
      });
      enrollmentByYear.push({ year: y, count });
    }

    // Attendance for selected year - aggregate
    const attendanceRecords = await prisma.attendance.groupBy({
      by: ["status"],
      where: {
        class: { schoolId, ...(classId ? { id: classId } : {}) },
        date: { gte: yearStart, lte: yearEnd },
      },
      _count: true,
    });
    const attByStatus = attendanceRecords.reduce(
      (acc, r) => {
        acc[r.status] = r._count;
        return acc;
      },
      {} as Record<string, number>
    );
    const present = attByStatus["PRESENT"] ?? 0;
    const absent = attByStatus["ABSENT"] ?? 0;
    const late = attByStatus["LATE"] ?? 0;
    const total = present + absent + late;
    const studentAttendancePct = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    // Subject performance - avg (marks/totalMarks)*100 per subject
    const marks = await prisma.mark.findMany({
      where: {
        class: { schoolId, ...(classId ? { id: classId } : {}) },
        totalMarks: { gt: 0 },
        createdAt: { gte: yearStart, lte: yearEnd },
      },
      select: { subject: true, marks: true, totalMarks: true },
    });
    const bySubject: Record<string, { sum: number; total: number }> = {};
    marks.forEach((m) => {
      if (!bySubject[m.subject]) bySubject[m.subject] = { sum: 0, total: 0 };
      bySubject[m.subject].sum += m.totalMarks > 0 ? (m.marks / m.totalMarks) * 100 : 0;
      bySubject[m.subject].total += 1;
    });
    const subjectPerformance = Object.entries(bySubject).map(([subject, { sum, total }]) => ({
      subject,
      percentage: total > 0 ? Math.round((sum / total) * 10) / 10 : 0,
    })).sort((a, b) => b.percentage - a.percentage).slice(0, 10);

    // Top performing teachers - by average student marks
    const teacherMarks = await prisma.mark.findMany({
      where: {
        class: { schoolId, ...(classId ? { id: classId } : {}) },
        createdAt: { gte: yearStart, lte: yearEnd },
      },
      select: {
        teacherId: true,
        marks: true,
        totalMarks: true,
        teacher: {
          select: {
            id: true,
            name: true,
            subject: true,
            subjects: true,
          },
        },
      },
    });

    const teacherScores: Record<string, { sum: number; count: number; teacher: typeof teacherMarks[0]["teacher"] }> = {};
    teacherMarks.forEach((m) => {
      const id = m.teacherId;
      if (!teacherScores[id]) {
        teacherScores[id] = { sum: 0, count: 0, teacher: m.teacher };
      }
      if (m.totalMarks > 0) {
        teacherScores[id].sum += (m.marks / m.totalMarks) * 100;
        teacherScores[id].count += 1;
      }
    });

    // All teachers sorted best to least (first top, then descending)
    const topTeachers = Object.entries(teacherScores)
      .map(([id, { sum, count, teacher }]) => ({
        id,
        name: teacher?.name ?? "Unknown",
        subject: teacher?.subjects?.[0] ?? teacher?.subject ?? "—",
        rating: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
      }))
      .filter((t) => t.rating > 0)
      .sort((a, b) => b.rating - a.rating);

    // Avg teacher rating - average of top teachers or overall marks avg
    const avgTeacherRating = topTeachers.length > 0
      ? Math.round((topTeachers.reduce((s, t) => s + t.rating, 0) / topTeachers.length) * 10) / 10
      : 0;

    // Total fees collected for the year
    const feesCollected = payments.reduce((s, p) => s + p.amount, 0);

    // Total enrollment
    const totalEnrollment = await prisma.student.count({
      where: baseStudentWhere,
    });

    // Classes for filter dropdown
    const classes = await prisma.class.findMany({
      where: { schoolId },
      select: { id: true, name: true, section: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      availableYears,
      classes,
      selectedYear: validYear,
      stats: {
        feesCollected,
        totalEnrollment,
        avgTeacherRating,
        avgExamScore: subjectPerformance.length > 0
          ? Math.round(
              (subjectPerformance.reduce((s, x) => s + x.percentage, 0) / subjectPerformance.length) * 10
            ) / 10
          : 0,
      },
      charts: {
        monthlyFeesCollection,
        enrollmentGrowth: enrollmentByYear,
        attendance: {
          students: studentAttendancePct,
          teachers: 0,
        },
        subjectPerformance,
      },
      topTeachers,
    });
  } catch (error) {
    console.error("Analysis API error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

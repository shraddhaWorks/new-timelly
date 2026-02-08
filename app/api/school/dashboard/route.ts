

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

/**
 * School Admin Dashboard API
 * GET /api/school/dashboard?year=2024
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SCHOOLADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const schoolId = session.user.schoolId;
    if (!schoolId) {
      return NextResponse.json(
        { message: "School not linked" },
        { status: 400 }
      );
    }

    /* ------------------ AVAILABLE YEARS ------------------ */

    const yearRows = await prisma.student.findMany({
      where: { schoolId },
      select: { createdAt: true },
    });

    const availableYears = Array.from(
      new Set(yearRows.map((s) => s.createdAt.getFullYear()))
    ).sort((a, b) => b - a);

    const { searchParams } = new URL(req.url);
    const year =
      Number(searchParams.get("year")) ||
      availableYears[0] ||
      new Date().getFullYear();

    const yearStart = new Date(`${year}-01-01`);
    const yearEnd = new Date(`${year}-12-31`);

    /* ------------------ STATS ------------------ */

    const feesCollected = await prisma.payment.aggregate({
      where: {
        student: { schoolId },
        createdAt: { gte: yearStart, lte: yearEnd },
        status: "SUCCESS",
      },
      _sum: { amount: true },
    });

    const totalEnrollment = await prisma.student.count({
      where: { schoolId },
    });

    const examAgg = await prisma.mark.aggregate({
      where: {
        class: { schoolId },
        createdAt: { gte: yearStart, lte: yearEnd },
      },
      _sum: { marks: true, totalMarks: true },
    });

    const avgExamScore =
      examAgg._sum.totalMarks && examAgg._sum.totalMarks > 0
        ? Math.round(
            (examAgg._sum.marks! / examAgg._sum.totalMarks) * 100
          )
        : 0;

    const teacherAvg = await prisma.teacherAuditRecord.aggregate({
      where: {
        teacher: { schoolId },
        createdAt: { gte: yearStart, lte: yearEnd },
      },
      _avg: { scoreImpact: true },
    });

    const avgTeacherRating = Math.min(
      5,
      Number(((teacherAvg._avg.scoreImpact ?? 0) / 10).toFixed(1))
    );

    /* ------------------ CHARTS ------------------ */

    const monthlyFeesRaw = await prisma.payment.findMany({
      where: {
        student: { schoolId },
        status: "SUCCESS",
        createdAt: { gte: yearStart, lte: yearEnd },
      },
      select: { amount: true, createdAt: true },
    });

    const monthlyMap: Record<string, number> = {};
    monthlyFeesRaw.forEach((p) => {
      const month = p.createdAt.toLocaleString("en-US", { month: "short" });
      monthlyMap[month] = (monthlyMap[month] || 0) + p.amount;
    });

    const monthlyFeesCollection = Object.entries(monthlyMap).map(
      ([month, amount]) => ({ month, amount })
    );

    const students = await prisma.student.findMany({
      where: { schoolId },
      select: { createdAt: true },
    });

    const enrollmentMap: Record<number, number> = {};
    students.forEach((s) => {
      const y = s.createdAt.getFullYear();
      enrollmentMap[y] = (enrollmentMap[y] || 0) + 1;
    });

    const enrollmentGrowth = Object.entries(enrollmentMap)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([year, count]) => ({
        year: Number(year),
        count,
      }));

    const studentAttendance = await prisma.attendance.aggregate({
      where: {
        class: { schoolId },
        createdAt: { gte: yearStart, lte: yearEnd },
        status: "PRESENT",
      },
      _count: true,
    });

    const teacherAttendance = await prisma.attendance.aggregate({
      where: {
        teacher: { schoolId },
        createdAt: { gte: yearStart, lte: yearEnd },
        status: "PRESENT",
      },
      _count: true,
    });

    const subjectAgg = await prisma.mark.groupBy({
      by: ["subject"],
      where: {
        class: { schoolId },
        createdAt: { gte: yearStart, lte: yearEnd },
      },
      _sum: { marks: true, totalMarks: true },
    });

    const subjectPerformance = subjectAgg.map((s) => ({
      subject: s.subject,
      percentage: s._sum.totalMarks
        ? Math.round((s._sum.marks! / s._sum.totalMarks) * 100)
        : 0,
    }));

    const teacherScores = await prisma.teacherAuditRecord.groupBy({
      by: ["teacherId"],
      where: {
        teacher: { schoolId },
        createdAt: { gte: yearStart, lte: yearEnd },
      },
      _sum: { scoreImpact: true },
      orderBy: {
        _sum: { scoreImpact: "desc" },
      },
      take: 5,
    });

    const teacherIds = teacherScores.map((t) => t.teacherId);

    const teachers = await prisma.user.findMany({
      where: { id: { in: teacherIds } },
      select: { id: true, name: true, subject: true },
    });

    const topTeachers = teacherScores.map((t) => {
      const teacher = teachers.find((x) => x.id === t.teacherId);
      return {
        id: teacher?.id!,
        name: teacher?.name!,
        subject: teacher?.subject!,
        rating: Math.min(5, Number(((t._sum.scoreImpact ?? 0) / 10).toFixed(1))),
      };
    });

    /* ------------------ RESPONSE ------------------ */

    return NextResponse.json({
      availableYears,
      selectedYear: year,
      stats: {
        feesCollected: feesCollected._sum.amount ?? 0,
        totalEnrollment,
        avgTeacherRating,
        avgExamScore,
      },
      charts: {
        monthlyFeesCollection,
        enrollmentGrowth,
        attendance: {
          students: studentAttendance._count,
          teachers: teacherAttendance._count,
        },
        subjectPerformance,
      },
      topTeachers,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

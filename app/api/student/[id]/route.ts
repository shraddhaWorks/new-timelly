import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

type RouteParams =
  | { params: { id: string } }
  | { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteParams) {
  const resolved = "then" in context.params ? await context.params : context.params;
  const id = resolved.id;

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user.role === "SCHOOLADMIN" || session.user.role === "SUPERADMIN";
  const isOwnStudent = session.user.studentId === id;

  if (!isAdmin && !isOwnStudent) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    let schoolId = session.user.schoolId;
    if (!schoolId && isAdmin) {
      const adminSchool = await prisma.school.findFirst({
        where: { admins: { some: { id: session.user.id } } },
        select: { id: true },
      });
      schoolId = adminSchool?.id ?? null;
    }

    const student = await prisma.student.findUnique({
      where: {
        id,
        ...(schoolId ? { schoolId } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true, photoUrl: true } },
        class: { select: { id: true, name: true, section: true } },
        fee: true,
      },
    });

    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    const payments = await prisma.payment.findMany({
      where: { studentId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const attendances = await prisma.attendance.findMany({
      where: { studentId: id },
      orderBy: { date: "desc" },
      take: 90,
    });

    const marks = await prisma.mark.findMany({
      where: { studentId: id },
      include: { class: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    const certificates = await prisma.certificate.findMany({
      where: { studentId: id },
      include: {
        template: { select: { name: true } },
        issuedBy: { select: { name: true } },
      },
      orderBy: { issuedDate: "desc" },
    });

    const dob = student.dob ? new Date(student.dob) : null;
    const age = dob
      ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null;

    const attendanceByMonth = attendances.reduce(
      (acc, a) => {
        const key = a.date.toISOString().slice(0, 7);
        if (!acc[key]) acc[key] = { present: 0, total: 0 };
        acc[key].total += 1;
        if (a.status === "PRESENT" || a.status === "LATE") acc[key].present += 1;
        return acc;
      },
      {} as Record<string, { present: number; total: number }>
    );

    const attendanceTrends = Object.entries(attendanceByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, v]) => ({
        month,
        present: v.present,
        total: v.total,
        pct: v.total > 0 ? Math.round((v.present / v.total) * 100) : 0,
      }));

    const marksBySubject = marks.reduce(
      (acc, m) => {
        const key = m.subject;
        if (!acc[key]) acc[key] = { marks: 0, total: 0, count: 0 };
        acc[key].marks += m.marks;
        acc[key].total += m.totalMarks;
        acc[key].count += 1;
        return acc;
      },
      {} as Record<string, { marks: number; total: number; count: number }>
    );

    const academicPerformance = Object.entries(marksBySubject).map(([subject, v]) => ({
      subject,
      score: v.total > 0 ? Math.round((v.marks / v.total) * 100) : 0,
    }));

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.user?.name ?? "",
        admissionNumber: student.admissionNumber,
        email: student.user?.email ?? "",
        photoUrl: student.user?.photoUrl ?? null,
        rollNo: student.rollNo ?? "",
        dob: student.dob?.toISOString().slice(0, 10) ?? "",
        age,
        address: student.address ?? "",
        phone: student.phoneNo ?? "",
        fatherName: student.fatherName ?? "",
        motherName: (student as { motherName?: string | null }).motherName ?? "",
        fatherOccupation: (student as { fatherOccupation?: string | null }).fatherOccupation ?? "",
        motherOccupation: (student as { motherOccupation?: string | null }).motherOccupation ?? "",
        fatherPhone: student.phoneNo ?? "",
        class: student.class
          ? {
              id: student.class.id,
              name: student.class.name,
              section: student.class.section,
              displayName: `${student.class.name}${student.class.section ? `-${student.class.section}` : ""}`,
            }
          : null,
      },
      fee: student.fee
        ? {
            totalFee: student.fee.finalFee,
            amountPaid: student.fee.amountPaid,
            remainingFee: student.fee.remainingFee,
            moneyForStudent: (student.fee as { moneyForStudent?: number }).moneyForStudent ?? null,
          }
        : null,
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        method: p.gateway,
        createdAt: p.createdAt,
        transactionId: p.transactionId,
      })),
      attendanceTrends,
      academicPerformance,
      certificates: certificates.map((c) => ({
        id: c.id,
        title: c.title,
        issuedDate: c.issuedDate,
        issuedBy: c.issuedBy?.name,
        templateName: c.template?.name,
        certificateUrl: c.certificateUrl,
      })),
    });
  } catch (error: unknown) {
    console.error("Student details error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

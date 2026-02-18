import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    let schoolId = session.user.schoolId;
    if (!schoolId && session.user.studentId) {
      const student = await prisma.student.findUnique({
        where: { id: session.user.studentId },
        select: { schoolId: true },
      });
      schoolId = student?.schoolId ?? null;
    }
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

    const where: any = {
      schoolId: schoolId,
    };

    // Filter by student
    if (session.user.studentId) {
      // For students: only show their own certificates
      where.studentId = session.user.studentId;
    } else if (studentId) {
      // For teachers/admins: filter by student if provided
      where.studentId = studentId;
    }
    const certificates = await prisma.certificate.findMany({
      where,
      include: {
        student: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        template: {
          select: { id: true, name: true, description: true },
        },
        issuedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: {
        issuedDate: "desc",
      },
    });

    return NextResponse.json({ certificates }, { status: 200 });
  } catch (error: any) {
    console.error("List certificates error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

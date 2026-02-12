import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch student with class and assigned teacher
    const student = await prisma.student.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        class: {
          include: {
            teacher: true, // ✅ correct relation as per schema
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    if (!student.class) {
      return NextResponse.json(
        { message: "Class not assigned" },
        { status: 404 }
      );
    }

    if (!student.class.teacher) {
      return NextResponse.json(
        { message: "Teacher not assigned to class" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      teacherId: student.class.teacher.id,
      teacherName: student.class.teacher.name,
      teacherEmail: student.class.teacher.email,
      classId: student.class.id,
      className: student.class.name,
      section: student.class.section,
      photoUrl: student.class.teacher.photoUrl,
    });
  } catch (error) {
    console.error("STUDENT_CLASS_TEACHER_ERROR:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

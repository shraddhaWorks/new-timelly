import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import { redis } from "@/lib/redis";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let schoolId = session.user.schoolId;

    if (!schoolId) {
      const adminSchool = await prisma.school.findFirst({
        where: { admins: { some: { id: session.user.id } } },
        select: { id: true },
      });
      schoolId = adminSchool?.id ?? null;

      if (schoolId) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { schoolId },
        });
      }
    }

    if (!schoolId) {
      return NextResponse.json(
        { message: "School not found in session" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const rollNo = searchParams.get("rollNo")?.trim();
    const admissionNumber = searchParams.get("admissionNumber")?.trim();

    const where: {
      schoolId: string;
      rollNo?: string | { contains: string; mode: "insensitive" };
      admissionNumber?: string | { contains: string; mode: "insensitive" };
    } = { schoolId };
    if (rollNo) where.rollNo = { contains: rollNo, mode: "insensitive" };
    if (admissionNumber) where.admissionNumber = { contains: admissionNumber, mode: "insensitive" };

    const students = await prisma.student.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        class: {
          select: { id: true, name: true, section: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!rollNo && !admissionNumber) {
      const cachedKey = `students:${schoolId}`;
      await redis.set(cachedKey, students, { ex: 60 * 5 });
    }

    return NextResponse.json({ students }, { status: 200 });
  } catch (error: unknown) {
    console.error("List students error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

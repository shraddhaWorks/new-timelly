import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import { ExamTermStatus } from "@/app/generated/prisma";

async function resolveSchoolId(session: { user: { id: string; schoolId?: string | null; role: string } }) {
  let schoolId = session.user.schoolId;
  if (!schoolId) {
    const school = await prisma.school.findFirst({
      where: { admins: { some: { id: session.user.id } } },
      select: { id: true },
    });
    schoolId = school?.id ?? null;
  }
  return schoolId;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const role = session.user.role;
    if (role !== "SCHOOLADMIN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const schoolId = await resolveSchoolId(session);
    if (!schoolId) return NextResponse.json({ message: "School not found" }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const status = searchParams.get("status");

    const terms = await prisma.examTerm.findMany({
      where: {
        schoolId,
        ...(classId ? { classId } : {}),
        ...(status ? { status: status as ExamTermStatus } : {}),
      },
      include: {
        class: { select: { id: true, name: true, section: true } },
        _count: { select: { schedules: true, syllabus: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ terms }, { status: 200 });
  } catch (e: unknown) {
    console.error("Exams terms GET:", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "SCHOOLADMIN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const schoolId = await resolveSchoolId(session);
    if (!schoolId) return NextResponse.json({ message: "School not found" }, { status: 400 });

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : null;
    const classId = typeof body.classId === "string" ? body.classId : null;
    const status = (body.status as ExamTermStatus | undefined) ?? "UPCOMING";

    if (!name || !classId) {
      return NextResponse.json({ message: "name and classId are required" }, { status: 400 });
    }

    const term = await prisma.examTerm.create({
      data: { name, description, classId, status, schoolId },
      include: { class: { select: { id: true, name: true, section: true } } },
    });

    return NextResponse.json({ term }, { status: 201 });
  } catch (e: unknown) {
    console.error("Exams terms POST:", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}


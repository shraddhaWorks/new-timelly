import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import { randomUUID } from "crypto";

const DEFAULT_EXAM_TYPES = ["TERM 1", "TERM 2", "FINAL"];

async function resolveSchoolId(session: {
  user: { id: string; schoolId?: string | null; role: string };
}) {
  let schoolId = session.user.schoolId;

  if (!schoolId) {
    if (session.user.role === "TEACHER") {
      const teacherClass = await prisma.class.findFirst({
        where: { teacherId: session.user.id },
        select: { schoolId: true },
      });
      schoolId = teacherClass?.schoolId ?? null;

      if (!schoolId) {
        const teacherSchool = await prisma.school.findFirst({
          where: { teachers: { some: { id: session.user.id } } },
          select: { id: true },
        });
        schoolId = teacherSchool?.id ?? null;
      }
    }

    if (!schoolId) {
      const school = await prisma.school.findFirst({
        where: { admins: { some: { id: session.user.id } } },
        select: { id: true },
      });
      schoolId = school?.id ?? null;
    }
  }

  return schoolId;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    if (role !== "SCHOOLADMIN" && role !== "TEACHER" && role !== "STUDENT") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const schoolId = await resolveSchoolId(session);
    if (!schoolId) {
      return NextResponse.json({ message: "School not found" }, { status: 400 });
    }

    const [customTypes, termNames] = await Promise.all([
      prisma.$queryRaw<Array<{ name: string | null }>>`
        SELECT "name" FROM "ExamType" WHERE "schoolId" = ${schoolId}
      `,
      prisma.$queryRaw<Array<{ name: string | null }>>`
        SELECT DISTINCT "name" FROM "ExamTerm" WHERE "schoolId" = ${schoolId}
      `,
    ]);

    const names = new Set<string>();
    DEFAULT_EXAM_TYPES.forEach((n) => names.add(n));
    termNames.forEach((t) => {
      if (t.name) names.add(t.name.trim().toUpperCase());
    });
    customTypes.forEach((t) => {
      if (t.name) names.add(t.name.trim().toUpperCase());
    });

    return NextResponse.json(
      { examTypes: Array.from(names).sort() },
      { status: 200 }
    );
  } catch (e: unknown) {
    console.error("Exam types GET:", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    if (role !== "SCHOOLADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const schoolId = await resolveSchoolId(session);
    if (!schoolId) {
      return NextResponse.json({ message: "School not found" }, { status: 400 });
    }

    const body = await req.json();
    const name =
      typeof body.name === "string" ? body.name.trim().toUpperCase() : "";

    if (!name) {
      return NextResponse.json(
        { message: "Exam type name is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.$queryRaw<Array<{ name: string }>>`
      SELECT "name" FROM "ExamType"
      WHERE "schoolId" = ${schoolId} AND UPPER("name") = ${name}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "This exam type name already exists" },
        { status: 409 }
      );
    }

    const id = randomUUID();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "ExamType" ("id", "name", "schoolId", "createdAt") VALUES ($1, $2, $3, NOW())`,
      id,
      name,
      schoolId
    );

    return NextResponse.json({ examType: { id, name, schoolId } }, { status: 201 });
  } catch (e: unknown) {
    console.error("Exam types POST:", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}


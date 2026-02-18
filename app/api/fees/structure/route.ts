import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

async function getSchoolId(session: { user: { id: string; schoolId?: string | null } }) {
  let schoolId = session.user.schoolId;
  if (!schoolId) {
    const adminSchool = await prisma.school.findFirst({
      where: { admins: { some: { id: session.user.id } } },
      select: { id: true },
    });
    schoolId = adminSchool?.id ?? null;
  }
  return schoolId;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const isAdmin = session.user.role === "SCHOOLADMIN" || session.user.role === "SUPERADMIN";
  if (!isAdmin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const schoolId = await getSchoolId(session);
    if (!schoolId) {
      return NextResponse.json({ message: "School not found" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    const where: { schoolId: string; classId?: string } = { schoolId };
    if (classId) where.classId = classId;

    const structures = await prisma.classFeeStructure.findMany({
      where,
      include: { class: { select: { id: true, name: true, section: true } } },
    });

    return NextResponse.json({ structures });
  } catch (error: any) {
    console.error("Fee structure GET error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const isAdmin = session.user.role === "SCHOOLADMIN" || session.user.role === "SUPERADMIN";
  if (!isAdmin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const schoolId = await getSchoolId(session);
    if (!schoolId) {
      return NextResponse.json({ message: "School not found" }, { status: 400 });
    }

    const body = await req.json();
    const { classId, components } = body;

    if (!classId || !Array.isArray(components)) {
      return NextResponse.json(
        { message: "classId and components (array) required" },
        { status: 400 }
      );
    }

    const valid = components.every(
      (c: unknown) =>
        c && typeof c === "object" && typeof (c as { name?: unknown }).name === "string" && typeof (c as { amount?: unknown }).amount === "number"
    );
    if (!valid) {
      return NextResponse.json(
        { message: "Each component must have name (string) and amount (number)" },
        { status: 400 }
      );
    }

    const structure = await prisma.classFeeStructure.upsert({
      where: { classId },
      create: { schoolId, classId, components: components as object[] },
      update: { components: components as object[] },
      include: { class: { select: { id: true, name: true, section: true } } },
    });

    return NextResponse.json({ structure });
  } catch (error: any) {
    console.error("Fee structure PUT error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

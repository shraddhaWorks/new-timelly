import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import { ExamTermStatus } from "@/app/generated/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "SCHOOLADMIN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const term = await prisma.examTerm.findUnique({
      where: { id },
      include: {
        class: { select: { id: true, name: true, section: true } },
        schedules: { orderBy: { examDate: "asc" } },
        syllabus: {
          orderBy: { subject: "asc" },
          include: { units: { orderBy: { order: "asc" } } },
        },
      },
    });
    return NextResponse.json({ term }, { status: 200 });
  } catch (e: unknown) {
    console.error("Exams term GET:", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "SCHOOLADMIN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const data: { name?: string; description?: string | null; status?: ExamTermStatus } = {};
    if (typeof body.name === "string") data.name = body.name.trim();
    if (typeof body.description === "string") data.description = body.description.trim();
    if (body.description === null) data.description = null;
    if (body.status === "UPCOMING" || body.status === "COMPLETED") data.status = body.status;

    const term = await prisma.examTerm.update({
      where: { id },
      data,
    });
    return NextResponse.json({ term }, { status: 200 });
  } catch (e: unknown) {
    console.error("Exams term PUT:", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}


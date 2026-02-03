import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "SCHOOLADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const schedules = await prisma.examSchedule.findMany({
      where: { termId: id },
      orderBy: { examDate: "asc" },
    });

    return NextResponse.json({ schedules }, { status: 200 });
  } catch (e: unknown) {
    console.error("Exams schedule GET:", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "SCHOOLADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const examDate = body.examDate ? new Date(body.examDate) : null;
    const startTime = typeof body.startTime === "string" ? body.startTime.trim() : "";
    const durationMin = Number(body.durationMin);

    if (!subject || !examDate || isNaN(examDate.getTime()) || !startTime || !Number.isFinite(durationMin)) {
      return NextResponse.json(
        { message: "subject, examDate, startTime and durationMin are required" },
        { status: 400 }
      );
    }

    const schedule = await prisma.examSchedule.create({
      data: {
        termId: id,
        subject,
        examDate,
        startTime,
        durationMin: Math.trunc(durationMin),
      },
    });

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (e: unknown) {
    console.error("Exams schedule POST:", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}


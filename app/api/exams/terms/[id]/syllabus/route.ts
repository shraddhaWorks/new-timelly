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
    const syllabus = await prisma.syllabusTracking.findMany({
      where: { termId: id },
      orderBy: { subject: "asc" },
    });

    return NextResponse.json({ syllabus }, { status: 200 });
  } catch (e: unknown) {
    console.error("Exams syllabus GET:", e);
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
    const completedPercentRaw = Number(body.completedPercent ?? 0);
    const notes =
      typeof body.notes === "string" && body.notes.trim().length > 0
        ? body.notes.trim()
        : null;

    if (!subject) {
      return NextResponse.json({ message: "subject is required" }, { status: 400 });
    }

    const completedPercent = Math.max(0, Math.min(100, Math.trunc(completedPercentRaw)));

    const record = await prisma.syllabusTracking.upsert({
      where: {
        termId_subject: {
          termId: id,
          subject,
        },
      },
      create: {
        termId: id,
        subject,
        completedPercent,
        notes,
      },
      update: {
        completedPercent,
        notes,
      },
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (e: unknown) {
    console.error("Exams syllabus POST:", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}


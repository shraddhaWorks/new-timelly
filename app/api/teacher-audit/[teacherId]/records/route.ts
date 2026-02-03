import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import { TeacherAuditCategory } from "@/app/generated/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "SCHOOLADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { teacherId } = await params;

    const { searchParams } = new URL(req.url);
    const take = Math.min(100, Number(searchParams.get("take") || 50));

    const records = await prisma.teacherAuditRecord.findMany({
      where: { teacherId },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take,
    });

    const agg = await prisma.teacherAuditRecord.aggregate({
      where: { teacherId },
      _sum: { scoreImpact: true },
      _count: { _all: true },
    });

    const performanceScore = Math.max(0, Math.min(100, 50 + (agg._sum.scoreImpact ?? 0)));

    return NextResponse.json(
      { records, performanceScore, recordCount: agg._count._all },
      { status: 200 }
    );
  } catch (e: unknown) {
    console.error("Teacher audit records GET:", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "SCHOOLADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { teacherId } = await params;
    const body = await req.json();

    const category = body.category as TeacherAuditCategory | undefined;
    const customCategory = typeof body.customCategory === "string" ? body.customCategory.trim() : null;
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const scoreImpact = Number(body.scoreImpact);

    if (!category) {
      return NextResponse.json({ message: "category is required" }, { status: 400 });
    }
    if (category === "CUSTOM" && !customCategory) {
      return NextResponse.json({ message: "customCategory is required for CUSTOM" }, { status: 400 });
    }
    if (!description) {
      return NextResponse.json({ message: "description is required" }, { status: 400 });
    }
    if (!Number.isFinite(scoreImpact) || Math.abs(scoreImpact) > 100) {
      return NextResponse.json({ message: "scoreImpact must be a number between -100 and 100" }, { status: 400 });
    }

    const record = await prisma.teacherAuditRecord.create({
      data: {
        teacherId,
        createdById: session.user.id,
        category,
        customCategory,
        description,
        scoreImpact: Math.trunc(scoreImpact),
      },
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (e: unknown) {
    console.error("Teacher audit records POST:", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}


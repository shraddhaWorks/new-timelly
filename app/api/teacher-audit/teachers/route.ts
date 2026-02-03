import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

function clampScore(score: number) {
  return Math.max(0, Math.min(100, score));
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "SCHOOLADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    let schoolId = session.user.schoolId;
    if (!schoolId) {
      const adminSchool = await prisma.school.findFirst({
        where: { admins: { some: { id: session.user.id } } },
        select: { id: true },
      });
      schoolId = adminSchool?.id ?? null;
    }
    if (!schoolId) return NextResponse.json({ message: "School not found" }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";

    const teachers = await prisma.user.findMany({
      where: {
        schoolId,
        role: "TEACHER",
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
                { teacherId: { contains: q, mode: "insensitive" } },
                { subject: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        photoUrl: true,
        teacherId: true,
        subject: true,
      },
      orderBy: { name: "asc" },
      take: 50,
    });

    // Compute performance scores (baseline 50 + sum impacts, clamped 0..100)
    const scores = await Promise.all(
      teachers.map(async (t) => {
        const agg = await prisma.teacherAuditRecord.aggregate({
          where: { teacherId: t.id },
          _sum: { scoreImpact: true },
          _count: { _all: true },
        });
        const impact = agg._sum.scoreImpact ?? 0;
        const score = clampScore(50 + impact);
        return { teacherId: t.id, score, recordCount: agg._count._all };
      })
    );

    const scoreMap = new Map(scores.map((s) => [s.teacherId, s]));

    return NextResponse.json(
      {
        teachers: teachers.map((t) => ({
          ...t,
          performanceScore: scoreMap.get(t.id)?.score ?? 50,
          recordCount: scoreMap.get(t.id)?.recordCount ?? 0,
        })),
      },
      { status: 200 }
    );
  } catch (e: unknown) {
    console.error("Teacher audit teachers GET:", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}


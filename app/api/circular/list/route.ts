import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    let schoolId = session.user.schoolId;
    if (!schoolId) {
      const adminSchool = await prisma.school.findFirst({
        where: { admins: { some: { id: session.user.id } } },
        select: { id: true },
      });
      schoolId = adminSchool?.id ?? null;
      if (schoolId && session.user.role === "SCHOOLADMIN") {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { schoolId },
        });
      }
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // PUBLISHED | DRAFT | all

    const where: { schoolId: string; publishStatus?: string } = { schoolId: schoolId! };
    if (status && status !== "all") where.publishStatus = status;

    const circulars = await prisma.circular.findMany({
      where,
      include: { issuedBy: { select: { id: true, name: true } } },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ circulars }, { status: 200 });
  } catch (e: unknown) {
    console.error("Circular list:", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let schoolId = session.user.schoolId;
    if (!schoolId) {
      const adminSchool = await prisma.school.findFirst({
        where: { admins: { some: { id: session.user.id } } },
        select: { id: true },
      });
      schoolId = adminSchool?.id ?? null;
    }
    if (!schoolId) {
      return NextResponse.json(
        { message: "School not found in session" },
        { status: 400 }
      );
    }

    const where: any = {
      schoolId: schoolId,
    };

    // For students: only show their own certificate requests
    if (session.user.studentId) {
      where.studentId = session.user.studentId;
    }

    if (status) {
      where.status = status;
    }
   const cachedKey = `certificate-requests:${schoolId}:${session.user.studentId || "all"}:${status || "all"}`;
   const cachedRequests = await redis.get(cachedKey);
    if (cachedRequests) {
      console.log("✅ Certificate requests served from Redis");
      return NextResponse.json({ certificateRequests: JSON.parse(cachedRequests as string) }, { status: 200 });
    }
    const certificateRequests = await prisma.transferCertificate.findMany({
      where,
      include: {
        student: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            class: {
              select: { id: true, name: true, section: true },
            },
          },
        },
        requestedBy: {
          select: { id: true, name: true, email: true },
        },
        approvedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    await redis.set(cachedKey, JSON.stringify(certificateRequests), { ex: 60 * 5 }); // Cache for 5 minutes
    return NextResponse.json({ certificateRequests }, { status: 200 });
  } catch (error: any) {
    console.error("List certificate requests error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

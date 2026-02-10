import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let schoolId = session.user.schoolId;

    if (!schoolId) {
      if (session.user.role === "SCHOOLADMIN") {
        const adminSchool = await prisma.school.findFirst({
          where: { admins: { some: { id: session.user.id } } },
          select: { id: true },
        });
        schoolId = adminSchool?.id ?? null;
      }
    }

    if (!schoolId) {
      return NextResponse.json(
        { message: "School not found" },
        { status: 400 }
      );
    }

    const roomAllocations = await prisma.roomAllocation.findMany({
      where: {
        schoolId: schoolId,
      },
      include: {
        classRooms: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
                section: true,
              },
            },
          },
        },
        studentAssignments: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                class: {
                  select: {
                    id: true,
                    name: true,
                    section: true,
                  },
                },
              },
            },
          },
        },
        teacherAssignments: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ roomAllocations }, { status: 200 });
  } catch (error: any) {
    console.error("Room allocation list error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

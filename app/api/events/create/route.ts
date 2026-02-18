import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, description, type, level, location, mode, additionalInfo, photo, eventDate, classId, maxSeats } = await req.json();

    if (!title || !description || !type || !level || !location || !mode || !additionalInfo) {
      return NextResponse.json(
        { message: "Title, description, type, level, location, mode and additionalInfo are required" },
        { status: 400 }
      );
    }

    const teacherId = session.user.id;
    const schoolId = session.user.schoolId;

    if (!schoolId) {
      return NextResponse.json(
        { message: "School not found in session" },
        { status: 400 }
      );
    }

    // If classId is provided, verify it belongs to teacher's school
    if (classId) {
      const classData = await prisma.class.findFirst({
        where: {
          id: classId,
          schoolId: schoolId,
        },
      });

      if (!classData) {
        return NextResponse.json(
          { message: "Class not found or doesn't belong to your school" },
          { status: 404 }
        );
      }
    }

    let parsedEventDate: Date | null = null;
    if (eventDate) {
      const parsed = new Date(eventDate);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json(
          { message: "Invalid eventDate" },
          { status: 400 }
        );
      }
      parsedEventDate = parsed;
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        level,
        type,
        location,
        mode,
        additionalInfo,
        photo: photo || null,
        eventDate: parsedEventDate,
        classId: classId || null,
        teacherId,
        schoolId,
        maxSeats: maxSeats != null && typeof maxSeats === "number" ? maxSeats : null,
      },
      include: {
        class: {
          select: { id: true, name: true, section: true },
        },
        teacher: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });

    return NextResponse.json(
      { message: "Event created successfully", event },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create event error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

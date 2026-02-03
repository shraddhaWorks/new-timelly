import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        language: true,
        photoUrl: true,
        role: true,
      },
    });

    return NextResponse.json({ user }, { status: 200 });
  } catch (e: unknown) {
    console.error("User me GET:", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const data: {
      email?: string;
      mobile?: string | null;
      language?: string | null;
      photoUrl?: string | null;
      name?: string | null;
    } = {};

    if (typeof body.email === "string" && body.email.trim()) {
      data.email = body.email.trim().toLowerCase();
    }
    if (typeof body.mobile === "string" || body.mobile === null) {
      data.mobile = body.mobile;
    }
    if (typeof body.language === "string" || body.language === null) {
      data.language = body.language;
    }
    if (typeof body.photoUrl === "string" || body.photoUrl === null) {
      data.photoUrl = body.photoUrl;
    }
    if (typeof body.name === "string" || body.name === null) {
      data.name = body.name;
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        language: true,
        photoUrl: true,
        role: true,
      },
    });

    return NextResponse.json({ user }, { status: 200 });
  } catch (e: unknown) {
    console.error("User me PUT:", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}


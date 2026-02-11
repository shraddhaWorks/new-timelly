import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { extractSubdomain } from "@/lib/subdomain";

/**
 * GET /api/school/by-subdomain
 * Resolves school from subdomain (from x-school-subdomain header or ?subdomain= query)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const querySubdomain = searchParams.get("subdomain");
    const headersList = await headers();
    const subdomain =
      querySubdomain ?? headersList.get("x-school-subdomain") ?? null;

    if (!subdomain) {
      return NextResponse.json(
        { message: "No subdomain provided" },
        { status: 400 }
      );
    }

    const school = await prisma.school.findFirst({
      where: { subdomain, isActive: true },
      select: {
        id: true,
        name: true,
        subdomain: true,
        logoUrl: true,
      },
    });

    if (!school) {
      return NextResponse.json(
        { message: "School not found for subdomain" },
        { status: 404 }
      );
    }

    return NextResponse.json({ school });
  } catch (error) {
    console.error("School by subdomain error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

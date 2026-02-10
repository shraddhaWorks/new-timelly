import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { nameToSubdomain } from "@/lib/subdomain";

/**
 * GET /api/school/default-subdomain
 * Returns the subdomain of the first active school.
 * Used for redirect when user visits root domain without subdomain.
 */
export async function GET() {
  try {
    const school = await prisma.school.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, subdomain: true },
    });

    if (!school) {
      return NextResponse.json(
        { message: "No school found" },
        { status: 404 }
      );
    }

    const subdomain =
      school.subdomain ?? (nameToSubdomain(school.name) || "school");

    return NextResponse.json({ subdomain, schoolId: school.id });
  } catch (error) {
    console.error("Default subdomain error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

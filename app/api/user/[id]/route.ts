import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import prisma from "../../../../lib/db";
import bcrypt from "bcryptjs";

type Params = Promise<{ id: string }>;

// GET /api/user/[id] - Fetch single user
export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subject: true,
        schoolId: true,
        allowedFeatures: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if requester has access to this school
    if (user.schoolId !== session.user.schoolId) {
      return NextResponse.json(
        { message: "You do not have access to this user" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      ...user,
      designation: user.subject,
    });
  } catch (error: any) {
    console.error("User fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/user/[id] - Update user
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { name, email, role, designation, password, allowedFeatures } =
      await req.json();

    console.log(`[PUT] /api/user/${id} called by ${session.user?.id} (role=${session.user?.role})`);
    console.log("Payload:", { name, email, role, designation, allowedFeatures });

    // Check if user exists and belongs to same school
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      console.warn(`User not found for id=${id}`);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.schoolId !== session.user.schoolId) {
      return NextResponse.json(
        { message: "You do not have access to this user" },
        { status: 403 }
      );
    }

    // Check if new email is unique (if changing email)
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        return NextResponse.json(
          { message: "Email already in use" },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (designation) updateData.subject = designation;
    if (allowedFeatures !== undefined) updateData.allowedFeatures = allowedFeatures;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subject: true,
        allowedFeatures: true,
      },
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: {
        ...updatedUser,
        designation: updatedUser.subject,
      },
    });
  } catch (error: any) {
    console.error("User update error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/user/[id] - Delete user
export async function DELETE(
  req: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to delete users
    if (!["SCHOOLADMIN", "SUPERADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { message: "You do not have permission to delete users" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if user exists and belongs to same school
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.schoolId !== session.user.schoolId) {
      return NextResponse.json(
        { message: "You do not have access to this user" },
        { status: 403 }
      );
    }

    // Don't allow deleting the current user
    if (user.id === session.user.id) {
      return NextResponse.json(
        { message: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // Soft delete by setting email/name to indicate deletion
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error: any) {
    console.error("User deletion error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

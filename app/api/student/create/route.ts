import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { Role } from "@/app/generated/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let schoolId = session.user.schoolId;

    // Fallback: find school where the admin belongs
    if (!schoolId) {
      const adminSchool = await prisma.school.findFirst({
        where: { admins: { some: { id: session.user.id } } },
        select: { id: true },
      });
      schoolId = adminSchool?.id ?? null;

      if (schoolId) {
        // persist the school on the user for future requests
        await prisma.user.update({
          where: { id: session.user.id },
          data: { schoolId },
        });
      }
    }

    if (!schoolId) {
      return NextResponse.json(
        { message: "School not found in session" },
        { status: 400 }
      );
    }

    const {
      name,
      fatherName,
      aadhaarNo,
      phoneNo,
      email: emailInput,
      dob,
      classId,
      address,
      totalFee,
      discountPercent,
      rollNo,
    } = await req.json();

    // Validate all required fields
    if (!name || !dob || !fatherName || !aadhaarNo || !phoneNo) {
      return NextResponse.json(
        { message: "Missing required fields: name, dob, fatherName, aadhaarNo, and phoneNo are required" },
        { status: 400 }
      );
    }

    if (typeof totalFee !== "number" || totalFee <= 0) {
      return NextResponse.json(
        { message: "totalFee must be a positive number" },
        { status: 400 }
      );
    }

    const safeDiscount = typeof discountPercent === "number" ? discountPercent : 0;
    if (safeDiscount < 0 || safeDiscount > 100) {
      return NextResponse.json(
        { message: "discountPercent must be between 0 and 100" },
        { status: 400 }
      );
    }

    const dobDate = new Date(dob);
    const password = dobDate.toISOString().split("T")[0].replace(/-/g, "");
    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await prisma.$transaction(
      async (tx) => {
        const year = new Date().getFullYear();
        let settings = await tx.schoolSettings.findUnique({ where: { schoolId } });
        if (!settings) {
          settings = await tx.schoolSettings.create({
            data: { schoolId, admissionPrefix: "ADM", rollNoPrefix: "", admissionCounter: 0 },
          });
        }
        const nextNum = settings.admissionCounter + 1;
        const admissionNumber =
          `${settings.admissionPrefix}/${year}/${String(nextNum).padStart(3, "0")}`;
        await tx.schoolSettings.update({
          where: { schoolId },
          data: { admissionCounter: nextNum },
        });

        const rollNoPrefix = settings.rollNoPrefix || "";
        const finalRollNo =
          typeof rollNo === "string" && rollNo.trim()
            ? rollNo.trim()
            : rollNoPrefix
              ? `${rollNoPrefix}${nextNum}`
              : String(nextNum);

        const emailTrimmed =
          typeof emailInput === "string" && emailInput.trim().length > 0
            ? emailInput.trim()
            : null;
        const userEmail =
          emailTrimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)
            ? emailTrimmed
            : `${admissionNumber.replaceAll("/", "")}@${String(settings.admissionPrefix).toLowerCase()}.in`;

        const user = await tx.user.create({
          data: {
            name,
            email: userEmail,
            password: hashedPassword,
            role: Role.STUDENT,
            schoolId,
          },
        });

        const studentRecord = await tx.student.create({
          data: {
            userId: user.id,
            schoolId,
            admissionNumber,
            classId: classId ?? null,
            dob: dobDate,
            address,
            fatherName,
            aadhaarNo,
            phoneNo,
            rollNo: finalRollNo,
          },
          include: {
            user: { select: { id: true, name: true, email: true } },
            class: true,
          },
        });

        const finalFee = totalFee * (1 - safeDiscount / 100);
        await tx.studentFee.create({
          data: {
            studentId: studentRecord.id,
            totalFee,
            discountPercent: safeDiscount,
            finalFee,
            amountPaid: 0,
            remainingFee: finalFee,
            installments: 3,
          },
        });

        return studentRecord;
      },
      {
        maxWait: 10000, // Maximum time to wait for a transaction slot (10 seconds)
        timeout: 20000, // Maximum time the transaction can run (20 seconds)
      }
    );

    return NextResponse.json(
      { message: "Student created under your school", student },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Student creation error:", error);
    
    const err = error as { code?: string; message?: string; meta?: { target?: string[] } };
    // Handle transaction timeout errors
    if (err?.code === "P1008" || err?.message?.includes("transaction") || err?.message?.includes("timeout")) {
      return NextResponse.json(
        { message: "Transaction timeout. Please try again." },
        { status: 408 }
      );
    }

    // Handle Prisma unique constraint violations
    if (err?.code === "P2002") {
      const target = err?.meta?.target;
      const field = Array.isArray(target) ? target[0] : undefined;
      if (field === "email" || field === "admissionNumber") {
        return NextResponse.json(
          { message: "Admission number already exists" },
          { status: 400 }
        );
      }
      if (field === "aadhaarNo") {
        return NextResponse.json(
          { message: "Aadhaar number already exists" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { message: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

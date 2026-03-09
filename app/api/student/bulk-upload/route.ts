import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import * as XLSX from "xlsx";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let schoolId = session.user.schoolId;

    if (!schoolId) {
      const adminSchool = await prisma.school.findFirst({
        where: { admins: { some: { id: session.user.id } } },
        select: { id: true },
      });

      schoolId = adminSchool?.id ?? null;

      if (schoolId) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { schoolId },
        });
      }
    }

    if (!schoolId) {
      return NextResponse.json({ message: "School not found" }, { status: 400 });
    }

    /* ================= EXCEL ================= */

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "Excel file required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) {
      return NextResponse.json({ message: "Excel empty" }, { status: 400 });
    }

    // Basic safety: avoid extremely large uploads
    if (rows.length > 2000) {
      return NextResponse.json(
        { message: "Too many rows in sheet. Please upload at most 2000 students at a time." },
        { status: 400 }
      );
    }

    const created: any[] = [];
    const failed: any[] = [];

    /* ================= PREPARE SETTINGS (NO LONG TRANSACTION) ================= */

    const year = new Date().getFullYear();
    let settings = await prisma.schoolSettings.findUnique({ where: { schoolId } });
    if (!settings) {
      settings = await prisma.schoolSettings.create({
        data: { schoolId, admissionPrefix: "ADM", rollNoPrefix: "", admissionCounter: 0 },
      });
    }

    let admissionCounter: number = settings.admissionCounter;

    // Simple cache so we don't query the same class many times
    const classCache = new Map<string, string | null>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        const name = String(row.name || "").trim();
        const fatherName = String(row.fatherName || "").trim();

        const rawPhone = row.phoneNo ?? row.contactNumber ?? "";
        const rawAadhaar = row.aadhaarNo ?? row.aadhaarNumber ?? "";
        const phoneNo = String(rawPhone).replace(/\.0$/, "").trim();

        const aadhaarTrimmed = String(rawAadhaar || "").trim();
        const aadhaarCleaned = aadhaarTrimmed.replace(/[\s-]/g, "");

        const address = row.address ? String(row.address).trim() : null;

        const totalFee = Number(row.totalFee ?? row.totalFeeAmount ?? NaN);
        const discountPercent = Number(row.discountPercent ?? row.discount ?? 0);

        const genderInput = row.gender;
        const previousSchoolInput = row.previousSchool;
        const rollNoInput = row.rollNo ?? row.studentId;
        const emailInput = row.email;

        const className = row.class || row.className;
        const section = row.section || null;

        if (!name || !fatherName || !phoneNo || !aadhaarCleaned || !row.dob) {
          throw new Error("Missing required fields");
        }

        if (aadhaarCleaned.length < 12) {
          throw new Error("Aadhaar number must be at least 12 digits");
        }

        // Skip/flag if Aadhaar already exists in this school
        const existingAadhaar = await prisma.student.findUnique({
          where: { aadhaarNo: aadhaarCleaned },
          select: { id: true },
        });
        if (existingAadhaar) {
          throw new Error("Aadhaar number already exists");
        }

        if (!Number.isFinite(totalFee) || totalFee <= 0) {
          throw new Error("Invalid or missing totalFee");
        }

        if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
          throw new Error("Invalid discountPercent (must be between 0 and 100)");
        }

        let dobDate: Date;
        if (typeof row.dob === "number") {
          const d = XLSX.SSF.parse_date_code(row.dob);
          dobDate = new Date(d.y, d.m - 1, d.d);
        } else {
          dobDate = new Date(row.dob);
        }

        if (isNaN(dobDate.getTime())) {
          throw new Error("Invalid DOB");
        }

        // Optional: resolve class by name/section if provided
        let classId: string | null = null;
        if (className) {
          const key = `${String(className).trim()}::${section ? String(section).trim() : ""}`;
          if (classCache.has(key)) {
            classId = classCache.get(key) ?? null;
          } else {
            const classRecord = await prisma.class.findFirst({
              where: {
                schoolId,
                name: String(className).trim(),
                ...(section ? { section: String(section).trim() } : {}),
              },
              select: { id: true },
            });
            classId = classRecord?.id ?? null;
            classCache.set(key, classId);
          }
        }

        admissionCounter += 1;
        const nextNum = admissionCounter;
        const admissionNumber =
          `${settings.admissionPrefix}/${year}/${String(nextNum).padStart(3, "0")}`;

        const rollNoPrefix = settings.rollNoPrefix || "";
        const autoRollNo = rollNoPrefix ? `${rollNoPrefix}${nextNum}` : String(nextNum);
        const rollNo =
          typeof rollNoInput === "string" && rollNoInput.trim()
            ? rollNoInput.trim()
            : autoRollNo;

        const password = dobDate
          .toISOString()
          .split("T")[0]
          .replace(/-/g, "");

        const hashedPassword = await bcrypt.hash(password, 10);

        const emailTrimmed =
          typeof emailInput === "string" && emailInput.trim().length > 0
            ? emailInput.trim()
            : null;

        let userEmail =
          emailTrimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)
            ? emailTrimmed
            : `${admissionNumber.replaceAll("/", "")}@${String(settings.admissionPrefix).toLowerCase()}.in`;

        // Try to avoid email conflicts for bulk insert
        let existingUser = await prisma.user.findUnique({
          where: { email: userEmail },
          select: { id: true },
        });
        if (existingUser) {
          let counter = 1;
          do {
            userEmail = `${admissionNumber.replaceAll("/", "")}_${counter}@${String(settings.admissionPrefix).toLowerCase()}.in`;
            existingUser = await prisma.user.findUnique({
              where: { email: userEmail },
              select: { id: true },
            });
            counter++;
            if (counter > 1000) {
              throw new Error("Unable to generate unique email for student");
            }
          } while (existingUser);
        }

        const user = await prisma.user.create({
          data: {
            name,
            email: userEmail,
            password: hashedPassword,
            role: Role.STUDENT,
            schoolId,
          },
        });

        const gender =
          typeof genderInput === "string" && genderInput.trim()
            ? genderInput.trim()
            : null;
        const previousSchool =
          typeof previousSchoolInput === "string" && previousSchoolInput.trim()
            ? previousSchoolInput.trim()
            : null;

        const student = await prisma.student.create({
          data: {
            userId: user.id,
            schoolId,
            admissionNumber,
            classId,
            dob: dobDate,
            address,
            gender,
            previousSchool,
            fatherName,
            aadhaarNo: aadhaarCleaned,
            phoneNo,
            rollNo,
          },
        });

        const finalFee = Number((totalFee * (1 - discountPercent / 100)).toFixed(2));

        await prisma.studentFee.create({
          data: {
            studentId: student.id,
            totalFee,
            discountPercent,
            finalFee,
            amountPaid: 0,
            remainingFee: finalFee,
            installments: 3,
          },
        });

        created.push({ row: i + 2, name });
      } catch (err: any) {
        failed.push({ row: i + 2, error: err.message || "Unknown error" });
      }
    }

    // Persist the latest admission counter once after processing
    if (admissionCounter !== settings.admissionCounter) {
      await prisma.schoolSettings.update({
        where: { schoolId },
        data: { admissionCounter },
      });
    }

    return NextResponse.json({
      message: "Bulk upload completed",
      createdCount: created.length,
      failedCount: failed.length,
      created,
      failed,
    });

  } catch (err: any) {
    console.error("Bulk upload error", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

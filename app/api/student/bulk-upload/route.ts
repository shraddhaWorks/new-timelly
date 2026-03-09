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

    const created: any[] = [];
    const failed: any[] = [];

    // Preload classes once so we can map Class + Section -> classId
    const classes = await prisma.class.findMany({
      where: { schoolId },
      select: { id: true, name: true, section: true },
    });

    const year = new Date().getFullYear();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        const name = String(row.name || "").trim();
        const fatherName = String(row.fatherName || "").trim();

        const rawPhone = row.phoneNo ?? row.contactNumber ?? "";
        const rawAadhaar = row.aadhaarNo ?? "";
        const phoneNo = String(rawPhone).replace(/\.0$/, "").trim();
        const aadhaarNoRaw = String(rawAadhaar).replace(/\.0$/, "").trim();
        const aadhaarNo = aadhaarNoRaw.replace(/[\s-]/g, "");

        const address = row.address ? String(row.address).trim() : null;
        const gender = row.gender ? String(row.gender).trim() : null;
        const previousSchool = row.previousSchool
          ? String(row.previousSchool).trim()
          : null;

        const totalFee = Number(row.totalFee ?? NaN);
        const discountPercent = Number(row.discountPercent ?? 0);

        const rawDob = row.dob ?? row.dateOfBirth;

        if (!name || name.length < 2) {
          throw new Error("Name is required (min 2 characters)");
        }
        if (!fatherName || fatherName.length < 2) {
          throw new Error("Parent name is required (min 2 characters)");
        }
        if (!phoneNo || !/^\d{10}$/.test(phoneNo)) {
          throw new Error("Contact number must be exactly 10 digits");
        }
        if (!aadhaarNo || !/^\d{12}$/.test(aadhaarNo)) {
          throw new Error("Aadhaar number must be exactly 12 digits");
        }
        if (!rawDob) {
          throw new Error("Date of birth (dob) is required");
        }
        if (!Number.isFinite(totalFee) || totalFee <= 0) {
          throw new Error("totalFee is required and must be a positive number");
        }
        if (
          !Number.isFinite(discountPercent) ||
          discountPercent < 0 ||
          discountPercent > 100
        ) {
          throw new Error("discountPercent must be between 0 and 100");
        }

        let dobDate: Date;
        if (typeof rawDob === "number") {
          const d = XLSX.SSF.parse_date_code(rawDob);
          dobDate = new Date(d.y, d.m - 1, d.d);
        } else {
          dobDate = new Date(rawDob);
        }

        if (isNaN(dobDate.getTime())) {
          throw new Error("Invalid date of birth");
        }

        // Check duplicate Aadhaar before creating user/student
        const existingAadhaar = await prisma.student.findUnique({
          where: { aadhaarNo },
          select: { id: true },
        });
        if (existingAadhaar) {
          throw new Error("Aadhaar number already exists. Please check the Aadhaar number.");
        }

        // Optional: Class + Section mapping
        const className = row.class || row.className || "";
        const section = row.section || "";
        let classId: string | null = null;
        if (className) {
          const match = classes.find((c) => {
            const sameName =
              (c.name || "").trim().toLowerCase() ===
              String(className).trim().toLowerCase();
            const sameSection =
              !section ||
              ((c.section || "").trim().toLowerCase() ===
                String(section).trim().toLowerCase());
            return sameName && sameSection;
          });

          if (!match) {
            throw new Error(
              `Class/Section not found for "${className}"${
                section ? ` - "${section}"` : ""
              }`
            );
          }
          classId = match.id;
        }

        // Each student is created in its own short transaction
        await prisma.$transaction(
          async (tx) => {
            let settings = await tx.schoolSettings.findUnique({
              where: { schoolId },
            });
            if (!settings) {
              settings = await tx.schoolSettings.create({
                data: {
                  schoolId,
                  admissionPrefix: "ADM",
                  rollNoPrefix: "",
                  admissionCounter: 0,
                },
              });
            }

            // Atomically increment admissionCounter and get the latest value
            const updatedSettings = await tx.schoolSettings.update({
              where: { schoolId },
              data: { admissionCounter: { increment: 1 } },
              select: {
                admissionPrefix: true,
                rollNoPrefix: true,
                admissionCounter: true,
              },
            });

            const nextNum = updatedSettings.admissionCounter;
            const admissionNumber = `${
              updatedSettings.admissionPrefix
            }/${year}/${String(nextNum).padStart(3, "0")}`;

            // Extra safety: check if this admission number already exists
            const existingAdmission = await tx.student.findUnique({
              where: { admissionNumber },
              select: { id: true },
            });
            if (existingAdmission) {
              throw new Error(
                "Admission number conflict. Please try the upload again."
              );
            }

            const rollNoPrefix = updatedSettings.rollNoPrefix || "";
            const rawRollNo = row.rollNo ?? row.studentId ?? "";
            const finalRollNo =
              typeof rawRollNo === "string" && rawRollNo.trim()
                ? rawRollNo.trim()
                : rollNoPrefix
                ? `${rollNoPrefix}${nextNum}`
                : String(nextNum);

            const emailTrimmed =
              typeof row.email === "string" && row.email.trim().length > 0
                ? row.email.trim()
                : null;
            const admissionLocalPart = admissionNumber
              .replaceAll("/", "")
              .toLowerCase();
            const fallbackEmail = `${admissionLocalPart}@${String(
              updatedSettings.admissionPrefix
            ).toLowerCase()}.in`;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            let userEmail =
              emailTrimmed && emailRegex.test(emailTrimmed)
                ? emailTrimmed
                : fallbackEmail;

            // Ensure email is unique; if conflict, generate alternative like single-create API
            let existingUser = await tx.user.findUnique({
              where: { email: userEmail },
              select: { id: true },
            });
            if (existingUser) {
              let counter = 1;
              do {
                userEmail = `${admissionLocalPart}_${counter}@${String(
                  settings.admissionPrefix
                ).toLowerCase()}.in`;
                existingUser = await tx.user.findUnique({
                  where: { email: userEmail },
                  select: { id: true },
                });
                counter++;
                if (counter > 1000) {
                  throw new Error(
                    "Unable to generate unique email for student. Please try again."
                  );
                }
              } while (existingUser);
            }

            const password = dobDate
              .toISOString()
              .split("T")[0]
              .replace(/-/g, "");
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await tx.user.create({
              data: {
                name,
                email: userEmail,
                password: hashedPassword,
                role: Role.STUDENT,
                schoolId,
              },
            });

            const finalFee = Number(
              (totalFee * (1 - discountPercent / 100)).toFixed(2)
            );

            const student = await tx.student.create({
              data: {
                userId: user.id,
                schoolId,
                admissionNumber,
                rollNo: finalRollNo,
                dob: dobDate,
                address,
                fatherName,
                aadhaarNo,
                phoneNo,
                classId,
                gender,
                previousSchool,
              },
            });

            await tx.studentFee.create({
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
          },
          {
            maxWait: 10000,
            timeout: 30000,
          }
        );

        created.push({ row: i + 2, name });
      } catch (err: any) {
        failed.push({
          row: i + 2,
          error: err?.message || "Unknown error while creating student",
        });
      }
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
    return NextResponse.json(
      { message: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

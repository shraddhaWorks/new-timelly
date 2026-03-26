import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import { assertCanManageAdmissions, getSessionSchoolId } from "../_utils";
import * as XLSX from "xlsx";
import { emailLocalPartFromFullName, normalizeEmailDomain, schoolDomainFromName } from "@/lib/schoolEmail";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    assertCanManageAdmissions(session.user.role);

    const schoolId = await getSessionSchoolId(session);
    if (!schoolId) return NextResponse.json({ message: "School not found in session" }, { status: 400 });

    const [school, settings] = await Promise.all([
      prisma.school.findUnique({ where: { id: schoolId }, select: { name: true } }),
      prisma.schoolSettings.findUnique({ where: { schoolId }, select: { emailDomain: true } }),
    ]);
    const emailDomain =
      normalizeEmailDomain(settings?.emailDomain) ?? schoolDomainFromName(school?.name ?? "school");

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") ?? "").trim();
    const gradeSought = (searchParams.get("gradeSought") ?? "").trim();
    const boardingType = (searchParams.get("boardingType") ?? "").trim();
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;

    const where: any = { schoolId };
    if (gradeSought) where.gradeSought = gradeSought;
    if (boardingType) where.boardingType = boardingType;
    if (fromDate && !Number.isNaN(fromDate.getTime())) {
      where.createdAt = { ...(where.createdAt ?? {}), gte: fromDate };
    }
    if (toDate && !Number.isNaN(toDate.getTime())) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { ...(where.createdAt ?? {}), lte: end };
    }

    if (search) {
      where.OR = [
        { applicationNo: { contains: search, mode: "insensitive" } },
        { admissionNo: { contains: search, mode: "insensitive" } },
        { fedenaNo: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { parentName: { contains: search, mode: "insensitive" } },
        { parentPhone: { contains: search, mode: "insensitive" } },
        { aadharNo: { contains: search, mode: "insensitive" } },
      ];
    }

    const rows = await prisma.studentApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        firstName: true,
        middleName: true,
        lastName: true,
        parentName: true,
        aadharNo: true,
        gender: true,
        dateOfBirth: true,
        previousSchoolName: true,
        className: true,
        section: true,
        class: { select: { name: true, section: true } },
        totalFee: true,
        discountPercent: true,
        parentPhone: true,
        parentEmail: true,
        houseNo: true,
        street: true,
        city: true,
        town: true,
        state: true,
        pinCode: true,
        createdAt: true,
      },
    });

    const data = rows.map((r) => ({
      // Match /api/student/bulk-upload expected headers
      name: `${r.firstName} ${r.middleName ? `${r.middleName} ` : ""}${r.lastName}`.trim(),
      fatherName: r.parentName,
      rollNo: "",
      aadhaarNo: r.aadharNo,
      gender: r.gender === "MALE" ? "Male" : "Female",
      dob: r.dateOfBirth.toISOString().slice(0, 10),
      previousSchool: r.previousSchoolName,
      class: r.class?.name ?? r.className ?? "",
      section: r.class?.section ?? r.section ?? "",
      totalFee: r.totalFee ?? "",
      discountPercent: r.discountPercent ?? 0,
      phoneNo: r.parentPhone,
      email: `${emailLocalPartFromFullName(
        `${r.firstName} ${r.middleName ? `${r.middleName} ` : ""}${r.lastName}`.trim()
      )}@${emailDomain}`,
      password: r.dateOfBirth.toISOString().split("T")[0].replace(/-/g, ""),
      address: `${r.houseNo}, ${r.street}, ${r.town ? `${r.town}, ` : ""}${r.city}, ${r.state} - ${r.pinCode}`,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Admissions");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
    const body = new Uint8Array(buf);

    const filename = `admissions-${Date.now()}.xlsx`;

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e: unknown) {
    const err = e as { message?: string; statusCode?: number };
    return NextResponse.json(
      { message: err?.message ?? "Internal server error" },
      { status: err?.statusCode ?? 500 }
    );
  }
}


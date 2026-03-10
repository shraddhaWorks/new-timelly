import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "STUDENT" || !session.user.studentId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { id: session.user.studentId },
      select: {
        id: true,
        school: {
          select: {
            billingMode: true,
            parentSubscriptionAmount: true,
            parentSubscriptionTrialDays: true,
            isActive: true,
          },
        },
      },
    });

    if (!student || !student.school) {
      return NextResponse.json({ message: "Student or school not found" }, { status: 404 });
    }

    const defaultAmountEnv = process.env.PARENT_SUBSCRIPTION_AMOUNT_DEFAULT;
    const defaultAmount = defaultAmountEnv ? Number(defaultAmountEnv) || 0 : 0;
    const defaultTrialEnv = process.env.PARENT_SUBSCRIPTION_TRIAL_DAYS_DEFAULT;
    const defaultTrialDays = defaultTrialEnv ? Number(defaultTrialEnv) || 0 : 0;

    if (student.school.isActive === false) {
      return NextResponse.json(
        {
          status: "EXPIRED" as const,
          isTrial: false,
          billingMode: "PARENT_SUBSCRIPTION",
          amount: 0,
          remainingDays: 0,
          expiresAt: null,
          invoiceUrl: null,
          deactivated: true,
          message: "Your school's Timelly access is deactivated. Please contact your school or Timelly support.",
        },
        { status: 200 }
      );
    }

    const billingMode = (student.school.billingMode ?? "PARENT_SUBSCRIPTION") as
      | "PARENT_SUBSCRIPTION"
      | "SCHOOL_PAID";
    const amount =
      typeof student.school.parentSubscriptionAmount === "number"
        ? student.school.parentSubscriptionAmount
        : defaultAmount;
    const trialDays =
      typeof student.school.parentSubscriptionTrialDays === "number"
        ? student.school.parentSubscriptionTrialDays
        : defaultTrialDays;

    if (billingMode === "SCHOOL_PAID") {
      // School has already paid centrally – parents don't need to subscribe.
      return NextResponse.json(
        {
          status: "ACTIVE" as const,
          isTrial: false,
          billingMode,
          amount,
          trialDays,
          remainingDays: null,
          expiresAt: null,
          invoiceUrl: null,
        },
        { status: 200 }
      );
    }

    // Parent-subscription mode: treat as not yet subscribed so UI shows pay button.
    return NextResponse.json(
      {
        status: "EXPIRED" as const,
        isTrial: false,
        billingMode,
        amount,
        trialDays,
        remainingDays: 0,
        expiresAt: null,
        invoiceUrl: null,
      },
      { status: 200 }
    );
  } catch (e: unknown) {
    console.error("Parent subscription status error:", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}


/**
 * Create Payment Order (HyperPG only)
 *
 * Only students can create fee payment orders. We use the student's school to decide
 * split settlement: if the school has a HyperPG sub-merchant ID (sub_mid), the payment
 * is split so the school receives the amount. Main merchant credentials come from env.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import { createSession } from "@/lib/hyperpg";

// Main merchant credentials (one main merchant can have many sub-merchants = schools)
const hyperpgMerchantId = process.env.HYPERPG_MERCHANT_ID;
const hyperpgApiKey = process.env.HYPERPG_API_KEY;
const hyperpgBaseUrl =
  process.env.HYPERPG_BASE_URL || "https://sandbox.hyperpg.in";

export async function POST(req: Request) {
  // ----- 1. Auth: only logged-in users -----
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Only students pay fees through this flow; parents use the same API on behalf of student
  if (session.user.role !== "STUDENT" || !session.user.studentId) {
    return NextResponse.json(
      { error: "Only students can create payment orders" },
      { status: 403 }
    );
  }

  try {
    // ----- 2. Parse body: amount and optional return path -----
    const body = await req.json();
    const rawAmount = body.amount;
    const returnPath = (body.return_path as string) || "/payments";

    const amountNumber =
      typeof rawAmount === "string" ? parseFloat(rawAmount) : Number(rawAmount);

    if (
      !amountNumber ||
      isNaN(amountNumber) ||
      amountNumber <= 0
    ) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // ----- 3. Load student and school settings -----
    const student = await prisma.student.findUnique({
      where: { id: session.user.studentId },
      select: {
        schoolId: true,
        phoneNo: true,
        user: { select: { name: true, email: true } },
      },
    });
    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const settings = await prisma.schoolSettings.findUnique({
      where: { schoolId: student.schoolId },
    });

    // ----- 4. HyperPG must be configured (main merchant in env) -----
    if (!hyperpgMerchantId || !hyperpgApiKey) {
      return NextResponse.json(
        {
          error:
            "Payment not configured. Set HYPERPG_MERCHANT_ID and HYPERPG_API_KEY in .env",
        },
        { status: 500 }
      );
    }

    // ----- 5. Build return URL so after payment user comes back with order_id and amount -----
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const path = returnPath.startsWith("/") ? returnPath : `/${returnPath}`;
    const orderId = `timelly_${Date.now()}_${session.user.studentId}`;
    const returnUrl = `${baseUrl}${path}${path.includes("?") ? "&" : "?"}success=1&order_id=${encodeURIComponent(orderId)}&amount=${amountNumber}`;

    // ----- 6. Customer details for HyperPG payment page -----
    const name = student.user?.name || "Student";
    const parts = name.trim().split(/\s+/);
    const firstName = parts[0] || "Student";
    const lastName = parts.slice(1).join(" ") || "";

    // ----- 7. Optional split settlement: if school has sub_mid, send full amount to school -----
    const splitSettlementDetails =
      settings?.hyperpgSubMid && settings.hyperpgSubMid.trim()
        ? {
            subMid: settings.hyperpgSubMid.trim(),
            amount: amountNumber,
          }
        : undefined;

    // ----- 8. Call HyperPG Session API -----
    const result = await createSession({
      merchantId: hyperpgMerchantId,
      apiKey: hyperpgApiKey,
      baseUrl: hyperpgBaseUrl,
      amount: amountNumber,
      currency: "INR",
      orderId,
      returnUrl,
      customerId: session.user.studentId,
      customerEmail: student.user?.email || "student@timelly.in",
      customerPhone: student.phoneNo || "9999999999",
      firstName,
      lastName,
      description: "Fee payment – Timelly",
      splitSettlementDetails,
    });

    // ----- 9. Return payment URL to frontend (user will be redirected there) -----
    // Session API returns payment_links.web; use it so the client can redirect the user
    const paymentUrl =
      result.payment_links?.web ||
      (result as { payment_links?: { web?: string } }).payment_links?.web;

    if (!paymentUrl) {
      console.error("HyperPG session response missing payment_links.web", result);
      return NextResponse.json(
        { error: "Payment gateway did not return a payment URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      gateway: "HYPERPG",
      order_id: orderId,
      hyperpg_order_id: result.id,
      payment_url: paymentUrl,
      amount: amountNumber,
    });
  } catch (err: unknown) {
    console.error("Create order error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to create order";
    return NextResponse.json(
      { error: "Failed to create order", details: message },
      { status: 500 }
    );
  }
}

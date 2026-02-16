/**
 * Verify Payment (HyperPG only)
 *
 * After the user is redirected back from HyperPG, the frontend calls this with
 * order_id (the one we sent when creating the session) and amount. We call
 * HyperPG Order Status API to confirm the payment, then create a Payment record
 * and update StudentFee. Duplicate calls with the same order_id are idempotent.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import { getOrderStatus } from "@/lib/hyperpg";

const hyperpgMerchantId = process.env.HYPERPG_MERCHANT_ID;
const hyperpgApiKey = process.env.HYPERPG_API_KEY;
const hyperpgBaseUrl =
  process.env.HYPERPG_BASE_URL || "https://sandbox.hyperpg.in";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "STUDENT" || !session.user.studentId) {
    return NextResponse.json(
      { message: "Only students can verify their payments" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { order_id: orderId, amount: rawAmount } = body;

    if (!orderId || typeof orderId !== "string" || !orderId.trim()) {
      return NextResponse.json(
        { message: "order_id is required" },
        { status: 400 }
      );
    }

    const amountNum =
      typeof rawAmount === "string" ? parseFloat(rawAmount) : Number(rawAmount);
    if (
      typeof amountNum !== "number" ||
      isNaN(amountNum) ||
      amountNum <= 0
    ) {
      return NextResponse.json(
        { message: "Valid amount (number) required" },
        { status: 400 }
      );
    }

    if (!hyperpgMerchantId || !hyperpgApiKey) {
      return NextResponse.json(
        { message: "Payment not configured" },
        { status: 500 }
      );
    }

    const studentId = session.user.studentId;

    // Idempotency: if we already recorded this order_id for this student, return success
    const existing = await prisma.payment.findFirst({
      where: {
        studentId,
        gateway: "HYPERPG",
        transactionId: orderId,
        status: "SUCCESS",
      },
    });
    if (existing) {
      const fee = await prisma.studentFee.findUnique({
        where: { studentId },
      });
      return NextResponse.json(
        { payment: existing, fee, message: "Already verified" },
        { status: 200 }
      );
    }

    // Fetch order status from HyperPG (server-to-server)
    const orderStatus = await getOrderStatus({
      merchantId: hyperpgMerchantId,
      apiKey: hyperpgApiKey,
      baseUrl: hyperpgBaseUrl,
      orderId: orderId.trim(),
    });

    // Only accept CHARGED as success (status_id 21 per doc)
    if (orderStatus.status !== "CHARGED") {
      return NextResponse.json(
        {
          message: `Payment not completed. Status: ${orderStatus.status || "UNKNOWN"}`,
        },
        { status: 400 }
      );
    }

    // Optional: ensure amount matches (HyperPG returns amount in rupees)
    const gatewayAmount = orderStatus.amount ?? orderStatus.effective_amount;
    if (
      gatewayAmount != null &&
      Math.abs(Number(gatewayAmount) - amountNum) > 0.01
    ) {
      return NextResponse.json(
        { message: "Amount mismatch with gateway" },
        { status: 400 }
      );
    }

    const fee = await prisma.studentFee.findUnique({
      where: { studentId },
    });
    if (!fee) {
      return NextResponse.json(
        { message: "Fee details not found for this student" },
        { status: 404 }
      );
    }

    const newAmountPaid = fee.amountPaid + amountNum;
    const newRemaining = Math.max(fee.finalFee - newAmountPaid, 0);

    const payment = await prisma.payment.create({
      data: {
        studentId,
        amount: amountNum,
        gateway: "HYPERPG",
        hyperpgOrderId: orderStatus.id ?? null,
        hyperpgPaymentId: orderStatus.txn_id ?? null,
        hyperpgStatus: orderStatus.status,
        status: "SUCCESS",
        transactionId: orderId,
      },
    });

    const updatedFee = await prisma.studentFee.update({
      where: { studentId },
      data: {
        amountPaid: newAmountPaid,
        remainingFee: newRemaining,
      },
    });

    return NextResponse.json(
      { payment, fee: updatedFee },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Verify payment error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}

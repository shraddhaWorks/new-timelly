import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

const hyperpgBaseUrl = process.env.HYPERPG_BASE_URL || "https://sandbox.hyperpg.in";
const globalHyperpgMerchantId = process.env.HYPERPG_MERCHANT_ID;
const globalHyperpgApiKey = process.env.HYPERPG_API_KEY;
const hyperpgAuthStyle = process.env.HYPERPG_AUTH_STYLE || "merchant_key";

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
    const studentId = session.user.studentId;
    const body = await req.json();
    const {
      gateway: gw,
      order_id: orderId,
      amount,
    } = body;

    const gateway = gw || "HYPERPG";

    const amountNum = typeof amount === "string" ? parseFloat(amount) : amount;
    if (typeof amountNum !== "number" || isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { message: "Valid amount (number) required" },
        { status: 400 }
      );
    }

    if (gateway !== "HYPERPG") {
      return NextResponse.json(
        { message: "Only HyperPG payments are supported" },
        { status: 400 }
      );
    }

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json(
        { message: "Missing order_id for verification" },
        { status: 400 }
      );
    }
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { schoolId: true },
    });
    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    const settings = await prisma.schoolSettings.findUnique({
      where: { schoolId: student.schoolId },
    });
    const merchantId =
      settings?.hyperpgMerchantId?.trim() || globalHyperpgMerchantId?.trim();
    const apiKey =
      settings?.hyperpgApiKey?.trim() || globalHyperpgApiKey?.trim();

    if (!merchantId || !apiKey) {
      return NextResponse.json(
        { message: "Payment gateway not configured for this school" },
        { status: 500 }
      );
    }

    const authCredentials =
      hyperpgAuthStyle === "merchant_key"
        ? `${merchantId}:${apiKey}`
        : `${apiKey}:`;
    const auth = Buffer.from(authCredentials).toString("base64");
    const statusRes = await fetch(
      `${hyperpgBaseUrl}/orders/${encodeURIComponent(orderId)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-merchantid": merchantId,
          Authorization: `Basic ${auth}`,
        },
      }
    );

    if (!statusRes.ok) {
      const errText = await statusRes.text();
      console.error("HyperPG order status error:", statusRes.status, errText);
      return NextResponse.json(
        { message: "Could not verify order status with payment gateway" },
        { status: 502 }
      );
    }

    const orderStatus = await statusRes.json();

    if (orderStatus.status !== "CHARGED") {
      return NextResponse.json(
        {
          message:
            orderStatus.status === "NEW"
              ? "Payment not completed yet"
              : `Payment status: ${orderStatus.status || "unknown"}`,
        },
        { status: 400 }
      );
    }

    const orderAmount = Number(orderStatus.amount);
    if (orderAmount > 0 && Math.abs(orderAmount - amountNum) > 0.01) {
      return NextResponse.json(
        { message: "Amount mismatch with order" },
        { status: 400 }
      );
    }

    const hyperpgId = orderStatus.id || null;

    const existing = hyperpgId
      ? await prisma.payment.findFirst({
          where: { hyperpgOrderId: hyperpgId, studentId },
        })
      : null;
    if (existing) {
      const fee = await prisma.studentFee.findUnique({
        where: { studentId },
      });
      return NextResponse.json(
        { payment: existing, fee: fee ?? undefined },
        { status: 200 }
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
        hyperpgOrderId: orderStatus.id || null,
        hyperpgTxnId: orderStatus.txn_id || null,
        status: "SUCCESS",
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
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

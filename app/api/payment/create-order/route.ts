import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

// Global Juspay fallback when school has no tenant credentials
const globalJuspayMerchantId = process.env.JUSTPAY_MERCHANT_ID;
const globalJuspayApiKey =
  process.env.JUSTPAY_API_KEY || process.env.JUSTPAY_MERCHANT_KEY_ID;

const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "STUDENT" || !session.user.studentId) {
    return NextResponse.json({ error: "Only students can create payment orders" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const rawAmount = body.amount;
    const returnPath = body.return_path as string | undefined; // e.g. "/frontend/pages/parent?tab=fees"

    const amountNumber = typeof rawAmount === "string" ? parseFloat(rawAmount) : rawAmount;

    if (!amountNumber || isNaN(amountNumber) || amountNumber <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const amountPaise = Math.round(amountNumber * 100);
    const customerId = session.user.studentId;

    // Tenant: payments go to the student's school account. Use school Juspay creds or global fallback.
    const student = await prisma.student.findUnique({
      where: { id: session.user.studentId },
      select: { schoolId: true },
    });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const settings = await prisma.schoolSettings.findUnique({
      where: { schoolId: student.schoolId },
    });

    const useSchoolJuspay =
      !!settings?.juspayMerchantId && !!settings?.juspayApiKey;
    const merchantId = useSchoolJuspay
      ? settings!.juspayMerchantId!
      : globalJuspayMerchantId;
    const apiKey = useSchoolJuspay
      ? settings!.juspayApiKey!
      : globalJuspayApiKey;
    const useJuspay = !!merchantId && !!apiKey;

    if (useJuspay) {
      const orderId = `ord_${Date.now()}_${session.user.studentId}`;

      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const path = returnPath && returnPath.startsWith("/") ? returnPath : "/payments";
      const sep = path.includes("?") ? "&" : "?";
      const returnUrl = `${baseUrl}${path}${sep}success=1&amount=${amountNumber}&juspay_order=${orderId}`;
      const params = new URLSearchParams({
        order_id: orderId,
        amount: String(amountPaise),
        currency: "INR",
        customer_id: customerId,
        return_url: returnUrl,
      });

      // Juspay typically expects Basic auth: base64(api_key:)
      const auth = Buffer.from(`${apiKey}:`).toString("base64");
      const res = await fetch("https://payments.sandbox.juspay.in/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${auth}`,
          "x-merchantid": merchantId,
          "x-routing-id": customerId,
        },
        body: params.toString(),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Juspay order error:", res.status, errText);
        const is401 = res.status === 401;
        return NextResponse.json(
          {
            error: is401
              ? "Juspay API key invalid. In .env use JUSTPAY_API_KEY with the API Key from Juspay Dashboard (not Key ID). Restart dev server after changing .env."
              : "Juspay order failed",
            details: errText,
          },
          { status: 500 }
        );
      }

      const data = await res.json();
      return NextResponse.json({
        gateway: "JUSPAY",
        id: data.order_id || orderId,
        amount: amountPaise,
        client_auth_token: data.client_auth_token,
        juspay_order_id: data.order_id || orderId,
      });
    }

    if (razorpay) {
      const order = await razorpay.orders.create({
        amount: amountPaise,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });
      return NextResponse.json({ ...order, gateway: "RAZORPAY" });
    }

    return NextResponse.json(
      {
        error:
          "Payment not configured for this school. Add Juspay credentials in School Settings, or set JUSTPAY_MERCHANT_ID and JUSTPAY_API_KEY in .env as fallback.",
      },
      { status: 500 }
    );
  } catch (err: any) {
    console.error("Order creation error:", err);
    return NextResponse.json(
      { error: "Failed to create order", details: err.message },
      { status: 500 }
    );
  }
}

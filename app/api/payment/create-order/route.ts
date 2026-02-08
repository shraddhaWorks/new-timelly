import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const useJuspay =
  !!process.env.JUSTPAY_MERCHANT_ID &&
  !!process.env.JUSTPAY_MERCHANT_KEY_ID;

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

    const amountNumber = typeof rawAmount === "string" ? parseFloat(rawAmount) : rawAmount;

    if (!amountNumber || isNaN(amountNumber) || amountNumber <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const amountPaise = Math.round(amountNumber * 100);
    const customerId = session.user.studentId;

    if (useJuspay) {
      const merchantId = process.env.JUSTPAY_MERCHANT_ID!;
      const apiKey = process.env.JUSTPAY_MERCHANT_KEY_ID!;
      const orderId = `ord_${Date.now()}_${session.user.studentId}`;

      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const returnUrl = `${baseUrl}/payments?success=1&amount=${amountNumber}&juspay_order=${orderId}`;
      const params = new URLSearchParams({
        order_id: orderId,
        amount: String(amountPaise),
        currency: "INR",
        customer_id: customerId,
        return_url: returnUrl,
      });

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
        return NextResponse.json(
          { error: "Juspay order failed", details: errText },
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
      { error: "No payment gateway configured. Set RAZORPAY_* or JUSTPAY_* env vars." },
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

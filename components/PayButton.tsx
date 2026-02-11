"use client";

import { useEffect } from "react";
import { CreditCard } from "lucide-react";
import { motion } from "framer-motion";

interface PayButtonProps {
  amount: number;
  onSuccess?: () => void;
  /** When paying from parent fees, pass "/frontend/pages/parent?tab=fees" so Juspay redirects back here */
  returnPath?: string;
}

export default function PayButton({ amount, onSuccess, returnPath }: PayButtonProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).Razorpay) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onerror = () => console.warn("Razorpay script failed to load");
    document.body.appendChild(script);
  }, []);

  const verifyAndComplete = async (
    normalizedAmount: number,
    verifyPayload: Record<string, unknown>
  ) => {
    const verifyRes = await fetch("/api/payment/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...verifyPayload, amount: normalizedAmount }),
    });
    const data = await verifyRes.json();
    if (!verifyRes.ok) {
      alert(data.message || "Payment verification failed");
      return false;
    }
    return true;
  };

  const payNow = async () => {
    try {
      const normalizedAmount = Number(amount.toFixed(2));

      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: normalizedAmount, ...(returnPath && { return_path: returnPath }) }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to create order: ${errorData.error || errorData.message || "Unknown error"}`);
        return;
      }

      const order = await res.json();
      const gateway = order.gateway || "RAZORPAY";

      if (gateway === "JUSPAY") {
        const paymentUrl =
          order.payment_url ||
          `https://payments.sandbox.juspay.in/merchant/pay?order_id=${order.juspay_order_id || order.id}`;
        const urlWithToken = order.client_auth_token
          ? `${paymentUrl}&client_auth_token=${order.client_auth_token}`
          : paymentUrl;
        window.location.href = urlWithToken;
        return;
      }

      if (!(window as any).Razorpay) {
        alert("Payment SDK loading. Please try again in a moment.");
        return;
      }

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        alert("Razorpay is not configured. Contact support.");
        return;
      }

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        name: "Timelly",
        description: "Fee payment",
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const ok = await verifyAndComplete(normalizedAmount, {
            gateway: "RAZORPAY",
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          if (ok) {
            alert("Payment successful!");
            onSuccess?.();
          }
        },
        theme: { color: "#404040" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={payNow}
      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-teal-600 hover:to-emerald-500 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg border border-emerald-400/30 transition-all duration-300"
    >
      <CreditCard size={20} />
      Pay ₹{Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </motion.button>
  );
}

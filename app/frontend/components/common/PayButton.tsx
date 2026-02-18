"use client";

import { CreditCard } from "lucide-react";
import { motion } from "framer-motion";

interface PayButtonProps {
  amount: number;
  onSuccess?: () => void;
  /** When paying from parent fees, pass "/frontend/pages/parent?tab=fees" so redirect returns here */
  returnPath?: string;
}

export default function PayButton({
  amount,
  onSuccess,
  returnPath,
}: PayButtonProps) {
  const payNow = async () => {
    try {
      const normalizedAmount = Number(amount.toFixed(2));

      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: normalizedAmount,
          ...(returnPath && { return_path: returnPath }),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(
          `Failed to create order: ${errorData.error || errorData.message || "Unknown error"}`
        );
        return;
      }

      const order = await res.json();

      if (order.gateway === "HYPERPG" && order.payment_url) {
        // HyperPG return_url has no query params; store order_id|amount in cookie for verification on return
        const payload = `${order.order_id || order.id}|${order.amount}`;
        document.cookie = `hyperpg_pending=${encodeURIComponent(payload)}; path=/; max-age=600; samesite=lax`;
        window.location.href = order.payment_url;
        return;
      }

      alert("Payment is not configured. Please contact support.");
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
      Pay ₹
      {Number(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </motion.button>
  );
}

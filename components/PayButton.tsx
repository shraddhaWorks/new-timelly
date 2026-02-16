"use client";

/**
 * PayButton – starts HyperPG fee payment flow
 *
 * On click: calls create-order API, then redirects the user to HyperPG's
 * payment page. After payment, HyperPG redirects back to return_path with
 * success=1&order_id=...&amount=... and the payments page calls verify.
 */

import { CreditCard } from "lucide-react";
import { motion } from "framer-motion";

interface PayButtonProps {
  /** Amount in rupees to pay */
  amount: number;
  /** Called after payment is verified (e.g. when returning from gateway) */
  onSuccess?: () => void;
  /** Path to redirect to after payment, e.g. "/payments" or "/frontend/pages/parent?tab=fees" */
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

      if (order.gateway !== "HYPERPG") {
        alert("Payment is configured for HyperPG only. Contact support.");
        return;
      }

      const paymentUrl = order.payment_url;
      if (!paymentUrl) {
        alert("No payment URL received. Try again.");
        return;
      }

      onSuccess?.();
      window.location.href = paymentUrl;
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

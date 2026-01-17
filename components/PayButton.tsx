"use client";

import { useEffect } from "react";
import { CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import Script from "next/script";

interface PayButtonProps {
  amount: number;
  onSuccess?: () => void;
}

export default function PayButton({ amount, onSuccess }: PayButtonProps) {
  useEffect(() => {
    // Load Razorpay script only when PayButton is used
    if (typeof window !== "undefined" && !(window as any).Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onerror = () => {
        console.warn("Razorpay script failed to load");
      };
      document.body.appendChild(script);
    }
  }, []);

  const payNow = async () => {
    try {
      // Ensure amount sent to backend is at most 2 decimal places
      const normalizedAmount = Number(amount.toFixed(2));

      // 1️⃣ Create order
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: normalizedAmount }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Order creation failed:", errorData);
        alert(`Failed to create order: ${errorData.error || errorData.message || "Unknown error"}`);
        return;
      }

      const order = await res.json();

      // 2️⃣ Check Razorpay SDK
      if (!(window as any).Razorpay) {
        alert("Razorpay SDK not loaded");
        return;
      }

      // 3️⃣ Open Razorpay portal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        name: "Timely Project",
        description: "Complete your payment",
        handler: async (response: any) => {
          console.log("Payment success", response);

          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: normalizedAmount,
              }),
            });

            const data = await verifyRes.json();

            if (!verifyRes.ok) {
              console.error("Payment verification failed:", data);
              alert(data.message || "Payment verification failed");
              return;
            }

            alert("Payment successful!");
            if (onSuccess) {
              onSuccess();
            }
          } catch (err) {
            console.error("Payment verification error:", err);
            alert("Payment verification failed");
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
      className="w-full bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg border border-[#333333] hover:border-[#808080] transition-all duration-300"
    >
      <CreditCard size={20} />
      Pay ₹{amount}
    </motion.button>
  );
}

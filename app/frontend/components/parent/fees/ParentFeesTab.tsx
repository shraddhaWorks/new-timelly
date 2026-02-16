"use client";

/// <reference path="./jsx-intrinsics.d.ts" />
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CreditCard,
  CheckCircle,
  Receipt,
  AlertCircle,
  IndianRupee,
  Shield,
  ExternalLink,
} from "lucide-react";
import PageHeader from "../../common/PageHeader";
import PayButton from "@/components/PayButton";

interface InstallmentItem {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: string;
  paymentId?: string;
}

interface PaymentItem {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  transactionId?: string;
  juspayPaymentId?: string;
}

interface FeeData {
  id: string;
  totalFee: number;
  discountPercent: number;
  finalFee: number;
  amountPaid: number;
  remainingFee: number;
  installments: number;
  components?: Array<{ name: string; amount: number }>;
  extraFees?: Array<{ name: string; amount: number }>;
  payments: PaymentItem[];
  installmentsList: InstallmentItem[];
}

export default function ParentFeesTab() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const verifiedRef = useRef(false);

  const [fee, setFee] = useState<FeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<1 | 3>(1);

  const fetchFee = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/fees/mine", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to load fee details");
        setFee(null);
        return;
      }
      setFee(data.fee);
    } catch {
      setError("Something went wrong");
      setFee(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔁 Handle Juspay redirect
  useEffect(() => {
    if (verifiedRef.current) return;

    const success = searchParams.get("success");
    const amount = searchParams.get("amount");
    const orderId = searchParams.get("order_id");

    if (success === "1" && orderId && amount) {
      const amt = Number(amount);
      if (!isNaN(amt) && amt > 0) {
        verifiedRef.current = true;

        fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: orderId, amount: amt }),
        })
          .then(async (res) => {
            const d = await res.json();
            if (!res.ok) alert(d.message || "Payment verification failed");
            else fetchFee();
          })
          .catch(console.error)
          .finally(() => {
            router.replace("/frontend/pages/parent?tab=fees");
          });
      }
    }
  }, [searchParams, fetchFee, router]);

  useEffect(() => {
    fetchFee();
  }, [fetchFee]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto h-full flex flex-col gap-6">
        <PageHeader title="Fees" subtitle="View and pay your child's school fees" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-lime-500/30 border-t-lime-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading fee details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !fee) {
    return (
      <div className="max-w-7xl mx-auto h-full flex flex-col gap-6">
        <PageHeader title="Fees" subtitle="View and pay your child's school fees" />
        <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center">
          <AlertCircle className="w-16 h-16 text-amber-400" />
          <p className="text-white font-medium">
            {error || "Fee details not configured. Please contact the school admin."}
          </p>
        </div>
      </div>
    );
  }

  const remainingAmount = fee.remainingFee;
  const payable = plan === 1 ? remainingAmount : remainingAmount / plan;
  const progress =
    fee.finalFee > 0 ? Math.min((fee.amountPaid / fee.finalFee) * 100, 100) : 0;

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col gap-6">
      <PageHeader title="Fees" subtitle="View and pay your child's school fees" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-6"
        >
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-lime-400" />
            Fee Summary
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat label="Total Fee" value={`₹${fee.totalFee}`} />
            <Stat label="Discount" value={`${fee.discountPercent}%`} highlight />
            <Stat label="Payable" value={`₹${fee.finalFee}`} />
            <Stat label="Paid" value={`₹${fee.amountPaid}`} success />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Payment progress</span>
              <span className="text-white font-medium">
                ₹{fee.amountPaid} / ₹{fee.finalFee}
              </span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6 }}
                className="h-full bg-gradient-to-r from-lime-500 to-emerald-500 rounded-full"
              />
            </div>
          </div>

          {remainingAmount <= 0 ? (
            <PaidBanner />
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                {([1, 3] as const).map((planOption) => (
                  <button
                    key={planOption}
                    onClick={() => setPlan(planOption)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      plan === planOption
                        ? "bg-lime-500 text-black"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    {planOption === 1 ? "Pay full" : `${planOption} installments`}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="text-sm text-gray-400">Amount to pay</p>
                  <p className="text-2xl font-bold text-lime-400">
                    ₹{payable.toFixed(2)}
                  </p>
                </div>
                <PayButton
                  amount={payable}
                  onSuccess={fetchFee}
                  returnPath="/frontend/pages/parent?tab=fees"
                />
              </div>

              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                Secure payment via HyperPG
              </p>
            </div>
          )}
        </motion.div>

        <Installments fee={fee} />
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function Stat({
  label,
  value,
  highlight,
  success,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  success?: boolean;
}) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <p className="text-xs text-gray-400 uppercase">{label}</p>
      <p
        className={`text-xl font-bold mt-1 ${
          highlight ? "text-lime-400" : success ? "text-emerald-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function PaidBanner() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
      <CheckCircle className="w-8 h-8 text-emerald-400" />
      <div>
        <p className="font-semibold text-white">All fees paid</p>
        <p className="text-sm text-gray-400">Thank you for your payment!</p>
      </div>
    </div>
  );
}

function Installments({ fee }: { fee: FeeData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 space-y-6"
    >
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Receipt className="w-5 h-5 text-lime-400" />
        Installments
      </h3>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {(fee.installmentsList ?? []).map((inst) => (
          <div
            key={inst.installmentNumber}
            className="flex justify-between p-3 bg-white/5 rounded-lg"
          >
            <div>
              <p className="text-sm text-white">Installment {inst.installmentNumber}</p>
              <p className="text-xs text-gray-500">
                Due: {new Date(inst.dueDate).toLocaleDateString("en-IN")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white">₹{inst.amount}</p>
              <span
                className={`text-xs ${
                  inst.status === "PAID" ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {inst.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
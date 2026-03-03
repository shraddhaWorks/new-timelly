"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Search } from "lucide-react";
import SelectInput from "../../common/SelectInput";
import RefundModal, { type TransactionItem } from "./RefundModal";
import type { Student } from "./types";

interface FeeTransactionsListProps {
  students: Student[];
  onSuccess: () => void;
}

export default function FeeTransactionsList({ students, onSuccess }: FeeTransactionsListProps) {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [refundTarget, setRefundTarget] = useState<TransactionItem | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const url = selectedStudent
        ? `/api/fees/transactions?studentId=${encodeURIComponent(selectedStudent)}`
        : "/api/fees/transactions";
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setTransactions(data.transactions || []);
      } else {
        setTransactions([]);
      }
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedStudent]);

  return (
    <section className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <RotateCcw className="w-5 h-5 text-amber-400" />
        Fee Transactions & Refunds
      </h3>
      <p className="text-sm text-gray-400 mb-4">
        View successful payments and process refunds when needed.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex-1 min-w-[180px]">
          <SelectInput
            label="Filter by student"
            value={selectedStudent}
            onChange={setSelectedStudent}
            options={[
              { label: "All students", value: "" },
              ...students.map((s) => ({
                label: `${s.user?.name || s.admissionNumber} (${s.class?.name || "-"})`,
                value: s.id,
              })),
            ]}
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 flex items-center gap-2 text-sm"
          >
            <Search size={16} />
            Refresh
          </button>
        </div>
      </div>
      {loading ? (
        <div className="py-8 text-center text-gray-400">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="py-8 text-center text-gray-400">No transactions found</div>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="text-left text-gray-400 border-b border-white/10">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Student</th>
                <th className="pb-3 font-medium">Class</th>
                <th className="pb-3 font-medium">Gateway</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Refunded</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="py-3 text-gray-400 whitespace-nowrap">
                    {new Date(t.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3 text-white font-medium">
                    {t.student.user?.name || t.student.admissionNumber || "-"}
                  </td>
                  <td className="py-3 text-gray-400">
                    {t.student.class
                      ? `${t.student.class.name}${t.student.class.section ? `-${t.student.class.section}` : ""}`
                      : "-"}
                  </td>
                  <td className="py-3 text-gray-400">{t.gateway}</td>
                  <td className="py-3 text-emerald-400">₹{t.amount.toLocaleString()}</td>
                  <td className="py-3">
                    {t.refundable < t.amount ? (
                      <span className="text-amber-400">
                        ₹{(t.amount - t.refundable).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {t.refundable > 0 ? (
                      <button
                        onClick={() => setRefundTarget(t)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 text-xs font-medium"
                      >
                        Refund
                      </button>
                    ) : (
                      <span className="text-gray-500 text-xs">Full refund</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RefundModal
        transaction={refundTarget}
        onClose={() => setRefundTarget(null)}
        onSuccess={() => {
          fetchTransactions();
          onSuccess();
        }}
      />
    </section>
  );
}

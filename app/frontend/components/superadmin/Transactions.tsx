"use client";

import { useEffect, useState } from "react";
import PageHeader from "../common/PageHeader";
import { formatAmount } from "../../utils/format";

interface SchoolTurnover {
  slNo: number;
  id: string;
  name: string;
  turnover: number;
  studentCount: number;
}

export default function Transactions() {
  const [schools, setSchools] = useState<SchoolTurnover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalTransactionCount, setTotalTransactionCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/superadmin/schools")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const list = (data.schools ?? []).map((s: { slNo: number; id: string; name: string; turnover: number; studentCount: number }, i: number) => ({
          slNo: i + 1,
          id: s.id,
          name: s.name,
          turnover: s.turnover ?? 0,
          studentCount: s.studentCount ?? 0,
        }));
        setSchools(list);
        setTotalTransactionCount(data.totalTransactionCount ?? 0);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const totalTurnover = schools.reduce((s, r) => s + r.turnover, 0);

  return (
    <main className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 flex flex-col items-center">
      <div className="w-full max-w-6xl py-4 sm:py-6 min-h-screen space-y-4 sm:space-y-6 text-center">
        <PageHeader
          center
          title="Fees Transactions"
          subtitle="Turnover (total amount) per school"
        />

        {error && (
          <div className="text-red-400 text-sm py-2">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/30 border-t-white" />
          </div>
        ) : (
          <>
            {/* Desktop/tablet: table - center aligned */}
            <div className="hidden md:block rounded-xl border border-white/10 overflow-hidden bg-white/5 w-full">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[400px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-center px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-white/80 w-14">Sl. No</th>
                      <th className="text-left px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-white/80">School</th>
                      <th className="text-center px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-white/80">Students</th>
                      <th className="text-center px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-white/80">Turnover</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schools.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-white/60 text-sm">No schools</td>
                      </tr>
                    ) : (
                      schools.map((s) => (
                        <tr key={s.id} className="border-b border-white/10 hover:bg-white/5 transition">
                          <td className="px-3 sm:px-4 py-3 text-white text-xs sm:text-sm text-center">{s.slNo}</td>
                          <td className="px-3 sm:px-4 py-3 text-white font-medium text-xs sm:text-sm text-left">{s.name}</td>
                          <td className="px-3 sm:px-4 py-3 text-white/90 text-xs sm:text-sm text-center">{s.studentCount.toLocaleString()}</td>
                          <td className="px-3 sm:px-4 py-3 text-white font-medium text-xs sm:text-sm text-center">{formatAmount(s.turnover)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile: cards - center aligned */}
            <div className="md:hidden space-y-3 w-full">
              {schools.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-white/60 text-sm">No schools</div>
              ) : (
                schools.map((s) => (
                  <div key={s.id} className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col sm:flex-row justify-center items-center gap-2 text-center">
                    <div className="text-left">
                      <p className="text-white font-medium">{s.name}</p>
                      <p className="text-white/70 text-xs">Students: {s.studentCount.toLocaleString()}</p>
                    </div>
                    <p className="text-white font-semibold text-sm">{formatAmount(s.turnover)}</p>
                  </div>
                ))
              )}
            </div>

            {schools.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-white/80">
                <span>Total transactions: <strong className="text-white">{totalTransactionCount.toLocaleString()}</strong></span>
                <span>Total amount: <strong className="text-white">{formatAmount(totalTurnover)}</strong></span>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

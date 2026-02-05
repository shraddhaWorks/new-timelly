"use client";

import { useEffect, useState } from "react";
import PageHeader from "../common/PageHeader";
import { Search } from "lucide-react";
import { formatAmount as fmtAmount } from "../../utils/format";

export interface SchoolRow {
  slNo: number;
  id: string;
  name: string;
  address: string;
  location: string;
  studentCount: number;
  teacherCount: number;
  classCount: number;
  turnover: number;
  admin: {
    id: string;
    name: string;
    email: string;
    mobile: string;
    role: string;
  } | null;
}

export default function Schools() {
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchSchools = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/superadmin/schools?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load schools");
      setSchools(data.schools ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error loading schools");
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    fetchSchools();
  };

  return (
    <main className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 flex flex-col md:items-center">
      <div className="w-full max-w-6xl py-4 sm:py-6 min-h-screen space-y-4 sm:space-y-6 md:text-center">
      

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
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-center px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-white/80 w-10">#</th>
                      <th className="text-left px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-white/80">School Name</th>
                      <th className="text-center px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-white/80">Admin Name</th>
                      <th className="text-center px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-white/80">Contact</th>
                      <th className="text-center px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-white/80">Email</th>
                      <th className="text-center px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-white/80">Students</th>
                      <th className="text-center px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold text-white/80">Turnover</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schools.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-white/60 text-sm">
                          No schools found
                        </td>
                      </tr>
                    ) : (
                      schools.map((s) => (
                        <tr key={s.id} className="border-b border-white/10 hover:bg-white/5 transition">
                          <td className="px-3 sm:px-4 py-3 text-white text-xs sm:text-sm text-center">{String(s.slNo).padStart(2, "0")}</td>
                          <td className="px-3 sm:px-4 py-3 text-left">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-white/20 flex-shrink-0" />
                              <span className="text-white font-medium truncate">{s.name}</span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 py-3 text-white/90 text-xs sm:text-sm text-center">{s.admin?.name ?? "—"}</td>
                          <td className="px-3 sm:px-4 py-3 text-white/90 text-xs sm:text-sm text-center">{s.admin?.mobile ?? "—"}</td>
                          <td className="px-3 sm:px-4 py-3 text-white/90 text-xs sm:text-sm text-center truncate max-w-[140px] mx-auto">{s.admin?.email ?? "—"}</td>
                          <td className="px-3 sm:px-4 py-3 text-white text-xs sm:text-sm text-center">{s.studentCount.toLocaleString()}</td>
                          <td className="px-3 sm:px-4 py-3 text-white font-medium text-xs sm:text-sm text-center">{fmtAmount(s.turnover, true)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {schools.length > 0 && (
                <div className="px-4 py-3 border-t border-white/10 flex items-center justify-center gap-4 text-xs sm:text-sm text-white/60">
                  <span>Page 1 of {Math.max(1, Math.ceil(schools.length / 10))}</span>
                  <div className="flex gap-2">
                    <button type="button" className="px-3 py-1.5 rounded bg-white/10 disabled:opacity-50" disabled>Previous</button>
                    <button type="button" className="px-3 py-1.5 rounded bg-white/10 disabled:opacity-50" disabled>Next</button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile: cards - same layout as Transactions (left/right, no center) */}
            <div className="md:hidden space-y-3 w-full">
              {schools.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-white/60 text-sm">
                  No schools found
                </div>
              ) : (
                schools.map((s) => (
                  <div key={s.id} className="rounded-xl border border-white/10 bg-white/5 p-4 flex justify-between items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium truncate">{s.name}</p>
                      <p className="text-white/70 text-xs truncate">{s.admin?.name ?? "—"} · {s.admin?.email ?? "—"}</p>
                      <p className="text-white/80 text-xs mt-1">Students: {s.studentCount.toLocaleString()}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-white font-semibold text-sm">{fmtAmount(s.turnover, true)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, ChevronDown, Send, Plus, X, CheckCircle } from "lucide-react";

const LEAVE_TYPE_OPTIONS = [
  { label: "Sick Leave", value: "SICK" },
  { label: "Casual Leave", value: "CASUAL" },
  { label: "Emergency Leave", value: "UNPAID" },
  { label: "Duty Leave", value: "PAID" },
];

type LeaveRecord = {
  id: string;
  leaveType: string;
  reason: string | null;
  fromDate: string;
  toDate: string;
  status: string;
  remarks: string | null;
  createdAt: string;
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function leaveTypeLabel(t: string) {
  return LEAVE_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t;
}

function statusStyle(s: string) {
  if (s === "APPROVED" || s === "CONDITIONALLY_APPROVED") return "bg-[#b4f03d]/10 text-[#b4f03d] border-[#b4f03d]/30";
  if (s === "REJECTED") return "bg-red-500/10 text-red-400 border-red-500/30";
  return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
}

export default function TeacherLeave() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: "SICK",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [myLeaves, setMyLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyLeaves = useCallback(async () => {
    try {
      const res = await fetch("/api/leaves/my");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setMyLeaves(data);
      else setMyLeaves([]);
    } catch {
      setMyLeaves([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyLeaves();
  }, [fetchMyLeaves]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason?.trim()) {
      setError("Please fill From Date, To Date and Reason.");
      return;
    }
    setError(null);
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/leaves/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaveType: formData.leaveType,
          fromDate: formData.startDate,
          toDate: formData.endDate,
          reason: formData.reason.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || data?.message || "Failed to submit leave");
        return;
      }
      setFormData({ leaveType: "SICK", startDate: "", endDate: "", reason: "" });
      setShowForm(false);
      await fetchMyLeaves();
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      {/* 1. Header Section */}
      <div className="max-w-6xl mx-auto bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {showForm ? "Apply New Leave" : "My Leave Application"}
          </h2>
          <p className="text-white/40 text-sm">
            {showForm ? "Please fill in the details below" : "Apply for leave and track your balance"}
          </p>
        </div>

        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 border border-[#b4f03d]/20 bg-[#b4f03d]/5 text-[#b4f03d] px-6 py-3 rounded-2xl font-bold text-sm"
          >
            <Plus size={20} strokeWidth={3} />
            <span>Apply New Leave</span>
          </button>
        ) : (
          <button
            onClick={() => setShowForm(false)}
            className="flex items-center gap-2 border border-white/10 bg-white/5 text-white/60 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-white/10 hover:text-white transition-all"
          >
            <ChevronDown size={20} strokeWidth={3} />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {/* 2. The Form */}
      {showForm && (
        <div className=" border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl animate-in slide-in-from-top-2 duration-400">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white ml-1">New Leave Request</h2>
              <div className="w-full h-px bg-white/10"></div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                {error}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] ml-1">Leave Type</label>
                <div className="relative">
                  <select
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 appearance-none text-white text-sm focus:outline-none focus:border-[#b4f03d]/50 cursor-pointer transition-all"
                    value={formData.leaveType}
                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  >
                    {LEAVE_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value} className="bg-[#0f0f0f]">
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">From Date</label>
                <div className="relative group">
                  <input
                    type="date"
                    required
                    className="w-full  bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-[#b4f03d]/50 [color-scheme:dark] transition-all"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">To Date</label>
                <div className="relative group">
                  <input
                    type="date"
                    required
                    className="w-full  bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-[#b4f03d]/50 [color-scheme:dark] transition-all"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">Reason for Leave</label>
              <textarea
                required
                placeholder="Provide a detailed reason for your leave request..."
                className="w-full  bg-black/30 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#b4f03d]/50 resize-none placeholder:text-white/20 transition-all"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitLoading}
                className="flex items-center gap-2 bg-[#b4f03d] text-black px-8 py-3 rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(180,240,61,0.2)] transition-all active:scale-95 disabled:opacity-60"
              >
                <CheckCircle size={18} strokeWidth={3} />
                {submitLoading ? "Submitting…" : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. My leaves list */}
      {!loading && myLeaves.length > 0 && (
        <div className="max-w-6xl mx-auto border border-white/10 rounded-[1.5rem] p-6 backdrop-blur-xl bg-white/[0.03]">
          <h3 className="text-lg font-bold text-white mb-4">My Applications</h3>
          <div className="space-y-4">
            {myLeaves.map((leave) => (
              <div
                key={leave.id}
                className="border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">{leaveTypeLabel(leave.leaveType)}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${statusStyle(leave.status)}`}>
                      {leave.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm mt-1">
                    {formatDate(leave.fromDate)} – {formatDate(leave.toDate)}
                  </p>
                  {leave.reason && <p className="text-white/50 text-sm mt-1 line-clamp-2">{leave.reason}</p>}
                  {leave.remarks && <p className="text-white/40 text-xs mt-1">Remarks: {leave.remarks}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && myLeaves.length === 0 && !showForm && (
        <div className="max-w-6xl mx-auto border border-white/10 rounded-[1.5rem] p-8 text-center text-white/50">
          No leave applications yet. Click &quot;Apply New Leave&quot; to submit one.
        </div>
      )}
    </div>
  );
}

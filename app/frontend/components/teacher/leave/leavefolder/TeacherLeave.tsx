import React, { useState, useEffect, useCallback } from "react";
import { Calendar, ChevronDown, Send, Plus, X, CheckCircle, Edit3, XCircle } from "lucide-react";
import PageHeader from "../../../common/PageHeader";

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
      console.log("Fetched my leaves:", data);
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
      <PageHeader
        title={showForm ? "Apply New Leave" : "My Leave Application"}
        subtitle={showForm ? "Please fill in the details below" : "Apply for leave and track your balance"}
        rightSlot={
          !showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 border border-[#b4f03d]/20 bg-[#b4f03d]/5 text-[#b4f03d] px-6 py-3 rounded-2xl font-bold text-sm hover:bg-[#b4f03d]/10 transition-all"
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
          )
        }
      />

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

      {/* 3. My Leave History Table */}
      {/* 3. My Leave History Table */}
      {!loading && myLeaves.length > 0 && (
        <div className="mt-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-0 shadow-2xl">
          <h3 className="text-xl font-bold text-white m p-6">My Leave History</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border border-white/10 text-white/30 text-[11px] uppercase tracking-[0.2em] bg-white/5">
                  <th className="px-6 py-4 font-bold">Type</th>
                  <th className="px-6 py-4 font-bold">Dates</th>
                  <th className="px-6 py-4 font-bold text-center">Days</th>
                  <th className="px-6 py-4 font-bold text-center">Status</th>
                  <th className="px-6 py-4 font-bold">Reason/Remarks</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {myLeaves.map((leave) => {
                  const start = new Date(leave.fromDate);
                  const end = new Date(leave.toDate);
                  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

                  function handleEdit(leave: LeaveRecord): void {
                    throw new Error("Function not implemented.");
                  }

                  function handleCancel(id: string): void {
                    throw new Error("Function not implemented.");
                  }

                  return (
                    <tr key={leave.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-5">
                        <span className="font-bold text-white text-sm">{leaveTypeLabel(leave.leaveType)}</span>
                      </td>
                      <td className="px-4 py-5 text-white/60 text-sm">
                        {leave.fromDate.split('T')[0]} to {leave.toDate.split('T')[0]}
                      </td>
                      <td className="px-4 py-5 text-center">
                        <span className="font-bold text-white text-sm">{days}</span>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex justify-center">
                          <span className={`px-4 py-1.5 rounded-lg text-[11px] font-bold border ${statusStyle(leave.status)}`}>
                            {leave.status === "CONDITIONALLY_APPROVED" ? "Approved" : leave.status.replace("_", " ").charAt(0) + leave.status.replace("_", " ").slice(1).toLowerCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-5 max-w-xs">
                        <div className="flex flex-col">
                          <span className="text-white text-sm font-bold line-clamp-1">{leave.reason}</span>
                          <span className="text-white/30 text-[11px] mt-0.5">
                            {leave.status === "APPROVED" || leave.status === "CONDITIONALLY_APPROVED"
                              ? (leave.remarks ? `Approved by Principal: ${leave.remarks}` : "Approved")
                              : leave.status === "PENDING"
                                ? "Awaiting approval"
                                : leave.remarks || "Insufficient notice period" /* For REJECTED */}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end items-center gap-3">
                          {/* This block only renders if status is PENDING */}
                          {leave.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleEdit(leave)} // Example handler
                                className="text-white/40 hover:text-white transition-colors"
                              >
                                <Edit3 size={18} strokeWidth={2} />
                              </button>
                              <button
                                onClick={() => handleCancel(leave.id)} // Example handler
                                className="text-white/40 hover:text-red-400 transition-colors"
                              >
                                <XCircle size={18} strokeWidth={2} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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

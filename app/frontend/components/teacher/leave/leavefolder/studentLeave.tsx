import React, { useState, useEffect, useCallback } from "react";
import {
  GraduationCap,
  Briefcase,
  Clock,
  CheckCircle2,
  Search,
  Calendar,
  Paperclip,
  Check,
  X,
} from "lucide-react";

type StudentLeaveItem = {
  id: string;
  leaveType: string;
  reason: string;
  fromDate: string;
  toDate: string;
  status: string;
  remarks: string | null;
  createdAt: string;
  student: {
    id: string;
    user: { id: string; name: string | null; email: string | null };
    class: { id: string; name: string; section: string | null } | null;
  };
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatDateRange(from: string, to: string) {
  return `${formatDate(from)} - ${formatDate(to)}`;
}

function daysBetween(from: string, to: string) {
  const a = new Date(from);
  const b = new Date(to);
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000)) + 1);
}

function leaveTypeShort(t: string) {
  if (t === "SICK") return "SICK";
  if (t === "CASUAL") return "CASUAL";
  if (t === "PAID") return "PAID";
  if (t === "UNPAID") return "UNPAID";
  return t;
}

export default function StudentLeave() {
  const [subTab, setSubTab] = useState<"pending" | "history">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingLeaves, setPendingLeaves] = useState<StudentLeaveItem[]>([]);
  const [allLeaves, setAllLeaves] = useState<StudentLeaveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    try {
      const res = await fetch("/api/student-leaves/pending");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setPendingLeaves(data);
      else setPendingLeaves([]);
    } catch {
      setPendingLeaves([]);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch("/api/student-leaves/all");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setAllLeaves(data);
      else setAllLeaves([]);
    } catch {
      setAllLeaves([]);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPending(), fetchAll()]).finally(() => setLoading(false));
  }, [fetchPending, fetchAll]);

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/student-leaves/${id}/approve`, { method: "PATCH" });
      if (res.ok) {
        await fetchPending();
        await fetchAll();
      }
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/student-leaves/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        await fetchPending();
        await fetchAll();
      }
    } finally {
      setActionId(null);
    }
  };

  const displayList = subTab === "pending" ? pendingLeaves : allLeaves;
  const filteredList = searchQuery.trim()
    ? displayList.filter((l) =>
        (l.student?.user?.name ?? "")
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase())
      )
    : displayList;

  const approvedRecent = allLeaves.filter((l) => l.status === "APPROVED").length;

  return (
    <div className=" text-white ">
      {/* Header Section */}
      <div className="max-w-6xl mb-6 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[1rem] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Student Approvals</h2>
          <p className="text-white/40 text-sm mt-1">Review and manage leave requests from your class</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30">
            <Clock size={16} className="text-yellow-400" />
            <span className="text-yellow-400 font-bold text-sm">{pendingLeaves.length} Pending</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#b4f03d]/10 border border-[#b4f03d]/30">
            <CheckCircle2 size={16} className="text-[#b4f03d]" />
            <span className="text-[#b4f03d] font-bold text-sm">{approvedRecent} Approved Recently</span>
          </div>
        </div>
      </div>

      {/* Sub-Nav & Search Bar */}
      <div className="max-w-6xl mb-6 bg-white/[0.03] border border-white/10 rounded-[1rem] p-5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="inline-flex bg-white/5 p-1 rounded-2xl border border-white/5">
            <button
              onClick={() => setSubTab("pending")}
              className={`px-8 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                subTab === "pending" ? "bg-[#b4f03d] text-black" : "text-white/40 hover:text-white"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setSubTab("history")}
              className={`px-8 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                subTab === "history" ? "bg-[#b4f03d] text-black" : "text-white/40 hover:text-white"
              }`}
            >
              History
            </button>
          </div>
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#b4f03d] transition-colors"
              size={18}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student name..."
              className="bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-12 pr-6 w-full md:w-80 focus:outline-none focus:border-[#b4f03d]/50 transition-all placeholder:text-white/20"
            />
          </div>
        </div>
      </div>

      {/* Request Cards */}
      {loading ? (
        <div className="max-w-6xl mx-auto flex justify-center py-12">
          <div className="w-10 h-10 border-2 border-[#b4f03d]/30 border-t-[#b4f03d] rounded-full animate-spin" />
        </div>
      ) : filteredList.length === 0 ? (
        <div className="max-w-6xl mx-auto border border-white/10 rounded-[1rem] p-8 text-center text-white/50">
          {subTab === "pending" ? "No pending student leave requests." : "No leave history."}
        </div>
      ) : (
        <div className="max-w-6xl mx-auto space-y-4">
          {filteredList.map((leave) => {
            const name = leave.student?.user?.name ?? "Student";
            const classLabel = leave.student?.class
              ? `${leave.student.class.name}${leave.student.class.section ? `-${leave.student.class.section}` : ""}`
              : "—";
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=56&background=4ade80&color=fff`;

            return (
              <div
                key={leave.id}
                className=" border border-white/10 rounded-[1rem] p-4 backdrop-blur-lg flex flex-col md:flex-row items-center md:items-stretch gap-6 relative group hover:border-white/20 transition-all shadow-2xl"
              >
                <div className="flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-2 min-w-[180px]">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-white/5">
                    <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg tracking-tight leading-none">{name}</h3>
                    <p className="text-white/40 text-xs font-medium mt-1">Class {classLabel}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold tracking-widest text-white/40 uppercase">
                      {leaveTypeShort(leave.leaveType)}
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                      <Calendar size={14} className="text-[#b4f03d]" />
                      <span className="text-xs font-medium text-white/80">
                        {formatDateRange(leave.fromDate, leave.toDate)}
                      </span>
                      <span className="text-white/20">|</span>
                      <span className="text-xs font-bold text-[#b4f03d]">
                        {daysBetween(leave.fromDate, leave.toDate)} Days
                      </span>
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-xl p-3 border border-white/[0.03]">
                    <p className="text-white/60 text-sm leading-snug font-medium line-clamp-2 md:line-clamp-none">
                      {leave.reason}
                    </p>
                  </div>
                </div>

                {subTab === "pending" && leave.status === "PENDING" && (
                  <div className="flex flex-row md:flex-col gap-2 justify-center items-center border-l border-white/10 pl-4">
                    <div className="flex flex-col items-center gap-3">
                      <button
                        onClick={() => handleApprove(leave.id)}
                        disabled={actionId !== null}
                        className="flex items-center justify-center gap-2 bg-[#b4f03d]/10 hover:bg-[#b4f03d] hover:text-black border border-[#b4f03d]/20 text-[#b4f03d] px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 w-[100px] group/btn disabled:opacity-50"
                      >
                        <Check size={18} strokeWidth={3} />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(leave.id)}
                        disabled={actionId !== null}
                        className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-500 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 w-[100px] group/btn disabled:opacity-50"
                      >
                        <X size={18} strokeWidth={3} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                )}

                {subTab === "history" && leave.status !== "PENDING" && (
                  <div className="flex items-center border-l border-white/10 pl-4">
                    <span
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                        leave.status === "APPROVED"
                          ? "bg-[#b4f03d]/10 text-[#b4f03d] border-[#b4f03d]/30"
                          : "bg-red-500/10 text-red-400 border-red-500/30"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

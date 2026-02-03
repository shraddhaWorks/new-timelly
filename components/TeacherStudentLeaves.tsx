"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, User, CheckCircle2, XCircle, FileText, BookOpen } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { formatDate } from "@/lib/utils";

interface StudentLeave {
  id: string;
  student: {
    user: { name: string | null; email: string | null };
    class?: { name: string; section: string | null } | null;
  };
  leaveType: string;
  reason: string;
  fromDate: string;
  toDate: string;
  status: string;
}

export default function TeacherStudentLeaves() {
  const [pending, setPending] = useState<StudentLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [showRejectInput, setShowRejectInput] = useState<Record<string, boolean>>({});

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student-leaves/pending");
      const data = await res.json();
      setPending(Array.isArray(data) ? data : []);
    } catch {
      setPending([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const approve = async (id: string) => {
    await fetch(`/api/student-leaves/${id}/approve`, { method: "PATCH" });
    fetchPending();
  };

  const reject = async (id: string) => {
    await fetch(`/api/student-leaves/${id}/reject`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ remarks: remarks[id] || "" }),
    });
    setRemarks((p) => ({ ...p, [id]: "" }));
    setShowRejectInput((p) => ({ ...p, [id]: false }));
    fetchPending();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/30 border-t-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center border border-white/10">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Student Leave Approval</h1>
            <p className="text-sm text-white/60">Approve or reject student leave requests</p>
          </div>
        </motion.div>

        {pending.length === 0 ? (
          <GlassCard variant="default" className="p-12 text-center">
            <Calendar className="w-14 h-14 mx-auto text-white/40 mb-4" />
            <p className="text-white/60">No pending student leave requests</p>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {pending.map((l) => (
              <GlassCard key={l.id} variant="default" className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl glass flex items-center justify-center">
                      <User className="w-6 h-6 text-white/80" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{l.student?.user?.name ?? "—"}</div>
                      <div className="text-white/60 text-sm flex items-center gap-1">
                        <BookOpen size={14} />
                        {l.student?.class ? `${l.student.class.name} ${l.student.class.section ?? ""}` : "—"}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <FileText size={14} />
                      {l.leaveType}
                    </div>
                    <div className="mt-1">
                      {formatDate(l.fromDate)} – {formatDate(l.toDate)}
                    </div>
                    <p className="mt-2 text-white/80">{l.reason}</p>
                  </div>
                </div>
                {showRejectInput[l.id] && (
                  <div className="mt-4">
                    <label className="block text-sm text-white/70 mb-2">Rejection remarks</label>
                    <textarea
                      value={remarks[l.id] ?? ""}
                      onChange={(e) => setRemarks((p) => ({ ...p, [l.id]: e.target.value }))}
                      placeholder="Optional reason..."
                      className="w-full glass-input text-white rounded-lg px-3 py-2 min-h-[80px]"
                    />
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => approve(l.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30"
                  >
                    <CheckCircle2 size={18} />
                    Approve
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (showRejectInput[l.id]) {
                        reject(l.id);
                      } else {
                        setShowRejectInput((p) => ({ ...p, [l.id]: true }));
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30"
                  >
                    <XCircle size={18} />
                    Reject
                  </motion.button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

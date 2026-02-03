"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, Plus, X, ThumbsUp, ThumbsDown, History } from "lucide-react";
import RequireRole from "@/components/RequireRole";
import GlassCard from "@/components/ui/GlassCard";

type TeacherRow = {
  id: string;
  name: string | null;
  email: string | null;
  photoUrl: string | null;
  teacherId: string | null;
  subject: string | null;
  performanceScore: number;
  recordCount: number;
};

type AuditRecord = {
  id: string;
  category: string;
  customCategory: string | null;
  description: string;
  scoreImpact: number;
  createdAt: string;
  createdBy: { id: string; name: string | null };
};

const CATEGORIES = [
  { id: "TEACHING_METHOD", label: "Teaching Method" },
  { id: "PUNCTUALITY", label: "Punctuality" },
  { id: "STUDENT_ENGAGEMENT", label: "Student Engagement" },
  { id: "INNOVATION", label: "Innovation" },
  { id: "EXTRA_CURRICULAR", label: "Extra Curricular" },
  { id: "RESULTS", label: "Results" },
  { id: "CUSTOM", label: "Custom" },
] as const;

export default function TeacherAuditPage() {
  return (
    <RequireRole allowedRoles={["SCHOOLADMIN"]}>
      <TeacherAuditInner />
    </RequireRole>
  );
}

function TeacherAuditInner() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherRow | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<"good" | "bad" | "history">("good");
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["id"]>("TEACHING_METHOD");
  const [customCategory, setCustomCategory] = useState("");
  const [description, setDescription] = useState("");
  const [scoreImpact, setScoreImpact] = useState(5);
  const [saving, setSaving] = useState(false);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/teacher-audit/teachers?${params.toString()}`);
      const data = await res.json();
      setTeachers(data.teachers ?? []);
    } catch {
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAdd = async (t: TeacherRow, nextMode: "good" | "bad" | "history") => {
    setSelectedTeacher(t);
    setMode(nextMode);
    setShowModal(true);
    setDescription("");
    setCustomCategory("");
    setCategory("TEACHING_METHOD");
    setScoreImpact(nextMode === "bad" ? -5 : 5);
    await loadHistory(t.id);
  };

  const loadHistory = async (teacherId: string) => {
    try {
      const res = await fetch(`/api/teacher-audit/${teacherId}/records?take=50`);
      const data = await res.json();
      setRecords(data.records ?? []);
    } catch {
      setRecords([]);
    }
  };

  const visibleTeachers = useMemo(() => teachers, [teachers]);

  const saveRecord = async () => {
    if (!selectedTeacher) return;
    setSaving(true);
    try {
      const payload = {
        category,
        customCategory: category === "CUSTOM" ? customCategory : undefined,
        description,
        scoreImpact,
      };
      const res = await fetch(`/api/teacher-audit/${selectedTeacher.id}/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");
      await loadHistory(selectedTeacher.id);
      await fetchTeachers();
      setDescription("");
      setCustomCategory("");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 flex-wrap"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center border border-white/10">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Teacher Audit & Appraisal</h1>
              <p className="text-sm text-white/60">
                Track performance, acknowledge achievements, and identify areas for improvement.
              </p>
            </div>
          </div>
        </motion.div>

        <GlassCard variant="card" className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchTeachers()}
                placeholder="Search teacher..."
                className="w-full glass-input rounded-xl pl-10 pr-3 py-2.5 text-white"
              />
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchTeachers}
              className="glass-card px-5 py-2.5 rounded-xl font-medium text-white flex items-center gap-2 border border-white/10"
            >
              <Search size={18} />
              Search
            </motion.button>
          </div>
        </GlassCard>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/30 border-t-white" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleTeachers.map((t) => (
              <GlassCard key={t.id} variant="default" className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden glass border border-white/10 flex items-center justify-center">
                      {t.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.photoUrl} alt={t.name ?? "Teacher"} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-6 h-6 text-white/60" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{t.name ?? "—"}</div>
                      <div className="text-white/60 text-sm">{t.subject ?? "—"}</div>
                      <div className="text-white/50 text-xs">{t.teacherId ?? "—"}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-2xl font-bold">{t.performanceScore}</div>
                    <div className="text-white/60 text-xs">Performance Score</div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openAdd(t, "good")}
                    className="flex-1 bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <ThumbsUp size={16} /> Add Good
                  </button>
                  <button
                    onClick={() => openAdd(t, "bad")}
                    className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <ThumbsDown size={16} /> Add Bad
                  </button>
                  <button
                    onClick={() => openAdd(t, "history")}
                    className="px-3 py-2 rounded-lg glass border border-white/10 text-white/80 flex items-center justify-center gap-2"
                  >
                    <History size={16} /> View
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && selectedTeacher && (
          <motion.div
            key="audit-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard variant="strong" className="p-6 md:p-8 border border-white/10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {mode === "history" ? "Performance History" : "Add Record"}
                    </h2>
                    <p className="text-white/60 text-sm">{selectedTeacher.name ?? "Teacher"}</p>
                  </div>
                  <button
                    className="p-2 rounded-lg hover:bg-white/10 text-white/80"
                    onClick={() => setShowModal(false)}
                    type="button"
                  >
                    <X size={18} />
                  </button>
                </div>

                {mode !== "history" && (
                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white/70 mb-2">Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value as any)}
                          className="w-full glass-input rounded-lg px-3 py-2 text-white"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-white/70 mb-2">Score Impact</label>
                        <input
                          type="number"
                          value={scoreImpact}
                          onChange={(e) => setScoreImpact(Number(e.target.value))}
                          className="w-full glass-input rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                    </div>

                    {category === "CUSTOM" && (
                      <div>
                        <label className="block text-sm text-white/70 mb-2">Custom Category</label>
                        <input
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          className="w-full glass-input rounded-lg px-3 py-2 text-white"
                          placeholder="Type or select a category..."
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm text-white/70 mb-2">Details</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full glass-input rounded-lg px-3 py-2 text-white min-h-[90px]"
                        placeholder="Add a short description..."
                      />
                    </div>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      disabled={saving}
                      onClick={saveRecord}
                      className="w-full bg-white/20 text-white border border-white/30 rounded-lg py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Plus size={18} />
                      Save Record
                    </motion.button>
                  </div>
                )}

                <div className="mt-6 space-y-3">
                  {records.length === 0 ? (
                    <p className="text-white/60 text-sm">No records yet.</p>
                  ) : (
                    records.map((r) => (
                      <div key={r.id} className="glass rounded-xl p-4 border border-white/10">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-white font-medium">
                              {r.category === "CUSTOM" ? r.customCategory ?? "Custom" : r.category}
                            </div>
                            <div className="text-white/70 text-sm mt-1">{r.description}</div>
                            <div className="text-white/50 text-xs mt-2">
                              {new Date(r.createdAt).toLocaleString()} • By {r.createdBy?.name ?? "—"}
                            </div>
                          </div>
                          <div className={`font-semibold ${r.scoreImpact >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {r.scoreImpact >= 0 ? `+${r.scoreImpact}` : r.scoreImpact}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


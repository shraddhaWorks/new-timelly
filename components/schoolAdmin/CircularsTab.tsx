"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  X,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  Search,
  Clock,
  Paperclip,
  Download,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { useSession } from "next-auth/react";
import { formatDate } from "@/lib/utils";
import {
  IMPORTANCE_LEVELS,
  CIRCULAR_RECIPIENTS,
  PUBLISH_STATUS,
} from "@/lib/constants";
import { useClasses } from "@/hooks/useClasses";
import {
  CIRCULAR_PRIMARY,
  CIRCULAR_SELECTED_RECIPIENT,
  CIRCULAR_IMPORTANCE_HIGH,
  CIRCULAR_IMPORTANCE_MEDIUM,
  CIRCULAR_IMPORTANCE_LOW,
  CIRCULAR_DRAFT_YELLOW,
  CIRCULAR_PUBLISHED_GREEN,
} from "@/app/frontend/constants/colors";

interface CircularRow {
  id: string;
  referenceNumber: string;
  date: string;
  subject: string;
  content: string;
  importanceLevel: string;
  recipients: string[];
  attachments?: string[];
  classId: string | null;
  publishStatus: string;
  issuedBy: { id: string; name: string | null };
}

const defaultForm = {
  referenceNumber: "",
  date: new Date().toISOString().split("T")[0],
  subject: "",
  content: "",
  importanceLevel: "Medium",
  recipients: ["All"],
  classId: "",
  publishStatus: "DRAFT",
  attachments: [] as string[],
};

function getImportanceBorderColor(level: string): string {
  switch (level) {
    case "High":
      return CIRCULAR_IMPORTANCE_HIGH;
    case "Medium":
      return CIRCULAR_IMPORTANCE_MEDIUM;
    case "Low":
      return CIRCULAR_IMPORTANCE_LOW;
    default:
      return CIRCULAR_IMPORTANCE_MEDIUM;
  }
}

function getInitial(name: string | null): string {
  if (!name || !name.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name[0].toUpperCase();
}

export default function CircularsTab() {
  const { data: session } = useSession();
  const { classes } = useClasses();
  const [circulars, setCirculars] = useState<CircularRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [importanceFilter, setImportanceFilter] = useState<string>("All Importance");

  const fetchCirculars = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/circular/list?status=all");
      const data = await res.json();
      if (res.ok && data.circulars) setCirculars(data.circulars);
    } catch {
      setCirculars([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCirculars();
  }, []);

  const filteredCirculars = useMemo(() => {
    let list = circulars;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.subject.toLowerCase().includes(q) ||
          (c.referenceNumber || "").toLowerCase().includes(q)
      );
    }
    if (importanceFilter !== "All Importance") {
      list = list.filter((c) => c.importanceLevel === importanceFilter);
    }
    return list;
  }, [circulars, searchQuery, importanceFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/circular/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceNumber: form.referenceNumber || undefined,
          date: form.date,
          subject: form.subject,
          content: form.content,
          importanceLevel: form.importanceLevel,
          recipients: form.recipients,
          classId: form.classId || null,
          publishStatus: form.publishStatus,
          attachments: form.attachments,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.message || "Failed to create circular" });
        return;
      }
      setMessage({ type: "ok", text: "Circular created successfully" });
      setForm({ ...defaultForm, attachments: [] });
      setShowForm(false);
      fetchCirculars();
    } catch {
      setMessage({ type: "err", text: "Something went wrong" });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleRecipient = (value: string) => {
    setForm((prev) => {
      const next = prev.recipients.includes(value)
        ? prev.recipients.filter((r) => r !== value)
        : [...prev.recipients, value];
      if (next.length === 0) return { ...prev, recipients: ["All"] };
      return { ...prev, recipients: next };
    });
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 pb-8">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header: Circulars & Notices + Create Circular - mobile stacked */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border border-white/10 flex-shrink-0"
                style={{ background: "rgba(163, 230, 53, 0.2)" }}
              >
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white truncate">
                  Circulars & Notices
                </h1>
                <p className="text-xs sm:text-sm text-white/60">
                  Create and manage school-wide circulars.
                </p>
              </div>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm(!showForm)}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:px-5 sm:py-2.5 rounded-xl font-medium text-white border-0 flex-shrink-0 backdrop-blur-sm min-h-[44px] touch-manipulation w-full sm:w-auto"
              style={{ background: CIRCULAR_PRIMARY, boxShadow: "0 4px 20px rgba(163, 230, 53, 0.25)" }}
            >
              <Plus size={20} className="text-white shrink-0" />
              Create Circular
            </motion.button>
          </div>
        </motion.div>

        {message && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 ${
              message.type === "ok"
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}
          >
            {message.type === "ok" ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            {message.text}
          </div>
        )}

        {showForm && (
          <GlassCard variant="card" className="p-4 sm:p-6 md:p-8 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-white">New Circular</h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-2.5 rounded-lg hover:bg-white/10 text-white/80 min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CIR/2026/004"
                    value={form.referenceNumber}
                    onChange={(e) =>
                      setForm({ ...form, referenceNumber: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl text-white bg-white/5 border border-white/10 backdrop-blur-sm placeholder:text-white/40 min-h-[44px] touch-manipulation text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                    <Calendar size={16} />
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-white bg-white/5 border border-white/10 backdrop-blur-sm min-h-[44px] touch-manipulation text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Subject / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter the subject of the circular..."
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-white bg-white/5 border border-white/10 backdrop-blur-sm placeholder:text-white/40 min-h-[44px] touch-manipulation text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Content *
                </label>
                <textarea
                  required
                  placeholder="Type the detailed content of the circular here..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl text-white bg-white/5 border border-white/10 backdrop-blur-sm resize-y placeholder:text-white/40 touch-manipulation text-base min-h-[120px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Attachments
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 text-white/80 hover:bg-white/5 transition"
                  >
                    <Paperclip size={18} />
                    Attach Document
                  </button>
                  {form.attachments.length > 0 &&
                    form.attachments.map((name, i) => (
                      <span
                        key={i}
                        className="text-sm text-white/70 bg-white/5 px-2 py-1 rounded-lg"
                      >
                        {name}
                      </span>
                    ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Issued By
                </label>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white">
                  <User size={18} className="text-white/70" />
                  {session?.user?.name ?? "—"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Importance Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {IMPORTANCE_LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() =>
                        setForm({ ...form, importanceLevel: level })
                      }
                      className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium transition border touch-manipulation ${
                        form.importanceLevel === level
                          ? "text-white border-transparent"
                          : "text-white/70 border-white/10 bg-white/5 hover:bg-white/10 active:bg-white/10"
                      }`}
                      style={
                        form.importanceLevel === level
                          ? {
                              background:
                                level === "High"
                                  ? CIRCULAR_IMPORTANCE_HIGH
                                  : level === "Medium"
                                    ? CIRCULAR_IMPORTANCE_MEDIUM
                                    : CIRCULAR_IMPORTANCE_LOW,
                            }
                          : undefined
                      }
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Recipients
                </label>
                <div className="flex flex-wrap gap-2">
                  {CIRCULAR_RECIPIENTS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleRecipient(value)}
                      className={`flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium transition border touch-manipulation ${
                        form.recipients.includes(value)
                          ? "border-transparent text-[#0f172a]"
                          : "text-white/70 border-white/10 bg-white/5 hover:bg-white/10 active:bg-white/10"
                      }`}
                      style={
                        form.recipients.includes(value)
                          ? { background: CIRCULAR_SELECTED_RECIPIENT }
                          : undefined
                      }
                    >
                      {form.recipients.includes(value) && (
                        <CheckCircle2 size={16} className="text-[#0f172a]" />
                      )}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Target Class (optional)
                </label>
                <select
                  value={form.classId}
                  onChange={(e) =>
                    setForm({ ...form, classId: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl text-white bg-white/5 border border-white/10 backdrop-blur-sm min-h-[44px] touch-manipulation text-base"
                >
                  <option value="">All classes</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.section ? `- ${c.section}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Publish Status
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-white/80">
                    <input
                      type="radio"
                      name="publishStatus"
                      checked={form.publishStatus === PUBLISH_STATUS.PUBLISHED}
                      onChange={() =>
                        setForm({ ...form, publishStatus: PUBLISH_STATUS.PUBLISHED })
                      }
                      className="rounded-full"
                    />
                    Publish Immediately
                  </label>
                  <label
                    className="flex items-center gap-2 cursor-pointer"
                    style={{ color: form.publishStatus === PUBLISH_STATUS.DRAFT ? CIRCULAR_DRAFT_YELLOW : "rgba(255,255,255,0.8)" }}
                  >
                    <input
                      type="radio"
                      name="publishStatus"
                      checked={form.publishStatus === PUBLISH_STATUS.DRAFT}
                      onChange={() =>
                        setForm({ ...form, publishStatus: PUBLISH_STATUS.DRAFT })
                      }
                      className="rounded-full"
                    />
                    <Clock size={18} />
                    Save as Draft
                  </label>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl text-white/80 bg-white/5 border border-white/10 min-h-[44px] touch-manipulation"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-[#0f172a] border-0 min-h-[44px] touch-manipulation"
                  style={{ background: CIRCULAR_PRIMARY }}
                >
                  <FileText size={18} />
                  Create Circular
                </motion.button>
              </div>
            </form>
          </GlassCard>
        )}

        {/* Search and filters - mobile: stack, touch-friendly */}
        {!showForm && (
          <div className="flex flex-col gap-3">
            <div className="relative min-w-0 w-full">
              <Search
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none"
                size={20}
              />
              <input
                type="text"
                placeholder="Search circulars by title or reference no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-11 pr-4 py-3 min-h-[44px] rounded-2xl text-white bg-[rgba(45,45,55,0.6)] border border-white/[0.08] backdrop-blur-[12px] placeholder:text-white/40 focus:outline-none focus:border-white/20 transition touch-manipulation text-base"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {["All Importance", ...IMPORTANCE_LEVELS].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setImportanceFilter(opt)}
                  className={`min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-medium transition border touch-manipulation ${
                    importanceFilter === opt
                      ? "text-white border-transparent"
                      : "text-white bg-[rgba(45,45,55,0.6)] border border-white/[0.08] backdrop-blur-[12px] hover:bg-white/10 active:bg-white/15"
                  }`}
                  style={
                    importanceFilter === opt
                      ? { background: CIRCULAR_PRIMARY }
                      : undefined
                  }
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/30 border-t-white" />
          </div>
        ) : filteredCirculars.length === 0 ? (
          <div className="rounded-2xl p-12 text-center bg-[rgba(26,26,36,0.6)] backdrop-blur-[14px] border border-white/[0.1] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <FileText className="w-14 h-14 mx-auto text-white/40 mb-4" />
            <p className="text-white/60">
              {circulars.length === 0
                ? "No circulars yet. Create one above."
                : "No circulars match your search or filter."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredCirculars.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl overflow-hidden flex flex-col backdrop-blur-[14px] border border-white/[0.1] shadow-[0_8px_32px_rgba(0,0,0,0.2)] min-h-0"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                {/* Top border accent - red / yellow / blue by importance */}
                <div
                  className="h-1 w-full shrink-0"
                  style={{
                    background: getImportanceBorderColor(c.importanceLevel),
                  }}
                />
                <div className="p-3 sm:p-4 flex flex-col flex-1 min-h-0">
                  {/* Reference number + Status - outside boxes */}
                  <span className="font-mono text-white/50 text-xs sm:text-sm">
                    {c.referenceNumber}
                  </span>
                  <span
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium w-fit mt-1.5 shrink-0"
                    style={
                      c.publishStatus === "PUBLISHED"
                        ? { background: CIRCULAR_PRIMARY, color: "#fff" }
                        : {
                            background: "rgba(255,255,255,0.12)",
                            color: "rgba(255,255,255,0.75)",
                          }
                    }
                  >
                    {c.publishStatus === "PUBLISHED" ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <Clock size={12} />
                    )}
                    {c.publishStatus}
                  </span>
                  {/* Outer box: title only */}
                  <div className="mt-3 mb-3 rounded-xl border border-white/[0.1] p-3 sm:p-3.5 bg-white/[0.04] backdrop-blur-sm">
                    <h3 className="text-base sm:text-lg font-bold text-white line-clamp-2 leading-snug">
                      {c.subject}
                    </h3>
                  </div>
                  {/* Inner box: all content + attachments (darker glass) */}
                  <div className="rounded-xl bg-[rgba(0,0,0,0.25)] border border-white/[0.06] backdrop-blur-sm p-3 sm:p-3.5 flex-1 min-h-0 flex flex-col">
                    <p className="text-white/70 text-sm line-clamp-3 mb-3 flex-shrink-0">
                      {c.content}
                    </p>
                    {(c.attachments?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {c.attachments?.map((att, i) => (
                          <a
                            key={i}
                            href={att.startsWith("http") ? att : "#"}
                            target={att.startsWith("http") ? "_blank" : undefined}
                            rel={att.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[rgba(255,255,255,0.08)] border border-white/[0.06] text-white text-sm hover:bg-white/10 active:bg-white/15 transition min-h-[44px] touch-manipulation w-full min-w-0"
                          >
                            <FileText size={14} className="shrink-0 text-white/80" />
                            <span className="truncate flex-1 text-left">
                              {att.split("/").pop() || att}
                            </span>
                            <Download size={14} className="shrink-0 text-white/80" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Footer: issued by (avatar + name) left, date right */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.08] gap-2">
                    <div className="flex items-center gap-2 text-white text-xs sm:text-sm min-w-0">
                      <div
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                        style={{ background: CIRCULAR_PUBLISHED_GREEN }}
                      >
                        {getInitial(c.issuedBy?.name ?? null)}
                      </div>
                      <span className="truncate">
                        {c.issuedBy?.name ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/80 text-xs sm:text-sm flex-shrink-0">
                      <Calendar size={14} />
                      {formatDate(c.date)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Send,
  X,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
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

interface CircularRow {
  id: string;
  referenceNumber: string;
  date: string;
  subject: string;
  content: string;
  importanceLevel: string;
  recipients: string[];
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
};

export default function CircularsTab() {
  const { data: session } = useSession();
  const { classes } = useClasses();
  const [circulars, setCirculars] = useState<CircularRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

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
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.message || "Failed to create circular" });
        return;
      }
      setMessage({ type: "ok", text: "Circular created successfully" });
      setForm(defaultForm);
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
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center border border-white/10">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Circulars</h1>
              <p className="text-sm text-white/60">Create and manage circulars</p>
            </div>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(!showForm)}
            className="glass-card px-5 py-2.5 rounded-xl font-medium text-white flex items-center gap-2 border border-white/10"
          >
            <Plus size={20} />
            New Circular
          </motion.button>
        </motion.div>

        {message && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 ${
              message.type === "ok"
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}
          >
            {message.type === "ok" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        {showForm && (
          <GlassCard variant="card" className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">New Circular</h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-white/80"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CIR/2026/004"
                    value={form.referenceNumber}
                    onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })}
                    className="w-full glass-input text-white rounded-lg px-4 py-2.5"
                  />
                  <p className="text-xs text-white/50 mt-1">Leave blank to auto-generate</p>
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
                    className="w-full glass-input text-white rounded-lg px-4 py-2.5"
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
                  className="w-full glass-input text-white rounded-lg px-4 py-2.5"
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
                  rows={6}
                  className="w-full glass-input text-white rounded-lg px-4 py-2.5 resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Issued By
                </label>
                <div className="flex items-center gap-2 text-white/80">
                  <User size={18} />
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
                      onClick={() => setForm({ ...form, importanceLevel: level })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        form.importanceLevel === level
                          ? "bg-white/20 text-white border border-white/30"
                          : "glass text-white/70 border border-white/10 hover:bg-white/10"
                      }`}
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
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        form.recipients.includes(value)
                          ? "bg-white/20 text-white border border-white/30"
                          : "glass text-white/70 border border-white/10 hover:bg-white/10"
                      }`}
                    >
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
                  onChange={(e) => setForm({ ...form, classId: e.target.value })}
                  className="w-full glass-input text-white rounded-lg px-4 py-2.5"
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
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-white/80">
                    <input
                      type="radio"
                      name="publishStatus"
                      checked={form.publishStatus === PUBLISH_STATUS.PUBLISHED}
                      onChange={() => setForm({ ...form, publishStatus: PUBLISH_STATUS.PUBLISHED })}
                      className="rounded-full"
                    />
                    Publish Immediately
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-white/80">
                    <input
                      type="radio"
                      name="publishStatus"
                      checked={form.publishStatus === PUBLISH_STATUS.DRAFT}
                      onChange={() => setForm({ ...form, publishStatus: PUBLISH_STATUS.DRAFT })}
                      className="rounded-full"
                    />
                    Save as Draft
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-lg glass text-white/80 border border-white/10"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white/20 text-white font-medium border border-white/30 disabled:opacity-50"
                >
                  <Send size={18} />
                  Create Circular
                </motion.button>
              </div>
            </form>
          </GlassCard>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/30 border-t-white" />
          </div>
        ) : circulars.length === 0 ? (
          <GlassCard variant="default" className="p-12 text-center">
            <FileText className="w-14 h-14 mx-auto text-white/40 mb-4" />
            <p className="text-white/60">No circulars yet. Create one above.</p>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {circulars.map((c) => (
              <GlassCard key={c.id} variant="default" className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-white/80 text-sm">{c.referenceNumber}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          c.publishStatus === "PUBLISHED"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-white/10 text-white/60"
                        }`}
                      >
                        {c.publishStatus}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">{c.subject}</h3>
                    <p className="text-white/60 text-sm mt-1 line-clamp-2">{c.content}</p>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-white/50">
                      <span>{formatDate(c.date)}</span>
                      <span>By {c.issuedBy?.name ?? "—"}</span>
                      <span>{c.importanceLevel}</span>
                      <span>{c.recipients?.join(", ") || "All"}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

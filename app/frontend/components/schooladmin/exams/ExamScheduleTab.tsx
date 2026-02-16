"use client";

import { useState } from "react";
import { Plus, Clock, X } from "lucide-react";
import type { ExamScheduleItem } from "@/hooks/useExamTerms";
import {
  EXAM_ACCENT,
  EXAM_ACCENT_GLOW,
  EXAM_TEXT_MAIN,
  EXAM_TEXT_SECONDARY,
  EXAM_CARD_BG_ALT,
  EXAM_INPUT_BG,
} from "@/app/frontend/constants/colors";

interface ExamScheduleTabProps {
  termId: string;
  schedules: ExamScheduleItem[];
  onScheduleChange?: () => void;
}

function formatDuration(min: number): string {
  if (min >= 60) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${min} min`;
}

export default function ExamScheduleTab({
  termId,
  schedules,
  onScheduleChange,
}: ExamScheduleTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [durationMin, setDurationMin] = useState(180);
  const [saving, setSaving] = useState(false);

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !examDate || !startTime) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/exams/terms/${termId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          examDate,
          startTime,
          durationMin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add");
      setSubject("");
      setExamDate("");
      setStartTime("");
      setDurationMin(180);
      setShowAddModal(false);
      onScheduleChange?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: EXAM_TEXT_MAIN }}
        >
          Schedule
        </h3>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-black transition min-h-[44px] touch-manipulation w-full sm:w-auto"
          style={{
            backgroundColor: EXAM_ACCENT,
            boxShadow: `0 0 12px ${EXAM_ACCENT_GLOW}`,
          }}
        >
          <Plus size={18} />
          Add Subject
        </button>
      </div>

      {!schedules.length ? (
        <div className="py-8 sm:py-12 text-center text-sm" style={{ color: EXAM_TEXT_SECONDARY }}>
          No exam schedule added yet. Click &quot;Add Subject&quot; to add one.
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((s) => {
            const date = new Date(s.examDate);
            const day = date.getDate();
            const month = date.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
            const durationStr = formatDuration(s.durationMin);
            return (
              <div
                key={s.id}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-white/10 min-h-[44px]"
                style={{
                  background: EXAM_CARD_BG_ALT,
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="flex-shrink-0 w-12 sm:w-14 text-center">
                  <div
                    className="text-xl sm:text-2xl font-bold leading-none"
                    style={{ color: EXAM_TEXT_MAIN }}
                  >
                    {day}
                  </div>
                  <div
                    className="text-xs mt-1 uppercase tracking-wider"
                    style={{ color: EXAM_TEXT_SECONDARY }}
                  >
                    {month}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-medium text-sm sm:text-base"
                    style={{ color: EXAM_TEXT_MAIN }}
                  >
                    {s.subject}
                  </div>
                  <div
                    className="flex items-center gap-1.5 text-xs sm:text-sm mt-0.5"
                    style={{ color: EXAM_TEXT_SECONDARY }}
                  >
                    <Clock size={14} />
                    <span>
                      {s.startTime}
                      <span className="mx-1.5">•</span>
                      {durationStr} duration
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="w-full max-w-md rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 shadow-xl mt-auto sm:mt-0 max-h-[90vh] overflow-y-auto"
            style={{
              background: EXAM_CARD_BG_ALT,
              backdropFilter: "blur(16px)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold" style={{ color: EXAM_TEXT_MAIN }}>
                Add Subject to Schedule
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2.5 rounded-lg hover:bg-white/10 transition min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center"
                style={{ color: EXAM_TEXT_SECONDARY }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: EXAM_TEXT_SECONDARY }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Mathematics"
                  required
                  className="w-full px-3 py-3 rounded-lg border border-white/20 placeholder:opacity-70 min-h-[44px] touch-manipulation text-base"
                  style={{ background: EXAM_INPUT_BG, color: EXAM_TEXT_MAIN }}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1" style={{ color: EXAM_TEXT_SECONDARY }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    required
                    className="w-full px-3 py-3 rounded-lg border border-white/20 placeholder:opacity-70 min-h-[44px] touch-manipulation text-base"
                    style={{ background: EXAM_INPUT_BG, color: EXAM_TEXT_MAIN }}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: EXAM_TEXT_SECONDARY }}>
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full px-3 py-3 rounded-lg border border-white/20 placeholder:opacity-70 min-h-[44px] touch-manipulation text-base"
                    style={{ background: EXAM_INPUT_BG, color: EXAM_TEXT_MAIN }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: EXAM_TEXT_SECONDARY }}>
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={durationMin}
                  onChange={(e) => setDurationMin(Number(e.target.value) || 0)}
                  min={1}
                  className="w-full px-3 py-3 rounded-lg border border-white/20 placeholder:opacity-70 min-h-[44px] touch-manipulation text-base"
                  style={{ background: EXAM_INPUT_BG, color: EXAM_TEXT_MAIN }}
                />
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 rounded-lg font-medium border border-white/20 transition min-h-[44px] touch-manipulation"
                  style={{ color: EXAM_TEXT_MAIN }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 rounded-lg font-medium text-black disabled:opacity-50 transition min-h-[44px] touch-manipulation"
                  style={{ backgroundColor: EXAM_ACCENT }}
                >
                  {saving ? "Saving…" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
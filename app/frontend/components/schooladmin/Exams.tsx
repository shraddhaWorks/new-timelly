"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Calendar, Plus } from "lucide-react";

import { useExamTerms, fetchExamTermDetail } from "@/hooks/useExamTerms";
import { useClasses } from "@/hooks/useClasses";

import type { ExamTermDetail } from "@/hooks/useExamTerms";
import {
  EXAM_ACCENT,
  EXAM_TEXT_SECONDARY,
  EXAM_TEXT_MAIN,
} from "@/app/frontend/constants/colors";
import ExamTermCard from "./exams/ExamTermCard";
import GlassCard from "./exams/GlassCard";
import ExamScheduleTab from "./exams/ExamScheduleTab";
import NewExamTermModal from "./exams/NewExamTermModal";
import SyllabusTrackingTab from "./exams/SyllabusTrackingTab";

type TabId = "schedule" | "syllabus";

export default function ExamsPage() {
  return (
      <ExamsPageInner />
  );
}

export function ExamsPageInner() {
  const { terms, loading, error, refetch } = useExamTerms();
  const { classes } = useClasses();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [termDetail, setTermDetail] = useState<ExamTermDetail | null>(null);
  const [tab, setTab] = useState<TabId>("syllabus");
  const [showAddModal, setShowAddModal] = useState(false);

  const upcoming = terms.filter((t) => t.status === "UPCOMING");
  const completed = terms.filter((t) => t.status === "COMPLETED");

  useEffect(() => {
    if (!selectedId) {
      setTermDetail(null);
      return;
    }
    let cancelled = false;
    fetchExamTermDetail(selectedId).then((detail) => {
      if (!cancelled) setTermDetail(detail);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const handleTermSaved = () => {
    refetch();
  };

  const handleSyllabusChange = () => {
    if (selectedId) {
      fetchExamTermDetail(selectedId).then(setTermDetail);
    }
  };

  const handleScheduleChange = () => {
    if (selectedId) {
      fetchExamTermDetail(selectedId).then(setTermDetail);
    }
  };

  const startsInDays = termDetail?.status === "UPCOMING" && termDetail?.schedules?.length
    ? (() => {
        const first = termDetail.schedules[0];
        const d = new Date(first.examDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        d.setHours(0, 0, 0, 0);
        const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
      })()
    : null;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 pb-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border border-white/10 flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}
              >
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: EXAM_TEXT_MAIN }} />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate" style={{ color: EXAM_TEXT_MAIN }}>
                  Exams & Syllabus
                </h1>
                <p className="text-xs sm:text-sm" style={{ color: EXAM_TEXT_SECONDARY }}>
                  Manage examination schedules and syllabus tracking
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-medium transition hover:opacity-90 w-full sm:w-auto min-h-[44px] touch-manipulation"
              style={{
                backgroundColor: EXAM_ACCENT,
                color: "#0b0616",
                boxShadow: `0 0 12px ${EXAM_ACCENT}40`,
              }}
            >
              <Plus size={18} /> Add Exam Term
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left: Exam terms list */}
          <div className="lg:col-span-1 space-y-3 sm:space-y-4 order-2 lg:order-1">
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            {loading ? (
              <div className="flex justify-center py-12">
                <div
                  className="animate-spin rounded-full h-10 w-10 border-2 border-white/30"
                  style={{ borderTopColor: EXAM_ACCENT }}
                />
              </div>
            ) : (
              <>
                {upcoming.length > 0 && (
                  <div>
                    <div className="lg:col-span-1 space-y-4">
                      {upcoming.map((t) => (
                        <ExamTermCard
                          key={t.id}
                          term={t}
                          isSelected={selectedId === t.id}
                          onClick={() => setSelectedId(t.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {completed.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wider mb-2 mt-4" style={{ color: EXAM_TEXT_SECONDARY }}>
                      Completed
                    </h3>
                    <div className="space-y-2">
                      {completed.map((t) => (
                        <ExamTermCard
                          key={t.id}
                          term={t}
                          isSelected={selectedId === t.id}
                          onClick={() => setSelectedId(t.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {terms.length === 0 && (
                  <GlassCard variant="default" className="p-8 text-center" style={{ color: EXAM_TEXT_SECONDARY }}>
                    No exam terms. Click &quot;Add Exam Term&quot; to create one.
                  </GlassCard>
                )}
              </>
            )}
          </div>

          {/* Right: Term detail + tabs - show first on mobile so user sees selection prompt */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            {termDetail ? (
              <GlassCard variant="card" className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start sm:justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold break-words" style={{ color: EXAM_TEXT_MAIN }}>{termDetail.name}</h2>
                    {termDetail.description && (
                      <p className="text-xs sm:text-sm mt-1" style={{ color: EXAM_TEXT_SECONDARY }}>{termDetail.description}</p>
                    )}
                  </div>
                  {startsInDays !== null && (
                    <div className="text-left sm:text-right flex-shrink-0">
                      <span className="text-xs sm:text-sm" style={{ color: EXAM_TEXT_SECONDARY }}>
                        Starts in
                      </span>
                      <div
                        className="text-xl sm:text-2xl font-bold"
                        style={{ color: EXAM_ACCENT }}
                      >
                        {startsInDays}
                      </div>
                      <span className="text-xs sm:text-sm" style={{ color: EXAM_TEXT_SECONDARY }}>
                        days
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 sm:gap-4 border-b mb-4 -mx-1 overflow-x-auto no-scrollbar" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                  <button
                    type="button"
                    onClick={() => setTab("schedule")}
                    className={`pb-2 px-2 sm:px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] touch-manipulation flex items-end ${
                      tab === "schedule" ? "border-b-2" : ""
                    }`}
                    style={
                      tab === "schedule"
                        ? { color: EXAM_ACCENT, borderBottomColor: EXAM_ACCENT }
                        : { color: EXAM_TEXT_SECONDARY }
                    }
                  >
                    Exam Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("syllabus")}
                    className={`pb-2 px-2 sm:px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] touch-manipulation flex items-end hover:text-white ${
                      tab === "syllabus" ? "border-b-2" : ""
                    }`}
                    style={
                      tab === "syllabus"
                        ? { color: EXAM_ACCENT, borderBottomColor: EXAM_ACCENT }
                        : { color: EXAM_TEXT_SECONDARY }
                    }
                  >
                    Syllabus Tracking
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {tab === "schedule" && (
                    <motion.div
                      key="schedule"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <ExamScheduleTab
                        termId={termDetail.id}
                        schedules={termDetail.schedules ?? []}
                        onScheduleChange={handleScheduleChange}
                      />
                    </motion.div>
                  )}
                  {tab === "syllabus" && (
                    <motion.div
                      key="syllabus"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <SyllabusTrackingTab
                        termId={termDetail.id}
                        syllabus={termDetail.syllabus ?? []}
                        onSyllabusChange={handleSyllabusChange}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            ) : (
              <div className="p-6 sm:p-12 text-center bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden min-h-[600px] flex flex-col" style={{ color: EXAM_TEXT_SECONDARY }}>
                <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-60" style={{ color: EXAM_TEXT_MAIN }} />
                <p className="text-sm sm:text-base">Select an exam term below to view schedule and syllabus tracking</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <NewExamTermModal
            classes={classes}
            onClose={() => setShowAddModal(false)}
            onSaved={handleTermSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import {
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  GraduationCap,
} from "lucide-react";
import type { TeacherRow, AuditRecord } from "./types";
import AddRecordForm from "./AddRecordForm";
import PerformanceHistory from "./PerformanceHistory";

interface TeacherAuditCardProps {
  teacher: TeacherRow;
  isAddFormOpen: boolean;
  addFormMode: "good" | "bad";
  records: AuditRecord[];
  isHistoryOpen: boolean;
  category: string;
  customCategory: string;
  description: string;
  scoreImpact: number;
  saving: boolean;
  onCategoryChange: (v: string) => void;
  onCustomCategoryChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onScoreImpactChange: (v: number) => void;
  onOpenAddGood: () => void;
  onOpenAddBad: () => void;
  onToggleHistory: () => void;
  onSaveRecord: () => void;
  onCloseAddForm: () => void;
}

export default function TeacherAuditCard({
  teacher,
  isAddFormOpen,
  addFormMode,
  records,
  isHistoryOpen,
  category,
  customCategory,
  description,
  scoreImpact,
  saving,
  onCategoryChange,
  onCustomCategoryChange,
  onDescriptionChange,
  onScoreImpactChange,
  onOpenAddGood,
  onOpenAddBad,
  onToggleHistory,
  onSaveRecord,
  onCloseAddForm,
}: TeacherAuditCardProps) {
  const score = Math.max(0, Math.min(100, teacher.performanceScore));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
      <div className="p-4 sm:p-5 md:p-6 space-y-4">
        {/* Top row: profile + score + actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-white/10 border border-white/10 flex-shrink-0 flex items-center justify-center">
              {teacher.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={teacher.photoUrl}
                  alt={teacher.name ?? "Teacher"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg sm:text-xl font-semibold text-white/70">
                  {(teacher.name ?? "T").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-white text-base sm:text-lg truncate">
                  {teacher.name ?? "—"}
                </h3>
                <div className="w-5 h-5 rounded bg-amber-500/30 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-3 h-3 text-amber-400" />
                </div>
              </div>
              <p className="text-white/80 text-sm">{teacher.subject ?? "—"}</p>
              <p className="text-white/50 text-xs">
                {(teacher.teacherId ?? "—").toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-amber-500/20 border border-amber-500/40">
                <span className="text-xl sm:text-2xl font-bold text-amber-400">
                  {score}
                </span>
              </div>
              <div className="min-w-[100px] sm:min-w-[140px]">
                <p className="text-xs text-white/60 mb-1">Performance Score</p>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <p className="text-xs text-white/70 mt-0.5">{score}/100</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onOpenAddGood}
                className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-white font-medium text-sm transition min-h-[44px] sm:min-h-0 touch-manipulation"
              >
                <ThumbsUp className="w-4 h-4 flex-shrink-0" />
                Add Good
              </button>
              <button
                type="button"
                onClick={onOpenAddBad}
                className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-sm transition min-h-[44px] sm:min-h-0 touch-manipulation"
              >
                <ThumbsDown className="w-4 h-4 flex-shrink-0" />
                Add Bad
              </button>
              <button
                type="button"
                onClick={onToggleHistory}
                className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-sm transition min-h-[44px] sm:min-h-0 touch-manipulation"
              >
                View All
                {isHistoryOpen ? (
                  <ChevronUp className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isAddFormOpen && (
          <AddRecordForm
            mode={addFormMode}
            category={category}
            customCategory={customCategory}
            description={description}
            scoreImpact={scoreImpact}
            saving={saving}
            onCategoryChange={onCategoryChange}
            onCustomCategoryChange={onCustomCategoryChange}
            onDescriptionChange={onDescriptionChange}
            onScoreImpactChange={onScoreImpactChange}
            onSave={onSaveRecord}
            onClose={onCloseAddForm}
          />
        )}

        {isHistoryOpen && <PerformanceHistory records={records} />}
      </div>
    </div>
  );
}

"use client";

import {
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Award,
  Save
} from "lucide-react";
import type { TeacherRow, AuditRecord } from "./types";
import PerformanceHistory from "./PerformanceHistory";
/* ================= NEW: CATEGORY MAP ================= */
const CATEGORY_MAP: Record<string, string> = {
  "Teaching Method": "TEACHING_METHOD",
  "Punctuality": "PUNCTUALITY",
  "Student Engagement": "STUDENT_ENGAGEMENT",
  "Innovation": "INNOVATION",
  "Extra Curricular": "EXTRA_CURRICULAR",
  "Results": "RESULTS",
};

const CATEGORY_LABEL_FROM_ENUM = (value: string) =>
  Object.keys(CATEGORY_MAP).find((k) => CATEGORY_MAP[k] === value) ?? value;
/* ==================================================== */

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
}: TeacherAuditCardProps) {

  const score = Math.max(0, Math.min(100, teacher.performanceScore));
  const isScoreMaxed =
    (addFormMode === "good" && score >= 100) ||
    (addFormMode === "bad" && score <= 0);


  const categories =
    addFormMode === "good"
      ? [
        "Teaching Method",
        "Punctuality",
        "Student Engagement",
        "Innovation",
        "Extra Curricular",
        "Results",
      ]
      : [
        "Teaching Method",
        "Punctuality",
        "Student Engagement",
        "Innovation",
        "Extra Curricular",
        "Results",
      ];


  const isFormReady = Boolean(
    category || customCategory.trim().length > 0
  );







  return (
    <div className="px-3 md:px-0">
      <div className="max-w-full mx-auto rounded-2xl border border-white/10 shadow-lg overflow-hidden">

        {/* CARD GRADIENT BACKGROUND */}
        <div className="">

          <div className="px-8 py-6 space-y-8 bg-white/5 backdrop-blur-xl border-b border-white/10">


            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 ">

              {/* LEFT SECTION: Profile & Name - Added min-w-0 to handle text overflow */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl">
                    {teacher.photoUrl ? (
                      <img
                        src={teacher.photoUrl}
                        alt={teacher.name || "Teacher"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/10 text-white/70 text-2xl font-bold">
                        {teacher.name?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#1a1a1a] border border-white/20 flex items-center justify-center shadow-lg">
                    <Award className="w-4 h-4 text-yellow-400" />
                  </div>
                </div>

                {/* Text container with truncation to prevent pushing the right side */}
                <div className="ml-2 min-w-0">
                  <h3 className="text-xl font-bold text-white tracking-tight truncate">
                    {teacher.name ?? "-"}
                  </h3>
                  <p className="text-sm text-white/50 font-medium truncate">
                    {teacher.subject ?? "-"}
                  </p>
                  <p className="text-xs text-white/20 font-mono mt-0.5 truncate">
                    {teacher.teacherId ?? "-"}
                  </p>
                </div>
              </div>

              {/* RIGHT SECTION: Fixed size to ensure alignment */}
              <div className="flex flex-col lg:flex-row items-center gap-8 flex-shrink-0">

                {/* SCORE SECTION */}
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 flex-shrink-0 rounded-2xl bg-white/5 border border-yellow-400/30 flex items-center justify-center shadow-inner">
                    <span className="text-xl font-bold text-yellow-400">
                      {score}
                    </span>
                  </div>

                  <div className="w-[180px] sm:w-[200px]">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                      Performance Score
                    </p>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-lime-400 rounded-full shadow-[0_0_8px_rgba(163,230,53,0.5)] transition-all duration-500"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-white/40 mt-1 font-bold">{score}/100</p>
                  </div>
                </div>

                {/* BUTTONS SECTION */}
                <div className="flex gap-3">
                  <button
                    onClick={onOpenAddGood}
                    className={`h-16 px-6 rounded-xl flex items-center gap-2 text-sm font-bold transition-all ${isAddFormOpen && addFormMode === "good"
                      ? "bg-lime-400 text-black shadow-[0_0_15px_rgba(163,230,53,0.4)]"
                      : "bg-white/10 border border-white/20 text-white hover:bg-white/20"
                      }`}
                  >
                    <ThumbsUp size={18} /> Add Good
                  </button>

                  <button
                    onClick={onOpenAddBad}
                    className={`h-16 px-6 rounded-xl flex items-center gap-2 text-sm font-bold transition-all ${isAddFormOpen && addFormMode === "bad"
                      ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                      : "bg-white/10 border border-white/20 text-white hover:bg-white/20"
                      }`}
                  >
                    <ThumbsDown size={18} /> Add Bad
                  </button>

                  <button
                    onClick={onToggleHistory}
                    className="h-16 px-6 rounded-xl bg-white/10 border border-white/20 text-white flex items-center gap-2 font-bold hover:bg-white/20 transition-all"
                  >
                    View All
                    {isHistoryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* ================= ADD FORM (SCREENSHOT MATCH) ================= */}
            {isAddFormOpen && (
              <div className="mt-6 rounded-2xl bg-white/5 backdrop-blur-lg p-9">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                  {/* LEFT */}
                  <div className="space-y-4">
                    <h4
                      className={`text-sm font-semibold flex items-center gap-2 ${addFormMode === "good"
                        ? "text-lime-400"
                        : "text-red-400"
                        }`}
                    >
                      {addFormMode === "good" ? (
                        <>
                          <ThumbsUp size={16} /> ADD POSITIVE RECORD
                        </>
                      ) : (
                        <>
                          <ThumbsDown size={16} /> ADD NEGATIVE RECORD
                        </>
                      )}
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {categories.map((c) => {
                        const enumValue = CATEGORY_MAP[c];
                        const isSelected = category === enumValue;
                        const isGood = addFormMode === "good";

                        return (
                          <button
                            key={c}
                            onClick={() => {
                              onCategoryChange(enumValue);
                              onCustomCategoryChange(""); // 🔥 clear custom text
                            }}

                            className={`px-3 py-1.5 rounded-full text-xs border transition
            ${isSelected
                                ? isGood
                                  ? "bg-lime-400 text-black border-lime-400"
                                  : "bg-red-500 text-white border-red-500"
                                : isGood
                                  ? "border-white/20 text-white/70 hover:bg-lime-400 hover:text-black"
                                  : "border-white/20 text-white/70 hover:bg-red-400 hover:text-white"
                              }
          `}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>

                  </div>

                  {/* RIGHT */}
                  <div className="lg:col-span-2 space-y-5">
  {/* CATEGORY SECTION */}
  <div className="space-y-1.5">
    <label className="text-[11px] text-white/40 font-medium ml-1">Category</label>
    <input
      value={customCategory || CATEGORY_LABEL_FROM_ENUM(category)}
      onChange={(e) => {
        onCustomCategoryChange(e.target.value);
        onCategoryChange("");
      }}
      placeholder="Type or select a category..."
      className="w-full h-11 rounded-2xl bg-black/20 px-4 text-sm text-white 
                 border border-white/20 focus:outline-none focus:ring-1 
                 focus:ring-white/30 transition"
    />
  </div>

  {/* DETAILS SECTION */}
  <div className="space-y-1.5">
    <label className="text-[11px] text-white/40 font-medium ml-1">Details</label>
    <textarea
      value={description}
      onChange={(e) => onDescriptionChange(e.target.value)}
      placeholder="Add a short description (optional)"
      className="w-full h-11 rounded-2xl bg-black/20 px-4 py-3 text-sm text-white 
                 border border-white/20 focus:outline-none focus:ring-1 
                 focus:ring-white/30 transition resize-none"
    />
  </div>

  {/* SCORE IMPACT SECTION */}
  <div className="space-y-3 pt-1">
    <div className="flex justify-between items-center">
      <label className="text-[11px] text-white/40 font-medium ml-1">
        Score Impact
      </label>
      <span className={`text-base font-bold ${addFormMode === "good" ? "text-lime-400" : "text-red-500"}`}>
        {addFormMode === "good" ? "+" : "-"}{Math.abs(scoreImpact)}
      </span>
    </div>

    {/* THE SLIDER */}
    {/* THE SLIDER */}
<div className="relative flex items-center h-2">
  <input
    type="range"
    min={0}
    max={50}
    step={5}
    disabled={isScoreMaxed}
    value={Math.abs(scoreImpact)}
    onChange={(e) =>
      onScoreImpactChange(
        addFormMode === "good"
          ? Number(e.target.value)
          : -Number(e.target.value)
      )
    }
    style={{
      background: `linear-gradient(to right, ${
        addFormMode === "good" ? "#a3e635" : "#ef4444"
      } 0%, ${
        addFormMode === "good" ? "#a3e635" : "#ef4444"
      } ${(Math.abs(scoreImpact) / 50) * 100}%, rgba(255, 255, 255, 0.1) ${
        (Math.abs(scoreImpact) / 50) * 100
      }%, rgba(255, 255, 255, 0.1) 100%)`,
    }}
    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-white"
  />
</div>
  </div>

  {/* SAVE BUTTON */}
  <div className="flex justify-end pt-2">
    <button
      type="button"
      disabled={saving || !isFormReady}
      onClick={onSaveRecord}
      className={`h-12 px-8 rounded-2xl flex items-center gap-2 font-bold transition-all
        ${isFormReady
          ? "bg-[#A3E635] text-black shadow-[0_8px_20px_rgba(163,230,53,0.3)] hover:scale-[1.02] active:scale-[0.98]"
          : "bg-white/10 text-white/30"
        }
        disabled:cursor-not-allowed`}
    >
      <Save size={18} strokeWidth={2.5} />
      <span>Save Record</span>
    </button>
  </div>
</div>
                </div>
              </div>
            )}

            {isHistoryOpen && <PerformanceHistory records={records} />}
          </div>
        </div>
      </div>
    </div>
  );
}

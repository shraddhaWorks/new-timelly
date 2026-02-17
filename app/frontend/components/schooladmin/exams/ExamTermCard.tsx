"use client";


import { BookOpen, Calendar, LucideSquarePen } from "lucide-react";
import type { ExamTermListItem } from "@/hooks/useExamTerms";
import {
  EXAM_ACCENT,
  EXAM_UPCOMING_LABEL_BG,
  EXAM_COMPLETED_LABEL_BG,
  EXAM_TEXT_MAIN,
  EXAM_TEXT_SECONDARY,
} from "@/app/frontend/constants/colors";
import GlassCard from "./GlassCard";

interface ExamTermCardProps {
  term: ExamTermListItem;
  isSelected: boolean;
  onClick: () => void;
}

export default function ExamTermCard({ term, isSelected, onClick }: ExamTermCardProps) {
  const isUpcoming = term.status === "UPCOMING";
  const classLabel = term.class?.name
    ? [term.class.name, term.class.section].filter(Boolean).join(" ")
    : "—";

  return (
    <div
      className={`p-4 sm:p-5 cursor-pointer transition-all border-l-4 min-h-[44px] touch-manipulation relative p-5 rounded-2xl border transition-all cursor-pointer group overflow-hidden bg-white/10 border-lime-400/50 shadow-xl ${
        isSelected ? "ring-1" : "border-l-transparent hover:bg-white/5"
      }`}
      style={
        isSelected
          ? {
              borderLeftColor: EXAM_ACCENT,
              boxShadow: `0 0 0 1px ${EXAM_ACCENT}40`,
            }
          : undefined
      }
      onClick={onClick}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-lime-400 shadow-[0_0_10px_#84cc16]"></div>
      <div
        className="flex justify-between items-start mb-2"
        
      >
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-lime-400/20 text-lime-400">{isUpcoming ? "UPCOMING" : "COMPLETED"}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
          <LucideSquarePen className="lucide lucide-square-pen w-3.5 h-3.5"/>
          </button>
        </div>
      </div>
      <h3 className="font-semibold font-bold text-lg mb-1 text-white" style={{ color: EXAM_TEXT_MAIN }}>
        {term.name}
        <p className="text-xs text-gray-500 line-clamp-2 mb-4">Final term examinations for the academic year 2025-26.</p>
        {term.description && (
        <p className="text-sm mt-1 line-clamp-2" >
          {term.description}
        </p>
      )}
      </h3>
     
      <div
        className="flex items-center gap-4 mt-3 text-sm flex items-center gap-4 text-xs text-gray-400 border-t border-white/5 pt-3"
        style={{ color: EXAM_TEXT_SECONDARY }}
      >
        <span className="flex items-center gap-1">
          <BookOpen size={14} />
          {term._count?.syllabus ?? 0} Subjects
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={14} />
          {classLabel}
        </span>
      </div>
    </div>
  );
}
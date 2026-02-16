"use client";

import { BookOpen, Calendar } from "lucide-react";

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
    <GlassCard
      variant="default"
      className={`p-4 sm:p-5 cursor-pointer transition-all border-l-4 min-h-[44px] touch-manipulation active:bg-white/5 ${
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
      <div
        className="inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 text-black"
        style={{
          backgroundColor: isUpcoming ? EXAM_UPCOMING_LABEL_BG : EXAM_COMPLETED_LABEL_BG,
        }}
      >
        {isUpcoming ? "UPCOMING" : "COMPLETED"}
      </div>
      <h3 className="font-semibold" style={{ color: EXAM_TEXT_MAIN }}>
        {term.name}
      </h3>
      {term.description && (
        <p className="text-sm mt-1 line-clamp-2" style={{ color: EXAM_TEXT_SECONDARY }}>
          {term.description}
        </p>
      )}
      <div
        className="flex items-center gap-4 mt-3 text-sm"
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
    </GlassCard>
  );
}
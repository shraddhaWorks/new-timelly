"use client";

import { Search, GraduationCap } from "lucide-react";

interface TeacherAuditHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: () => void;
  placeholder?: string;
}

export default function TeacherAuditHeader({
  searchValue,
  onSearchChange,
  onSearchSubmit,
  placeholder = "Search teacher...",
}: TeacherAuditHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-600/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
            Teacher Audit & Appraisal
          </h1>
          <p className="text-sm text-white/60 mt-0.5">
            Track performance, acknowledge achievements, and identify areas for
            improvement.
          </p>
        </div>
      </div>
      <div className="w-full sm:w-64 flex-shrink-0">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4 sm:w-5 sm:h-5"
            aria-hidden
          />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearchSubmit?.()}
            placeholder={placeholder}
            className="w-full rounded-xl pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 text-white text-sm placeholder:text-white/50 border border-white/10 bg-white/5 backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition"
            aria-label="Search teacher"
          />
        </div>
      </div>
    </div>
  );
}

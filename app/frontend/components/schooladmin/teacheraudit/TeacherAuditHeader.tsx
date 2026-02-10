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
            className="w-full rounded-xl pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 text-white text-sm placeholder:text-white/50 border-lime-400 bg-white/5 backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-lime-400 focus:border-white/20 transition"
            aria-label="Search teacher"
          />
        </div>
      </div>
    </div>
  );
}

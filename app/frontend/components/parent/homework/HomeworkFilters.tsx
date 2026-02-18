'use client';

import {
  SlidersHorizontal,
  BookOpen,
  List,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface HomeworkFiltersProps {
  subject: string;
  status: string;
  onSubjectChange: (subject: string) => void;
  onStatusChange: (status: string) => void;
  filteredCount: number;
  availableSubjects: string[];
}

export default function HomeworkFilters({
  subject,
  status,
  onSubjectChange,
  onStatusChange,
  filteredCount,
  availableSubjects,
}: HomeworkFiltersProps) {
  return (
    <section className="min-w-0 w-full max-w-full rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-5 lg:p-6 xl:p-8 backdrop-blur-xl border border-white/10">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5 sm:mb-6 md:mb-8 lg:mb-10">
        <div className="flex gap-3 sm:gap-4 items-start min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-lime-400/20 flex items-center justify-center shrink-0">
            <SlidersHorizontal className="text-lime-300" size={22} />
          </div>

          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-semibold leading-tight">
              Filter Homework
            </h3>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              Find assignments quickly
            </p>
          </div>
        </div>

        <span className="px-3 py-1.5 sm:px-4 rounded-full bg-lime-400/20 border border-lime-400/40 text-lime-300 text-xs sm:text-sm font-medium whitespace-nowrap self-start sm:self-auto">
          {filteredCount} Results
        </span>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-12 gap-4 sm:gap-5 md:gap-6 lg:gap-8 items-start min-w-0">
        
        {/* Subject */}
        <div className="col-span-12 lg:col-span-4 space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 text-lime-300 font-medium text-sm sm:text-base">
            <BookOpen size={18} />
            Select Subject
          </div>

          <select
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="w-full min-w-0 max-w-full h-12 sm:h-14 md:min-h-[44px] lg:h-[64px] rounded-xl sm:rounded-2xl px-4 sm:px-5 bg-white/5 border border-white/15 outline-none backdrop-blur text-white text-base sm:text-base"
          >
            <option value="All">All Subjects</option>
            {availableSubjects.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="col-span-12 lg:col-span-8 space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 text-lime-300 font-medium text-sm sm:text-base">
            <SlidersHorizontal size={18} />
            Filter by Status
          </div>

          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {[
              { label: 'All', icon: List },
              { label: 'Pending', icon: Clock },
              { label: 'Submitted', icon: CheckCircle },
              { label: 'Late', icon: AlertCircle },
            ].map(({ label, icon: Icon }) => (
              <li
                key={label}
                onClick={() => onStatusChange(label)}
                className={`cursor-pointer min-h-[44px] h-12 sm:h-14 md:min-h-[44px] lg:h-[64px] rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all touch-manipulation
                  ${
                    status === label
                      ? 'bg-lime-400/20 border border-lime-400 text-lime-300'
                      : 'bg-white/5 border border-white/15 text-white/60 hover:bg-white/10'
                  }`}
              >
                <Icon size={18} />
                <span className="text-xs sm:text-sm font-medium">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
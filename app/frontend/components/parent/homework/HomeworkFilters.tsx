'use client';

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
    <section className="somu rounded-2xl p-7 space-y-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold">Filter Homework</h3>
          <p className="text-sm text-white/70">
            Find assignments quickly
          </p>
        </div>

        <span className="rounded-full border border-lime-400/30 px-4 py-1 text-sm text-lime-300">
          {filteredCount} Results
        </span>
      </div>

      <select
        value={subject}
        onChange={(e) => onSubjectChange(e.target.value)}
        className="w-72 rounded-xl px-4 py-3 bg-transparent border border-white/20 outline-none"
      >
        <option>All Subjects</option>
        {availableSubjects.map((subj) => (
          <option key={subj} value={subj}>
            {subj}
          </option>
        ))}
      </select>

      <div className="flex gap-3 flex-wrap">
        {['All', 'Pending', 'Submitted', 'Late'].map((tab) => (
          <button
            key={tab}
            onClick={() => onStatusChange(tab)}
            className={`px-6 py-3 rounded-xl border transition ${
              status === tab
                ? 'border-lime-400 text-lime-300'
                : 'border-white/20 hover:border-white/40'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </section>
  );
}

'use client';

type ParentHomeworkFilterProps = {
  subject: string;
  setSubject: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  resultCount: number;
  subjects?: string[];
};

export default function ParentHomeworkFilter({
  subject,
  setSubject,
  status,
  setStatus,
  resultCount,
  subjects = ['All Subjects', 'Mathematics', 'Science', 'English'],
}: ParentHomeworkFilterProps) {
  return (
    <section className="somu rounded-2xl p-7 space-y-6 text-white transition-all duration-200 hover:border-white/20 hover:shadow-lg">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold">Filter Homework</h3>
          <p className="text-sm text-white/70">
            Find assignments quickly
          </p>
        </div>

        <span className="rounded-full border border-lime-400/30 px-4 py-1 text-sm text-lime-300">
          {resultCount} Results
        </span>
      </div>

      <select
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-72 rounded-xl px-4 py-3 bg-transparent border border-white/20 outline-none focus:border-lime-400/50 text-white"
      >
        {subjects.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>

      <div className="flex gap-3 flex-wrap">
        {['All', 'Pending', 'Submitted', 'Late'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setStatus(tab)}
            className={`px-6 py-3 rounded-xl border transition ${
              status === tab
                ? 'border-lime-400 text-lime-300'
                : 'border-white/20 hover:border-white/40 text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </section>
  );
}

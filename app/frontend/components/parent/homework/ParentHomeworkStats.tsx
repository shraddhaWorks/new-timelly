'use client';

import { ListChecks, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

type ParentHomeworkStatsProps = {
  total: number;
  pending: number;
  submitted: number;
  completion: number;
};

export default function ParentHomeworkStats({
  total,
  pending,
  submitted,
  completion,
}: ParentHomeworkStatsProps) {
  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <div className="somu rounded-2xl p-6 text-white transition-all duration-200 hover:border-white/20 hover:shadow-lg">
        <ListChecks className="h-6 w-6 text-lime-400" />
        <div className="mt-4 text-[28px] font-bold">{total}</div>
        <p className="mt-1 text-sm text-white/70">All assignments</p>
      </div>

      <div className="somu rounded-2xl p-6 text-white transition-all duration-200 hover:border-white/20 hover:shadow-lg">
        <Clock className="h-6 w-6 text-orange-400" />
        <div className="mt-4 text-[28px] font-bold">{pending}</div>
        <p className="mt-1 text-sm text-white/70">Need attention</p>
      </div>

      <div className="somu rounded-2xl p-6 text-white transition-all duration-200 hover:border-white/20 hover:shadow-lg">
        <CheckCircle2 className="h-6 w-6 text-lime-400" />
        <div className="mt-4 text-[28px] font-bold">{submitted}</div>
        <p className="mt-1 text-sm text-white/70">On time</p>
      </div>

      <div className="somu rounded-2xl p-6 text-white transition-all duration-200 hover:border-white/20 hover:shadow-lg">
        <TrendingUp className="h-6 w-6 text-yellow-300" />
        <div className="mt-4 text-[28px] font-bold">{completion}%</div>
        <p className="mt-1 text-sm text-white/70">Overall progress</p>
      </div>
    </section>
  );
}

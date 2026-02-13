"use client";

import { BookOpen, CheckCircle2, IndianRupee, Trophy } from "lucide-react";
import type { ReactNode } from "react";
import StatCard from "../../common/statCard";
import { formatAmount } from "../../../utils/format";

type Props = {
  attendancePct: number;
  presentDays: number;
  totalAttendanceDays: number;
  homeworkSubmitted: number;
  homeworkTotal: number;
  averageMarksPct: number;
  gradeLabel: string;
  feePendingAmount: number;
};

type StatCardItem = {
  key: string;
  title: string;
  value: string;
  subtitle: string;
  badge: string;
  badgeClass: string;
  icon: ReactNode;
};

export default function ParentHomeStats({
  attendancePct,
  presentDays,
  totalAttendanceDays,
  homeworkSubmitted,
  homeworkTotal,
  averageMarksPct,
  gradeLabel,
  feePendingAmount,
}: Props) {
  const items: StatCardItem[] = [
    {
      key: "attendance",
      title: "Attendance",
      value: `${attendancePct.toFixed(1)}%`,
      subtitle: `${presentDays}/${totalAttendanceDays} days present`,
      badge: attendancePct >= 90 ? "Excellent" : "Needs Focus",
      badgeClass:
        attendancePct >= 90
          ? "px-2.5 py-1 text-xs font-semibold rounded-lg border bg-[#A3E635]/10 text-[#A3E635] border-[#A3E635]/20"
          : "bg-orange-400/10 text-orange-300 border border-orange-400/20 px-2.5 py-1 text-xs font-semibold rounded-lg",
      icon: <CheckCircle2 className="w-5 h-5 text-[#A3E635]" />,
    },
    {
      key: "homework",
      title: "Homework",
      value: `${homeworkSubmitted}/${homeworkTotal}`,
      subtitle: "Tasks completed",
      badge: `${Math.max(homeworkTotal - homeworkSubmitted, 0)} Pending`,
      badgeClass: "px-2.5 py-1 text-xs font-semibold rounded-lg border bg-[#A3E635]/10 text-[#A3E635] border-[#A3E635]/20",
      icon: <BookOpen className="w-5 h-5 text-[#A3E635]" />,
    },
    {
      key: "marks",
      title: "Overall Marks",
      value: gradeLabel,
      subtitle: `${averageMarksPct.toFixed(1)}% Average`,
      badge: "Top 3",
      badgeClass: "px-2.5 py-1 text-xs font-semibold rounded-lg border bg-[#A3E635]/10 text-[#A3E635] border-[#A3E635]/20",
      icon: <Trophy className="w-5 h-5 text-[#A3E635]" />,
    },
    {
      key: "fees",
      title: "Fee Status",
      value: formatAmount(feePendingAmount, feePendingAmount >= 100000),
      subtitle: "Pending amount",
      badge: feePendingAmount > 0 ? "Due Soon" : "Cleared",
      badgeClass:
        feePendingAmount > 0
          ? "bg-red-500/10 text-red-300 border border-red-500/20 px-2.5 py-1 text-xs font-semibold rounded-lg"
          : "px-2.5 py-1 text-xs font-semibold rounded-lg border bg-[#A3E635]/10 text-[#A3E635] border-[#A3E635]/20",
      icon: <IndianRupee className="w-5 h-5 text-red-300" />,
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <StatCard key={item.key} className="bg-white/5">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 rounded-xl transition-transform duration-300 hover:scale-110 bg-[#A3E635]/10">{item.icon}</div>
            <span className={`px-2 py-1 text-xs font-bold rounded-full ${item.badgeClass}`}>
              {item.badge}
            </span>
          </div>
          <div className="mt-5">
            <h3 className="text-sm font-medium text-gray-400 mb-1">{item.title}</h3>
            <p className="text-3xl font-bold text-white mb-2 tracking-tight">{item.value}</p>
            <p className="text-xs text-[rgb(204,213,238)] font-medium">{item.subtitle}</p>
          </div>
        </StatCard>
      ))}
    </section>
  );
}

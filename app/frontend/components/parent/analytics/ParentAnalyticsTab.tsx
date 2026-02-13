"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  BookOpen,
  Trophy,
  Target,
} from "lucide-react";
import AnalyticsHeader from "./AnalyticsHeader";
import StatCard from "./StatCard";
import PerformanceOverview from "./PerformanceOverview";
import AttendanceAnalysis from "./AttendanceAnalysis";
import ProfileCard from "./ProfileCard";
import BestQualities from "./BestQualities";
import HomeworkTasks from "./HomeworkTasks";
import RecentUpdates from "./RecentUpdates";
import UpcomingWorkshops from "./UpcomingWorkshops";

interface AnalyticsData {
  student: {
    name: string;
    rollNo: string;
    class: string;
    photoUrl?: string | null;
  };
  stats: {
    attendance: {
      percent: number;
      present: number;
      total: number;
      absent: number;
      late: number;
      change: string;
    };
    homework: {
      total: number;
      submitted: number;
      completion: number;
    };
    grade: {
      letter: string;
      score: number;
      rank: number | null;
    };
    fee: {
      pending: number;
      total: number;
      dueDate: string | null;
    };
  };
  performance: {
    data: Array<{ m: string; v: number; info: string }>;
    average: number;
  };
  attendanceAnalysis: {
    percent: number;
    present: number;
    absent: number;
    late: number;
    change: string;
  };
  homeworkTasks: Array<{ subject: string; title: string; time: string }>;
  recentUpdates: Array<{ title: string; date: string }>;
  workshops: Array<{ title: string; date: string }>;
}

export default function ParentAnalyticsTab() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await fetch("/api/analytics/student", {
          credentials: "include",
        });
        if (!active) return;

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Failed to load analytics");
        }

        const analyticsData = await res.json();
        setData(analyticsData);
        setError(null);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load analytics");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/60">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Failed to load analytics"}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
    return `₹${amount}`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "TBD";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="p-6 space-y-6 text-white">
      {/* Header */}
      <AnalyticsHeader />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main */}
        <div className="lg:col-span-3 space-y-6">
          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <StatCard
              icon={<CheckCircle2 />}
              label="Attendance"
              value={`${data.stats.attendance.percent}%`}
              sub={`${data.stats.attendance.present}/${data.stats.attendance.total} days present`}
              tag={data.stats.attendance.change}
            />
            <StatCard
              icon={<BookOpen />}
              label="Homework"
              value={`${data.stats.homework.total} Tasks`}
              sub={`${data.stats.homework.completion}% completion`}
              tag={data.stats.homework.total > 0 ? "Due Soon" : "No Tasks"}
            />
            <StatCard
              icon={<Trophy />}
              label="Overall Grade"
              value={data.stats.grade.letter}
              sub={`Score: ${data.stats.grade.score}%`}
              tag={data.stats.grade.rank ? `Rank #${data.stats.grade.rank}` : "N/A"}
            />
            <StatCard
              icon={<Target />}
              label="Fee Pending"
              value={formatCurrency(data.stats.fee.pending)}
              sub={`Total: ${formatCurrency(data.stats.fee.total)}`}
              tag={data.stats.fee.dueDate ? `Due ${formatDate(data.stats.fee.dueDate)}` : "N/A"}
            />
          </div>

          {/* Performance Overview */}
          <PerformanceOverview data={data.performance.data} average={data.performance.average} />

          {/* Attendance Analysis */}
          <AttendanceAnalysis
            percent={data.attendanceAnalysis.percent}
            present={data.attendanceAnalysis.present}
            absent={data.attendanceAnalysis.absent}
            late={data.attendanceAnalysis.late}
            change={data.attendanceAnalysis.change}
          />

          {/* Homework and Recent Updates */}
          <div className="grid md:grid-cols-2 gap-6">
            <HomeworkTasks tasks={data.homeworkTasks} />
            <RecentUpdates updates={data.recentUpdates} />
          </div>

          {/* Upcoming Workshops */}
          <UpcomingWorkshops workshops={data.workshops} />
        </div>

        {/* Right Profile */}
        <div className="space-y-6">
          <ProfileCard
            name={data.student.name}
            rollNo={data.student.rollNo}
            class={data.student.class}
            photoUrl={data.student.photoUrl ?? null}
            grade={data.stats.grade.letter}
            score={data.stats.grade.score}
            rank={data.stats.grade.rank}
          />
          <BestQualities />
        </div>
      </div>
    </div>
  );
}

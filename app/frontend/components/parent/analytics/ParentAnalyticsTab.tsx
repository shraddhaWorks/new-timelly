"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { BookOpen, Trophy, Target, CheckCircle2 } from "lucide-react";
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
    photoUrl: string | null;
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
  const { data: session } = useSession();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!session?.user) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analytics/student", {
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch analytics");
      }

      const analyticsData = await res.json();
      setData(analyticsData);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchAnalytics();
    }
  }, [session, fetchAnalytics]);

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden text-white">
        <div className="absolute inset-0" />
        <div className="absolute right-0 top-0 w-[600px] h-[600px] somu rounded-full blur-[180px]" />
        <div className="absolute left-0 bottom-0 w-[600px] h-[600px] rounded-full blur-[180px]" />
        <div className="relative z-10 p-6 max-w-7xl mx-auto flex items-center justify-center min-h-screen">
          <div className="text-white/60">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden text-white">
        <div className="absolute inset-0" />
        <div className="absolute right-0 top-0 w-[600px] h-[600px] somu rounded-full blur-[180px]" />
        <div className="absolute left-0 bottom-0 w-[600px] h-[600px] rounded-full blur-[180px]" />
        <div className="relative z-10 p-6 max-w-7xl mx-auto flex items-center justify-center min-h-screen">
          <div className="text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen relative overflow-hidden text-white">
        <div className="absolute inset-0" />
        <div className="absolute right-0 top-0 w-[600px] h-[600px] somu rounded-full blur-[180px]" />
        <div className="absolute left-0 bottom-0 w-[600px] h-[600px] rounded-full blur-[180px]" />
        <div className="relative z-10 p-6 max-w-7xl mx-auto flex items-center justify-center min-h-screen">
          <div className="text-white/60">No data available</div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-white">
      {/* Background Gradients */}
      <div className="absolute inset-0" />
      <div className="absolute right-0 top-0 w-[600px] h-[600px] somu rounded-full blur-[180px]" />
      <div className="absolute left-0 bottom-0 w-[600px] h-[600px] rounded-full blur-[180px]" />

      <div className="relative z-10 p-6 max-w-7xl mx-auto space-y-6">
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
                value={`${data.stats.attendance.percent.toFixed(1)}%`}
                sub={`${data.stats.attendance.present}/${data.stats.attendance.total} days present`}
                tag={data.stats.attendance.change}
              />
              <StatCard
                icon={<BookOpen />}
                label="Homework"
                value={`${data.stats.homework.total} Tasks`}
                sub={`${data.stats.homework.completion}% completion`}
                tag={data.stats.homework.total > 0 ? "Due Soon" : "All Done"}
              />
              <StatCard
                icon={<Trophy />}
                label="Overall Grade"
                value={data.stats.grade.letter}
                sub={`Score: ${data.stats.grade.score.toFixed(1)}%`}
                tag={data.stats.grade.rank ? `Rank #${data.stats.grade.rank}` : "—"}
              />
              <StatCard
                icon={<Target />}
                label="Fee Pending"
                value={formatCurrency(data.stats.fee.pending)}
                sub={`Total: ${formatCurrency(data.stats.fee.total)}`}
                tag={data.stats.fee.dueDate ? `Due ${formatDate(data.stats.fee.dueDate)}` : "—"}
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
              class={data.student.class}
              rollNo={data.student.rollNo}
              photoUrl={data.student.photoUrl}
              grade={data.stats.grade.letter}
              score={data.stats.grade.score}
              rank={data.stats.grade.rank}
            />
            <BestQualities />
          </div>
        </div>
      </div>
    </div>
  );
}

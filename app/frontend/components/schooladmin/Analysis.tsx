"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,

} from "recharts";
import {
  IndianRupee,
  Users,
  Star,
  Award,
  ChevronDown,
  CalendarCheck,
  TrendingUp,
  BookOpen
} from "lucide-react";

/* ---------------- Types ---------------- */

/** Actual API returns different shape; we normalize to this for the UI. */
type DashboardResponse = {
  availableYears: number[];
  selectedYear: number;
  stats: {
    feesCollected: number;
    totalEnrollment: number;
    avgTeacherRating: number;
    avgExamScore: number;
  };
  charts: {
    monthlyFeesCollection: { month: string; amount: number }[];
    enrollmentGrowth: { year: number; count: number }[];
    attendance: { students: number; teachers: number };
    subjectPerformance: { subject: string; percentage: number }[];
  };
  topTeachers: { id: string; name: string; subject: string; rating: number }[];
}

/** Raw shape from GET /api/school/dashboard */
type SchoolDashboardApi = {
  message?: string;
  stats?: {
    totalStudents?: number;
    totalClasses?: number;
    totalTeachers?: number;
    feesCollected?: string;
    feesCollectedRaw?: number;
    feesCollectedPct?: number;
    totalStudentsChange?: number;
  };
  attendance?: { present?: number; total?: number; overallRate?: number };
  teachersOnLeave?: Array<{ id: string; name: string; subject?: string }>;
};

function normalizeDashboardResponse(raw: SchoolDashboardApi, year: number): DashboardResponse {
  const stats = raw.stats ?? {};
  const totalStudents = stats.totalStudents ?? 0;
  const feesRaw = stats.feesCollectedRaw ?? 0;
  const attendance = raw.attendance ?? {};
  const present = attendance.present ?? 0;
  const total = attendance.total ?? 1;

  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear, currentYear - 1, currentYear - 2];

  return {
    availableYears,
    selectedYear: year,
    stats: {
      feesCollected: feesRaw,
      totalEnrollment: totalStudents,
      avgTeacherRating: 0,
      avgExamScore: total > 0 ? Math.round((present / total) * 100) : 0,
    },
    charts: {
      monthlyFeesCollection: [],
      enrollmentGrowth: [{ year: currentYear, count: totalStudents }],
      attendance: {
        students: total > 0 ? Math.round((present / total) * 100) : 0,
        teachers: 0,
      },
      subjectPerformance: [],
    },
    topTeachers: (raw.teachersOnLeave ?? []).slice(0, 6).map((t, i) => ({
      id: t.id ?? String(i),
      name: t.name ?? "Teacher",
      subject: t.subject ?? "-",
      rating: 0,
    })),
  };
}

import Spinner from "../common/Spinner";
import PageHeader from "../common/PageHeader";
/* ---------------- Component ---------------- */

export default function AnalysisDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/school/dashboard", { credentials: "include" })
      .then((res) => res.json())
      .then((res: SchoolDashboardApi) => {
        if (res.message && !res.stats) {
          setError(res.message ?? "Failed to load");
          setData(null);
          return;
        }
        setData(normalizeDashboardResponse(res, year));
      })
      .catch(() => {
        setError("Failed to load analysis");
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [year]);

  if (loading) {
    return <div className="p-6 text-white"><Spinner /></div>;
  }
  if (error || !data) {
    return (
      <div className="p-6 text-white">
        <p className="text-red-400">{error ?? "No data available"}</p>
      </div>
    );
  }

  /* ---------------- UI-ready Data ---------------- */

  const stats = [
    {
      title: "Fees Collected",
      value: `₹${(data.stats.feesCollected / 100000).toFixed(1)}L`,
      change: "+12% vs last month",
      icon: IndianRupee,
      iconColor: "text-lime-400",
      iconBorder: "border-lime-400/30",
      iconBg: "bg-lime-400/10",
      changeColor: "text-lime-400",
    },
    {
      title: "Total Enrollment",
      value: data.stats.totalEnrollment.toLocaleString(),
      change: "+150 new admissions",
      icon: Users,
      iconColor: "text-sky-400",
      iconBorder: "border-sky-400/30",
      iconBg: "bg-sky-400/10",
      changeColor: "text-sky-400",
    },
    {
      title: "Avg Teacher Rating",
      value: data.stats.avgTeacherRating > 0 ? `${data.stats.avgTeacherRating}/5` : "—",
      change: "Based on student feedback",
      icon: Star,
      iconColor: "text-purple-300",
      iconBorder: "border-purple-300/30",
      iconBg: "bg-purple-300/10",
      changeColor: "text-purple-300",
    },
    {
      title: "Avg Exam Score",
      value: `${data.stats.avgExamScore}%`,
      change: "+2.4% vs last year",
      icon: Award,
      iconColor: "text-yellow-400",
      iconBorder: "border-yellow-400/30",
      iconBg: "bg-yellow-400/10",
      changeColor: "text-yellow-400",
    },
  ];
  const axisStyle = {
    stroke: "rgba(255,255,255,0.45)",
    fontSize: 12,
  };


  const feesData = (data.charts?.monthlyFeesCollection ?? []).map((f) => ({
    month: f.month,
    value: f.amount,
  }));

  const enrollmentData = (data.charts?.enrollmentGrowth ?? []).map((e) => ({
    year: e.year.toString(),
    students: e.count,
  }));

  const attendance = data.charts?.attendance ?? { students: 0, teachers: 0 };
  const attendanceData = [
    { day: "Avg", students: attendance.students, teachers: attendance.teachers },
  ];

  const subjectData = (data.charts?.subjectPerformance ?? []).map((s) => ({
    subject: s.subject,
    score: s.percentage,
  }));

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen p-2 text-white">
      {/* Header */}
      <PageHeader
        title="Analysis & Reports"
        subtitle="Comprehensive insights into school performance"
        className="border"
        transparent={false}
        rightSlot={
          <div className="relative self-center">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="
          appearance-none
          bg-black/40
          text-white
          px-7 py-2 pl-2
          rounded-xl
          text-sm
          border border-white/10
          focus:outline-none
          focus:ring-1 focus:ring-white/20
          cursor-pointer
          text-center
        "
            >
              {(data.availableYears ?? []).map((y) => (
                <option key={y} value={y} className="text-black">
                  {y}-{y + 1}
                </option>
              ))}
            </select>

            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
          </div>
        }
      />




      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="rounded-2xl p-5 bg-white/10 backdrop-blur-md border border-white/10 flex flex-col justify-between"
          >
            {/* Top Row */}
            <div className="flex items-start gap-4">
              {/* Icon Box */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center border ${stat.iconBorder} ${stat.iconBg}`}
              >
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>

              {/* Title + Value */}
              <div className="flex flex-col">
                <p className="text-xs text-white/70 leading-tight">
                  {stat.title}
                </p>
                <h2 className={`text-2xl font-bold ${stat.changeColor}`}>
                  {stat.value}
                </h2>
              </div>
            </div>

            {/* Bottom Text */}
            <p className={`text-xs mt-3 ml-2 ${stat.changeColor}`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>



      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Fees */}
        <div className="rounded-2xl p-5 bg-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-lime-400" />
            <h3 className="font-semibold text-white text-sm">
              Monthly Fees Collection
            </h3>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={feesData}>
              <defs>
                <linearGradient id="fees" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a3e635" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#a3e635" stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis dataKey="month" {...axisStyle} tickLine={false} axisLine={false} />
              <YAxis {...axisStyle} tickLine={false} axisLine={false} />
              <Tooltip />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#a3e635"
                fill="url(#fees)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Enrollment */}
        <div className="rounded-2xl p-5 bg-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-sky-400" />
            <h3 className="font-semibold text-white text-sm">
              Student Enrollment Growth
            </h3>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={enrollmentData} barCategoryGap="35%">
              <XAxis dataKey="year" {...axisStyle} tickLine={false} axisLine={false} />
              <YAxis {...axisStyle} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="students" fill="#60a5fa" barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance */}
        <div className="rounded-2xl p-5 bg-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4">
            <CalendarCheck className="w-5 h-5 text-sky-400" />
            <h3 className="font-semibold text-white text-sm">
              Attendance: Students vs Teachers
            </h3>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={attendanceData}>
              <XAxis dataKey="day" {...axisStyle} tickLine={false} axisLine={false} />
              <YAxis {...axisStyle} tickLine={false} axisLine={false} />
              <Tooltip />

              <Line
                type="monotone"
                dataKey="students"
                stroke="#60a5fa"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="teachers"
                stroke="#a3e635"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subject */}
        <div className="rounded-2xl p-5 bg-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold text-white text-sm">
                Subject Performance
              </h3>
            </div>

            <span className="text-xs text-white/50 border border-white/10 rounded-lg px-2 py-1">
              All Exams
            </span>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={subjectData} layout="vertical">
              <XAxis
                type="number"
                {...axisStyle}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey="subject"
                type="category"
                {...axisStyle}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip />
              <Bar dataKey="score" fill="#facc15" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>


      {/* Top Performing Teachers */}
      <div className="mt-6 rounded-2xl p-6 bg-white/10 backdrop-blur-md border border-white/10">
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-300" />
            <h3 className="font-semibold text-white">
              Top Performing Teachers
            </h3>
          </div>
          <p className="text-sm text-white/50 mt-1">
            Based on student feedback and academic results
          </p>
        </div>

        <div className="border-t border-white/10 mb-5" />

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(data.topTeachers ?? []).map((t) => (
            <div
              key={t.id}
              className="rounded-xl p-6 bg-white/5 border border-white/10 flex items-center justify-between"
            >
              {/* Left */}
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full uppercase bg-purple-400/20 flex items-center justify-center text-purple-300 ">
                  {t.name.charAt(0)}
                </div>

                {/* Name + Subject */}
                <div>
                  <p className="text-l font-semibold text-white">
                    {t.name}
                  </p>
                  <p className="text-xs text-white/30">
                    {t.subject}
                  </p>
                </div>
              </div>

              {/* Right */}
              <div className="text-right">
                <p className="text-lime-400 font-bold text-l ">
                  {t.rating}
                </p>
                <p className="text-[10px] text-white/40">
                  Rating
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
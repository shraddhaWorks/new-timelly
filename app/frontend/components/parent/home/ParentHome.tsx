"use client";

import { useEffect, useState } from "react";
import { Sun } from "lucide-react";
import { useSession } from "next-auth/react";
import PageHeader from "../../common/PageHeader";
import ParentHomeStats from "./ParentHomeStats";
import ParentHomeCircularsSection from "./ParentHomeCircularsSection";
import ParentHomeUpdatesSection from "./ParentHomeUpdatesSection";
import { buildDailyStatus } from "../attendance/attendanceUtils";
import { ParentCircular, ParentEvent, ParentFeed, ParentHomeData } from "./types";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function mapAverageToGrade(avg: number) {
  if (avg >= 90) return "A+";
  if (avg >= 80) return "A";
  if (avg >= 70) return "B+";
  if (avg >= 60) return "B";
  return "C";
}

function initialState(): ParentHomeData {
  return {
    studentName: "Student",
    attendancePct: 0,
    presentDays: 0,
    totalAttendanceDays: 0,
    homeworkSubmitted: 0,
    homeworkTotal: 0,
    averageMarksPct: 0,
    gradeLabel: "C",
    feePendingAmount: 0,
    circulars: [],
    events: [],
    feeds: [],
  };
}

export default function ParentHomeTab() {
  const { data: session } = useSession();
  const studentId = session?.user?.studentId ?? null;

  const [data, setData] = useState<ParentHomeData>(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [studentRes, attendanceRes, homeworkRes, marksRes, feesRes, circularRes, eventsRes, feedsRes] =
          await Promise.allSettled([
            studentId ? fetch(`/api/student/${studentId}`, { credentials: "include" }) : Promise.resolve(null),
            fetch("/api/attendance/view", { credentials: "include" }),
            fetch("/api/homework/list", { credentials: "include" }),
            fetch("/api/marks/view", { credentials: "include" }),
            fetch("/api/fees/mine", { credentials: "include" }),
            fetch("/api/circular/list?status=PUBLISHED", { credentials: "include" }),
            fetch("/api/events/list", { credentials: "include" }),
            fetch("/api/newsfeed/list", { credentials: "include" }),
          ]);

        if (!active) return;

        const next = initialState();

        if (studentRes.status === "fulfilled" && studentRes.value?.ok) {
          const studentData = await studentRes.value.json();
          next.studentName = studentData?.student?.name || "Student";
        }

        if (attendanceRes.status === "fulfilled" && attendanceRes.value.ok) {
          const payload = await attendanceRes.value.json();
          const dayStatus = buildDailyStatus(payload?.attendances ?? []);
          const statuses = Object.values(dayStatus);
          const presentDays = statuses.filter((s) => s === "PRESENT" || s === "LATE").length;
          const totalDays = statuses.filter((s) => s !== "HOLIDAY").length;
          next.presentDays = presentDays;
          next.totalAttendanceDays = totalDays;
          next.attendancePct = totalDays ? (presentDays / totalDays) * 100 : 0;
        }

        if (homeworkRes.status === "fulfilled" && homeworkRes.value.ok) {
          const payload = await homeworkRes.value.json();
          const homeworks = payload?.homeworks ?? [];
          next.homeworkTotal = homeworks.length;
          next.homeworkSubmitted = homeworks.filter((h: { hasSubmitted?: boolean }) => h.hasSubmitted).length;
        }

        if (marksRes.status === "fulfilled" && marksRes.value.ok) {
          const payload = await marksRes.value.json();
          const marks = payload?.marks ?? [];
          const percentages = marks
            .map((m: { marks?: number; totalMarks?: number }) => {
              if (typeof m.marks !== "number" || typeof m.totalMarks !== "number" || m.totalMarks <= 0) {
                return 0;
              }
              return (m.marks / m.totalMarks) * 100;
            })
            .filter((v: number) => Number.isFinite(v));
          const avg = percentages.length
            ? percentages.reduce((a: number, b: number) => a + b, 0) / percentages.length
            : 0;
          next.averageMarksPct = avg;
          next.gradeLabel = mapAverageToGrade(avg);
        }

        if (feesRes.status === "fulfilled" && feesRes.value.ok) {
          const payload = await feesRes.value.json();
          next.feePendingAmount = payload?.fee?.remainingFee ?? 0;
        }

        if (circularRes.status === "fulfilled" && circularRes.value.ok) {
          const payload = await circularRes.value.json();
          next.circulars = (payload?.circulars ?? []) as ParentCircular[];
        }

        if (eventsRes.status === "fulfilled" && eventsRes.value.ok) {
          const payload = await eventsRes.value.json();
          next.events = (payload?.events ?? []) as ParentEvent[];
        }

        if (feedsRes.status === "fulfilled" && feedsRes.value.ok) {
          const payload = await feedsRes.value.json();
          next.feeds = (payload?.newsFeeds ?? []) as ParentFeed[];
        }

        setData(next);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load parent home dashboard");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [studentId]);

  const heroSubtitle = "Welcome back, here's what's happening with";

  if (loading) {
    return <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-white/70">Loading home dashboard...</div>;
  }

  if (error) {
    return <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-8 text-red-100">{error}</div>;
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-6">
      <PageHeader title="Home" subtitle="Welcome to Timelly Parent Dashboard" />

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-10">
        <h2 className="text-4xl md:text-6xl font-bold text-white flex items-center gap-3">
          {getGreeting()}! <Sun className="h-8 w-8 md:h-12 md:w-12 text-yellow-300" />
        </h2>
        <p className="text-xl md:text-4xl text-white/70 mt-3">
          {heroSubtitle} <span className="text-lime-300 font-semibold">{data.studentName}</span>
        </p>
      </section>

      <ParentHomeStats
        attendancePct={data.attendancePct}
        presentDays={data.presentDays}
        totalAttendanceDays={data.totalAttendanceDays}
        homeworkSubmitted={data.homeworkSubmitted}
        homeworkTotal={data.homeworkTotal}
        averageMarksPct={data.averageMarksPct}
        gradeLabel={data.gradeLabel}
        feePendingAmount={data.feePendingAmount}
      />

      <ParentHomeCircularsSection circulars={data.circulars} />
      <ParentHomeUpdatesSection feeds={data.feeds} events={data.events} />
    </div>
  );
}

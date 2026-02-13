"use client";

import React from "react";
import {
  TrendingUp,
  BookOpen,
  Trophy,
  Target,
  CheckCircle2,
  Clock,
} from "lucide-react";

/* ===== GLASS STYLE ===== */
const glass =
  "bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.4)]";

/* =================== MAIN PAGE =================== */

export default function ParentAnalyticsTab() {
  return (
    <div className="min-h-screen relative overflow-hidden text-white">

      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2a1458] via-[#12051f] to-black" />
      <div className="absolute right-0 top-0 w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-[180px]" />
      <div className="absolute left-0 bottom-0 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[180px]" />

      <div className="relative z-10 p-6 max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <header className={`${glass} rounded-3xl p-8`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/10 p-2 rounded-lg">
              <TrendingUp />
            </div>
            <h1 className="text-3xl font-bold">Analytics</h1>
          </div>
          <p className="text-white/60">
            Welcome to Timelly Parent Dashboard
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Main */}
          <div className="lg:col-span-3 space-y-6">

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <StatCard icon={<CheckCircle2 />} label="Attendance" value="95.8%" sub="23/24 days present" tag="+2.3%" />
              <StatCard icon={<BookOpen />} label="Homework" value="3 Tasks" sub="85% completion" tag="Due Soon" />
              <StatCard icon={<Trophy />} label="Overall Grade" value="A+" sub="Score: 88.4%" tag="Rank #3" />
              <StatCard icon={<Target />} label="Fee Pending" value="₹12.5k" sub="Total: ₹50,000" tag="Due Jan 31" />
            </div>

            {/* Performance Overview */}
            <PerformanceOverview />

            {/* Attendance Analysis */}
            <AttendanceAnalysis />

            {/* Homework and Recent Updates */}
            <div className="grid md:grid-cols-2 gap-6">
              <HomeworkTasks />
              <RecentUpdates />
            </div>

            {/* Upcoming Workshops */}
            <UpcomingWorkshops />
          </div>

          {/* Right Profile */}
          <div className="space-y-6">
            <ProfileCard />
            <BestQualities />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= STATS ================= */
function StatCard({ icon, label, value, sub, tag }: any) {
  return (
    <div className={`${glass} rounded-2xl p-5`}>
      <div className="flex justify-between mb-3">
        <div className="bg-white/10 p-2 rounded-lg">{icon}</div>
        <span className="text-xs text-lime-400 bg-lime-400/10 px-2 py-1 rounded">
          {tag}
        </span>
      </div>
      <div className="text-white/60 text-xs">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-white/40">{sub}</div>
    </div>
  );
}

/* ================= PERFORMANCE ================= */
function PerformanceOverview() {
  const data = [
    { m: "Aug", v: 82, info: "Good start of academic year" },
    { m: "Sep", v: 85, info: "Improved performance" },
    { m: "Oct", v: 88, info: "Excellent consistency" },
    { m: "Nov", v: 86, info: "Slight drop due to exams" },
    { m: "Dec", v: 90, info: "Top score in science" },
    { m: "Jan", v: 88, info: "Stable overall performance" },
  ];

  const [hovered, setHovered] = React.useState<number | null>(null);

  return (
    <div className={`${glass} rounded-3xl p-6 relative`}>
      <div className="flex justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Performance Overview</h3>
          <p className="text-white/50 text-sm">
            Last 6 months academic trend
          </p>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-xl">
          <div className="text-xl font-bold">88.4%</div>
          <div className="text-[10px] text-white/40">Average</div>
        </div>
      </div>

      <div className="flex items-end justify-between h-56 relative">
        {data.map((d, idx) => (
          <div
            key={d.m}
            className="flex flex-col items-center relative group cursor-pointer"
            onMouseEnter={() => setHovered(idx)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Extra Info Box */}
            {hovered === idx && (
              <div className="absolute -top-24 w-40 bg-white/95 text-black p-3 rounded-lg shadow-lg z-20">
                <div className="font-semibold text-sm">{d.m}</div>
                <div className="text-xs mt-1">Avg Score: {d.v}%</div>
                <div className="text-[10px] mt-1 text-gray-600">{d.info}</div>
              </div>
            )}

            {/* Bar */}
            <div
              className="w-10 bg-gradient-to-t from-lime-400 to-green-300 rounded-t-xl transition-all duration-300 hover:scale-110"
              style={{ height: `${d.v * 2}px` }}
            />

            {/* Month Label */}
            <span className="text-xs mt-2 text-white/60">{d.m}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


/* ================= ATTENDANCE ================= */
function AttendanceAnalysis() {
  const stats = [
    { label: "Present Days", value: "23", percent: "95.8%", icon: <CheckCircle2 size={16} className="text-green-400" /> },
    { label: "Absent Days", value: "1", percent: "4.2%", icon: <Clock size={16} className="text-red-400" />, isNegative: true },
    { label: "Late Arrivals", value: "0", percent: "0%", icon: <Clock size={16} className="text-orange-400" /> },
  ];

  return (
    <div className={`${glass} rounded-3xl p-6`}>
      <h3 className="text-lg font-semibold mb-1">Attendance Analysis</h3>
      <p className="text-white/50 text-sm mb-8">Monthly attendance breakdown</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

        {/* Circular Progress */}
        <div className="flex justify-center relative">
          <div 
            className="relative w-48 h-48 rounded-full flex items-center justify-center"
            style={{
              background: `conic-gradient(#a3e635 0% 95.8%, rgba(255,255,255,0.1) 95.8% 100%)`,
              maskImage: 'radial-gradient(transparent 55%, black 56%)',
              WebkitMaskImage: 'radial-gradient(transparent 55%, black 56%)',
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">95.8%</span>
            <span className="text-xs text-white/60">Present</span>
            <span className="text-[10px] text-lime-400 mt-1">↗ +2.3%</span>
          </div>
        </div>

        {/* Breakdown List */}
        <div className="space-y-3">
          {stats.map((item, idx) => (
            <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/5 p-2 rounded-lg">{item.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">{item.value}</span>
                    <span className="text-xs text-white/40">{item.label}</span>
                  </div>
                </div>
              </div>
              <span className={`text-lg font-bold ${item.isNegative ? 'text-red-400' : 'text-white'}`}>
                {item.percent}
              </span>
            </div>
          ))}

          {/* Bottom Trend */}
          <div className="bg-lime-400/10 border border-lime-400/20 rounded-2xl p-2 text-center">
            <span className="text-lime-400 text-xs font-semibold">↗ +2.3% from last month</span>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ================= PROFILE CARD ================= */
function ProfileCard() {
  return (
    <div className={`${glass} rounded-3xl overflow-hidden`}>
      <div className="p-5 bg-yellow-400/10">
        <span className="text-xs text-yellow-400">★ Star Student</span>
        <h2 className="text-xl font-bold mt-1">Aarav Kumar</h2>
        <p className="text-white/50 text-sm">Class 10 • Roll 15</p>
      </div>
      <img
        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav"
        className="w-full h-48 object-cover bg-black/40"
      />
      <div className="p-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-white/60">Overall Performance</span>
          <Trophy className="text-yellow-400" size={16} />
        </div>
        <div className="text-green-400 text-2xl font-bold">A+ 88.4%</div>
        <div className="w-full h-2 bg-white/10 rounded mt-2">
          <div className="h-full w-[88%] bg-lime-400 rounded" />
        </div>
        <p className="text-xs text-white/40 mt-2">Rank #3</p>
      </div>
    </div>
  );
}

/* ================= QUALITIES ================= */
function BestQualities() {
  const q = [
    { l: "Leadership", v: "92%" },
    { l: "Creativity", v: "88%" },
    { l: "Discipline", v: "95%" },
    { l: "Teamwork", v: "90%" },
  ];

  return (
    <div className={`${glass} rounded-3xl p-5`}>
      <h3 className="font-semibold mb-4">Best Qualities</h3>
      <div className="grid grid-cols-2 gap-3">
        {q.map((x) => (
          <div key={x.l} className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-lime-400">{x.v}</div>
            <div className="text-xs text-white/50">{x.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= LISTS ================= */
function HomeworkTasks() {
  const tasks = [
    { s: "Maths", t: "Exercise 5.2", d: "2 hrs" },
    { s: "Science", t: "Chapter Review", d: "Tomorrow" },
    { s: "English", t: "Essay Writing", d: "2 days" },
  ];
  return (
    <GlassList title="Homework Tasks">
      {tasks.map((t, i) => (
        <Row key={i} title={t.s} sub={t.t} right={t.d} />
      ))}
    </GlassList>
  );
}

function RecentUpdates() {
  const u = [
    { t: "Sports Day", d: "Feb 15" },
    { t: "PT Meeting", d: "Feb 20" },
    { t: "Results Out", d: "Feb 25" },
  ];
  return (
    <GlassList title="Recent Updates">
      {u.map((x, i) => (
        <Row key={i} title={x.t} right={x.d} />
      ))}
    </GlassList>
  );
}

function UpcomingWorkshops() {
  return (
    <div className={`${glass} rounded-3xl px-20 py-10`}>
      <h3 className="font-semibold mb-4">Upcoming Workshops</h3>
      <div className="grid md:grid-cols-2 gap-10">
        {["Science Fair", "Creative Writing"].map((w) => (
          <div key={w} className="bg-white/10 rounded-xl px-10 py-8 text-center">
            <h4 className="text-lime-400 font-semibold">{w}</h4>
            <p className="text-xs text-white/40">Feb 2026</p>
            <button className="mt-3 px-3 py-1 bg-lime-400 text-black rounded">
              Register
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */
function GlassList({ title, children }: any) {
  return (
    <div className={`${glass} rounded-3xl p-5 space-y-3`}>
      <h3 className="font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function Row({ title, sub, right }: any) {
  return (
    <div className="flex justify-between bg-white/10 rounded-xl p-3">
      <div>
        <div className="text-sm font-semibold">{title}</div>
        {sub && <div className="text-xs text-white/40">{sub}</div>}
      </div>
      <span className="text-xs text-white/50">{right}</span>
    </div>
  );
}
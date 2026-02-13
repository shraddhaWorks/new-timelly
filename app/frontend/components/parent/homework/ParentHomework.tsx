'use client';

import {
  ListChecks,
  Clock,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

/* =======================
   PAGE
======================= */
export default function Page() {
  return (
    <main className="min-h-screen p-8 space-y-8 bg-gradient-to-br from-[#2a0b52] via-[#3a0f4f] to-[#4a1b2d] text-white">
      <Header />
      <StatsGrid />
      <FilterSection />
    </main>
  );
}

/* =======================
   HEADER
======================= */
function Header() {
  return (
    <section className="
      rounded-2xl p-7
      bg-gradient-to-br from-purple-700/70 to-rose-700/60
      backdrop-blur-xl border border-white/15
      shadow-xl
    ">
      <h1 className="text-2xl font-semibold">
        Homework & Assignments
      </h1>
      <p className="mt-1 text-sm text-white/70">
        Track and submit Aarav Kumar&apos;s homework
      </p>
    </section>
  );
}

/* =======================
   STATS GRID
======================= */
function StatsGrid() {
  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={ListChecks}
        iconColor="text-lime-400"
        badge="This Month"
        badgeBg="bg-lime-400/20 text-lime-300"
        value="5"
        label="All assignments"
      />

      <StatCard
        icon={Clock}
        iconColor="text-orange-400"
        badge="Due Soon"
        badgeBg="bg-orange-400/20 text-orange-300"
        value="2"
        label="Need attention"
      />

      <StatCard
        icon={CheckCircle2}
        iconColor="text-lime-400"
        badge="Great!"
        badgeBg="bg-lime-400/20 text-lime-300"
        value="2"
        label="On time"
      />

      <StatCard
        icon={TrendingUp}
        iconColor="text-yellow-300"
        badge="+12%"
        badgeBg="bg-yellow-300/20 text-yellow-200"
        value="60%"
        label="Overall progress"
      />
    </section>
  );
}

/* =======================
   STAT CARD
======================= */
function StatCard({
  icon: Icon,
  iconColor,
  badge,
  badgeBg,
  value,
  label,
}: {
  icon: any;
  iconColor: string;
  badge: string;
  badgeBg: string;
  value: string;
  label: string;
}) {
  return (
    <div
      className="
        rounded-2xl p-6
        bg-gradient-to-br from-white/15 to-white/5
        backdrop-blur-xl border border-white/15
        transition-all duration-300
        hover:-translate-y-1.5 hover:shadow-2xl
      "
    >
      <div className="flex items-center justify-between">
        <Icon className={`h-7 w-7 ${iconColor}`} />
        <span className={`rounded-full px-3 py-1 text-xs ${badgeBg}`}>
          {badge}
        </span>
      </div>

      <div className="mt-4 text-4xl font-bold">
        {value}
      </div>

      <p className="mt-1 text-sm text-white/70">
        {label}
      </p>
    </div>
  );
}

/* =======================
   FILTER SECTION
======================= */
function FilterSection() {
  return (
    <section className="
      rounded-2xl p-7 space-y-6
      bg-gradient-to-br from-white/15 to-white/5
      backdrop-blur-xl border border-white/15
      shadow-xl
    ">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Filter Homework
          </h3>
          <p className="text-sm text-white/70">
            Find assignments quickly
          </p>
        </div>

        <span className="rounded-full bg-lime-400/20 px-4 py-1 text-sm text-lime-300">
          1 Result
        </span>
      </div>

      <select
        className="
          w-72 rounded-xl px-4 py-3 text-sm
          bg-white/15 backdrop-blur-md
          border border-white/20
          outline-none
        "
      >
        <option>All Subjects</option>
        <option>Math</option>
        <option>Science</option>
      </select>

      <StatusTabs />
    </section>
  );
}

/* =======================
   STATUS TABS
======================= */
function StatusTabs() {
  const tabs = ['All', 'Pending', 'Submitted', 'Late'];

  return (
    <div className="flex flex-wrap gap-3">
      {tabs.map((tab) => {
        const isLate = tab === 'Late';

        return (
          <button
            key={tab}
            className={`
              rounded-xl px-6 py-3 text-sm
              transition-all
              ${
                isLate
                  ? 'bg-lime-400/30 text-lime-200 border border-lime-400/40'
                  : 'bg-white/15 hover:bg-white/25 border border-white/15'
              }
            `}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}

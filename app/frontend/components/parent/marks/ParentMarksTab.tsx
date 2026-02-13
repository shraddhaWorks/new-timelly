'use client';

import { div } from "framer-motion/client";
import {
  TrendingUp,
  Trophy,
  Award,
  Target,
  BookOpen,
  BarChart3,
  Star,
  Calculator,
  Microscope,
  Book,

  Globe,
  Laptop,
} from "lucide-react";
import ProgressReport from "./ProgressReport";
import SubjectPerformance from "./SubjetPerformance";

export default function ParentMarksTab() {
  return (
    <div className="p-6 lg:p-10 min-h-screen text-white">

      {/* HEADER */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Academic Performance
        </h1>
        <p className="text-white/60">
          Track Aarav Kumar's marks and grades
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {/* Overall Score */}
        <div className="relative rounded-2xl border border-white/10 p-6 backdrop-blur-xl hover:border-lime-400/30 transition">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-white/5 rounded-xl">
              <TrendingUp className="w-5 h-5 text-lime-400" />
            </div>
            <span className="px-3 py-1 text-xs rounded-lg bg-lime-400/10 text-lime-400 border border-lime-400/20 font-semibold">
              Excellent
            </span>
          </div>
          <div className="mt-6">
            <p className="text-sm text-white/60 mb-1">Overall Score</p>
            <h2 className="text-3xl font-bold">88.4%</h2>
            <p className="text-sm text-white/50 mt-1">
              Above class average
            </p>
          </div>
        </div>

        {/* Class Rank */}
        <div className="relative rounded-2xl border border-white/10 p-6 backdrop-blur-xl hover:border-lime-400/30 transition">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-white/5 rounded-xl">
              <Trophy className="w-5 h-5 text-lime-400" />
            </div>
            <span className="px-3 py-1 text-xs rounded-lg bg-white/5 text-gray-400 border border-white/10 font-semibold">
              Top 3
            </span>
          </div>
          <div className="mt-6">
            <p className="text-sm text-white/60 mb-1">Class Rank</p>
            <h2 className="text-3xl font-bold text-lime-400">#3</h2>
            <p className="text-sm text-white/50 mt-1">
              Out of 40 students
            </p>
          </div>
        </div>

        {/* Current Grade */}
        <div className="relative rounded-2xl border border-white/10  p-6 backdrop-blur-xl hover:border-lime-400/30 transition">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-white/5 rounded-xl">
              <Award className="w-5 h-5 text-lime-400" />
            </div>
            <span className="px-3 py-1 text-xs rounded-lg bg-lime-400/10 text-lime-400 border border-lime-400/20 font-semibold">
              Pass
            </span>
          </div>
          <div className="mt-6">
            <p className="text-sm text-white/60 mb-1">Current Grade</p>
            <h2 className="text-3xl font-bold">A+</h2>
            <p className="text-sm text-white/50 mt-1">
              Highest grade achieved
            </p>
          </div>
        </div>

        {/* Total Marks */}
        <div className="relative rounded-2xl border border-white/10  p-6 backdrop-blur-xl hover:border-lime-400/30 transition">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-white/5 rounded-xl">
              <Target className="w-5 h-5 text-lime-400" />
            </div>
            <span className="px-3 py-1 text-xs rounded-lg bg-white/5 text-gray-400 border border-white/10 font-semibold">
              Progress
            </span>
          </div>
          <div className="mt-6">
            <p className="text-sm text-white/60 mb-1">Total Marks</p>
            <h2 className="text-3xl font-bold">531/600</h2>
            <p className="text-sm text-white/50 mt-1">
              Score obtained
            </p>
          </div>
        </div>

      </div>
      <div>
<ProgressReport />
      </div>
      <div>
        <SubjectPerformance/>
      </div>
    </div>
  );







}
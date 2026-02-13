


"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Calculator, Target, TrendingUp, Trophy } from "lucide-react";
import StatCard from "../../common/statCard";
import StudentPerformanceCard from "./StudentPerformanceCard";

type Subject = {
  name: string;
  score: number;
  total: number;
  grade: string;
  icon?: React.ReactNode;
};

const subjects: Subject[] = [
  {
    name: "Mathematics",
    score: 92,
    total: 100,
    grade: "A+",
    icon: <Calculator className="w-5 h-5" />,
  },
  {
    name: "Science",
    score: 88,
    total: 100,
    grade: "A",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    name: "English",
    score: 95,
    total: 100,
    grade: "A+",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    name: "Telugu",
    score: 95,
    total: 100,
    grade: "A+",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    name: "Hindi",
    score: 95,
    total: 100,
    grade: "A+",
    icon: <BookOpen className="w-5 h-5" />,
  },
];

const ProgressReport = () => {
  const [animatedScores, setAnimatedScores] = useState<number[]>(
    subjects.map(() => 0)
  );

  const { totalMarks, totalMax, percentage } = useMemo(() => {
    const totalMarks = subjects.reduce((acc, s) => acc + s.score, 0);
    const totalMax = subjects.reduce((acc, s) => acc + s.total, 0);
    const percentage = Math.round((totalMarks / totalMax) * 100);

    return { totalMarks, totalMax, percentage };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScores(subjects.map((s) => (s.score / s.total) * 100));
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto">
      <div className="mt-6 sm:mt-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg overflow-hidden animate-fade-in">
        
        {/* ================= HEADER ================= */}
        <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 border-b border-white/10 bg-white/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                Progress Report
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm">
                Academic Performance Overview
              </p>
            </div>

            <span className="px-3 py-1 text-xs rounded-lg bg-lime-400/10 text-lime-400 border border-lime-400/20 font-semibold">
              Term 1 - 2026
            </span>
          </div>
        </div>

        {/* ================= MAIN GRID ================= */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 xl:gap-8 p-4 sm:p-6 lg:p-8">

          {/* ================= LEFT SECTION ================= */}
          <div className="xl:col-span-2 space-y-6">

            {/* ================= STUDENT CARD ================= */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 sm:p-5 bg-white/[0.03] rounded-2xl border border-white/[0.05]">
              
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/[0.1]">
                <img
                  src="https://case-wafer-93800037.figma.site/_assets/v11/9e19b2c4823e22402f2eadefd9095b1af00df867.png"
                  alt="Student"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Aarav Kumar
                </h3>
                <p className="text-sm text-gray-400">
                  Grade 10 • Section A
                </p>
                <p className="text-sm text-[rgb(204,213,238)] mt-1">
                  Class Teacher: Mrs. Sharma
                </p>
              </div>

              <div className="text-center sm:text-right mt-3 sm:mt-0">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#A3E635]">
                  {percentage}%
                </div>
                <div className="text-xs text-[rgb(204,213,238)] mt-1">
                  Overall Percentage
                </div>
              </div>
            </div>

            {/* ================= STAT CARDS ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <StatCard
                variant="gradientCentered"
                title="Marks Obtained"
                value={`${totalMarks}`}
                subtitle={`out of ${totalMax}`}
                icon={<Target className="w-5 h-5 text-lime-400" />}
              />

              <StatCard
                variant="gradientCentered"
                title="Percentage"
                value={`${percentage}%`}
                subtitle="Above Average"
                icon={<TrendingUp className="w-5 h-5 text-lime-400" />}
              />

              <StatCard
                variant="gradientCentered"
                title="Class Rank"
                value="#3"
                subtitle="Top 10%"
                icon={<Trophy className="w-5 h-5 text-gray-200" />}
              />
            </div>

            {/* ================= SUBJECT PERFORMANCE ================= */}
            <div>
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#A3E635]" />
                Subject Performance
              </h4>

              <div className="space-y-3 sm:space-y-4">
                {subjects.map((subject, index) => {
                  const percent = Math.round(
                    (subject.score / subject.total) * 100
                  );

                  return (
                    <div
                      key={subject.name}
                      className="bg-white/[0.03] rounded-xl p-3 sm:p-4 border border-white/[0.05] hover:bg-white/[0.05] transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#A3E635]/10 rounded-xl text-[#A3E635] group-hover:scale-110 transition-transform">
                          {subject.icon}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold text-gray-200 text-sm sm:text-base">
                              {subject.name}
                            </h5>

                            <div className="flex items-center gap-3">
                              <span className="text-xs sm:text-sm text-[rgb(204,213,238)]">
                                {subject.score}/{subject.total}
                              </span>

                              <span className="px-3 py-1 bg-[#A3E635]/10 text-[#A3E635] text-xs font-bold rounded-full border border-[#A3E635]/20">
                                {subject.grade}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-white/[0.1] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#A3E635] rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${animatedScores[index]}%` }}
                              />
                            </div>

                            <span className="text-xs text-gray-500 w-12 text-right">
                              {percent}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ================= RIGHT SECTION ================= */}
          <div className="xl:col-span-1">
            <StudentPerformanceCard
              name="Arav Kumar"
              grade="Class 10"
              imageUrl="/students/arav.png"
              score={80}
              classAverage={72}
              attendance={92}
              stats={[
                { title: "Rank", value: "5", icon: Trophy },
                { title: "Subjects", value: "6", icon: BookOpen },
              ]}
              gradingScale={[
                { label: "E - Excellent", range: "90-100", color: "text-[#A3E635]" },
                { label: "G - Good", range: "75-89", color: "text-blue-400" },
                { label: "A - Average", range: "50-74", color: "text-yellow-400" },
              ]}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProgressReport;

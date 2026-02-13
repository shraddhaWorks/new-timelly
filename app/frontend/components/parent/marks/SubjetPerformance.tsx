"use client";

import {
  Calculator,
  Microscope,
  BookOpen,
  Languages,
  Globe,
  Laptop,
  TrendingUp,
} from "lucide-react";

type Subject = {
  name: string;
  marks: number;
  total: number;
  classAvg: number;
  grade: string;
  icon: React.ReactNode;
};

const subjects: Subject[] = [
  {
    name: "Mathematics",
    marks: 92,
    total: 100,
    classAvg: 78,
    grade: "A+",
    icon: <Calculator className="w-5 h-5" />,
  },
  {
    name: "Science",
    marks: 88,
    total: 100,
    classAvg: 75,
    grade: "A+",
    icon: <Microscope className="w-5 h-5" />,
  },
  {
    name: "English",
    marks: 85,
    total: 100,
    classAvg: 80,
    grade: "A",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    name: "Hindi",
    marks: 90,
    total: 100,
    classAvg: 82,
    grade: "A+",
    icon: <Languages className="w-5 h-5" />,
  },
  {
    name: "Social Studies",
    marks: 82,
    total: 100,
    classAvg: 76,
    grade: "A",
    icon: <Globe className="w-5 h-5" />,
  },
  {
    name: "Computer Science",
    marks: 94,
    total: 100,
    classAvg: 79,
    grade: "A+",
    icon: <Laptop className="w-5 h-5" />,
  },
];

const SubjectPerformance = () => {
  return (
    <div className="mt-8 max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">

      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          Subject-wise Performance
        </h2>
        <p className="text-gray-400 mt-1 text-sm sm:text-base">
          Detailed analysis of each subject
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">

        {subjects.map((subject) => {
          const percentage = subject.marks;
          const improvement = subject.marks - subject.classAvg;

          return (
            <div
              key={subject.name}
              className="
                relative
                p-6
                rounded-2xl
                bg-gradient-to-br
               
                border border-white/10
                backdrop-blur-xl
                shadow-lg
                hover:shadow-xl
                transition-all duration-300
              "
            >
              {/* TOP ROW */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-lime-400/10 text-lime-400 flex items-center justify-center">
                    {subject.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {subject.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Marks: {subject.marks}/{subject.total}
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 text-xs font-bold rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/20">
                  {subject.grade}
                </span>
              </div>

              {/* PROGRESS */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Your Score</span>
                  <span className="text-lime-400 font-semibold">
                    {percentage}%
                  </span>
                </div>

                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-lime-400 rounded-full transition-all duration-700"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* CLASS AVG */}
              <div className="flex items-center justify-between text-sm mt-4">
                <span className="text-gray-400">
                  Class Avg:{" "}
                  <span className="text-white font-medium">
                    {subject.classAvg}%
                  </span>
                </span>

                <span className="flex items-center gap-1 px-3 py-1 bg-lime-400/10 text-lime-400 rounded-full text-xs font-semibold border border-lime-400/20">
                  <TrendingUp className="w-3 h-3" />
                  +{improvement}
                </span>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
};

export default SubjectPerformance;

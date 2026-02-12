"use client";

import { useEffect, useState } from "react";
import { BookOpen, Calendar, CheckCircle2 } from "lucide-react";
import PageHeader from "../../common/PageHeader";

interface ExamSchedule {
  id: string;
  subject: string;
  examDate: string;
  startTime: string;
  durationMin: number;
}

interface TermData {
  id: string;
  name: string;
  status: "COMPLETED" | "UPCOMING";
  class: { name: string; section: string };
  schedules: ExamSchedule[];
}

const MOCK_SYLLABUS = [
  { name: "Quadratic Equations", status: "Done", progress: 100 },
  { name: "Arithmetic Progressions", status: "Done", progress: 100 },
  { name: "Circles", status: "Done", progress: 100 },
  { name: "Surface Areas and Volumes", status: "60%", progress: 60 },
  { name: "Statistics", status: "20%", progress: 20 },
];

export default function ParentExamsTab() {
  const [terms, setTerms] = useState<TermData[]>([]);
  const [activeTerm, setActiveTerm] = useState<TermData | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch("/api/exams/terms");
        const result = await res.json();
        const fetchedTerms: TermData[] = result.terms || [];
        console.log("Fetched Terms:", fetchedTerms);
        setTerms(fetchedTerms);

        // Find current term based on API status
        const current = fetchedTerms.find((t) => t.status === "UPCOMING") || fetchedTerms[0] || null;
        setActiveTerm(current);
      } catch (e) {
        console.error("Fetch failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!activeTerm) return <div className="p-8 text-white">No exam data found.</div>;

  const schedules = activeTerm.schedules || [];
  const nextExam = schedules[0];
  const nextExamDate = nextExam ? new Date(nextExam.examDate) : null;

  // Calculate days left from current date
  const daysLeft = nextExamDate
    ? Math.max(0, Math.ceil((nextExamDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const uniqueSubjects = Array.from(new Set(schedules.map((s) => s.subject)));

  return (
    <div className="min-h-screen text-white max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span>Exams & Syllabus</span>
            <span className="bg-[#B4F42A] text-black text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase">
              Upcoming
            </span>
          </div>
        }
        subtitle="Final term examinations for the academic year 2025-26."
        rightSlot={
          <div className="flex gap-6 md:gap-10">
            <div className="text-right md:text-center">
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Next Exam</p>
              <p className="text-xl font-bold">
                {nextExamDate ? nextExamDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "--"}
              </p>
            </div>
            <div className="text-right md:text-center">
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Days Left</p>
              <p className="text-xl font-bold text-[#B4F42A]">{daysLeft}</p>
            </div>
          </div>
        }
        className="somu border-none !bg-white/5"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT SIDEBAR */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col gap-3">
            {terms.map((term) => (
              <button
                key={term.id}
                onClick={() => setActiveTerm(term)}
                className={`p-5 rounded-2xl text-left transition-all border ${
                  activeTerm.id === term.id
                    ? "border-[#B4F42A]/50 bg-white/10 ring-1 ring-[#B4F42A]/20"
                    : "border-white/5 bg-white/5 hover:bg-white/10"
                }`}
              >
                <p className="font-bold text-base capitalize">{term.name} Examination</p>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  term.status === 'UPCOMING' ? 'text-[#B4F42A]' : 'text-white/40'
                }`}>
                  {term.status}
                </span>
              </button>
            ))}
          </div>

          {/* SCHEDULE LIST */}
          <div className="somu rounded-3xl p-5 border-none">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-white/80">
              <Calendar size={16} className="text-[#B4F42A]" /> Schedule
            </h3>
            <div className="space-y-3">
              {schedules.map((exam) => (
                <div key={exam.id} className="bg-white/5 p-4 rounded-2xl flex items-center gap-4 border border-white/5">
                  <div className="text-center border-r border-white/10 pr-3">
                    <p className="text-lg font-bold leading-tight">{new Date(exam.examDate).getDate()}</p>
                    <p className="text-[9px] text-white/40 uppercase">{new Date(exam.examDate).toLocaleString('default', { month: 'short' })}</p>
                  </div>
                  <div>
                    <p className="font-bold capitalize text-sm">{exam.subject}</p>
                    <p className="text-[10px] text-white/40">{exam.startTime} AM</p>
                  </div>
                </div>
              ))}
              <button className="w-full text-center text-[#B4F42A] text-xs font-bold pt-1 hover:underline">View all</button>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-9 space-y-6">
          {/* FILTER PILLS */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            <button 
              onClick={() => setSelectedSubject("all")}
              className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedSubject === "all" ? "bg-[#B4F42A] text-black" : "somu border-none"
              }`}
            >
              All Subjects
            </button>
            {uniqueSubjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all capitalize ${
                  selectedSubject === sub ? "bg-[#B4F42A] text-black" : "somu border-none"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* SYLLABUS DETAIL CARDS */}
          {/* If "All Subjects" is selected, we loop through subjects. Otherwise, just show the selected one. */}
          {(selectedSubject === "all" ? uniqueSubjects : [selectedSubject]).map((subName) => (
            <div key={subName} className="somu rounded-3xl p-6 md:p-8 border-none mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-3 rounded-2xl">
                    <BookOpen className="text-[#B4F42A]" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold capitalize">{subName === 'maths' ? 'Mathematics' : subName}</h2>
                    <p className="text-white/40 text-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B4F42A]"></span> Mr. Rajesh Kumar
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-auto">
                  <div className="flex justify-between md:justify-end items-center gap-3 mb-2">
                    <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Completion</span>
                    <span className="text-lg font-bold">60%</span>
                  </div>
                  <div className="w-full md:w-40 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="bg-[#B4F42A] h-full w-[60%] rounded-full" />
                  </div>
                </div>
              </div>

              {/* TOPICS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MOCK_SYLLABUS.map((item, idx) => (
                  <div key={idx} className="bg-white/5 p-4 rounded-2xl flex justify-between items-center border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${item.progress === 100 ? 'bg-[#B4F42A]' : 'bg-blue-400'}`} />
                      <span className="text-sm font-medium text-white/90">{item.name}</span>
                    </div>
                    {item.progress === 100 ? (
                      <div className="flex items-center gap-1.5 bg-[#B4F42A]/10 px-3 py-1 rounded-lg border border-[#B4F42A]/20">
                        <CheckCircle2 size={12} className="text-[#B4F42A]" />
                        <span className="text-[10px] font-bold text-[#B4F42A] uppercase">Done</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-white/30 uppercase">{item.status}</span>
                        <div className="w-10 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="bg-blue-400 h-full" style={{ width: `${item.progress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
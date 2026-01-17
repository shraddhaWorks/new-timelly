"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { FileText, Download, Filter, Award, TrendingUp, GraduationCap, User, Calendar, AlertCircle, BookOpen } from "lucide-react";

interface Mark {
  id: string;
  subject: string;
  marks: number;
  totalMarks: number;
  grade: string | null;
  suggestions: string | null;
  createdAt: string;
  class: { id: string; name: string; section: string | null };
  teacher?: { id: string; name: string | null; email: string | null };
  student?: {
    id: string;
    user: { id: string; name: string | null; email: string | null };
  };
}

export default function ViewMarksPage() {
  const { data: session, status } = useSession();
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState<string>("");

  useEffect(() => {
    if (session) {
      fetchMarks();
    }
  }, [session, subjectFilter]);

  const fetchMarks = async () => {
    setLoading(true);
    try {
      const url = subjectFilter
        ? `/api/marks/view?subject=${subjectFilter}`
        : "/api/marks/view";
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        console.error("Failed to fetch marks:", data.message);
        setMarks([]);
        return;
      }
      if (data.marks) {
        setMarks(data.marks);
      } else {
        setMarks([]);
      }
    } catch (err) {
      console.error("Error fetching marks:", err);
      setMarks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await fetch("/api/marks/download?format=json");
      const data = await res.json();

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `marks-report-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading marks:", err);
      alert("Failed to download marks report");
    }
  };

  const calculatePercentage = (marks: number, totalMarks: number) => {
    return ((marks / totalMarks) * 100).toFixed(2);
  };

  const getGradeColor = (grade: string | null) => {
    if (!grade) return "bg-[#2d2d2d] text-[#808080] border-[#404040]";
    if (grade === "A+") return "bg-green-500/20 text-green-400 border-green-500/30";
    if (grade === "A") return "bg-green-500/20 text-green-400 border-green-500/30";
    if (grade === "B+") return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (grade === "B") return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (grade === "C") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    if (grade === "D") return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  const avgPercentage = marks.length > 0
    ? marks.reduce((sum, m) => sum + parseFloat(calculatePercentage(m.marks, m.totalMarks)), 0) / marks.length
    : 0;

  if (status === "loading") return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#808080] mx-auto mb-4"></div>
        <p className="text-white">Loading session…</p>
      </div>
    </div>
  );
  if (!session) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="p-6 text-red-400">Not authenticated</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2d2d2d] to-[#404040] rounded-xl flex items-center justify-center border border-[#333333] shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              My Marks Report
            </h1>
            <p className="text-[#808080] text-sm md:text-base">View and track your academic performance</p>
          </div>
          {session.user.role === "STUDENT" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 border border-[#333333] hover:border-[#808080] shadow-lg"
            >
              <Download size={18} />
              Download Report
            </motion.button>
          )}
        </motion.div>

        {/* Stats Card */}
        {marks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] border border-[#333333] rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center border border-green-500/30">
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-[#808080] mb-1">Overall Average</p>
                <p className="text-4xl font-bold text-white">{avgPercentage.toFixed(1)}%</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 shadow-lg hover:border-[#404040] transition"
        >
          <label className="block text-sm font-medium text-[#808080] mb-3 flex items-center gap-2">
            <Filter size={18} />
            Filter by Subject
          </label>
          <input
            type="text"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            placeholder="Enter subject name..."
            className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
          />
        </motion.div>

        {loading ? (
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#808080] mx-auto mb-4"></div>
            <p className="text-white">Loading...</p>
          </div>
        ) : marks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-12 text-center"
          >
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-[#808080] opacity-50" />
            <p className="text-[#808080] text-lg">No marks found</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-lg overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#2d2d2d] border-b border-[#333333]">
                  <tr>
                    {session.user.role !== "STUDENT" && (
                      <th className="px-4 py-4 text-left text-sm font-medium text-white">
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          Student
                        </div>
                      </th>
                    )}
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} />
                        Subject
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">Marks</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">Total</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={16} />
                        Percentage
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                        <Award size={16} />
                        Grade
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                        <GraduationCap size={16} />
                        Class
                      </div>
                    </th>
                    {session.user.role !== "STUDENT" && (
                      <th className="px-4 py-4 text-left text-sm font-medium text-white">
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          Teacher
                        </div>
                      </th>
                    )}
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        Date
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333333]">
                  {marks.map((mark, index) => (
                    <motion.tr
                      key={mark.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-[#2d2d2d] transition"
                    >
                      {session.user.role !== "STUDENT" && (
                        <td className="px-4 py-4 text-white font-medium">
                          {mark.student?.user?.name || "N/A"}
                        </td>
                      )}
                      <td className="px-4 py-4 text-white font-medium">{mark.subject}</td>
                      <td className="px-4 py-4 text-[#808080]">{mark.marks}</td>
                      <td className="px-4 py-4 text-[#808080]">{mark.totalMarks}</td>
                      <td className="px-4 py-4">
                        <span className="text-white font-semibold">
                          {calculatePercentage(mark.marks, mark.totalMarks)}%
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getGradeColor(
                            mark.grade
                          )}`}
                        >
                          {mark.grade || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[#808080]">
                        {mark.class.name} {mark.class.section ? `- ${mark.class.section}` : ""}
                      </td>
                      {session.user.role !== "STUDENT" && mark.teacher && (
                        <td className="px-4 py-4 text-[#808080]">{mark.teacher.name}</td>
                      )}
                      <td className="px-4 py-4 text-[#808080]">
                        {new Date(mark.createdAt).toLocaleDateString()}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Show suggestions if any */}
        {marks.some((m) => m.suggestions) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] border border-[#333333] rounded-xl shadow-lg p-6 hover:border-[#404040] transition"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText size={20} />
              Teacher Suggestions
            </h2>
            <div className="space-y-4">
              {marks
                .filter((m) => m.suggestions)
                .map((mark, index) => (
                  <motion.div
                    key={mark.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-l-4 border-green-500/30 pl-4 bg-[#2d2d2d]/50 rounded-r-lg p-4 hover:bg-[#404040]/50 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-white">{mark.subject}</span>
                      <span className="text-sm text-[#808080]">
                        {new Date(mark.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[#808080]">{mark.suggestions}</p>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

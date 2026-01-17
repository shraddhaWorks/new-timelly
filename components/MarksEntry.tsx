"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, User, FileText, Award, Save, AlertCircle } from "lucide-react";

interface Student {
  id: string;
  user: { id: string; name: string | null; email: string | null };
  class: { id: string; name: string; section: string | null } | null;
}

interface Class {
  id: string;
  name: string;
  section: string | null;
}

export default function MarksEntryPage() {
  const { data: session, status } = useSession();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [form, setForm] = useState({
    subject: "",
    marks: "",
    totalMarks: "",
    suggestions: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (session && session.user.role === "TEACHER") {
      fetchClasses();
    }
  }, [session]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/class/list");
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Failed to fetch classes");
        return;
      }
      if (data.classes) {
        setClasses(data.classes);
        if (data.classes.length === 0) {
          setMessage("No classes found. Please create a class first.");
        }
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
      setMessage("Error fetching classes. Please try again.");
    }
  };

  const fetchStudents = async () => {
    if (!selectedClass) return;
    try {
      const res = await fetch(`/api/class/students?classId=${selectedClass}`);
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Failed to fetch students");
        setStudents([]);
        return;
      }
      if (data.students) {
        setStudents(data.students);
        if (data.students.length === 0) {
          setMessage("No students found in this class.");
        } else {
          setMessage("");
        }
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      setMessage("Error fetching students. Please try again.");
      setStudents([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedStudent || !form.subject || !form.marks || !form.totalMarks) {
      setMessage("Please fill all required fields");
      return;
    }

    if (parseFloat(form.marks) < 0 || parseFloat(form.totalMarks) <= 0 || parseFloat(form.marks) > parseFloat(form.totalMarks)) {
      setMessage("Invalid marks: marks must be between 0 and total marks");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/marks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent,
          classId: selectedClass,
          subject: form.subject,
          marks: parseFloat(form.marks),
          totalMarks: parseFloat(form.totalMarks),
          suggestions: form.suggestions || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to add marks");
        return;
      }

      setMessage("Marks added successfully!");
      setForm({ subject: "", marks: "", totalMarks: "", suggestions: "" });
      setSelectedStudent("");
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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
  if (session.user.role !== "TEACHER")
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="p-6 text-red-400">Forbidden: Teachers only</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#2d2d2d] to-[#404040] rounded-xl flex items-center justify-center border border-[#333333] shadow-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            Add Marks
          </h1>
          <p className="text-[#808080] text-sm md:text-base">Enter student marks and grades</p>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border flex items-center gap-3 ${
              message.includes("success")
                ? "bg-[#2d2d2d] text-white border-[#404040]"
                : "bg-red-500/10 text-red-400 border-red-500/30"
            }`}
          >
            <AlertCircle size={20} />
            {message}
          </motion.div>
        )}

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                  <GraduationCap size={16} />
                  Class <span className="text-red-400">*</span>
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedStudent("");
                  }}
                  required
                  className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition"
                >
                  <option value="" className="bg-[#2d2d2d]">Select Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#2d2d2d]">
                      {c.name} {c.section ? `- ${c.section}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                  <User size={16} />
                  Student <span className="text-red-400">*</span>
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  required
                  disabled={!selectedClass}
                  className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" className="bg-[#2d2d2d]">Select Student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#2d2d2d]">
                      {s.user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                  <BookOpen size={16} />
                  Subject <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g., Mathematics"
                  required
                  className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                  <Award size={16} />
                  Marks Obtained <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.marks}
                  onChange={(e) => setForm({ ...form, marks: e.target.value })}
                  placeholder="e.g., 85"
                  required
                  className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                  <FileText size={16} />
                  Total Marks <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.totalMarks}
                  onChange={(e) => setForm({ ...form, totalMarks: e.target.value })}
                  placeholder="e.g., 100"
                  required
                  className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                <FileText size={16} />
                Suggestions/Comments (Optional)
              </label>
              <textarea
                value={form.suggestions}
                onChange={(e) => setForm({ ...form, suggestions: e.target.value })}
                placeholder="Add suggestions or comments for the student..."
                rows={4}
                className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b] resize-none"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white py-3.5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg border border-[#333333] hover:border-[#808080] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Add Marks</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

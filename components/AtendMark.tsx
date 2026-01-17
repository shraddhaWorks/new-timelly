"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Calendar, Clock, User, CheckCircle2, XCircle, AlertCircle, GraduationCap, Save, Users, BookOpen } from "lucide-react";

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

export default function MarkAttendancePage() {
  const { data: session, status } = useSession();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [period, setPeriod] = useState<number>(1);
  const [attendances, setAttendances] = useState<Record<string, string>>({});
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
        // Initialize all as PRESENT
        const initial: Record<string, string> = {};
        data.students.forEach((s: Student) => {
          initial[s.id] = "PRESENT";
        });
        setAttendances(initial);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      setMessage("Error fetching students. Please try again.");
      setStudents([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !date || !period) {
      setMessage("Please select class, date, and period");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const attendanceArray = Object.entries(attendances).map(([studentId, status]) => ({
        studentId,
        status,
      }));

      const res = await fetch("/api/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClass,
          date,
          period,
          attendances: attendanceArray,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to mark attendance");
        return;
      }

      setMessage("Attendance marked successfully!");
      // Reset form
      setAttendances({});
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "ABSENT":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "LATE":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-[#2d2d2d] text-[#808080] border-[#404040]";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PRESENT":
        return <CheckCircle2 size={16} />;
      case "ABSENT":
        return <XCircle size={16} />;
      case "LATE":
        return <Clock size={16} />;
      default:
        return null;
    }
  };

  const presentCount = Object.values(attendances).filter(s => s === "PRESENT").length;
  const absentCount = Object.values(attendances).filter(s => s === "ABSENT").length;
  const lateCount = Object.values(attendances).filter(s => s === "LATE").length;

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
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-[#808080]" />
            Mark Attendance
          </h1>
          <p className="text-[#808080] text-sm md:text-base">Record student attendance for classes</p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg border flex items-center gap-3 ${
              message.includes("success")
                ? "bg-[#2d2d2d] text-white border-[#404040]"
                : "bg-red-500/10 text-red-400 border-red-500/30"
            }`}
          >
            <AlertCircle size={20} />
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selection Form */}
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen size={20} />
              Select Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                  <GraduationCap size={16} />
                  Class <span className="text-red-400">*</span>
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  required
                  className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent"
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
                  <Calendar size={16} />
                  Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                  <Clock size={16} />
                  Period (1-8) <span className="text-red-400">*</span>
                </label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(Number(e.target.value))}
                  required
                  className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                    <option key={p} value={p} className="bg-[#2d2d2d]">
                      Period {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          {students.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-[#808080] text-sm">Present</span>
                </div>
                <p className="text-2xl font-bold text-white">{presentCount}</p>
              </div>
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <span className="text-[#808080] text-sm">Absent</span>
                </div>
                <p className="text-2xl font-bold text-white">{absentCount}</p>
              </div>
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="text-[#808080] text-sm">Late</span>
                </div>
                <p className="text-2xl font-bold text-white">{lateCount}</p>
              </div>
            </div>
          )}

          {/* Students Attendance List */}
          {students.length > 0 && (
            <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users size={20} />
                Students Attendance ({students.length})
              </h2>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 bg-[#2d2d2d] border border-[#404040] rounded-lg hover:border-[#808080] transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center border border-[#333333]">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-white">{student.user.name}</span>
                    </div>
                    <select
                      value={attendances[student.id] || "PRESENT"}
                      onChange={(e) =>
                        setAttendances({ ...attendances, [student.id]: e.target.value })
                      }
                      className={`bg-[#1a1a1a] border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent ${getStatusColor(attendances[student.id] || "PRESENT")}`}
                    >
                      <option value="PRESENT" className="bg-[#1a1a1a]">Present</option>
                      <option value="ABSENT" className="bg-[#1a1a1a]">Absent</option>
                      <option value="LATE" className="bg-[#1a1a1a]">Late</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || students.length === 0}
            className="w-full bg-[#404040] hover:bg-[#6b6b6b] text-white py-3.5 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed border border-[#333333] flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Mark Attendance</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

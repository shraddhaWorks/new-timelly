"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Users, GraduationCap, Plus, Save, Filter, Mail, User, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

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

export default function AssignStudentsPage() {
  const { data: session, status } = useSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [bulkSelections, setBulkSelections] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState("");
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [createClassForm, setCreateClassForm] = useState({
    name: "",
    section: "",
  });

  useEffect(() => {
    if (session) {
      fetchStudents();
      fetchClasses();
    }
  }, [session]);

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/student/list");
      const data = await res.json();
      if (data.students) {
        setStudents(data.students);
        // Reset bulk selections to only unassigned students
        const nextSelection: Record<string, boolean> = {};
        data.students.forEach((s: Student) => {
          if (!s.class) nextSelection[s.id] = false;
        });
        setBulkSelections(nextSelection);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/class/list");
      const data = await res.json();
      if (data.classes) {
        setClasses(data.classes);
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  const handleAssign = async (studentId: string, classId: string | null) => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/student/assign-class", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          classId: classId || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to assign student");
        return;
      }

      setMessage(data.message || "Student assigned successfully");
      setSelectedStudent(null);
      setSelectedClass("");
      fetchStudents();
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAssign = (studentId: string, newClassId: string) => {
    handleAssign(studentId, newClassId || null);
  };

  const toggleBulkSelection = (studentId: string) => {
    setBulkSelections((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleBulkAssign = async () => {
    if (!selectedClass) {
      setMessage("Please select a class for bulk assignment");
      return;
    }
    const studentIds = Object.keys(bulkSelections).filter((id) => bulkSelections[id]);
    if (studentIds.length === 0) {
      setMessage("Select at least one unassigned student");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      await Promise.all(
        studentIds.map((id) =>
          fetch("/api/student/assign-class", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId: id, classId: selectedClass }),
          })
        )
      );
      setMessage("Students assigned successfully");
      setSelectedStudent(null);
      setSelectedClass("");
      fetchStudents();
    } catch (err) {
      console.error(err);
      setMessage("Bulk assignment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createClassForm.name) {
      setMessage("Class name is required");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/class/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createClassForm.name,
          section: createClassForm.section || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Failed to create class");
        return;
      }
      setMessage("Class created successfully");
      setCreateClassForm({ name: "", section: "" });
      setShowCreateClass(false);
      fetchClasses();
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong while creating class");
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
                <Users className="w-6 h-6 text-white" />
              </div>
              Assign Students to Classes
            </h1>
            <p className="text-[#808080] text-sm md:text-base">Manage student-class assignments</p>
          </div>
          <motion.a
            href="/classes"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 border border-[#333333] hover:border-[#808080] shadow-lg"
          >
            <GraduationCap size={18} />
            Manage Classes
            <ArrowRight size={18} />
          </motion.a>
        </motion.div>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border flex items-center gap-3 ${
              message.includes("successfully")
                ? "bg-[#2d2d2d] text-white border-[#404040]"
                : "bg-red-500/10 text-red-400 border-red-500/30"
            }`}
          >
            {message.includes("successfully") ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            {message}
          </motion.div>
        )}

        {/* Bulk Assignment Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
          <div className="relative">
            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
              <Users size={24} />
              Quick Assignment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                  <User size={16} />
                  Select Student
                </label>
                <select
                  value={selectedStudent || ""}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition"
                >
                  <option value="" className="bg-[#2d2d2d]">Choose a student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id} className="bg-[#2d2d2d]">
                      {student.user.name} ({student.user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                  <GraduationCap size={16} />
                  Select Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition"
                >
                  <option value="" className="bg-[#2d2d2d]">Choose a class</option>
                  {classes.map((classItem) => (
                    <option key={classItem.id} value={classItem.id} className="bg-[#2d2d2d]">
                      {classItem.name} {classItem.section ? `- ${classItem.section}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <motion.button
                  onClick={handleBulkAssign}
                  disabled={loading || !selectedClass}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 border border-[#333333] hover:border-[#808080] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Assigning...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Assign Selected Unassigned</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Create Class */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-lg p-6 hover:border-[#404040] transition"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <GraduationCap size={20} />
              Create Class (inline)
            </h2>
            <motion.button
              onClick={() => setShowCreateClass(!showCreateClass)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-[#808080] hover:text-white underline transition"
            >
              {showCreateClass ? "Hide" : "Add Class"}
            </motion.button>
          </div>
          {showCreateClass && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              onSubmit={handleCreateClass}
              className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <input
                className="bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                placeholder="Class name *"
                value={createClassForm.name}
                onChange={(e) => setCreateClassForm({ ...createClassForm, name: e.target.value })}
                required
              />
              <input
                className="bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                placeholder="Section (optional)"
                value={createClassForm.section}
                onChange={(e) =>
                  setCreateClassForm({ ...createClassForm, section: e.target.value })
                }
              />
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 border border-[#333333] hover:border-[#808080] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    <span>Create</span>
                  </>
                )}
              </motion.button>
            </motion.form>
          )}
        </motion.div>

        {/* Students List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-lg overflow-hidden hover:border-[#404040] transition"
        >
          <div className="p-4 md:p-6 bg-[#2d2d2d] border-b border-[#333333]">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users size={24} />
              Students ({students.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#2d2d2d] border-b border-[#333333]">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-medium text-white">Select</th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-white">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      Student Name
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-white">
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      Email
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-white">
                    <div className="flex items-center gap-2">
                      <GraduationCap size={16} />
                      Current Class
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-white">Assign/Change Class</th>
                  <th className="px-4 py-4 text-left text-sm font-medium text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333333]">
                {students.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-[#808080]"
                    >
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No students found. Add students first!</p>
                    </td>
                  </tr>
                ) : (
                  students.map((student, index) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-[#2d2d2d] transition"
                    >
                      <td className="px-4 py-4 text-sm">
                        {!student.class && (
                          <input
                            type="checkbox"
                            checked={!!bulkSelections[student.id]}
                            onChange={() => toggleBulkSelection(student.id)}
                            className="w-4 h-4 bg-[#2d2d2d] border-[#404040] rounded focus:ring-2 focus:ring-[#808080] text-green-500"
                          />
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-white">
                        {student.user.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-[#808080] flex items-center gap-2">
                        <Mail size={14} />
                        {student.user.email}
                      </td>
                      <td className="px-4 py-4 text-sm text-[#808080]">
                        {student.class
                          ? `${student.class.name} ${
                              student.class.section
                                ? `- ${student.class.section}`
                                : ""
                            }`
                          : <span className="text-red-400">Not assigned</span>}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <select
                          value={student.class?.id || ""}
                          onChange={(e) => handleQuickAssign(student.id, e.target.value)}
                          className="bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition"
                        >
                          <option value="" className="bg-[#2d2d2d]">Remove from class</option>
                          {classes.map((classItem) => (
                            <option key={classItem.id} value={classItem.id} className="bg-[#2d2d2d]">
                              {classItem.name}{" "}
                              {classItem.section ? `- ${classItem.section}` : ""}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {student.class && (
                          <motion.button
                            onClick={() => handleAssign(student.id, null)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-red-400 hover:text-red-300 font-medium transition"
                          >
                            Remove
                          </motion.button>
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

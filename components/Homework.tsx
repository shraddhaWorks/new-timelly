"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { BookOpen, Plus, X, Calendar, User, GraduationCap, FileText, Save, AlertCircle, CheckCircle2 } from "lucide-react";

interface Homework {
  id: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string | null;
  createdAt: string;
  class: { id: string; name: string; section: string | null };
  teacher: { id: string; name: string | null; email: string | null };
  _count: { submissions: number };
}

interface Class {
  id: string;
  name: string;
  section: string | null;
}

export default function HomeworkPage() {
  const { data: session, status } = useSession();
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    classId: "",
    dueDate: "",
    assignedDate: "",
    file: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (session) {
      fetchHomeworks();
      fetchClasses();
    }
  }, [session]);

  const fetchHomeworks = async () => {
    try {
      const res = await fetch("/api/homework/list");
      const data = await res.json();
      if (res.ok && data.homeworks) {
        setHomeworks(data.homeworks);
      }
    } catch (err) {
      console.error("Error fetching homeworks:", err);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/class/list");
      const data = await res.json();
      if (res.ok && data.classes) {
        setClasses(data.classes);
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.subject || !form.classId) {
      setMessage("Title, description, subject, and class are required");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/homework/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          subject: form.subject,
          classId: form.classId,
          dueDate: form.dueDate || null,
          assignedDate: form.assignedDate || null,
          file: form.file || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to create homework");
        return;
      }

      setMessage("Homework created successfully!");
      setForm({ title: "", description: "", subject: "", classId: "", dueDate: "", assignedDate: "", file: "" });
      setShowForm(false);
      fetchHomeworks();
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingHomework(null);
    setForm({ title: "", description: "", subject: "", classId: "", dueDate: "", assignedDate: "", file: "" });
    setMessage("");
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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2d2d2d] to-[#404040] rounded-xl flex items-center justify-center border border-[#333333] shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              Homework Management
            </h1>
            <p className="text-[#808080] text-sm md:text-base">Create and manage homework assignments</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              handleCancel();
              setShowForm(!showForm);
            }}
            className="bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 border border-[#333333] hover:border-[#808080] shadow-lg"
          >
            {showForm ? (
              <>
                <X size={18} />
                Cancel
              </>
            ) : (
              <>
                <Plus size={18} />
                Create Homework
              </>
            )}
          </motion.button>
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

        {/* Create Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
            <div className="relative">
              <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                <BookOpen size={24} />
                Create Homework
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                      <FileText size={16} />
                      Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                      className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                      placeholder="Enter homework title..."
                    />
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
                      required
                      placeholder="e.g., Mathematics"
                      className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                      <GraduationCap size={16} />
                      Class <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={form.classId}
                      onChange={(e) => setForm({ ...form, classId: e.target.value })}
                      required
                      className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition"
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
                      Assigned Date (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={form.assignedDate}
                      onChange={(e) => setForm({ ...form, assignedDate: e.target.value })}
                      className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                      <Calendar size={16} />
                      Due Date (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                      className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                    <FileText size={16} />
                    File URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.file}
                    onChange={(e) => setForm({ ...form, file: e.target.value })}
                    placeholder="https://example.com/file.pdf"
                    className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                    <FileText size={16} />
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                    rows={5}
                    className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b] resize-none"
                    placeholder="Enter homework description..."
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white py-3.5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 border border-[#333333] hover:border-[#808080] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>Create Homework</span>
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Homeworks List */}
        {homeworks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-12 text-center"
          >
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-[#808080] opacity-50" />
            <p className="text-[#808080] text-lg">No homework assigned yet</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {homeworks.map((homework, index) => (
              <motion.div
                key={homework.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-lg p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
                <div className="relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-[#808080]" />
                        {homework.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-[#808080] mb-4">
                        <div className="flex items-center gap-2">
                          <BookOpen size={14} />
                          <span><strong className="text-white">Subject:</strong> {homework.subject}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap size={14} />
                          <span><strong className="text-white">Class:</strong> {homework.class.name}
                            {homework.class.section ? ` - ${homework.class.section}` : ""}</span>
                        </div>
                        {homework.dueDate && (
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span><strong className="text-white">Due:</strong>{" "}
                              {new Date(homework.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-[#808080] whitespace-pre-wrap mb-6 leading-relaxed bg-[#2d2d2d]/50 p-4 rounded-lg border border-[#404040]">
                        {homework.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-[#808080] pt-4 border-t border-[#333333]">
                        <div className="flex items-center gap-2">
                          <User size={14} />
                          <span>Created by: <span className="text-white font-medium">{homework.teacher.name}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>{new Date(homework.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText size={14} />
                          <span className="text-white font-medium">{homework._count.submissions}</span> submission(s)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

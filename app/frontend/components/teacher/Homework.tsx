"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  Plus,
  X,
  ChevronDown,
  Pencil,
  Trash2,
  FileText,
  Calendar,
  Search,
  CheckCircle2,
  TrendingUp,
  Upload,
} from "lucide-react";

interface Homework {
  id: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string | null;
  createdAt: string;
  class: { id: string; name: string; section: string | null };
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
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "closed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
 const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
  // --- REFS ---
  const fileRef = useRef<HTMLInputElement>(null);
  const assignedDateRef = useRef<HTMLInputElement>(null);
  const dueDateRef = useRef<HTMLInputElement>(null);
  const classRef = useRef<HTMLSelectElement>(null);
  const subjectRef = useRef<HTMLSelectElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (session) {
      fetch("/api/homework/list")
        .then((r) => r.json())
        .then((d) => setHomeworks(d.homeworks || []));

      fetch("/api/class/list")
        .then((r) => r.json())
        .then((d) => setClasses(d.classes || []));
    }
  }, [session]);

  const filteredHomeworks = useMemo(() => {
    const map = new Map<string, Homework>();
    homeworks.forEach((h) => map.set(h.id, h));
    let list = Array.from(map.values());

    if (searchQuery) {
      list = list.filter((h) =>
        h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  }, [homeworks, searchQuery]);

  if (status === "loading") return null;
  if (!session) return <div className="text-white p-6">Unauthorized</div>;
  // --- DELETE LOGIC ---
const handleDelete = async (id: string) => {
  if (!confirm("Are you sure you want to delete this assignment?")) return;

  try {
    const res = await fetch(`/api/homework/${id}`, { method: "DELETE" });
    if (res.ok) {
      setHomeworks((prev) => prev.filter((h) => h.id !== id));
    }
  } catch (error) {
    console.error("Delete failed:", error);
  }
};

// --- EDIT LOGIC ---
const handleEditClick = (h: Homework) => {
  setEditingHomework(h);
  setShowForm(true);
  // Optional: Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// --- SUBMIT (CREATE OR UPDATE) ---
const handleSubmit = async () => {
  const payload = {
    title: titleRef.current?.value,
    description: descRef.current?.value,
    classId: classRef.current?.value,
    subject: subjectRef.current?.value,
    dueDate: dueDateRef.current?.value,
  };

  const url = editingHomework 
    ? `/api/homework/update/${editingHomework.id}` 
    : "/api/homework/create";
  
  const method = editingHomework ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      // Refresh list or update state manually
      const updatedData = await res.json();
      if (editingHomework) {
        setHomeworks(prev => prev.map(h => h.id === updatedData.id ? updatedData : h));
      } else {
        setHomeworks(prev => [updatedData, ...prev]);
      }
      setShowForm(false);
      setEditingHomework(null);
    }
  } catch (err) {
    console.error("Submission failed", err);
  }
};

  return (
    <div className="min-h-screen w-full overflow-x-hidden p-4 md:p-6 lg:p-10 text-white bg-[radial-gradient(1200px_circle_at_20%_20%,#5b2bff55,transparent_40%),radial-gradient(1000px_circle_at_80%_30%,#ff7a1855,transparent_45%),radial-gradient(800px_circle_at_50%_80%,#00ffcc33,transparent_50%),linear-gradient(135deg,#0b0616_0%,#120b2a_100%)]">
      
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="glass rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-xl md:text-2xl font-semibold">Homework Management</h2>
            <p className="text-white/60 text-sm">Assign and track student homework</p>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-lime-400 text-black font-semibold flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            {showForm ? <X size={20} /> : <Plus size={20} />}
            <span className="text-sm md:text-base">{showForm ? "Cancel" : "Create New Assignment"}</span>
          </button>
        </div>

        {/* CREATE ASSIGNMENT FORM */}
        {showForm && (
          <div className="glass rounded-2xl mb-8 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="px-6 md:px-8 py-4 md:py-6 border-b border-white/10">
              <h3 className="text-lg md:text-xl font-semibold">New Assignment Details</h3>
            </div>

            <ul className="px-6 md:px-8 py-6 md:py-8 space-y-6">
              <li className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs md:text-sm text-white/60 block mb-2 uppercase tracking-wider">Class</label>
                  <select className="input h-12 md:h-14 w-full bg-black/40 border border-white/10 rounded-xl px-4 outline-none focus:border-lime-400/50">
                    <option className="bg-slate-900">Class 10-A</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs md:text-sm text-white/60 block mb-2 uppercase tracking-wider">Subject</label>
                  <select className="input h-12 md:h-14 w-full bg-black/40 border border-white/10 rounded-xl px-4 outline-none focus:border-lime-400/50">
                    <option className="bg-slate-900">Mathematics</option>
                  </select>
                </div>
              </li>

              <li>
                <label className="text-xs md:text-sm text-white/60 block mb-2 uppercase tracking-wider">
                  Assignment Title
                </label>
                <input
                  className="input h-12 md:h-14 w-full bg-black/40 border border-white/10 rounded-xl px-4 outline-none focus:border-lime-400/50"
                  placeholder="e.g. Chapter 5: Quadratic Equations"
                />
              </li>

              <li className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ASSIGNED DATE */}
                <div className="relative">
                  <label className="text-xs md:text-sm text-white/60 block mb-2 uppercase tracking-wider">
                    Assigned Date
                  </label>
                  <input 
                    ref={assignedDateRef}
                    type="date"
                    className="input h-12 md:h-14 w-full bg-black/40 border border-white/10 rounded-xl px-4 outline-none focus:border-lime-400/50 [color-scheme:dark]" 
                  />
                  <Calendar 
                    className="absolute right-4 top-10 md:top-11 text-white/60 cursor-pointer hover:text-lime-400 transition-colors" 
                    size={18} 
                    onClick={() => assignedDateRef.current?.showPicker()}
                  />
                </div>

                {/* DUE DATE */}
                <div className="relative">
                  <label className="text-xs md:text-sm text-white/60 block mb-2 uppercase tracking-wider">
                    Due Date
                  </label>
                  <input 
                    ref={dueDateRef}
                    type="date"
                    className="input h-12 md:h-14 w-full bg-black/40 border border-white/10 rounded-xl px-4 outline-none focus:border-lime-400/50 [color-scheme:dark]" 
                  />
                  <Calendar 
                    className="absolute right-4 top-10 md:top-11 text-white/60 cursor-pointer hover:text-lime-400 transition-colors" 
                    size={18} 
                    onClick={() => dueDateRef.current?.showPicker()}
                  />
                </div>
              </li>

              <li>
                <label className="text-xs md:text-sm text-white/60 block mb-3 uppercase tracking-wider">
                  Description
                </label>
                <div className="rounded-2xl bg-black/30 border border-white/10 overflow-hidden">
                  <textarea
                    className="w-full h-32 md:h-40 bg-transparent px-4 md:px-6 py-4 text-white placeholder:text-white/40 resize-none outline-none"
                    placeholder="Enter assignment details..."
                  />
                </div>
              </li>

              <li>
                <label className="text-xs md:text-sm text-white/60 block mb-3 uppercase tracking-wider">
                  Attachments
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="cursor-pointer rounded-2xl border border-dashed border-lime-400/40 p-6 md:p-10 text-center bg-black/30 hover:bg-black/40 transition"
                >
                  <Upload size={26} className="mx-auto mb-3 text-white/60" />
                  <p className="text-sm font-medium">Click to upload files</p>
                  <p className="text-xs text-white/50 mt-1">
                    PDF, DOC, JPG up to 10MB
                  </p>
                  {file && (
                    <p className="mt-3 text-lime-400 text-sm font-medium">{file.name}</p>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx,.jpg,.jpeg"
                  onChange={(e) =>
                    setFile(e.target.files ? e.target.files[0] : null)
                  }
                />
              </li>
            </ul>

            <div className="px-6 md:px-8 py-4 md:py-6 border-t border-white/10 flex flex-col sm:flex-row justify-end gap-3 md:gap-4">
              <button
                onClick={() => setShowForm(false)}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button className="w-full sm:w-auto px-8 py-3 rounded-full bg-lime-400 text-black font-bold shadow-lg shadow-lime-400/10 active:scale-95 transition-transform">
                Assign Homework
              </button>
            </div>
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          <div className="glass rounded-2xl p-6 flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:gap-0">
            <BookOpen className="text-lime-400 mb-0 sm:mb-2 shrink-0" />
            <div>
                <p className="text-white/60 text-xs md:text-sm">Active Assignments</p>
                <p className="text-2xl md:text-3xl font-bold">{homeworks.length}</p>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:gap-0">
            <CheckCircle2 className="text-blue-400 mb-0 sm:mb-2 shrink-0" />
            <div>
                <p className="text-white/60 text-xs md:text-sm">Total Submissions</p>
                <p className="text-2xl md:text-3xl font-bold">
                {homeworks.reduce((a, b) => a + b._count.submissions, 0)}
                </p>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:gap-0 sm:col-span-2 lg:col-span-1">
            <TrendingUp className="text-purple-400 mb-0 sm:mb-2 shrink-0" />
            <div>
                <p className="text-white/60 text-xs md:text-sm">Avg. Completion Rate</p>
                <p className="text-2xl md:text-3xl font-bold">82%</p>
            </div>
          </div>
        </div>

        {/* FILTER & SEARCH BAR */}
        <div className="glass rounded-2xl p-3 md:p-4 mb-6 flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex bg-black/20 p-1 rounded-full border border-white/5 w-full lg:w-auto overflow-x-auto no-scrollbar">
            {["all", "active", "closed"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`flex-1 lg:flex-none px-6 md:px-8 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
                  filter === f ? "bg-white/10 text-white shadow-inner" : "text-white/40 hover:text-white"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assignments..."
              className="w-full bg-black/30 border border-white/10 rounded-full py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-lime-400/50 transition-colors"
            />
          </div>
        </div>

        {/* HOMEWORK LIST */}
        <div className="space-y-4">
          {filteredHomeworks.length > 0 ? (
            filteredHomeworks.map((h) => {
              const isOpen = expandedId === h.id;
              const totalStudents = 40;
              const submitted = h._count.submissions;
              const pending = totalStudents - submitted;
              const progress = (submitted / totalStudents) * 100;
             

              return (
                <div key={h.id} className={`glass rounded-2xl transition-all duration-300 ${isOpen ? 'ring-1 ring-white/20' : ''}`}>
                  {/* Top Row / Summary */}
                  <div 
                    className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer"
                    onClick={() => setExpandedId(isOpen ? null : h.id)}
                  >
                    <div className="flex gap-4 items-center w-full md:w-auto">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-lime-400/20 flex items-center justify-center shrink-0 shadow-inner">
                        <BookOpen className="text-lime-400" size={20} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] md:text-xs text-white/50 uppercase tracking-widest truncate">
                          {h.class.name}{h.class.section ? `-${h.class.section}` : ""} • {h.subject}
                        </p>
                        <h3 className="text-base md:text-lg font-semibold truncate">{h.title}</h3>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 w-full md:w-auto border-t border-white/5 pt-4 md:pt-0">
                      <div className="text-xs md:text-sm">
                        <p className="text-white/40 text-[10px] md:text-xs uppercase">Submissions</p>
                        <p className="text-lime-400 font-bold">{submitted} / {totalStudents}</p>
                      </div>

                      <div className="text-xs md:text-sm text-right md:text-left">
                        <p className="text-white/40 text-[10px] md:text-xs uppercase">Due Date</p>
                        <p className="font-medium">{h.dueDate ? new Date(h.dueDate).toLocaleDateString() : "—"}</p>
                      </div>

                      <div className="hidden sm:block">
                        <span className="px-3 py-1 rounded-full bg-lime-400/10 text-lime-400 text-[10px] font-bold border border-lime-400/20 uppercase">
                            Active
                        </span>
                      </div>

                      <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                         <ChevronDown className="text-white/40" />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Section */}
                  {isOpen && (
                    <div className="px-4 md:px-6 pb-6 border-t border-white/10 pt-6 animate-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Side: Actions & Content */}
                        <div className="lg:col-span-2 space-y-4">
                          <div className="flex flex-wrap gap-3">
                             
                            <div className="flex flex-wrap gap-3">
  {/* EDIT BUTTON */}
  <button 
    onClick={() => handleEditClick(h)}
    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 flex items-center justify-center gap-2 text-sm transition-all shadow-sm"
  >
    <Pencil size={16} /> Edit
  </button>

  {/* DELETE BUTTON */}
  <button 
    onClick={() => handleDelete(h.id)}
    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 flex items-center justify-center gap-2 text-sm transition-all shadow-sm"
  >
    <Trash2 size={16} /> Delete
  </button>
</div>
                          </div>

                          <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-white/80">
                              <FileText size={16} className="text-lime-400" /> Description
                            </h4>
                            <p className="text-white/60 text-sm leading-relaxed">
                              {h.description || "No description provided."}
                            </p>
                          </div>

                          <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                            <FileText className="text-white/40 group-hover:text-lime-400 transition-colors" />
                            <span className="text-sm font-medium">Chapter_5_Questions.pdf</span>
                          </div>
                        </div>

                        {/* Right Side: Status Progress */}
                        <div className="bg-black/20 rounded-xl p-5 space-y-4 border border-white/5">
                          <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                            Submission Status
                          </h4>

                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Completion</span>
                              <span className="text-lime-400 font-bold">{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.5)] rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <div className="text-center flex-1 border-r border-white/5">
                                    <p className="text-[10px] text-white/40 uppercase">Submitted</p>
                                    <p className="text-lg font-bold text-white">{submitted}</p>
                                </div>
                                <div className="text-center flex-1">
                                    <p className="text-[10px] text-white/40 uppercase">Pending</p>
                                    <p className="text-lg font-bold text-orange-400">{pending}</p>
                                </div>
                            </div>
                          </div>

                          <button className="w-full py-3.5 rounded-xl bg-lime-400/10 hover:bg-lime-400/20 text-lime-400 font-bold text-sm transition-all active:scale-95 border border-lime-400/20">
                            View All Submissions
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="glass rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="text-white/20" size={32} />
                </div>
                <h3 className="text-lg font-medium text-white/60">No assignments found</h3>
                <p className="text-sm text-white/40">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .glass {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.08),
            rgba(255, 255, 255, 0.02)
          );
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
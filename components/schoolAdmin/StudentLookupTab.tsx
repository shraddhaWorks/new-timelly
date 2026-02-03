"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, User, Hash, Mail, BookOpen } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { formatDate } from "@/lib/utils";
import type { StudentWithRelations } from "@/hooks/useStudents";

export default function StudentLookupTab() {
  const [rollNoSearch, setRollNoSearch] = useState("");
  const [admissionSearch, setAdmissionSearch] = useState("");
  const [students, setStudents] = useState<StudentWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const doSearch = async () => {
    const roll = rollNoSearch.trim();
    const adm = admissionSearch.trim();
    if (!roll && !adm) {
      setStudents([]);
      setSearched(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (roll) params.set("rollNo", roll);
      if (adm) params.set("admissionNumber", adm);
      const res = await fetch(`/api/student/list?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Search failed");
      setStudents(data.students ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
      setStudents([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center border border-white/10">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Student Lookup</h1>
            <p className="text-sm text-white/60">Search by roll number or admission number</p>
          </div>
        </motion.div>

        <GlassCard variant="card" className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                <Hash size={16} />
                Roll Number
              </label>
              <input
                type="text"
                placeholder="Enter roll number..."
                value={rollNoSearch}
                onChange={(e) => {
                  setRollNoSearch(e.target.value);
                  if (e.target.value) setAdmissionSearch("");
                }}
                className="w-full glass-input text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                <Mail size={16} />
                Admission Number
              </label>
              <input
                type="text"
                placeholder="Enter admission number..."
                value={admissionSearch}
                onChange={(e) => {
                  setAdmissionSearch(e.target.value);
                  if (e.target.value) setRollNoSearch("");
                }}
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                className="w-full glass-input text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <motion.button
              type="button"
              onClick={doSearch}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="glass-card px-5 py-2.5 rounded-xl font-medium text-white flex items-center gap-2 border border-white/10"
            >
              <Search size={18} />
              Search
            </motion.button>
          </div>
        </GlassCard>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/30 border-t-white" />
          </div>
        )}

        {!loading && searched && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold text-white">
              {students.length === 0 ? "No students found" : `Results (${students.length})`}
            </h2>
            {students.map((s) => (
              <StudentCard key={s.id} student={s} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StudentCard({ student }: { student: StudentWithRelations }) {
  return (
    <GlassCard variant="default" className="p-5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl glass flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-white/80" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-semibold text-white text-lg">{student.user?.name ?? "—"}</span>
            {student.class && (
              <span className="text-white/60 text-sm flex items-center gap-1">
                <BookOpen size={14} />
                {student.class.name}
                {student.class.section ? ` - ${student.class.section}` : ""}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-white/70">
              <Hash size={14} />
              Roll: {student.rollNo ?? "—"}
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Mail size={14} />
              Admission: {student.admissionNumber}
            </div>
            <div className="text-white/60">DOB: {formatDate(student.dob)}</div>
            <div className="text-white/60">Father: {student.fatherName}</div>
            <div className="text-white/60">Phone: {student.phoneNo}</div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

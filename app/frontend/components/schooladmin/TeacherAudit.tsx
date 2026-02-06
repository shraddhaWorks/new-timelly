"use client";

import { useCallback, useEffect, useState } from "react";
import type { TeacherRow, AuditRecord } from "./teacheraudit/types";
import TeacherAuditHeader from "./teacheraudit/TeacherAuditHeader";
import TeacherAuditCard from "./teacheraudit/TeacherAuditCard";
import LoadingSpinner from "./teacheraudit/LoadingSpinner";

export default function TeacherAuditTab() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [expandedTeacherId, setExpandedTeacherId] = useState<string | null>(
    null
  );
  const [addFormMode, setAddFormMode] = useState<"good" | "bad">("good");
  const [historyExpanded, setHistoryExpanded] = useState<Record<string, boolean>>(
    {}
  );
  const [recordsByTeacher, setRecordsByTeacher] = useState<
    Record<string, AuditRecord[]>
  >({});
  const [category, setCategory] = useState<string>("TEACHING_METHOD");
  const [customCategory, setCustomCategory] = useState("");
  const [description, setDescription] = useState("");
  const [scoreImpact, setScoreImpact] = useState(5);
  const [saving, setSaving] = useState(false);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/teacher-audit/teachers?${params.toString()}`);
      const data = await res.json();
      setTeachers(data.teachers ?? []);
    } catch {
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    const t = setTimeout(() => fetchTeachers(), 300);
    return () => clearTimeout(t);
  }, [q, fetchTeachers]);

  const loadRecords = useCallback(async (teacherId: string) => {
    try {
      const res = await fetch(
        `/api/teacher-audit/${teacherId}/records?take=50`
      );
      const data = await res.json();
      setRecordsByTeacher((prev) => ({
        ...prev,
        [teacherId]: data.records ?? [],
      }));
    } catch {
      setRecordsByTeacher((prev) => ({ ...prev, [teacherId]: [] }));
    }
  }, []);

  const openAddForm = (t: TeacherRow, mode: "good" | "bad") => {
    setExpandedTeacherId(t.id);
    setAddFormMode(mode);
    setDescription("");
    setCustomCategory("");
    setCategory("TEACHING_METHOD");
    setScoreImpact(mode === "bad" ? -5 : 5);
    loadRecords(t.id);
  };

  const toggleHistory = (teacherId: string) => {
    setHistoryExpanded((prev) => ({ ...prev, [teacherId]: !prev[teacherId] }));
    if (!recordsByTeacher[teacherId]) loadRecords(teacherId);
  };

  const saveRecord = async () => {
    const teacherId = expandedTeacherId;
    if (!teacherId) return;
    setSaving(true);
    try {
      const payload = {
        category,
        customCategory: category === "CUSTOM" ? customCategory : undefined,
        description,
        scoreImpact,
      };
      const res = await fetch(`/api/teacher-audit/${teacherId}/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");
      await loadRecords(teacherId);
      await fetchTeachers();
      setDescription("");
      setCustomCategory("");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen text-white p-3 sm:p-4 md:p-6 overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <TeacherAuditHeader
          searchValue={q}
          onSearchChange={setQ}
          onSearchSubmit={fetchTeachers}
        />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-4">
            {teachers.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 sm:p-8 text-center text-white/60 text-sm sm:text-base">
                No teachers found. Try a different search.
              </div>
            ) : (
              teachers.map((t) => (
                <TeacherAuditCard
                  key={t.id}
                  teacher={t}
                  isAddFormOpen={expandedTeacherId === t.id}
                  addFormMode={addFormMode}
                  records={recordsByTeacher[t.id] ?? []}
                  isHistoryOpen={!!historyExpanded[t.id]}
                  category={category}
                  customCategory={customCategory}
                  description={description}
                  scoreImpact={scoreImpact}
                  saving={saving}
                  onCategoryChange={setCategory}
                  onCustomCategoryChange={setCustomCategory}
                  onDescriptionChange={setDescription}
                  onScoreImpactChange={setScoreImpact}
                  onOpenAddGood={() => openAddForm(t, "good")}
                  onOpenAddBad={() => openAddForm(t, "bad")}
                  onToggleHistory={() => toggleHistory(t.id)}
                  onSaveRecord={saveRecord}
                  onCloseAddForm={() => setExpandedTeacherId(null)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

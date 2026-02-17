"use client";

import { useCallback, useEffect, useState } from "react";
import type { TeacherRow, AuditRecord } from "./teacheraudit/types";
import TeacherAuditHeader from "./teacheraudit/TeacherAuditHeader";
import TeacherAuditCard from "./teacheraudit/TeacherAuditCard";

import PageHeader from "../common/PageHeader";
import Spinner from "../common/Spinner";

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
  const [category, setCategory] = useState<string>("");
  const [customCategory, setCustomCategory] = useState("");
  const [description, setDescription] = useState("");
  const [scoreImpact, setScoreImpact] = useState<number>(5);

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
    setCategory("");
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
      category: category || "OTHER",
      customCategory: category ? null : customCategory.trim(),
      scoreImpact, // ✅ send raw impact
      ...(description.trim() && { description: description.trim() }),
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
    setCategory("");
  } catch (e) {
    alert(e instanceof Error ? e.message : "Failed to save");
  } finally {
    setSaving(false);
  }
};


  

  return (
    <div className="space-y-4 sm:space-y-6 px-3 md:px-0 overflow-x-hidden">
      <PageHeader
        title=" Teacher Audit & Appraisal"
        subtitle="Track performance, acknowledge achievements, and identify areas for
              improvement."
        rightSlot={<TeacherAuditHeader searchValue={q} onSearchChange={setQ} onSearchSubmit={() => { }} placeholder="Search teachers..." />}
      />

      <div className="">
        <div className=" mx-auto space-y-4 sm:space-y-6">


          {loading ? (
            <Spinner />
          ) : (
            <div className="space-y-4">
              {teachers.length === 0 ? (
                <div className="rounded-2xl border  border-white/10 backdrop-blur-xl p-6 sm:p-8 text-center text-white/60 text-sm sm:text-base">
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
    </div>
  );
}

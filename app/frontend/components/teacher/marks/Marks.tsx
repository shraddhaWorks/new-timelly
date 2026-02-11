"use client";

import { useState, useEffect, useCallback } from "react";
import PageHeader from "../../common/PageHeader";
import { SelectField } from "./MarksSelectField";
import { Download, Save, Upload } from "lucide-react";
import DataTable from "../../common/TableLayout";
import { Column } from "@/app/frontend/types/superadmin";

/* ---------------- TYPES ---------------- */

type StudentRow = {
  id: string;
  rollNo: string;
  name: string;
  avatar: string;
  marks: number | "";
  maxMarks: number;
  markId?: string;
};

type ClassOption = { id: string; name: string; section: string | null };
type StudentApi = {
  id: string;
  rollNo: string | null;
  user: { id: string; name: string | null; email: string | null };
  class?: { id: string; name: string; section: string | null };
};
type MarkApi = {
  id: string;
  studentId: string;
  subject: string;
  marks: number;
  totalMarks: number;
  grade: string | null;
  createdAt: string;
};

const DEFAULT_SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "Hindi",
  "Social Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
];
const EXAM_TYPES = ["Term 1", "Term 2", "Final"];

export default function TeacherMarksTab() {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [form, setForm] = useState({
    classId: "",
    classLabel: "",
    section: "",
    subject: "Mathematics",
    examType: "Term 1",
  });
  const [activeBtn, setActiveBtn] = useState<null | "save" | "import" | "export">(null);
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const classOptions = classes.map((c) => ({
    value: c.id,
    label: c.section ? `${c.name} - ${c.section}` : c.name,
  }));
  const sectionOptions = form.classId
    ? (() => {
        const c = classes.find((x) => x.id === form.classId);
        if (c?.section) return [c.section];
        return ["Section A"];
      })()
    : ["Section A"];
  const subjectOptions = DEFAULT_SUBJECTS;
  const examTypeOptions = EXAM_TYPES;

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch("/api/class/list");
      const data = await res.json();
      if (!res.ok) return;
      const list = Array.isArray(data.classes) ? data.classes : [];
      setClasses(list.map((c: { id: string; name: string; section?: string | null }) => ({ id: c.id, name: c.name, section: c.section ?? null })));
      if (list.length > 0 && !form.classId) {
        const first = list[0];
        setForm((prev) => ({
          ...prev,
          classId: first.id,
          classLabel: first.section ? `${first.name} - ${first.section}` : first.name,
          section: first.section || "Section A",
        }));
      }
    } catch {
      setClasses([]);
    }
  }, []);

  const fetchStudentsAndMarks = useCallback(async () => {
    if (!form.classId) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const [studentsRes, marksRes] = await Promise.all([
        fetch(`/api/class/students?classId=${encodeURIComponent(form.classId)}`),
        fetch(`/api/marks/view?classId=${encodeURIComponent(form.classId)}&subject=${encodeURIComponent(form.subject)}`),
      ]);
      const studentsData = await studentsRes.json();
      const marksData = await marksRes.json();
      const students: StudentApi[] = Array.isArray(studentsData.students) ? studentsData.students : [];
      const marks: MarkApi[] = Array.isArray(marksData.marks) ? marksData.marks : [];
      const markByStudent: Record<string, MarkApi> = {};
      marks.forEach((m) => {
        if (!markByStudent[m.studentId] || new Date(m.createdAt) > new Date(markByStudent[m.studentId].createdAt)) {
          markByStudent[m.studentId] = m;
        }
      });
      const newRows: StudentRow[] = students.map((s) => {
        const name = s.user?.name ?? "Student";
        const mark = markByStudent[s.id];
        return {
          id: s.id,
          rollNo: s.rollNo ?? "--",
          name,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=40&background=4ade80&color=fff`,
          marks: mark ? (mark.marks as number) : "",
          maxMarks: mark ? mark.totalMarks : 100,
          markId: mark?.id,
        };
      });
      setRows(newRows);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [form.classId, form.subject]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    fetchStudentsAndMarks();
  }, [fetchStudentsAndMarks]);

  const handleChange = (key: string, value: string) => {
    if (key === "class") {
      if (!value || value === "Select class") {
        setForm((prev) => ({ ...prev, classId: "", classLabel: "", section: "" }));
        return;
      }
      const opt = classOptions.find((o) => o.value === value || o.label === value);
      const c = classes.find((x) => x.id === value || (x.section ? `${x.name} - ${x.section}` : x.name) === value);
      setForm((prev) => ({
        ...prev,
        classId: opt?.value ?? "",
        classLabel: opt?.label ?? value,
        section: c?.section ?? prev.section,
      }));
      return;
    }
    if (key === "section") {
      setForm((prev) => ({ ...prev, section: value }));
      return;
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateMarks = (id: string, value: string) => {
    const num = value === "" ? "" : Math.min(1000, Math.max(0, Number(value)));
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, marks: num } : r)));
  };

  const getPercentage = (m: number | "", max: number) =>
    m === "" ? "--" : `${((Number(m) / max) * 100).toFixed(1)}%`;

  const getGrade = (m: number | "") => {
    if (m === "") return "--";
    const n = Number(m);
    if (n >= 90) return "A+";
    if (n >= 80) return "A";
    if (n >= 70) return "B+";
    if (n >= 60) return "B";
    return "C";
  };

  const total = rows.length;
  const entered = rows.filter((r) => r.marks !== "").length;
  const pending = total - entered;

  const handleSaveAll = async () => {
    if (pending > 0 || !form.classId) return;
    setSaveLoading(true);
    try {
      let hasError = false;
      for (const row of rows) {
        if (row.marks === "") continue;
        const payload = {
          studentId: row.id,
          classId: form.classId,
          subject: form.subject,
          marks: Number(row.marks),
          totalMarks: row.maxMarks,
        };
        if (row.markId) {
          const res = await fetch(`/api/marks/${row.markId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ marks: payload.marks, totalMarks: payload.totalMarks }),
          });
          if (!res.ok) hasError = true;
        } else {
          const res = await fetch("/api/marks/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) hasError = true;
        }
      }
      if (!hasError) await fetchStudentsAndMarks();
    } finally {
      setSaveLoading(false);
    }
  };

  const columns: Column<StudentRow>[] = [
    { header: "ROLL NO", accessor: "rollNo" },
    {
      header: "STUDENT NAME",
      render: (row: StudentRow) => (
        <div className="flex items-center gap-3">
          <img src={row.avatar} alt={row.name} className="w-9 h-9 rounded-full" />
          <span className="font-medium text-white">{row.name}</span>
        </div>
      ),
    },
    {
      header: "MARKS OBTAINED",
      align: "center",
      render: (row: StudentRow) => (
        <input
          type="number"
          value={row.marks}
          onChange={(e) => updateMarks(row.id, e.target.value)}
          className="w-20 text-center rounded-lg bg-white/5 border border-white/10 px-2 py-1 text-white outline-none"
        />
      ),
    },
    { header: "MAX MARKS", align: "center", accessor: "maxMarks" },
    {
      header: "PERCENTAGE",
      align: "center",
      render: (row: StudentRow) => (
        <span className="font-medium text-white">{getPercentage(row.marks, row.maxMarks)}</span>
      ),
    },
    {
      header: "GRADE",
      align: "center",
      render: (row: StudentRow) => {
        const g = getGrade(row.marks);
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs border ${
              g === "A+" ? "bg-lime-400/10 text-lime-400 border-lime-400/30" : "bg-white/5 text-gray-200 border-white/20"
            }`}
          >
            {g}
          </span>
        );
      },
    },
  ];

  const displayClass = form.classLabel || form.classId || "Select class";
  const displaySection = form.section || "Section A";

  return (
    <div className="min-h-screen text-white px-3 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Marks Entry"
          subtitle="Enter and manage student marks for your classes"
        />

        {/* FILTER BAR */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SelectField
              label="CLASS"
              value={form.classLabel || ""}
              onChange={(v) => handleChange("class", v)}
              options={classOptions.length ? classOptions.map((o) => o.label) : ["Select class"]}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-lime-400/50 text-white text-sm"
            />
            <SelectField
              label="SECTION"
              value={form.section}
              onChange={(v) => handleChange("section", v)}
              options={sectionOptions}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-lime-400/50 text-white text-sm"
            />
            <SelectField
              label="SUBJECT"
              value={form.subject}
              onChange={(v) => handleChange("subject", v)}
              options={subjectOptions}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-lime-400/50 text-white text-sm"
            />
            <SelectField
              label="EXAM TYPE"
              value={form.examType}
              onChange={(v) => handleChange("examType", v)}
              options={examTypeOptions}
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-lime-400/50 text-white text-sm"
            />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-4">
          {[
            { key: "save", label: "Save Marks", icon: Save },
            { key: "import", label: "Import Excel", icon: Upload },
            { key: "export", label: "Export Excel", icon: Download },
          ].map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.key}
                onClick={() => setActiveBtn(btn.key as "save" | "import" | "export")}
                className={`px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-medium transition
                  ${
                    activeBtn === btn.key
                      ? "bg-lime-400/20 text-lime-400 border border-lime-400/40 shadow-md"
                      : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
                  }`}
              >
                <Icon size={16} />
                {btn.label}
              </button>
            );
          })}
        </div>

        {/* TABLE CARD */}
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10 flex flex-col">
          <div className="p-6 border-b border-white/10 bg-white/[0.02]">
            <h3 className="font-bold text-white text-lg">Enter Marks</h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-white/60">
              <span>{displayClass}</span>
              <span className="w-1 h-1 rounded-full bg-white/40" />
              <span>{form.subject}</span>
              <span className="w-1 h-1 rounded-full bg-white/40" />
              <span className="text-lime-400 font-medium">{form.examType}</span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-2 border-lime-500/30 border-t-lime-500 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <DataTable<StudentRow>
                  columns={columns}
                  rounded={false}
                  data={rows}
                  rowKey={(row) => row.id}
                  emptyText="No students in this class. Select a class above."
                />
              </div>

              <div className="md:hidden space-y-4 p-4">
                {rows.length === 0 ? (
                  <p className="text-white/60 text-center py-6">No students in this class.</p>
                ) : (
                  rows.map((student) => {
                    const percentage = getPercentage(student.marks, student.maxMarks);
                    const grade = getGrade(student.marks);
                    return (
                      <div
                        key={student.id}
                        className="rounded-2xl p-5 border border-white/10 bg-gradient-to-br from-purple-700/40 via-indigo-700/30 to-purple-900/40 backdrop-blur-xl shadow-xl"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={student.avatar} alt={student.name} className="w-12 h-12 rounded-full" />
                            <div>
                              <div className="text-white font-semibold">{student.name}</div>
                              <div className="text-xs text-white/60">Roll : {student.rollNo}</div>
                            </div>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs border bg-lime-400/20 text-lime-400 border-lime-400/40">
                            {grade}
                          </span>
                        </div>
                        <div className="mt-5 flex justify-between text-sm">
                          <span className="text-white/60">Calculated Percentage</span>
                          <span className="text-white font-semibold">{percentage}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-white/[0.02] border-t border-white/10">
                <div className="flex gap-6 text-sm">
                  <span className="text-gray-400">
                    TOTAL <span className="text-white font-semibold ml-1">{total}</span>
                  </span>
                  <span className="text-lime-400">
                    ENTERED <span className="font-semibold ml-1">{entered}</span>
                  </span>
                  <span className="text-red-400">
                    PENDING <span className="font-semibold ml-1">{pending}</span>
                  </span>
                </div>
                <button
                  disabled={pending > 0 || saveLoading}
                  onClick={handleSaveAll}
                  className={`px-5 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition
                    ${
                      pending === 0 && !saveLoading
                        ? "bg-lime-400/20 text-lime-400 border border-lime-400/30 hover:shadow-[0_0_15px_rgba(163,230,53,0.2)]"
                        : "bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed"
                    }`}
                >
                  <Save size={16} />
                  {saveLoading ? "Saving…" : "Save All Marks"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

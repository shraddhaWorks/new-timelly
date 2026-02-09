"use client";

import { GraduationCap, UserPlus, Trash2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

const DEFAULT_AVATAR = "https://randomuser.me/api/portraits/lego/1.jpg";

/* ================= TYPES ================= */
type ClassItem = {
  id: string;
  name: string;
  section: string | null;
  teacherId: string | null;
  teacher?: { id: string; name: string | null; email: string | null } | null;
};

type TeacherItem = {
  id: string;
  name: string | null;
  email: string | null;
  teacherId: string | null;
  photoUrl: string | null;
};

type AppointmentRow = {
  classId: string;
  className: string;
  teacherName: string;
  teacherCode: string;
  teacherEmail: string;
  avatar: string;
};

type TableColumn<T> = {
  key: keyof T | "actions";
  label: string;
  hideOnMobile?: boolean;
  className?: string;
};

/* ================= COLUMN CONFIG ================= */
const columns: TableColumn<AppointmentRow>[] = [
  { key: "className", label: "Class" },
  { key: "teacherName", label: "Class Teacher" },
  {
    key: "teacherEmail",
    label: "Teacher Email",
    hideOnMobile: true,
  },
  { key: "actions", label: "Actions", className: "text-right" },
];

/* ================= COMPONENT ================= */
export default function AppointTeacher() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [classRes, teacherRes] = await Promise.all([
          fetch("/api/class/list", { credentials: "include" }),
          fetch("/api/teacher/list", { credentials: "include" }),
        ]);
        if (cancelled) return;
        const classData = await classRes.json();
        const teacherData = await teacherRes.json();
        if (classData.classes) setClasses(classData.classes);
        if (teacherData.teachers) setTeachers(teacherData.teachers);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const appointments: AppointmentRow[] = useMemo(() => {
    return classes
      .filter((c) => c.teacherId && c.teacher)
      .map((c) => ({
        classId: c.id,
        className: [c.name, c.section].filter(Boolean).join(c.section ? " - " : ""),
        teacherName: c.teacher!.name || "Teacher",
        teacherCode: (c.teacher as { teacherId?: string }).teacherId || c.teacher!.id.slice(0, 6).toUpperCase(),
        teacherEmail: c.teacher!.email || "-",
        avatar: DEFAULT_AVATAR,
      }));
  }, [classes]);

  const classOptions = useMemo(() => {
    return classes.map((c) => ({
      value: c.id,
      label: [c.name, c.section].filter(Boolean).join(c.section ? " - " : ""),
    }));
  }, [classes]);

  const teacherOptions = useMemo(() => {
    return teachers.map((t) => ({
      value: t.id,
      label: t.name || "Teacher",
    }));
  }, [teachers]);

  const handleAssign = async () => {
    if (!selectedClassId || !selectedTeacherId) return;
    setAssigning(true);
    try {
      const res = await fetch(`/api/class/${selectedClassId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ teacherId: selectedTeacherId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to assign");
      setSelectedClassId("");
      setSelectedTeacherId("");
      const listRes = await fetch("/api/class/list", { credentials: "include" });
      const listData = await listRes.json();
      if (listData.classes) setClasses(listData.classes);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Failed to assign class teacher.");
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async (classId: string) => {
    if (!confirm("Remove class teacher from this class?")) return;
    setRemovingId(classId);
    try {
      const res = await fetch(`/api/class/${classId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ teacherId: null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove");
      const listRes = await fetch("/api/class/list", { credentials: "include" });
      const listData = await listRes.json();
      if (listData.classes) setClasses(listData.classes);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Failed to remove class teacher.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-white">
      {/* ================= HEADER ================= */}
      <div className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <GraduationCap className="text-lime-400" />
          Appoint Class Teacher
        </h2>
        <p className="text-xs sm:text-sm text-white/60 mt-1">
          Assign one class teacher per class.
        </p>
      </div>

      {/* ================= FORM ================= */}
      <div className="border-y border-white/10 p-4 sm:p-6 bg-[#0F172A]/50">
        {loading ? (
          <p className="text-sm text-white/50">Loading classes and teachers...</p>
        ) : (
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-lime-400/50"
            >
              <option value="">-- Select Class --</option>
              {classOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0F172A]">
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-lime-400/50"
            >
              <option value="">-- Select Teacher --</option>
              {teacherOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0F172A]">
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={!selectedClassId || !selectedTeacherId || assigning}
              onClick={handleAssign}
              className={`px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 justify-center transition ${
                !selectedClassId || !selectedTeacherId || assigning
                  ? "bg-white/10 text-white/40 cursor-not-allowed"
                  : "bg-lime-500 text-black hover:bg-lime-400"
              }`}
            >
              <UserPlus size={18} />
              {assigning ? "Assigning..." : "Assign"}
            </button>
          </div>
        )}
      </div>

      {/* ================= CURRENT APPOINTMENTS ================= */}
      <div className="p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase">
          Current Appointments
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            {/* ===== TABLE HEAD ===== */}
            <thead className="bg-white/5">
              <tr className="text-xs text-gray-400 uppercase">
                {columns.map((col, index) => (
                  <th
                    key={col.key}
                    className={`px-3 py-2 ${
                      col.hideOnMobile ? "hidden sm:table-cell" : ""
                    } ${index === 0 ? "rounded-l-lg" : ""} ${
                      index === columns.length - 1 ? "rounded-r-lg" : ""
                    } ${col.className || ""}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* ===== TABLE BODY ===== */}
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-3 py-6 text-center text-sm text-white/40"
                  >
                    No appointments found
                  </td>
                </tr>
              ) : (
                appointments.map((item) => (
                  <tr
                    key={item.classId}
                    className="hover:bg-white/5 transition-colors"
                  >
                    {columns.map((col) => {
                      if (col.key === "actions") {
                        return (
                          <td
                            key="actions"
                            className="px-3 py-3 text-right"
                          >
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                disabled={removingId === item.classId}
                                onClick={() => handleRemove(item.classId)}
                                className="text-red-400 hover:opacity-80 disabled:opacity-50"
                                title="Remove class teacher"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        );
                      }

                      if (col.key === "className") {
                        return (
                          <td key={col.key} className="px-3 py-3">
                            <span className="px-2 py-1 text-xs font-bold rounded-md bg-white/10 text-lime-400">
                              {item.className}
                            </span>
                          </td>
                        );
                      }

                      if (col.key === "teacherName") {
                        return (
                          <td key={col.key} className="px-3 py-3">
                            <div className="flex items-center gap-2 min-w-[160px]">
                              <img
                                src={item.avatar}
                                alt={item.teacherName}
                                className="w-7 h-7 rounded-full border border-white/10"
                              />
                              <div className="leading-tight">
                                <p className="text-sm font-medium text-white truncate max-w-[120px]">
                                  {item.teacherName}
                                </p>
                                <p className="text-[10px] text-white/40 uppercase">
                                  {item.teacherCode}
                                </p>
                              </div>
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={col.key}
                          className={`px-3 py-3 text-sm text-white/50 ${
                            col.hideOnMobile
                              ? "hidden sm:table-cell"
                              : ""
                          }`}
                        >
                          {item[col.key]}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


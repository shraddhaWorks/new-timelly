"use client";

import { ChevronDown, ChevronUp, Mail, Phone, Search } from "lucide-react";
import SearchInput from "../../../common/SearchInput";
import type { StudentRow } from "../hooks/useTeacherClasses";
import type { StudentMetrics } from "../hooks/useClassMetrics";

type StudentWithMetrics = StudentRow & {
  metrics: StudentMetrics;
};

type StudentsSectionProps = {
  classTitle: string;
  students: StudentWithMetrics[];
  search: string;
  onSearch: (value: string) => void;
  expandedId: string | null;
  onToggleExpanded: (id: string) => void;
};

const initials = (name?: string | null) => {
  if (!name) return "S";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "S";
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const formatPercent = (value: number | null) =>
  value === null ? "--" : `${value.toFixed(1)}%`;

const progressWidth = (value: number | null) =>
  value === null ? "0%" : `${Math.max(6, Math.min(100, value))}%`;

const gradeLabel = (value: string | null) => value ?? "--";

const progressColor = (value: number | null) => {
  if (value === null) return "bg-white/20";
  if (value >= 92) return "bg-lime-400";
  if (value >= 85) return "bg-amber-400";
  return "bg-orange-400";
};

const gradePillClass = (grade?: string | null) => {
  const g = grade?.toUpperCase() ?? "";
  if (g === "A+" || g === "A") return "bg-lime-400/15 text-lime-300 border-lime-400/30";
  if (g === "B+" || g === "B") return "bg-amber-400/15 text-amber-300 border-amber-400/30";
  return "bg-white/10 text-white/80 border-white/20";
};

export default function StudentsSection({
  classTitle,
  students,
  search,
  onSearch,
  expandedId,
  onToggleExpanded,
}: StudentsSectionProps) {
  const expandedStudent = students.find((s) => s.id === expandedId) ?? null;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">{classTitle} Students</h3>
          <p className="text-sm text-white/60">{students.length} students enrolled</p>
        </div>
        <div className="w-full md:w-[280px]">
          <SearchInput
            value={search}
            onChange={onSearch}
            placeholder="Search by name or roll number..."
            variant="glass"
            icon={Search}
          />
        </div>
      </div>

      <div className="mt-4 hidden md:block">
        <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                {["ROLL NO", "STUDENT NAME", "ATTENDANCE", "AVG MARKS", "GRADE", "ACTIONS"].map(
                  (label) => (
                    <th
                      key={label}
                      scope="col"
                      className={`px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider ${
                        label === "ATTENDANCE" ||
                        label === "AVG MARKS" ||
                        label === "GRADE" ||
                        label === "ACTIONS"
                          ? "text-center"
                          : "text-left"
                      }`}
                    >
                      {label}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {students.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/60">
                    No students found.
                  </td>
                </tr>
              )}

              {students.map((row) => {
                const isExpanded = expandedId === row.id;
                return (
                  <tr
                    key={row.id}
                    className="hover:bg-white/5 transition-colors duration-200"
                  >
                    <td className="px-6 py-5 text-white/80">
                      {row.rollNo ?? row.admissionNumber ?? "--"}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs font-semibold text-white">
                          {initials(row.user?.name)}
                        </div>
                        <div>
                          <div
                            className={`font-medium ${
                              isExpanded ? "text-lime-300" : "text-white"
                            }`}
                          >
                            {row.user?.name ?? "Unnamed Student"}
                          </div>
                          <div className="text-xs text-white/40">
                            {row.user?.email ?? "No email"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="h-2 w-28 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${progressColor(
                              row.metrics.attendancePct
                            )}`}
                            style={{ width: progressWidth(row.metrics.attendancePct) }}
                          />
                        </div>
                        <span className="text-white/80 text-xs">
                          {formatPercent(row.metrics.attendancePct)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center text-white/80">
                      {formatPercent(row.metrics.avgMarksPct)}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${gradePillClass(
                          row.metrics.grade
                        )}`}
                      >
                        {gradeLabel(row.metrics.grade)}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleExpanded(row.id)}
                        className={`h-9 w-9 rounded-full transition flex items-center justify-center ${
                          isExpanded
                            ? "bg-lime-400 text-black"
                            : "bg-white/10 text-white/80 hover:bg-white/20"
                        }`}
                        aria-label="Toggle student details"
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {expandedStudent && (
        <div className="mt-6 hidden md:grid rounded-2xl border border-white/10 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-pink-500/10 p-5 grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Mail size={14} />
              Contact Information
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <div className="text-xs uppercase text-white/40">Email</div>
                <div className="text-white/90">
                  {expandedStudent.user?.email ?? "Not available"}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase text-white/40">Parent Contact</div>
                <div className="text-white/90">
                  {expandedStudent.phoneNo ?? "Not available"}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Phone size={14} />
              Performance & Actions
            </div>
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>Avg Marks</span>
              <span className="text-white/90">
                {formatPercent(expandedStudent.metrics.avgMarksPct)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>Attendance</span>
              <span className="text-white/90">
                {formatPercent(expandedStudent.metrics.attendancePct)}
              </span>
            </div>
            <button
              type="button"
              className="mt-auto w-full rounded-full border border-lime-400/30 bg-lime-400/15 px-4 py-2 text-sm font-semibold text-lime-300 hover:bg-lime-400/25 transition"
            >
              Message Parent
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 md:hidden space-y-3">
        {students.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/60 text-center">
            No students found.
          </div>
        ) : (
          students.map((student) => (
            <div
              key={student.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <button
                type="button"
                onClick={() => onToggleExpanded(student.id)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs font-semibold text-white">
                    {initials(student.user?.name)}
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {student.user?.name ?? "Unnamed Student"}
                    </div>
                    <div className="text-xs text-white/40">
                      Roll: {student.rollNo ?? student.admissionNumber ?? "--"}
                    </div>
                  </div>
                </div>
                {expandedId === student.id ? (
                  <ChevronUp size={18} className="text-white/70" />
                ) : (
                  <ChevronDown size={18} className="text-white/70" />
                )}
              </button>

              {expandedId === student.id && (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-xs text-white/50">Avg Marks</div>
                      <div className="text-white/90 font-semibold">
                        {formatPercent(student.metrics.avgMarksPct)}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-xs text-white/50">Attendance</div>
                      <div className="text-lime-300 font-semibold">
                        {formatPercent(student.metrics.attendancePct)}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-white/50">
                    Contact: {student.phoneNo ?? "Not available"}
                  </div>
                  <div className="text-xs text-white/50">
                    Email: {student.user?.email ?? "Not available"}
                  </div>

                  <button
                    type="button"
                    className="w-full rounded-full border border-lime-400/30 bg-lime-400/10 px-4 py-2 text-sm font-semibold text-lime-300 hover:bg-lime-400/20 transition"
                  >
                    Message
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

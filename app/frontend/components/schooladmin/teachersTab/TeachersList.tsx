"use client";

import { useState } from "react";
import { Eye, Pencil, Trash2, Search } from "lucide-react";
import ShowTeacher from "./ShowTeacher";

/* ================= Types ================= */

export interface TeacherRow {
  id: string;
  teacherId: string;
  name: string;
  avatar: string;
  subject: string;
  attendance: number;
  phone: string;
  status: "Active" | "On Leave";
}

interface Props {
  teachersLoading: boolean;
  filteredTeachers: TeacherRow[];
  pagedTeachers: TeacherRow[];
  attendanceDate: string;
  overallPct: number;
  presentCount: number;
  teachersCount: number;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
  onDelete: (id: string) => void;

  /* 🔥 NEW */
  onEditTeacher: (teacher: TeacherRow) => void;
}

/* ================= Component ================= */

export default function TeachersList({
  teachersLoading,
  filteredTeachers,
  pagedTeachers,
  attendanceDate,
  overallPct,
  presentCount,
  teachersCount,
  searchTerm,
  setSearchTerm,
  page,
  totalPages,
  setPage,
  onDelete,
  onEditTeacher,
}: Props) {
  const [viewTeacher, setViewTeacher] =
    useState<TeacherRow | null>(null);

  return (
    <div className="w-full min-w-0 overflow-hidden">

      {/* 🔎 Search */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search teachers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400"
          />
        </div>
      </div>

      {/* ===== Table ===== */}
      <div className="border-t border-white/10">
        <div className="w-full overflow-x-auto">
          <table className="min-w-[900px] w-full table-fixed text-sm">
            {/* Column widths */}
            <colgroup>
              <col className="w-[260px]" />
              <col className="w-[160px]" />
              <col className="w-[180px]" />
              <col className="w-[160px]" />
              <col className="w-[140px]" />
              <col className="w-[120px]" />
            </colgroup>

            <thead className="text-gray-400">
              <tr className="border-b border-white/10 text-left">
                <th className="px-6 py-4">Teacher</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4 text-center">Attendance</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {pagedTeachers.map((teacher) => (
                <tr
                  key={teacher.id}
                  className="border-t border-white/5 hover:bg-white/5"
                >
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img
                      src={teacher.avatar}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <p className="font-semibold text-white">
                        {teacher.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {teacher.teacherId}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4">{teacher.subject}</td>
                  <td className="px-6 py-4">{teacher.attendance}%</td>
                  <td className="px-6 py-4">{teacher.phone}</td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${
                          teacher.status === "Active"
                            ? "bg-lime-400/10 text-lime-400"
                            : "bg-orange-400/10 text-orange-400"
                        }`}
                    >
                      {teacher.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setViewTeacher(teacher)}
                        className="hover:text-lime-400"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditTeacher(teacher)}
                        className="hover:text-yellow-400"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(teacher.id)}
                        className="hover:text-red-400"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 👁 Show Modal */}
      {viewTeacher && (
        <ShowTeacher
          teacher={viewTeacher}
          onClose={() => setViewTeacher(null)}
          onEdit={(teacher) => {
            setViewTeacher(null);
            onEditTeacher(teacher);
          }}
        />
      )}
    </div>
  );
}

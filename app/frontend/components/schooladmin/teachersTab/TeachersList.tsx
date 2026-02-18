"use client";

import { Eye, Pencil, Trash2, Search } from "lucide-react";

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
}

/* ================= Status Badge ================= */

const StatusBadge = ({ status }: { status: TeacherRow["status"] }) => (
  <span
    className={`px-3 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap
    ${
      status === "Active"
        ? "bg-lime-400/10 text-lime-400 border-lime-400/20"
        : "bg-orange-400/10 text-orange-400 border-orange-400/20"
    }`}
  >
    {status.toUpperCase()}
  </span>
);

/* ================= Pagination ================= */

const Pagination = ({
  page,
  totalPages,
  setPage,
}: {
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
}) => (
  <div className="flex justify-end gap-2 p-4 border-t border-white/10">
    <button
      disabled={page === 1}
      onClick={() => setPage(page - 1)}
      className="px-3 py-1 bg-white/5 rounded-lg disabled:opacity-40"
    >
      Prev
    </button>

    <span className="px-3 py-1 text-sm text-gray-300">
      {page} / {totalPages}
    </span>

    <button
      disabled={page === totalPages}
      onClick={() => setPage(page + 1)}
      className="px-3 py-1 bg-white/5 rounded-lg disabled:opacity-40"
    >
      Next
    </button>
  </div>
);

/* ================= Main ================= */

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
}: Props) {
  return (
    <div className="w-full min-w-0 overflow-hidden">
      <div className="bg-white/[0.04] backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden">

        {/* ===== Header ===== */}
        <div className="px-6 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">
              All Teachers ({filteredTeachers.length})
            </h3>

            <p className="text-sm text-gray-400">
              Today: {attendanceDate} • Overall:
              <span className="text-lime-400 font-semibold ml-1">
                {overallPct}%
              </span>{" "}
              ({presentCount}/{teachersCount})
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search teachers..."
              className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-gray-200 focus:border-lime-400/50 outline-none"
            />
          </div>
        </div>

        {/* ===== Table ===== */}
        <div className="border-t border-white/10">
          <div className="w-full overflow-x-auto no-scrollbar">
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
                {teachersLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">
                      Loading teachers...
                    </td>
                  </tr>
                ) : pagedTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">
                      No teachers found
                    </td>
                  </tr>
                ) : (
                  pagedTeachers.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-white/5 hover:bg-white/5 transition"
                    >
                      {/* Teacher */}
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={t.avatar}
                            className="w-10 h-10 rounded-xl border border-white/10"
                          />
                          <div className="min-w-0">
                            <p className="text-white truncate">{t.name}</p>
                            <p className="text-xs text-gray-500">
                              {t.teacherId}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="px-6 py-4 align-middle text-white">
                        {t.subject}
                      </td>

                      {/* Attendance */}
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-lime-400"
                              style={{ width: `${t.attendance}%` }}
                            />
                          </div>
                          <span className="text-lime-400 font-bold">
                            {t.attendance}%
                          </span>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4 align-middle text-gray-400">
                        {t.phone}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 align-middle">
                        <StatusBadge status={t.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 align-middle text-right">
                        <div className="flex justify-end gap-3">
                          <Eye className="text-gray-400 hover:text-gray-300 cursor-pointer" size={18} />
                          <Pencil   className="text-lime-400 hover:text-lime-300 cursor-pointer"size={18} />
                          <button onClick={() => onDelete(t.id)}>
                            <Trash2  className="text-red-400 hover:text-red-300 cursor-pointer"size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </div>
      </div>
    </div>
  );
}

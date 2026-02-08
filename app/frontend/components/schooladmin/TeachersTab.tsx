"use client";

import PageHeader from "../common/PageHeader";
import {
    Plus,
    Upload,
    Download,
    UserCheck,
    Coffee,
    Clock,
    XCircle,
} from "lucide-react";
import DataTable from "../common/TableLayout";
import TeacherStatCard from "./teacherstab/teacherStatCard";

/* ================= Types ================= */

interface TeacherRow {
  teacherId: string;
  name: string;
  avatar: string;
  subject: string;
  attendance: number;
  phone: string;
  status: "Active" | "On Leave";
}

/* ================= Mobile Card Component ================= */

const MobileTeacherCard = ({ teacher, onEdit, onDelete }: { 
  teacher: TeacherRow; 
  onEdit: (t: TeacherRow) => void; 
  onDelete: (id: string) => void; 
}) => (
  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-5 space-y-4 shadow-xl">
    <div className="flex items-center gap-4">
      <img src={teacher.avatar} alt="" className="w-14 h-14 rounded-2xl border border-white/10 object-cover" />
      <div className="flex-1">
        <h4 className="font-bold text-gray-100 text-lg leading-tight">{teacher.name}</h4>
        <p className="text-xs text-gray-500 font-mono">{teacher.teacherId}</p>
        <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-[10px] font-bold border ${
            teacher.status === "Active" ? "bg-lime-400/10 text-lime-400 border-lime-400/20" : "bg-orange-400/10 text-orange-400 border-orange-400/20"
        }`}>
          {teacher.status.toUpperCase()}
        </span>
      </div>
    </div>

    <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Subject</p>
      <p className="text-gray-200 font-medium">{teacher.subject}</p>
    </div>

    <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex justify-between items-center">
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Attendance</p>
        <p className="text-lime-400 font-bold">{teacher.attendance}% Present</p>
      </div>
      <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-lime-400" style={{ width: `${teacher.attendance}%` }} />
      </div>
    </div>

    <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Phone</p>
      <p className="text-gray-200 font-medium">{teacher.phone}</p>
    </div>

    <div className="flex gap-2 pt-2">
      <button className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-gray-300 transition-colors">
        <Eye size={18} /> View
      </button>
      <button 
        onClick={() => onEdit(teacher)}
        className="flex-[1.5] bg-white/5 hover:bg-lime-400/10 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-lime-400 transition-colors border border-white/5"
      >
        <Pencil size={18} /> Edit
      </button>
      <button 
        onClick={() => onDelete(teacher.teacherId)}
        className="bg-red-500/10 hover:bg-red-500/20 p-3 rounded-xl text-red-400 transition-colors border border-red-500/20"
      >
        <Trash2 size={18} />
      </button>
    </div>
  </div>
);

/* ================= Main Component ================= */import StatCard from "../common/StatCard";


const SchoolAdminTeacherTab = () => {
    return (
        <div className="p-4 sm:p-6 space-y-6">

            {/* ===== Header ===== */}
            <PageHeader
                title="Teachers"
                subtitle="Overview of teaching staff, attendance, and assignments"
                transparent
                rightSlot={
                    <div className="flex flex-wrap items-center gap-3">
                        <button className="px-4 py-2 rounded-xl text-sm flex items-center gap-2 bg-lime-400 hover:bg-lime-500 text-black shadow-[0_0_15px_rgba(163,230,53,0.3)]">
                            <Plus size={16} />
                            Add Teacher
                        </button>

                        <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm flex items-center gap-2 text-gray-300">
                            <Upload size={16} />
                            Upload CSV
                        </button>

                        <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm flex items-center gap-2 text-gray-300">
                            <Download size={16} />
                            Report
                        </button>
                    </div>
                }
            />

            {/* ===== Stats Cards ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* Total Present */}
                <StatCard
                    title="Total Present"
                    value={
                        <>
                            2 <span className="text-sm text-lime-400">/ 4</span>
                        </>
                    }
                    icon={<UserCheck size={70} className="text-white/30" />}
                    iconVariant="plain"
                >
                    <div className="mt-4">
                        <div className="h-2 w-full bg-white/20 rounded-full">
                            <div className="h-2 w-1/2 bg-lime-400 rounded-full" />
                        </div>
                    </div>
                </StatCard>

                {/* On Leave */}
                <StatCard
                    title="On Leave"
                    value={
                        <>
                            1 <span className="text-yellow-400 text-sm">Teachers</span>
                        </>
                    }
                    icon={<Coffee size={70} className="text-white/30" />}
                    iconVariant="plain"
                    footer="Planned leaves for today"
                />

                {/* Late Arrival */}
                <StatCard
                    title="Late Arrival"
                    value={
                        <>
                            1 <span className="text-sky-400 text-sm">Teachers</span>
                        </>
                    }
                    icon={<Clock size={70} className="text-white/30" />}
                    iconVariant="plain"
                    footer="Check-in after 8:30 AM"
                />

                {/* Absent */}
                <StatCard
                    title="Absent"
                    value={
                        <>
                            0 <span className="text-red-400 text-sm">Unplanned</span>
                        </>
                    }
                    icon={<XCircle size={70} className="text-white/30" />}
                    iconVariant="plain"
                    footer="Requires verification"
                />

            </div>
            <TeacherStatCard
                avatar="https://randomuser.me/api/portraits/women/44.jpg"
                name="Mrs. Priyanka"
                code="TCH001"
                percentage={98}
                stats={[
                    { label: "PRES", value: 145, color: "text-lime-400" },
                    { label: "ABS", value: 1, color: "text-red-400" },
                    { label: "LATE", value: 2, color: "text-sky-400" },
                    { label: "LEAVE", value: 0, color: "text-yellow-400" },
                ]}
                statuses={[
                    { label: "P", active: true },
                    { label: "A" },
                    { label: "L" },
                    { label: "OL" },
                ]}
            />

        </div>
    );
};

export default SchoolAdminTeacherTab;

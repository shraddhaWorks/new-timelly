"use client";

import { useState, useMemo } from "react";
import { 
  Eye, Pencil, Trash2, Download, UserCheck, 
  Coffee, Clock, XCircle, Search, Save, Calendar 
} from "lucide-react";
import PageHeader from "../common/PageHeader";
import StatCard from "../common/statCard";
import DataTable from "../common/TableLayout";
import TeacherStatCard from "./teachersTab/teacherStatCard";
import AppointTeacher from "./teachersTab/AppointTeacher";

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

/* ================= Main Component ================= */

const SchoolAdminTeacherTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [teachers, setTeachers] = useState<TeacherRow[]>([
    {
      teacherId: "TCH001",
      name: "Mrs. Priya Sharma",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      subject: "Mathematics",
      attendance: 98,
      phone: "+91 98765 43210",
      status: "Active",
    },
    {
      teacherId: "TCH002",
      name: "Mr. Rajesh Kumar",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      subject: "Physics",
      attendance: 95,
      phone: "+91 98765 43211",
      status: "Active",
    },
    {
      teacherId: "TCH003",
      name: "Mrs. Anita Desai",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      subject: "English",
      attendance: 88,
      phone: "+91 98765 43212",
      status: "Active",
    },
    {
      teacherId: "TCH004",
      name: "Mr. Amit Shah",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      subject: "Science",
      attendance: 92,
      phone: "+91 98765 43213",
      status: "On Leave",
    },
  ]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.teacherId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, teachers]);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this teacher?")) {
      setTeachers(prev => prev.filter(t => t.teacherId !== id));
    }
  };

  const teacherColumns = [
    { key: "teacherId", header: "TEACHER ID" },
    { 
      key: "name", 
      header: "NAME",
      render: (row: TeacherRow) => (
        <div className="flex items-center gap-3">
          <img src={row.avatar} alt="" className="w-10 h-10 rounded-xl border border-white/10" />
          <span className="font-medium">{row.name}</span>
        </div>
      )
    },
    { key: "subject", header: "SUBJECT" },
    {
      key: "attendance",
      header: "ATTENDANCE",
      render: (row: TeacherRow) => (
        <div className="flex items-center gap-3 min-w-[120px]">
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.5)]" style={{ width: `${row.attendance}%` }} />
          </div>
          <span className="text-lime-400 font-bold text-sm">{row.attendance}%</span>
        </div>
      ),
    },
    { key: "phone", header: "PHONE" },
    {
      key: "status",
      header: "STATUS",
      render: (row: TeacherRow) => (
        <span className={`px-4 py-1 rounded-full text-[10px] font-bold border ${
            row.status === "Active" ? "bg-lime-400/10 text-lime-400 border-lime-400/20" : "bg-orange-400/10 text-orange-400 border-orange-400/20"
        }`}>
          {row.status.toUpperCase()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "ACTIONS",
      render: (row: TeacherRow) => (
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-gray-400 hover:text-white transition-colors"><Eye size={18} /></button>
          <button className="p-1.5 text-gray-400 hover:text-lime-400 transition-colors"><Pencil size={18} /></button>
          <button onClick={() => handleDelete(row.teacherId)} className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-8 bg-transparent min-h-screen">
      
      <PageHeader
        title="Teachers"
        subtitle="Overview of teaching staff, attendance, and assignments"
        transparent
        rightSlot={
          <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-sm font-medium transition-all text-gray-300">
            <Download size={16} /> Report
          </button>
        }
      />

      {/* ===== Stats Cards ===== */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                title="Total Present"
                value={<>2 <span className="text-sm text-lime-400">/ 4</span></>}
                icon={<UserCheck size={70} className="text-white/30" />}
                iconVariant="plain"
                 progress={50}
/>
              <StatCard
                title="On Leave"
                value={<>1 <span className="text-yellow-400 text-sm">Teacher</span></>}
                icon={<Coffee size={70} className="text-white/30" />}
                iconVariant="plain"
/>
              <StatCard
                title="Late Arrival"
                value={<>1 <span className="text-sky-400 text-sm">Teacher</span></>}
                icon={<Clock size={70} className="text-white/30" />}
                iconVariant="plain"
            />
              <StatCard
                title="Absent"
                value={<>0 <span className="text-red-400 text-sm">Unplanned</span></>}
                icon={<XCircle size={70} className="text-white/30" />}
                iconVariant="plain"
              />
            </div>
     
      {/* Attendance Card */}
       <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 overflow-hidden">

        <div className="p-4 md:p-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
              <Calendar size={18} />
              Mark Daily Attendance
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Record presence for today
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              className="px-3 py-1.5 bg-black/30 border border-white/10 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-lime-400/50"
            />
            <button className="px-3 py-1.5 bg-lime-400/10 hover:bg-lime-400/20 text-lime-400 border border-lime-400/20 rounded-lg text-xs font-semibold flex items-center gap-2">
              Mark All Present
            </button>
          </div>
        </div>

        <div className="p-4 md:p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
        </div>

        <div className="mt-6 flex justify-end pt-4 border-t border-white/5 px-4 pb-4">
          <button className="px-6 py-2.5 bg-lime-400 hover:bg-lime-500 text-black font-bold rounded-xl shadow-[0_0_15px_rgba(163,230,53,0.3)] flex items-center gap-2">
            <Save size={18} />
            Save Today’s Attendance
          </button>
        </div>

      </div>

      {/* Main Table & Mobile Card Section */}
      <div className="relative space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-xl font-bold">All Teachers ({filteredTeachers.length})</h3>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search list..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm focus:border-lime-400/50 outline-none transition-all"
            />
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block rounded-[1rem] backdrop-blur-2xl overflow-hidden">
          <DataTable
            title=""
            columns={teacherColumns}
            data={filteredTeachers}
            emptyText="No teachers matching your search."
          />
        </div>

        {/* Mobile View */}
        <div className="md:hidden grid grid-cols-1 gap-6">
          {filteredTeachers.map(teacher => (
            <MobileTeacherCard 
              key={teacher.teacherId} 
              teacher={teacher} 
              onEdit={(t) => alert(`Edit ${t.name}`)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button className="bg-lime-400 hover:bg-lime-500 text-black px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-lime-400/20">
          <Save size={20} /> Save Changes
        </button>
      </div>
      <AppointTeacher />
    </div>
  );
};
export default SchoolAdminTeacherTab;
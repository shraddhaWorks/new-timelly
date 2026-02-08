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
import StatCard from "../common/statCard";
import TeacherStatCard from "./teacherstab/teacherStatCard";


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
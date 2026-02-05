import PageHeader from "../common/PageHeader";
import StatCard from "@/components/statCard";
import { Users, School, GraduationCap } from "lucide-react";

export default function Dashboard() {
    return (
        <main className="flex-1 overflow-y-auto px-3 sm:px-4">
            <div className="py-4 sm:p-6 bg-transparent min-h-screen space-y-6">

                {/* ================= HEADER ================= */}
                <PageHeader
                    title="Superadmin Dashboard"
                    subtitle="Manage everything from here"
                    rightSlot={
                        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-3">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full sm:w-56 bg-[#2d2d2d] text-white px-3 py-2 rounded-lg focus:outline-none"
                            />
                            <button className="w-full sm:w-auto bg-[#404040] text-white px-4 py-2 rounded-lg">
                                Add Admin
                            </button>
                        </div>
                    }
                />

                {/* ================= STATS + FEE TRANSACTIONS ================= */}
                <div className="flex flex-col lg:flex-row gap-[10px]">

                    {/* LEFT STATS */}
                    <div className="flex flex-col gap-[10px] w-full lg:w-1/2">
                        <StatCard
                            title="Total Schools"
                            value={128}
                            icon={<School size={24} />}
                            footer="Active institutions"
                        />

                        <StatCard
                            title="Total Students"
                            value="24,560"
                            icon={<Users size={24} />}
                            footer="+12% this month" className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 md:p-5 shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-1 transition-all duration-300 border border-white/10 group"
                        />
                        <StatCard
                            title="Fee Transactions"
                            className="w-full  "
                        >
                            {/* Table Wrapper */}
                            <div className="border border-white/10 rounded-xl overflow-hidden w-full" style={{width: '100%'}}>

                                {/* Table Header */}
                                <div className="grid grid-cols-2 px-4 py-3 text-sm font-semibold text-white/80">
                                    <div>Sl. No</div>
                                    <div>Schools</div>
                                </div>

                                {/* Table Row */}
                                <div className="grid grid-cols-2 items-center px-4 py-4 border-t border-white/10 text-sm">
                                    <div className="text-white">0</div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/20" />
                                        <span className="text-white font-medium">sse</span>
                                    </div>
                                </div>

                            </div>
                        </StatCard>

                    </div>

                    <StatCard
                        title="Fee Transactions"
                        className="w-full lg:w-1/2"
                    >
                        {/* Table Container */}
                        <div className="rounded-xl border border-white/10 overflow-hidden bg-white/5">

                            {/* Table Header */}
                            <div className="grid grid-cols-2 px-4 py-3 text-sm font-semibold text-white/80">
                                <div>Sl. No</div>
                                <div>Schools</div>
                            </div>

                            {/* Table Row */}
                            <div className="grid grid-cols-2 items-center px-4 py-4 border-t border-white/10 text-sm">
                                <div className="text-white">0</div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/20" />
                                    <span className="text-white font-medium">sse</span>
                                </div>
                            </div>

                        </div>
                    </StatCard>

                </div>

            </div>
        </main>
    );
}

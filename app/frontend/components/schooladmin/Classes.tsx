"use client";
import PageHeader from "../common/PageHeader";
import { AlertTriangle, BookOpen, ChevronDown, Download, Plus, Upload, User, Users } from "lucide-react";
import { useState } from "react";
import AddClassPanel from "./classes-panels/AddClassPanel";
import AddSectionPanel from "./classes-panels/AddSectionPanel";
import UploadCsvPanel from "./classes-panels/UploadCsvPanel";
import StatCard from "./StatCard";

export default function SchoolAdminClassesTab() {
  const [activeAction, setActiveAction] = useState<"none" | "class" | "section" | "csv">("none");
  const handleReportClick = () => {
    window.alert("Downloading Classes Report...");
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 text-white overflow-x-hidden">
      <div className="pt-0 bg-transparent min-h-screen space-y-6">

        {/* ================= HEADER ================= */}
        <PageHeader
          title="Classes Management"
          subtitle="Manage all classes, sections, and class teachers"
          rightSlot={
            <div className="flex w-full lg:w-auto justify-start lg:justify-end">
              <div className="flex w-full flex-wrap items-center gap-2 px-2 sm:px-3 py-2 overflow-x-auto sm:overflow-visible whitespace-nowrap">
                <button
                  onClick={() => setActiveAction("class")}
                  className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-3 py-2 text-sm font-semibold text-black shadow-[0_6px_18px_rgba(163,230,53,0.35)] transition hover:bg-lime-300 shrink-0"
                >
                  <ChevronDown size={16} />
                  <span className={activeAction === "class" ? "inline" : "hidden sm:inline"}>Add Class</span>
                </button>
                <button
                  onClick={() => setActiveAction("section")}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/20 shrink-0"
                >
                  <Plus size={16} />
                  <span className={activeAction === "section" ? "inline" : "hidden sm:inline"}>Add Section</span>
                </button>
                <button
                  onClick={() => setActiveAction("csv")}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/20 shrink-0"
                >
                  <Upload size={16} />
                  <span className={activeAction === "csv" ? "inline" : "hidden sm:inline"}>Upload CSV</span>
                </button>
                <button
                  onClick={handleReportClick}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/20 shrink-0"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Report</span>
                </button>
              </div>
            </div>
          }
        />

        {activeAction === "class" && <AddClassPanel />}
        {activeAction === "section" && <AddSectionPanel />}
        {activeAction === "csv" && <UploadCsvPanel />}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={<BookOpen size={18} />} label="Total Classes" value="6" />
          <StatCard icon={<Users size={18} />} label="Total Students" value="268" />
          <StatCard icon={<AlertTriangle size={18} />} label="Avg Size" value="45" />
          <StatCard icon={<User size={18} />} label="Teachers" value="6" />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-b border-white/10">
            <div className="text-white font-semibold">All Classes</div>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
              <span className="text-white/40">Search classes...</span>
            </div>
          </div>

          <div className="hidden md:grid grid-cols-[1.2fr_1fr_0.7fr_1.4fr_0.6fr] gap-3 px-6 py-3 text-[11px] uppercase tracking-wide text-white/50">
            <div>Class Name</div>
            <div>Section</div>
            <div>Students</div>
            <div>Class Teacher</div>
            <div>Actions</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_0.7fr_1.4fr_0.6fr] gap-3 px-6 py-4 text-sm text-white/80 border-t border-white/10">
            <div className="font-medium text-white">Class 10</div>
            <div>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs">Section A</span>
            </div>
            <div className="md:text-center text-white">45</div>
            <div>
              <div className="font-semibold text-white">Mrs. Priya Sharma</div>
              <div className="text-xs text-white/50">Mathematics</div>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <span className="text-xs">•••</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

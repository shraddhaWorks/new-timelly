"use client";

import { useEffect, useState } from "react";
import PageHeader from "../../common/PageHeader";
import { Plus, Calendar as CalendarIcon, Search } from "lucide-react";
import ExamCard from "./examComponents/ExamCard";
import ScheduleExamView from "./examComponents/ScheduleExamView";
import ExamDetailsView from "./examComponents/ExamDetailsView";

type ViewState =
    | { mode: "list" }
    | { mode: "create" }
    | { mode: "edit"; examId: string }
    | { mode: "view"; examId: string };

export default function TeacherExamsTab() {
    const [view, setView] = useState<ViewState>({ mode: "list" });
    const [exams, setExams] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadExams();
    }, []);

    async function loadExams() {
        setLoading(true);
        const res = await fetch("/api/exams/terms");
        const data = await res.json();
        setExams(data.terms || []);
        setLoading(false);
    }

    if (view.mode === "create") {
        return (
            <ScheduleExamView
                mode="create"
                onCancel={() => setView({ mode: "list" })}
                onSaved={() => {
                    loadExams();
                    setView({ mode: "list" });
                }}
            />
        );
    }

    if (view.mode === "edit") {
        return (
            <ScheduleExamView
                mode="edit"
                examId={view.examId}
                onCancel={() => setView({ mode: "list" })}
                onSaved={() => {
                    loadExams();
                    setView({ mode: "list" });
                }}
            />
        );
    }

    if (view.mode === "view") {
        return (
            <ExamDetailsView
                examId={view.examId}
                onBack={() => setView({ mode: "list" })}
                onEdit={() => setView({ mode: "edit", examId: view.examId })}
            />
        );
    }

    const filtered = exams.filter((e) =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${e.class.name}-${e.class.section}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen text-white px-6 py-4">
            <PageHeader
                title="Exams & Syllabus"
                subtitle="Manage schedules and track syllabus coverage"
                icon={<CalendarIcon className="text-[#b4ff39]" />}
                rightSlot={
                    <button
                        onClick={() => setView({ mode: "create" })}
                        className="bg-[#b4ff39] text-black px-6 py-3 rounded-2xl font-bold flex items-center gap-2"
                    >
                        <Plus size={20} /> Schedule Exam
                    </button>
                }
            />

            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                    placeholder="Search exams by class or subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 py-4 rounded-2xl bg-white/5 border border-white/10"
                />
            </div>

            {loading ? (
                <p className="text-white/40">Loading exams…</p>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((exam) => (
                        <ExamCard
                            key={exam.id}
                            exam={exam}
                            onView={() => setView({ mode: "view", examId: exam.id })}
                            onEdit={() => setView({ mode: "edit", examId: exam.id })}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import PageHeader from "../../common/PageHeader";
import { Plus, Calendar as CalendarIcon, Search, BookOpen } from "lucide-react";
import ExamCard from "./examComponents/ExamCard";
import ScheduleExamView from "./examComponents/ScheduleExamView";
import ExamDetailsView from "./examComponents/ExamDetailsView";
import Spinner from "../../common/Spinner";

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
        try {
            const res = await fetch("/api/exams/terms", { cache: "no-store", credentials: "include" });
            const data = await res.json();
            if (!res.ok) {
                setExams([]);
                return;
            }
            // Teacher API returns data.exams (flattened list of schedules from DB)
            if (data.exams && Array.isArray(data.exams)) {
                setExams(data.exams);
            } else {
                setExams([]);
            }
        } catch (error) {
            console.error("Failed to load exams:", error);
            setExams([]);
        } finally {
            setLoading(false);
        }
    }

    // Navigation Render Logic
    if (view.mode === "create") {
        return (
            <ScheduleExamView
                mode="create"
                onCancel={() => setView({ mode: "list" })}
                onSave={() => {
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
                onSave={() => {
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

    const filtered = exams.filter((e) => {
        const name = (e.name || "").toLowerCase();
        const classStr = e.class ? `${e.class.name || ""}-${e.class.section || ""}`.toLowerCase() : "";
        const subject = (e.subject || "").toLowerCase();
        const q = searchQuery.toLowerCase().trim();
        return name.includes(q) || classStr.includes(q) || subject.includes(q);
    });

    return (
        <div className="min-h-screen space-y-6 px-1 md:px-0 animate-in fade-in duration-500">
            {/* ENHANCED PAGE HEADER */}
            <PageHeader
                title="Exams & Syllabus"
                subtitle="Manage schedules and track syllabus coverage"
                icon={<BookOpen className="text-[#b4ff39] w-8 h-8" strokeWidth={2.5} />}
                rightSlot={
                    <button
                        onClick={() => setView({ mode: "create" })}
                        className="bg-[#b4ff39] text-black px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-lime-500/20"
                    >
                        <Plus size={18} strokeWidth={3} /> Schedule Exam
                    </button>
                }
            />

            {/* REFINED SEARCH BAR SECTION */}
            <div className="relative mb-8  px-6 py-4 rounded-2xl  border border-white/10">

                <Search className="absolute h-4 w-6 left-10 top-1/2 -translate-y-1/2 text-white/50" />

                <input

                    placeholder="    Search exams by class or subject..."

                    value={searchQuery}

                    onChange={(e) => setSearchQuery(e.target.value)}

                    className="w-full pl-6 py-2 rounded-3xl bg-black/10 border border-lime-500/50 focus:outline-none "

                />

            </div>  

            {/* EXAM CARDS GRID */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Spinner/>
                    
                </div>
            ) : (
                <>
                    {filtered.length === 0 ? (
                        <div className="rounded-[32px] border border-white/10 bg-white/5 p-20 text-center">
                            <p className="text-white/40">No exams found matching your search.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filtered.map((exam) => (
                                <ExamCard
                                    key={exam.id}
                                    exam={exam}
                                    onView={() => setView({ mode: "view", examId: exam.id })}
                                    onEdit={() => setView({ mode: "edit", examId: exam.id })}
                                    onDelete={() => {
                                        if(confirm("Are you sure you want to delete this exam?")) {
                                            // Add your delete API logic here
                                            console.log("Delete exam", exam.id);
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
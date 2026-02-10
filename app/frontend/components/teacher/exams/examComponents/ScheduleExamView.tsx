"use client";
import { useEffect, useState } from "react";
import { X, ChevronLeft, Plus, BookOpen, CheckCircle2, Trash2, Save, Calendar, Clock } from "lucide-react";
import PageHeader from "../../../common/PageHeader";

export default function ScheduleExamView({
    mode = "create",
    examId,
    onCancel,
    onSave,
}: any) {
    const [units, setUnits] = useState([
        { id: 1, name: "", status: "Pending", completion: 0 },
        { id: 2, name: "", status: "Pending", completion: 0 },
    ]);

    const addUnit = () => setUnits([...units, { id: Date.now(), name: "", status: "Pending", completion: 0 }]);
    const removeUnit = (id: number) => setUnits(units.filter(u => u.id !== id));

    const isEdit = mode === "edit";

    useEffect(() => {
        if (!isEdit || !examId) return;

        fetch(`/api/exams/terms/${examId}`)
            .then(res => res.json())
            .then(data => {
                // If you have exam form state, set it here
                // setForm(data.term);

                // Populate syllabus units
                setUnits(
                    data.term.syllabus.flatMap((s: any) =>
                        s.units.map((u: any) => ({
                            id: u.id,
                            name: u.name,
                            status: u.status ?? "Pending",
                            completion: u.completion ?? 0,
                        }))
                    )
                );
            });
    }, [isEdit, examId]);


    return (
        <>
            <PageHeader
                title="Exams"
                subtitle="Manage schedules and track syllabus coverage"

            />
            <form className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT COLUMN: Exam Details */}
                <div className="lg:col-span-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 flex flex-col gap-6 h-fit">
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="text-[#b4ff39]" size={24} />
                        <h2 className="text-xl font-bold">Exam Details</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Exam Title</label>
                            <input placeholder="e.g. Term 1 Finals" className="bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-[#b4ff39] outline-none" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Class</label>
                                <input placeholder="e.g. 10-A" className="bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-[#b4ff39] outline-none" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Subject</label>
                                <input placeholder="Mathematics" className="bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-[#b4ff39] outline-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2 relative">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Date</label>
                                <input type="text" placeholder="dd-mm-yy" className="bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-[#b4ff39] outline-none" />
                                <Calendar className="absolute right-4 bottom-4 text-white/40" size={18} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Status</label>
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white/60">Draft</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2 relative">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Time</label>
                                <input type="text" placeholder="--:--" className="bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-[#b4ff39] outline-none" />
                                <Clock className="absolute right-4 bottom-4 text-white/40" size={18} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Duration</label>
                                <input placeholder="e.g. 2 hrs" className="bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-[#b4ff39] outline-none" />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button type="button" onClick={onCancel} className="flex-1 bg-white/5 border border-white/10 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                            <X size={20} /> Cancel
                        </button>
                        <button type="submit" className="flex-[1.5] bg-[#b4ff39] text-black py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(180,255,57,0.3)]">
                            <Save size={20} /> Save Exam
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: Syllabus */}
                <div className="lg:col-span-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] flex flex-col overflow-hidden">
                    <div className="p-8 border-b border-white/10 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="text-[#b4ff39]" size={24} />
                            <h2 className="text-xl font-bold">Syllabus & Coverage</h2>
                        </div>
                        <button type="button" onClick={addUnit} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[#b4ff39] text-xs font-bold flex items-center gap-2">
                            <Plus size={16} /> Add Unit
                        </button>
                    </div>

                    <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
                        {units.map((unit, idx) => (
                            <div key={unit.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 relative group">
                                <div className="flex gap-6">
                                    {/* Number Circle */}
                                    <div className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center text-white/30 font-bold shrink-0">
                                        {idx + 1}
                                    </div>

                                    {/* Unit Content */}
                                    <div className="flex-1 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <input
                                                placeholder="Unit / Topic Name"
                                                className="bg-transparent text-xl font-semibold text-white/40 w-full outline-none focus:text-white"
                                            />
                                            <button onClick={() => removeUnit(unit.id)} className="text-white/20 hover:text-red-400">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            {/* Status Toggles */}
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Status</label>
                                                <div className="flex gap-2">
                                                    <button type="button" className="px-4 py-2 rounded-lg bg-[#ff6b6b] text-white text-xs font-bold">Pending</button>
                                                    <button type="button" className="px-4 py-2 rounded-lg bg-white/5 text-white/40 text-xs font-bold">Partial</button>
                                                    <button type="button" className="px-4 py-2 rounded-lg bg-white/5 text-white/40 text-xs font-bold">Completed</button>
                                                </div>
                                            </div>

                                            {/* Completion Slider */}
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Completion %</label>
                                                    <span className="text-sm font-black text-white">{unit.completion}%</span>
                                                </div>
                                                <div className="relative pt-2">
                                                    <div className="h-1 w-full bg-white/10 rounded-full">
                                                        <div className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-[#b4ff39] border-4 border-[#0f0a1e] rounded-full shadow-[0_0_10px_#b4ff39]" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </form>
        </>
    );
}
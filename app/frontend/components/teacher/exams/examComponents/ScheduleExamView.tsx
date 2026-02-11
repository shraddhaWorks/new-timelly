"use client";
import { useState, useEffect } from "react";
import { X, Plus, BookOpen, CheckCircle2, Trash2, Save } from "lucide-react";
import PageHeader from "../../../common/PageHeader";

interface ClassItem {
  id: string;
  name: string;
  section: string | null;
}

export default function ScheduleExamView({
    mode = "create",
    examId,
    onCancel,
    onSave,
}: any) {
    const [units, setUnits] = useState<Array<{ id: number; unitId?: string; name: string; status: string; completion: number }>>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [classLoading, setClassLoading] = useState(true);
    const [selectedClassId, setSelectedClassId] = useState("");
    const today = new Date().toISOString().slice(0, 10);
    const [examDate, setExamDate] = useState(today);
    const [startTime, setStartTime] = useState("09:00");
    const [durationMin, setDurationMin] = useState(180);
    const [examStatus, setExamStatus] = useState<"UPCOMING" | "COMPLETED">("UPCOMING");
    const [examTitle, setExamTitle] = useState("");
    const [subject, setSubject] = useState("");
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [editTermId, setEditTermId] = useState<string | null>(null);
    const [examLoading, setExamLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setClassLoading(true);
            try {
                const res = await fetch("/api/class/list", { credentials: "include" });
                const data = await res.json();
                if (cancelled) return;
                if (res.ok && data.classes && Array.isArray(data.classes)) {
                    setClasses(data.classes);
                    if (data.classes.length > 0 && !selectedClassId) {
                        setSelectedClassId((prev) => prev || data.classes[0].id);
                    }
                }
            } finally {
                if (!cancelled) setClassLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (mode !== "edit" || !examId) return;
        let cancelled = false;
        setExamLoading(true);
        (async () => {
            try {
                const res = await fetch(`/api/exams/schedules/${examId}`, { credentials: "include" });
                const data = await res.json();
                if (cancelled) return;
                if (res.ok && data.exam) {
                    const ex = data.exam;
                    setExamTitle(ex.name ?? "");
                    setSubject(ex.subject ?? "");
                    setExamStatus((ex.status === "COMPLETED" ? "COMPLETED" : "UPCOMING") as "UPCOMING" | "COMPLETED");
                    setExamDate(ex.date ?? today);
                    setStartTime(ex.time?.slice(0, 5) ?? "09:00");
                    setDurationMin(ex.durationMin ?? 180);
                    setSelectedClassId(ex.classId ?? ex.class?.id ?? "");
                    setEditTermId(ex.termId ?? null);
                    const syllabus = ex.syllabus ?? [];
                    setUnits(
                        syllabus.length > 0
                            ? syllabus.map((u: { id?: string; subject?: string; completedPercent?: number }, i: number) => ({
                                  id: i + 1,
                                  unitId: u.id,
                                  name: u.subject ?? "",
                                  status: (u.completedPercent ?? 0) === 100 ? "Completed" : (u.completedPercent ?? 0) > 0 ? "Partial" : "Pending",
                                  completion: u.completedPercent ?? 0,
                              }))
                            : []
                    );
                }
            } finally {
                if (!cancelled) setExamLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [mode, examId]);

    const addUnit = () => setUnits([...units, { id: units.length ? Math.max(...units.map((u) => u.id), 0) + 1 : 1, name: "", status: "Pending", completion: 0 }]);
    const removeUnit = (id: number) => setUnits(units.filter(u => u.id !== id));

    const isEdit = mode === "edit";

    async function saveSyllabusUnits(termId: string, subj: string) {
        const opts = { credentials: "include" as const, headers: { "Content-Type": "application/json" } };
        await fetch(`/api/exams/terms/${termId}/syllabus`, {
            method: "POST",
            ...opts,
            body: JSON.stringify({ subject: subj }),
        });
        for (let i = 0; i < units.length; i++) {
            const u = units[i];
            const unitName = (u.name || "").trim() || "Unit " + (i + 1);
            await fetch(`/api/exams/terms/${termId}/syllabus/units`, {
                method: "POST",
                ...opts,
                body: JSON.stringify({
                    subject: subj,
                    unitName,
                    order: i,
                    completedPercent: u.completion,
                }),
            });
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitError(null);
        const title = examTitle.trim();
        const subj = subject.trim();
        if (!title) {
            setSubmitError("Exam title is required.");
            return;
        }
        if (!selectedClassId) {
            setSubmitError("Please select a class.");
            return;
        }
        if (!subj) {
            setSubmitError("Subject is required.");
            return;
        }
        const duration = durationMin > 0 ? durationMin : 60;
        setSubmitLoading(true);
        try {
            if (isEdit && editTermId && examId) {
                const termRes = await fetch(`/api/exams/terms/${editTermId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ name: title, status: examStatus }),
                });
                const termData = await termRes.json();
                if (!termRes.ok) throw new Error(termData.message || "Failed to update exam term");

                const scheduleRes = await fetch(`/api/exams/schedules/${examId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        subject: subj,
                        examDate,
                        startTime,
                        durationMin: duration,
                    }),
                });
                const scheduleData = await scheduleRes.json();
                if (!scheduleRes.ok) throw new Error(scheduleData.message || "Failed to update schedule");

                for (const u of units) {
                    if (u.unitId) {
                        await fetch(`/api/exams/units/${u.unitId}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ completedPercent: u.completion }),
                        });
                    }
                }
                const newUnits = units.filter((u) => !u.unitId && (u.name?.trim() || u.completion > 0));
                if (newUnits.length > 0) {
                    const opts = { credentials: "include" as const, headers: { "Content-Type": "application/json" } };
                    await fetch(`/api/exams/terms/${editTermId}/syllabus`, {
                        method: "POST",
                        ...opts,
                        body: JSON.stringify({ subject: subj }),
                    });
                    await Promise.all(
                        newUnits.map((u, idx) =>
                            fetch(`/api/exams/terms/${editTermId}/syllabus/units`, {
                                method: "POST",
                                ...opts,
                                body: JSON.stringify({
                                    subject: subj,
                                    unitName: (u.name || "").trim() || "Unit " + (idx + 1),
                                    order: units.indexOf(u),
                                    completedPercent: u.completion,
                                }),
                            })
                        )
                    );
                }
                onSave?.();
                return;
            }

            const termRes = await fetch("/api/exams/terms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    name: title,
                    classId: selectedClassId,
                    status: examStatus,
                }),
            });
            const termData = await termRes.json();
            if (!termRes.ok) {
                throw new Error(termData.message || "Failed to create exam term");
            }
            const termId = termData.term?.id;
            if (!termId) {
                throw new Error("Invalid response from server");
            }
            const scheduleRes = await fetch(`/api/exams/terms/${termId}/schedule`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    subject: subj,
                    examDate: examDate,
                    startTime: startTime,
                    durationMin: duration,
                }),
            });
            const scheduleData = await scheduleRes.json();
            if (!scheduleRes.ok) {
                throw new Error(scheduleData.message || "Failed to add exam schedule");
            }
            if (units.length > 0) {
                await saveSyllabusUnits(termId, subj);
            }
            onSave?.();
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        } finally {
            setSubmitLoading(false);
        }
    }

    if (isEdit && examLoading) {
        return (
            <div className="min-h-screen text-white pb-10 flex flex-col items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#b4ff39]" />
                <p className="text-white/60 text-sm uppercase tracking-wider">Loading exam...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white pb-10">
            <PageHeader
                title={isEdit ? "Edit Exam" : "Schedule Exam"}
                subtitle="Manage schedules and track syllabus coverage"
            />

            <form className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 px-4" onSubmit={handleSubmit}>

                {/* LEFT COLUMN: Exam Details Card */}
              <div className="lg:col-span-4 flex flex-col gap-6">
    {/* EXAM DETAILS CONTAINER */}
    <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 rounded-[1rem] p-8 flex flex-col gap-8 h-fit ">
        <div className="flex items-center gap-3">
            <BookOpen className="text-lime-400" size={22} />
            <h2 className="text-xl font-semibold text-white">Exam Details</h2>
        </div>

        <div className="space-y-3">
            {/* Exam Title */}
            <div className="flex flex-col gap-2">
                <label className="text-[12px] text-white/50 uppercase ">Exam Title</label>
                <input 
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    placeholder="Term 1 Mathematics Finals" 
                    className="bg-[#2a213a]/50 border border-white/5 rounded-2xl p-2 text-white/80 focus:border-[#b4ff39]/50 focus:bg-[#2a213a] outline-none transition-all placeholder:text-white" 
                />
            </div>

            {/* Class and Subject */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px]  text-white/30 uppercase tracking-[0.1em]">Class</label>
                    {classLoading ? (
                        <div className="bg-[#2a213a]/50 border border-white/5 rounded-2xl p-2 text-white/40 text-sm">Loading classes...</div>
                    ) : (
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="bg-[#2a213a]/50 border border-white/5 rounded-2xl p-2 text-white/80 focus:border-[#b4ff39]/50 outline-none placeholder:text-white/20"
                        >
                            <option value="">Select class</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}{c.section ? `-${c.section}` : ""}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Subject</label>
                    <input 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Mathematics" 
                        className="bg-[#2a213a]/50 border border-white/5 rounded-2xl p-2 text-white/80 focus:border-[#b4ff39]/50 outline-none placeholder:text-white/20" 
                    />
                </div>
            </div>

            {/* Date and Status */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Date</label>
                    <input
                        type="date"
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        className="w-full bg-[#2a213a]/50 border border-white/5 rounded-2xl py-2.5 px-3 text-white/90 outline-none focus:border-[#b4ff39]/50 [color-scheme:dark]"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Status</label>
                    <select
                        value={examStatus}
                        onChange={(e) => setExamStatus(e.target.value as "UPCOMING" | "COMPLETED")}
                        className="w-full bg-[#2a213a]/50 border border-white/5 rounded-2xl py-2.5 px-3 text-white/90 outline-none focus:border-[#b4ff39]/50"
                    >
                        <option value="UPCOMING">Upcoming</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                </div>
            </div>

            {/* Time and Duration */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Time</label>
                    <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-[#2a213a]/50 border border-white/5 rounded-2xl py-2.5 px-3 text-white/90 outline-none focus:border-[#b4ff39]/50 [color-scheme:dark]"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Duration (minutes)</label>
                    <div className="flex gap-2 flex-wrap items-center">
                        <input
                            type="number"
                            value={durationMin}
                            onChange={(e) => {
                                const raw = e.target.value;
                                if (raw === "") {
                                    setDurationMin(0);
                                    return;
                                }
                                const n = parseInt(raw, 10);
                                if (!Number.isNaN(n) && n >= 0) {
                                    setDurationMin(n);
                                }
                            }}
                            onBlur={(e) => {
                                const n = parseInt(e.target.value, 10);
                                if (Number.isNaN(n) || n < 0) setDurationMin(60);
                            }}
                            placeholder="60"
                            className="w-24 bg-[#2a213a]/50 border border-white/5 rounded-2xl py-2.5 px-3 text-white/90 outline-none focus:border-[#b4ff39]/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-white/50 text-sm">min</span>
                        <div className="flex gap-1">
                            {[60, 90, 120, 180].map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setDurationMin(m);
                                    }}
                                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase ${
                                        durationMin === m ? "bg-[#b4ff39] text-black" : "bg-white/5 text-white/60 hover:text-white/80"
                                    }`}
                                >
                                    {m === 60 ? "1h" : m === 90 ? "1.5h" : m === 120 ? "2h" : "3h"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

   
    {submitError && (
        <p className="text-red-400 text-sm py-2">{submitError}</p>
    )}
    <div className="flex gap-4">
        <button 
            type="button" 
            onClick={onCancel} 
            disabled={submitLoading}
            className="flex-1 bg-[#1e162e]/40 backdrop-blur-xl border border-white/10 py-4 rounded-2xl font-semibold text-white hover:bg-white/10 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
        >
            <X size={18} /> Cancel
        </button>
        <button 
            type="submit" 
            disabled={submitLoading}
            className="flex-[1.5] bg-[#b4ff39] text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(180,255,57,0.2)] hover:scale-[1.02] transition-transform disabled:opacity-50"
        >
            {submitLoading ? "Saving…" : <><Save size={20} /> Save Exam</>}
        </button>
    </div>
</div>

                {/* RIGHT COLUMN: Syllabus & Coverage Card */}
              <div className="lg:col-span-8 bg-white/5 backdrop-blur-xl border-b border-white/10 rounded-[1rem] flex flex-col overflow-hidden shadow-2xl">
    {/* Header Section */}
    <div className="p-8 border-b border-white/30 flex justify-between items-center bg-white/5">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-[#b4ff39]/10 rounded-lg">
                <CheckCircle2 className="text-[#b4ff39]" size={20} />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-white">Syllabus & Coverage</h2>
        </div>
        <button type="button" onClick={addUnit} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-white/70 text-xs font-bold flex items-center gap-2 hover:bg-[#b4ff39] hover:text-black transition-all">
            <Plus size={16} /> Add Unit
        </button>
    </div>

    {/* Units Content */}
    <div className="p-2 space-y-4 overflow-y-auto max-h-[400px] custom-scrollbar">
        {units.length === 0 ? (
            <p className="text-white/40 text-sm py-6 text-center">No syllabus units yet. Click &quot;Add Unit&quot; to add topics and track coverage.</p>
        ) : null}
        {units.map((unit, idx) => (
            <div key={unit.id} className=" text-white-400 border border-white/5 rounded-[1rem] p-5 relative transition-all hover:bg-[#2a213a]/50 group">
                <div className="flex gap-8">
                    {/* Number Badge */}
                    <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white-400 text-sm font-bold shrink-0">
                        {idx + 1}
                    </div>

                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <input
                                value={unit.name}
                                onChange={(e) => {
                                    const newUnits = [...units];
                                    newUnits[idx].name = e.target.value;
                                    setUnits(newUnits);
                                }}
                                placeholder="Unit / Topic Name"
                                className="bg-transparent text-sm font-semibold text-white w-full outline-none "
                            />
                            <button onClick={() => removeUnit(unit.id)} className="text-white/10 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                <Trash2 size={20} />
                            </button>
                        </div>

                        {/* SINGLE ROW: Status Buttons + Progress Bar */}
                        <div className="flex flex-col xl:flex-row items-start xl:items-center gap-6 xl:gap-8">
                            
                            {/* Status Selection */}
                            <div className="shrink-0 z-10">
                                <label className="block text-[10px]  text-white/20 uppercase tracking-[0.1em] mb-3">Status</label>
                                <div className="flex items-center">
                                    <div className="flex p-1  rounded-xl border border-white/5">
                                        {["Pending", "Partial", "Completed"].map((status) => (
                                            <button
                                                key={status}
                                                type="button"
                                                onClick={() => {
                                                    const newUnits = [...units];
                                                    newUnits[idx].status = status;
                                                    // Sync completion percentage based on status
                                                    if (status === "Completed") newUnits[idx].completion = 100;
                                                    if (status === "Pending") newUnits[idx].completion = 0;
                                                    setUnits(newUnits);
                                                }}
                                                className={`px-4 py-2 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                                                    unit.status === status 
                                                    ? status === "Completed" ? "text-black shadow-lg" : status === "Partial" ? "bg-yellow-400 text-black" : "bg-red-500 text-white" 
                                                    : "text-white/30 hover:text-white/60 hover:bg-white/5"
                                                }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                    {/* Vertical spacer */}
                                    <div className="hidden xl:block h-10 w-px bg-white/10 mx-4" />
                                </div>
                            </div>

                            {/* Progress Slider */}
                            <div className="flex-1 w-full">
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Completion %</label>
                                    <span className="text-sm font-black text-[#b4ff39]">{unit.completion}%</span>
                                </div>
                                
                                <div className="relative h-6 flex items-center group">
                                    {/* Slider Track */}
                                    <div className="h-2 w-full bg-white/5 rounded-full relative overflow-visible">
                                        {/* Progress Fill */}
                                        <div 
                                            className="h-full bg-[#b4ff39] rounded-full shadow-[0_0_15px_rgba(180,255,57,0.5)] transition-all duration-300" 
                                            style={{ width: `${unit.completion}%` }} 
                                        />
                                        
                                        {/* Glow Knob (Thumb) */}
                                        <div 
                                            className="absolute top-1/2 h-5 w-5 bg-[#b4ff39] border-[4px] border-[#1e162e] rounded-full shadow-lg -translate-y-1/2 -translate-x-1/2 z-20 pointer-events-none transition-all duration-300"
                                            style={{ left: `${unit.completion}%` }}
                                        />
                                    </div>
                                    
                                    {/* Transparent Range Input for Interactivity */}
                                    <input 
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="5"
                                        value={unit.completion}
                                        onChange={(e) => {
                                            const newUnits = [...units];
                                            const val = parseInt(e.target.value);
                                            newUnits[idx].completion = val;
                                            // Sync status based on slider value
                                            if (val === 100) newUnits[idx].status = "Completed";
                                            else if (val > 0) newUnits[idx].status = "Partial";
                                            else newUnits[idx].status = "Pending";
                                            setUnits(newUnits);
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                                    />
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
        </div>
    );
}
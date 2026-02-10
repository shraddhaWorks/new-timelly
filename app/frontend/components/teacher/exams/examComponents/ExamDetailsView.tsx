"use client";

import { useEffect, useState } from "react";

export default function ExamDetailsView({ examId, onBack, onEdit }: any) {
    const [exam, setExam] = useState<any>(null);

    useEffect(() => {
        fetch(`/api/exams/terms/${examId}`)
            .then(res => res.json())
            .then(data => setExam(data.term));
    }, [examId]);

    if (!exam) return null;

    return (
        <div className="grid lg:grid-cols-12 gap-6">
            {/* LEFT */}
            <div className="lg:col-span-4 bg-white/5 rounded-2xl p-6">
                <button onClick={onBack} className="text-white/40 mb-4">← Back</button>
                <h2 className="text-xl font-bold">{exam.name}</h2>
                <p className="text-white/40">
                    Class {exam.class.name}-{exam.class.section}
                </p>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-8 bg-white/5 rounded-2xl p-6 space-y-6">
                {exam.syllabus.map((s: any, i: number) => (
                    <div key={i}>
                        <div className="flex justify-between mb-2">
                            <span>{s.subject}</span>
                            <span>{s.completedPercent}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full">
                            <div
                                className="h-full bg-[#b4ff39]"
                                style={{ width: `${s.completedPercent}%` }}
                            />
                        </div>
                    </div>
                ))}
                <button onClick={onEdit} className="btn-primary mt-6">
                    Edit Exam Details
                </button>
            </div>
        </div>
    );
}

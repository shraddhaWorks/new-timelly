"use client";
import { Calendar, Clock, Pencil, Trash2, EyeIcon } from "lucide-react";


export default function ExamCard({ exam, onView, onEdit }: any) {
    const coverage =
        exam.syllabus.length === 0
            ? 0
            : Math.round(
                exam.syllabus.reduce((s: number, x: any) => s + x.completedPercent, 0) /
                exam.syllabus.length
            );

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
            <span className="text-[#b4ff39] text-xs uppercase">{exam.status}</span>

            <h3 className="text-lg font-bold mt-2">{exam.name}</h3>
            <p className="text-white/40 text-sm">
                Class {exam.class.name}-{exam.class.section}
            </p>

            <div className="mt-6">
                <div className="flex justify-between text-xs mb-1">
                    <span>Syllabus Coverage</span>
                    <span>{coverage}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full">
                    <div
                        className="h-full bg-[#b4ff39] rounded-full"
                        style={{ width: `${coverage}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
                <button onClick={onEdit} className="btn-outline">Edit</button>
                <button onClick={onView} className="btn-secondary">View</button>
            </div>
        </div>
    );
}

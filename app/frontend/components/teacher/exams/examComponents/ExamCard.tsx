"use client";

import React from 'react';
import { Calendar, Clock, Pencil, Trash2, EyeIcon } from "lucide-react";

interface ExamCardProps {
  exam: any;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ExamCard({ exam, onView, onEdit, onDelete }: ExamCardProps) {
  // Logic for dynamic status colors to match the UI screenshots
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'upcoming': return 'text-[#b4ff39] bg-[#b4ff39]/10 border-[#b4ff39]/20';
      case 'completed': return 'text-white/60 bg-white/10 border-white/20';
      case 'draft': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-white bg-white/10 border-white/10';
    }
  };

  const coverage =
    !exam.syllabus || exam.syllabus.length === 0
      ? 0
      : Math.min(100, Math.max(0, Math.round(
          exam.syllabus.reduce((s: number, x: any) => s + (Number(x.completedPercent) || 0), 0) /
          exam.syllabus.length
        )));

  const statusLabel = typeof exam.status === "string"
    ? exam.status.charAt(0).toUpperCase() + exam.status.slice(1).toLowerCase()
    : exam.status;

  return (
    <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 flex flex-col backdrop-blur-md shadow-2xl w-full transition-transform hover:scale-[1.01]">
      
      {/* HEADER: Status Badge and Top Actions */}
      <div className="flex justify-between items-start">
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${getStatusStyles(exam.status)}`}>
          {statusLabel}
        </span>
        <div className="flex gap-2">
          <button onClick={onEdit} className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-[#b4ff39] transition-colors">
            <Pencil size={16} />
          </button>
          <button onClick={onDelete} className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-red-400 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* EXAM INFO */}
      <h3 className={`text-xl font-bold mt-5 leading-tight ${exam.status.toLowerCase() === 'upcoming' ? 'text-[#b4ff39]' : 'text-white'}`}>
        {exam.name}
      </h3>
      <p className="text-white/40 text-sm font-medium mt-1 uppercase tracking-wider">
        Class {exam.class?.name ?? ""}{exam.class?.section != null ? `-${exam.class.section}` : ""}{exam.subject ? ` • ${exam.subject}` : ""}
      </p>

      {/* SCHEDULE DETAILS */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-3 text-white/60">
          <Calendar size={18} className="text-[#b4ff39]/70" />
          <span className="text-sm font-medium">{exam.date}</span>
        </div>
        <div className="flex items-center gap-3 text-white/60">
          <Clock size={18} className="text-[#b4ff39]/70" />
          <span className="text-sm font-medium">{exam.time} <span className="text-white/20 ml-1">({exam.duration})</span></span>
        </div>
      </div>

      {/* SYLLABUS PROGRESS */}
      <div className="mt-8 pt-6 border-t border-white/5">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2.5">
          <span>Syllabus Coverage</span>
          <span className="text-white">{coverage}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#b4ff39] rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(180,255,57,0.4)]"
            style={{ width: `${coverage}%` }}
          />
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="grid grid-cols-2 gap-3 mt-8">
        <button 
          onClick={onEdit} 
          className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#b4ff39]/20 text-[#b4ff39] hover:bg-[#b4ff39]/10 transition-all font-bold text-xs uppercase tracking-widest"
        >
          <Pencil size={14} /> Edit Details
        </button>
        <button 
          onClick={onView} 
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest"
        >
          <EyeIcon size={14} /> View Details
        </button>
      </div>
    </div>
  );
}
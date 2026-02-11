import React, { useState } from "react";
import { Calendar, ChevronDown, Paperclip, Send, Plus, X, CheckCircle } from "lucide-react";

export default function TeacherLeave() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: "Sick Leave",
    startDate: "",
    endDate: "",
    reason: "",
  });

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      
      {/* 1. Header Section */}
      <div className="max-w-6xl mx-auto bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {showForm ? "Apply New Leave" : "My Leave Application"}
          </h2>
          <p className="text-white/40 text-sm">
            {showForm ? "Please fill in the details below" : "Apply for leave and track your balance"}
          </p>
        </div>

        {/* Toggle Button */}
        {!showForm ? (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 border border-[#b4f03d]/20 bg-[#b4f03d]/5 text-[#b4f03d] px-6 py-3 rounded-2xl font-bold text-sm"
          >
            <Plus size={20} strokeWidth={3} />
            <span>Apply New Leave</span>
          </button>
        ) : (
          <button 
            onClick={() => setShowForm(false)}
            className="flex items-center gap-2 border border-white/10 bg-white/5 text-white/60 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-white/10 hover:text-white transition-all"
          >
            <ChevronDown size={20} strokeWidth={3} />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {/* 2. The Form (3-Field Row Layout) */}
     {showForm && (
        <div className=" border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl animate-in slide-in-from-top-2 duration-400">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            
            {/* Form Title & Separator */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white ml-1">New Leave Request</h2>
              <div className="w-full h-px bg-white/10"></div>
            </div>

            {/* Top Row: 3 Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Leave Type */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] ml-1">Leave Type</label>
                <div className="relative">
                  <select 
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 appearance-none text-white text-sm focus:outline-none focus:border-[#b4f03d]/50 cursor-pointer transition-all"
                    value={formData.leaveType}
                    onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                  >
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Emergency Leave">Emergency Leave</option>
                    <option value="Duty Leave">Duty Leave</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={16} />
                </div>
              </div>

              {/* From Date */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">From Date</label>
                <div className="relative group">
                  <input 
                    type="date" 
                    className="w-full  bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-[#b4f03d]/50 [color-scheme:dark] transition-all"
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                 
                </div>
              </div>

              {/* To Date */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">To Date</label>
                <div className="relative group">
                  <input 
                    type="date" 
                    className="w-full  bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-[#b4f03d]/50 [color-scheme:dark] transition-all"
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                  
                </div>
              </div>
            </div>

            {/* Reason Row */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">Reason for Leave</label>
              <textarea 
                
                placeholder="Provide a detailed reason for your leave request..."
                className="w-full  bg-black/30 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#b4f03d]/50 resize-none placeholder:text-white/20 transition-all"
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
              ></textarea>
            </div>

            {/* Bottom Row */}
            <div className="flex justify-end pt-2">
              <button 
                type="button"
                className="flex items-center gap-2 bg-[#b4f03d] text-black px-8 py-3 rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(180,240,61,0.2)] transition-all active:scale-95"
              >
                <CheckCircle size={18} strokeWidth={3} />
                Submit Application
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
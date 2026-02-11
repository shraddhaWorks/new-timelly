import React, { useState } from "react";
import { 
  GraduationCap, Briefcase, Clock, CheckCircle2, 
  Search, Calendar, Paperclip, Check, X 
} from "lucide-react";

export default function TeacherLeavesTab() {
 
  const [subTab, setSubTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  // Handlers for click actions
  const handleApprove = (name: string) => alert(`Approved leave for ${name}`);
  const handleReject = (name: string) => alert(`Rejected leave for ${name}`);

  return (
    <div className=" text-white ">
      

      {/* 2. Header Section */}
      <div className="max-w-6xl mb-6 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[1rem] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Student Approvals</h2>
          <p className="text-white/40 text-sm mt-1">Review and manage leave requests from your class</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30">
            <Clock size={16} className="text-yellow-400" />
            <span className="text-yellow-400 font-bold text-sm">2 Pending</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#b4f03d]/10 border border-[#b4f03d]/30">
            <CheckCircle2 size={16} className="text-[#b4f03d]" />
            <span className="text-[#b4f03d] font-bold text-sm">0 Approved Recently</span>
          </div>
        </div>
      </div>

      {/* 3. Sub-Nav & Search Bar (JOINED IN ONE BORDER) */}
      <div className="max-w-6xl mb-6 bg-white/[0.03] border border-white/10 rounded-[1rem] p-5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Internal Sub-Tabs */}
          <div className="inline-flex bg-white/5 p-1 rounded-2xl border border-white/5">
            <button 
              onClick={() => setSubTab("pending")}
              className={`px-8 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                subTab === 'pending' ? 'bg-[#b4f03d] text-black' : 'text-white/40 hover:text-white'
              }`}
            >
              Pending
            </button>
            <button 
              onClick={() => setSubTab("history")}
              className={`px-8 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                subTab === 'history' ? 'bg-[#b4f03d] text-black' : 'text-white/40 hover:text-white'
              }`}
            >
              History
            </button>
          </div>
          
          {/* Search Field */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#b4f03d] transition-colors" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student name..." 
              className="bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-12 pr-6 w-full md:w-80 focus:outline-none focus:border-[#b4f03d]/50 transition-all placeholder:text-white/20"
            />
          </div>
        </div>
      </div>

     
    {/* 4. Request Card */}

<div className="max-w-6xl mx-auto  border border-white/10 rounded-[1rem] p-4 backdrop-blur-lg flex flex-col md:flex-row items-center md:items-stretch gap-6 relative group hover:border-white/20 transition-all shadow-2xl">
  
  {/* Profile Info: Reduced margins and size */}
  <div className="flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-2 min-w-[180px]">
    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
      <img src="g" alt="Aarav" className="w-full h-full object-cover" />
    </div>
    <div>
      <h3 className="font-bold text-lg tracking-tight leading-none">Aarav Kumar</h3>
      <p className="text-white/40 text-xs font-medium mt-1">Class 10-A</p>
      <span className="inline-block mt-2 px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold tracking-widest text-white/40 uppercase">
        SICK
      </span>
    </div>
  </div>

  {/* Content Details: Tightened vertical spacing */}
  <div className="flex-1 flex flex-col justify-between py-1">
    {/* Date Pill - Smaller padding */}
    <div className="flex items-center gap-3 mb-3">
      <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
        <Calendar size={14} className="text-[#b4f03d]" />
        <span className="text-xs font-medium text-white/80">Feb 02 - Feb 04</span>
        <span className="text-white/20">|</span>
        <span className="text-xs font-bold text-[#b4f03d]">3 Days</span>
      </div>
    </div>

    {/* Reason Box - Compact padding and reduced mt */}
    <div className="bg-black/20 rounded-xl p-3 border border-white/[0.03]">
      <p className="text-white/60 text-sm leading-snug font-medium line-clamp-2 md:line-clamp-none">
        Suffering from high fever and viral infection. Doctor advised complete rest for 3 days.
      </p>
      
      <button className="flex items-center gap-1.5 mt-2 text-[#b4f03d] text-[13px] font-bold hover:opacity-80 transition-all">
        <Paperclip size={12} strokeWidth={3} />
        View Attachment
      </button>
    </div>
  </div>
  
  {/* Action Buttons: Slimmer padding and smaller font */}
  <div className="flex flex-row md:flex-col gap-2 justify-center items-center border-l border-white/10 pl-4">
   <div className="flex flex-col items-center gap-3">
  <button 
    onClick={() => handleApprove("Aarav Kumar")}
   
    className="flex items-center justify-center gap-2 bg-[#b4f03d]/10 hover:bg-[#b4f03d] hover:text-black border border-[#b4f03d]/20 text-[#b4f03d] px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 w-[100px] group/btn"
  >
    <Check size={18} strokeWidth={3} /> 
    <span>Approve</span>
  </button>
  
  <button 
    onClick={() => handleReject("Aarav Kumar")}
   
    className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-500 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 w-[100px] group/btn"
  >
    <X size={18} strokeWidth={3} /> 
    <span>Reject</span>
  </button>
</div>
  </div>
</div>

    </div>
  );
}
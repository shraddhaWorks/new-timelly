import React, { useState, useEffect } from "react";
import {
  Clock, CheckCircle2, Search, Calendar, 
  Paperclip, Check, X, Edit2, Loader2
} from "lucide-react";
import PageHeader from "../../../common/PageHeader";

export default function TeacherLeavesTab() {
  const [subTab, setSubTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState<any[]>([]);

  // Modal States - Strictly for History Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [tempStatus, setTempStatus] = useState("");
  const [tempRemark, setTempRemark] = useState("");

  const formatDate = (dateStr: any) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) 
      ? "Invalid Date" 
      : new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(date);
  };

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const endpoint = subTab === "pending" ? "/api/student-leaves/pending" : "/api/student-leaves/all";
      const response = await fetch(endpoint);
      const resData = await response.json();
      
      if (!response.ok) throw new Error(resData.message || "Failed to fetch");

      // Filter: Show only processed requests in History
      const data = subTab === "history" 
        ? resData.filter((l: any) => l.status !== "PENDING")
        : resData;
        
      setLeaves(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [subTab]);

  const handleUpdateStatus = async (id: string, status: string, remarks: string) => {
    try {
      // Use 'aprove' and 'rejection' to match your folder names exactly
      const action = status === "APPROVED" ? "approve" : "rejection";
      
      const response = await fetch(`/api/student-leaves/${id}/${action}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // Use 'remarks' to match your backend body variable
        body: JSON.stringify({ remarks }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Update failed");
      }
      
      setIsEditModalOpen(false);
      fetchLeaves(); 
    } catch (error) {
      console.error("Update error:", error);
      alert("Update failed. Make sure your backend prisma query doesn't restrict status to PENDING for history edits.");
    }
  };

  const calculateDays = (start: any, end: any) => {
    if (!start || !end) return 0;
    const d1 = new Date(start);
    const d2 = new Date(end);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
    const diff = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const openEditModal = (item: any) => {
    setSelectedItem(item);
    setTempStatus(item.status);
    setTempRemark(item.remarks || "");
    setIsEditModalOpen(true);
  };

  return (
    <div className="text-white p-6 relative">
      
      {/* EDIT MODAL - For History Tab */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 pb-2">
              <h2 className="text-xl font-bold">Edit Decision</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex gap-4">
                <button 
                  onClick={() => setTempStatus("APPROVED")}
                  className={`flex-1 py-3 rounded-2xl font-bold border transition-all ${tempStatus === 'APPROVED' ? 'bg-[#b4f03d]/20 border-[#b4f03d] text-[#b4f03d]' : 'bg-white/5 border-white/10 text-white/40'}`}
                >
                  Approve
                </button>
                <button 
                   onClick={() => setTempStatus("REJECTED")}
                   className={`flex-1 py-3 rounded-2xl font-bold border transition-all ${tempStatus === 'REJECTED' ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-white/5 border-white/10 text-white/40'}`}
                >
                  Reject
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-white/60">Remarks</label>
                <textarea 
                  value={tempRemark}
                  onChange={(e) => setTempRemark(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#b4f03d]/50 min-h-[120px] resize-none"
                  placeholder="Enter remark..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 rounded-2xl font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  Cancel
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedItem.id, tempStatus, tempRemark)}
                  className="flex-1 py-3 rounded-2xl font-bold bg-[#b4f03d] text-black hover:opacity-90 transition-all"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <PageHeader
        title="Student Approvals"
        subtitle="Review and manage leave requests from your class"
        className="max-w-6xl mb-6 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[1rem] shadow-2xl"
        rightSlot={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30">
              <Clock size={16} className="text-yellow-400" />
              <span className="text-yellow-400 font-bold text-sm">
                {leaves.filter(l => l.status === 'PENDING').length} Pending
              </span>
            </div>
          </div>
        }
      />

      {/* Tabs and Search */}
      <div className="max-w-6xl mb-6 bg-white/[0.03] border border-white/10 rounded-[1rem] p-5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="inline-flex bg-white/5 p-1 rounded-2xl border border-white/5">
            {["pending", "history"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSubTab(tab)}
                className={`px-8 py-2 rounded-xl text-sm font-bold transition-all duration-300 capitalize ${subTab === tab ? 'bg-[#b4f03d] text-black' : 'text-white/40 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>

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

      {/* Leave Cards */}
      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        {loading ? (
           <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#b4f03d]" size={40} /></div>
        ) : leaves.length === 0 ? (
          <div className="text-center py-20 text-white/20 font-bold">No leave requests found.</div>
        ) : (
          leaves
          .filter(item => item.student?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((item) => (
            <div key={item.id} className="border border-white/10 rounded-[1rem] p-4 backdrop-blur-lg flex flex-col md:flex-row items-center md:items-stretch gap-6 relative group hover:border-white/20 transition-all shadow-2xl">
              <div className="flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-2 min-w-[180px]">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 bg-white/10 shadow-lg">
                  <img src={`https://i.pravatar.cc/150?u=${item.student?.id}`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight leading-none">{item.student?.user?.name}</h3>
                  <p className="text-white/40 text-xs font-medium mt-1">Class {item.student?.class?.name}-{item.student?.class?.section}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold tracking-widest text-white/40 uppercase">
                    {item.leaveType || "LEAVE"}
                  </span>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between py-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                    <Calendar size={14} className="text-[#b4f03d]" />
                    <span className="text-xs font-medium text-white/80">
                      {formatDate(item.fromDate)} - {formatDate(item.toDate)}
                    </span>
                    <span className="text-white/20">|</span>
                    <span className="text-xs font-bold text-[#b4f03d]">
                      {calculateDays(item.fromDate, item.toDate)} Days
                    </span>
                  </div>
                </div>
                <div className="bg-black/20 rounded-xl p-3 border border-white/[0.03]">
                  <p className="text-white/60 text-sm leading-snug font-medium">
                    {item.reason}
                  </p>
                </div>
                {item.status !== "PENDING" && (
                  <div className="mt-2 text-xs">
                    <span className="font-bold text-white/40">Your Remark: </span>
                    <span className="text-white/60 italic">{item.remarks || "No remarks provided."}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-row md:flex-col gap-2 justify-center items-center border-l border-white/10 pl-4">
                {item.status === "PENDING" ? (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(item.id, "APPROVED", "")} 
                      className="flex items-center justify-center gap-2 bg-[#b4f03d]/10 hover:bg-[#b4f03d] hover:text-black border border-[#b4f03d]/20 text-[#b4f03d] px-4 py-3 rounded-xl font-bold text-sm transition-all w-[110px]"
                    >
                      <Check size={18} strokeWidth={3} /> <span>Approve</span>
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(item.id, "REJECTED", "")} 
                      className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-500 px-4 py-3 rounded-xl font-bold text-sm transition-all w-[110px]"
                    >
                      <X size={18} strokeWidth={3} /> <span>Reject</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest border text-center ${
                      item.status === 'APPROVED' ? 'bg-[#b4f03d]/30 border-[#b4f03d]/20 text-[#b4f03d]' : 'bg-red-500/10 border-red-500/20 text-red-500'
                    }`}>
                      {item.status}
                    </div>
                    <button onClick={() => openEditModal(item)} className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 px-4 py-2 rounded-xl font-bold text-xs transition-all w-full">
                      <Edit2 size={14} /> <span>Edit</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
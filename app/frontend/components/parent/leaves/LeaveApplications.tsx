"use client";

import React, { useState } from "react";
import axios from "axios";
import { Calendar, FileText, Send, Loader2, CheckCircle } from "lucide-react";

export default function ParentLeavesTab() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    leaveType: "CASUAL",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/student-leaves/apply", formData);
      setSuccess(true);
      setFormData({ leaveType: "CASUAL", fromDate: "", toDate: "", reason: "" });
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to apply for leave");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-[#b4f03d]/10 rounded-2xl border border-[#b4f03d]/20">
            <Send className="text-[#b4f03d]" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Apply for Leave</h2>
            <p className="text-white/40 text-sm">Submit your leave request for approval</p>
          </div>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-10 animate-in fade-in zoom-in duration-300">
            <CheckCircle className="text-[#b4f03d] mb-4" size={60} />
            <h3 className="text-xl font-bold text-white">Application Submitted!</h3>
            <p className="text-white/40 text-center mt-2">Your request has been sent to your teacher.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Leave Type Selector */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-white/60 ml-1">Leave Type</label>
              <div className="grid grid-cols-2 gap-3">
                {["CASUAL", "SICK", "PAID", "UNPAID"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, leaveType: type })}
                    className={`py-3 rounded-xl font-bold border transition-all text-xs ${
                      formData.leaveType === type
                        ? "bg-[#b4f03d]/20 border-[#b4f03d] text-[#b4f03d]"
                        : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/60 ml-1">From Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b4f03d]" size={18} />
                  <input
                    type="date"
                    required
                    value={formData.fromDate}
                    onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#b4f03d]/50 transition-all [color-scheme:dark]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/60 ml-1">To Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b4f03d]" size={18} />
                  <input
                    type="date"
                    required
                    value={formData.toDate}
                    onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#b4f03d]/50 transition-all [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            {/* Reason Textarea */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-white/60 ml-1">Reason for Leave</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 text-white/20" size={18} />
                <textarea
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={4}
                  placeholder="Describe your reason clearly..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#b4f03d]/50 transition-all resize-none text-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#b4f03d] hover:bg-[#a2d937] text-black font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#b4f03d]/10 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Send size={18} />
                  APPLY NOW
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
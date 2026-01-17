"use client";
import { useEffect, useState } from "react";
import { Calendar, CheckCircle2, XCircle, Clock, User, Mail, FileText, Filter, AlertCircle, TrendingUp } from "lucide-react";

interface Leave {
  id: string;
  teacher: { id: string; name: string; email: string };
  approver: { id: string; name: string } | null;
  leaveType: string;
  fromDate: string;
  toDate: string;
  status: string;
  remarks?: string | null;
}

export default function AdminLeavesPage() {
  const [allLeaves, setAllLeaves] = useState<Leave[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<Leave[]>([]);
  const [remarksMap, setRemarksMap] = useState<{ [key: string]: string }>({});
  const [showRemarksInput, setShowRemarksInput] = useState<{ [key: string]: boolean }>({});

  async function loadAll() {
    const res = await fetch("/api/leaves/all");
    const data = await res.json();
    setAllLeaves(data);
  }

  async function loadPending() {
    const res = await fetch("/api/leaves/pending");
    const data = await res.json();
    setPendingLeaves(data);
  }

  async function approve(id: string) {
    await fetch(`/api/leaves/${id}/approve`, { method: "PATCH" });
    loadAll();
    loadPending();
  }

  async function reject(id: string) {
    await fetch(`/api/leaves/${id}/reject`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ remarks: remarksMap[id] || "" }),
    });
    setRemarksMap(prev => ({ ...prev, [id]: "" }));
    setShowRemarksInput(prev => ({ ...prev, [id]: false }));
    loadAll();
    loadPending();
  }

  useEffect(() => {
    loadAll();
    loadPending();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
            <CheckCircle2 size={14} />
            {status}
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
            <XCircle size={14} />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            <Clock size={14} />
            {status}
          </span>
        );
    }
  };

  const totalLeaves = allLeaves.length;
  const approvedCount = allLeaves.filter(l => l.status === "APPROVED").length;
  const rejectedCount = allLeaves.filter(l => l.status === "REJECTED").length;
  const pendingCount = pendingLeaves.length;

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-[#808080]" />
              Leave Management
            </h1>
            <p className="text-[#808080] text-sm md:text-base">Manage and approve teacher leave requests</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 text-[#808080]" />
              <TrendingUp className="w-5 h-5 text-[#808080]" />
            </div>
            <p className="text-3xl font-bold text-white">{totalLeaves}</p>
            <p className="text-sm text-[#808080] mt-1">Total Leaves</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">{pendingCount}</p>
            <p className="text-sm text-[#808080] mt-1">Pending</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">{approvedCount}</p>
            <p className="text-sm text-[#808080] mt-1">Approved</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-3xl font-bold text-white">{rejectedCount}</p>
            <p className="text-sm text-[#808080] mt-1">Rejected</p>
          </div>
        </div>

        {/* Pending Leaves Section */}
        {pendingLeaves.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
              Pending Approvals ({pendingLeaves.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingLeaves.map(l => (
                <div
                  key={l.id}
                  className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 shadow-lg hover:border-[#404040] transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#2d2d2d] rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-white text-lg">{l.teacher.name}</div>
                        <div className="text-[#808080] text-sm flex items-center gap-1">
                          <Mail size={12} />
                          {l.teacher.email}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(l.status)}
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-[#808080]" />
                      <span className="text-[#808080]">Type:</span>
                      <span className="text-white font-medium">{l.leaveType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-[#808080]" />
                      <span className="text-[#808080]">From:</span>
                      <span className="text-white">{new Date(l.fromDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-[#808080]" />
                      <span className="text-[#808080]">To:</span>
                      <span className="text-white">{new Date(l.toDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {showRemarksInput[l.id] && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-[#808080] mb-2">Rejection Remarks</label>
                      <textarea
                        value={remarksMap[l.id] || ""}
                        onChange={(e) => setRemarksMap(prev => ({ ...prev, [l.id]: e.target.value }))}
                        placeholder="Enter reason for rejection..."
                        className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent placeholder-[#6b6b6b] min-h-[80px]"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => approve(l.id)}
                      className="flex-1 bg-[#404040] hover:bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={18} />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        if (showRemarksInput[l.id] && remarksMap[l.id]) {
                          reject(l.id);
                        } else {
                          setShowRemarksInput(prev => ({ ...prev, [l.id]: true }));
                        }
                      }}
                      className="flex-1 bg-[#404040] hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Leaves Table */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Filter className="w-6 h-6 text-[#808080]" />
            All Leave Requests
          </h2>
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#2d2d2d] border-b border-[#333333]">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        Teacher
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                        <FileText size={16} />
                        Type
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        Date Range
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">
                      Status
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333333]">
                  {allLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-[#808080]">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No leave requests found</p>
                      </td>
                    </tr>
                  ) : (
                    allLeaves.map(l => (
                      <tr key={l.id} className="hover:bg-[#2d2d2d] transition">
                        <td className="px-4 py-4">
                          <div className="font-medium text-white">{l.teacher.name}</div>
                          <div className="text-xs text-[#808080] flex items-center gap-1 mt-1">
                            <Mail size={12} />
                            {l.teacher.email}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[#808080]">{l.leaveType}</td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-white">{new Date(l.fromDate).toLocaleDateString()}</div>
                          <div className="text-xs text-[#808080]">to {new Date(l.toDate).toLocaleDateString()}</div>
                        </td>
                        <td className="px-4 py-4">
                          {getStatusBadge(l.status)}
                        </td>
                        <td className="px-4 py-4">
                          {l.status === "PENDING" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => approve(l.id)}
                                className="bg-[#404040] hover:bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1"
                              >
                                <CheckCircle2 size={14} />
                                Approve
                              </button>
                              <button
                                onClick={() => reject(l.id)}
                                className="bg-[#404040] hover:bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1"
                              >
                                <XCircle size={14} />
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

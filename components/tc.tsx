"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { FileText, Filter, CheckCircle2, XCircle, AlertCircle, User, Mail, GraduationCap, Calendar, Download, Check, X } from "lucide-react";

interface TransferCertificate {
  id: string;
  reason: string | null;
  status: string;
  issuedDate: string | null;
  tcDocumentUrl: string | null;
  createdAt: string;
  student: {
    id: string;
    user: { id: string; name: string | null; email: string | null };
    class: { id: string; name: string; section: string | null } | null;
  };
  requestedBy: { id: string; name: string | null; email: string | null } | null;
  approvedBy: { id: string; name: string | null; email: string | null } | null;
}

export default function TCPage() {
  const { data: session, status } = useSession();
  const [tcs, setTCs] = useState<TransferCertificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  useEffect(() => {
    if (session) {
      fetchTCs();
    }
  }, [session, filterStatus]);

  const fetchTCs = async () => {
    try {
      const url = filterStatus
        ? `/api/tc/list?status=${filterStatus}`
        : "/api/tc/list";
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.tcs) {
        setTCs(data.tcs);
      }
    } catch (err) {
      console.error("Error fetching TCs:", err);
    }
  };

  const handleApprove = async (tcId: string, tcDocumentUrl?: string) => {
    if (
      !confirm(
        "Are you sure you want to approve this TC? This will deactivate the student account and save data to history."
      )
    )
      return;

    setLoading(true);
    try {
      const res = await fetch(`/api/tc/${tcId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tcDocumentUrl: tcDocumentUrl || null }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to approve TC");
        return;
      }

      alert("TC approved successfully! Student account has been deactivated.");
      fetchTCs();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (tcId: string) => {
    if (!confirm("Are you sure you want to reject this TC request?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/tc/${tcId}/reject`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to reject TC");
        return;
      }

      alert("TC request rejected successfully!");
      fetchTCs();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "REJECTED":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-[#2d2d2d] text-[#808080] border-[#404040]";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle2 size={16} />;
      case "REJECTED":
        return <XCircle size={16} />;
      case "PENDING":
        return <AlertCircle size={16} />;
      default:
        return null;
    }
  };

  if (status === "loading") return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#808080] mx-auto mb-4"></div>
        <p className="text-white">Loading session…</p>
      </div>
    </div>
  );
  if (!session) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="p-6 text-red-400">Not authenticated</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-[#2d2d2d] to-[#404040] rounded-xl flex items-center justify-center border border-[#333333] shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Transfer Certificate Management</h1>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border flex items-center gap-3 ${
              message.includes("successfully")
                ? "bg-[#2d2d2d] text-white border-[#404040]"
                : "bg-red-500/10 text-red-400 border-red-500/30"
            }`}
          >
            {message.includes("successfully") ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            {message}
          </motion.div>
        )}

        {/* Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-lg p-6 hover:border-[#404040] transition"
        >
          <label className="block text-sm font-medium text-[#808080] mb-3 flex items-center gap-2">
            <Filter size={18} />
            Filter by Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-auto bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition"
          >
            <option value="" className="bg-[#2d2d2d]">All Status</option>
            <option value="PENDING" className="bg-[#2d2d2d]">Pending</option>
            <option value="APPROVED" className="bg-[#2d2d2d]">Approved</option>
            <option value="REJECTED" className="bg-[#2d2d2d]">Rejected</option>
          </select>
        </motion.div>

        {/* TC List */}
        {tcs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-lg p-12 text-center"
          >
            <FileText className="w-16 h-16 mx-auto mb-4 text-[#808080] opacity-50" />
            <p className="text-[#808080] text-lg">No TC requests found</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {tcs.map((tc, index) => (
              <motion.div
                key={tc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-lg p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
                <div className="relative">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-4 mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4 flex-wrap">
                        <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                          <User size={20} />
                          {tc.student.user.name}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border ${getStatusColor(
                            tc.status
                          )}`}
                        >
                          {getStatusIcon(tc.status)}
                          {tc.status}
                        </span>
                      </div>
                      <div className="space-y-3 text-sm text-[#808080]">
                        <div className="flex items-center gap-2">
                          <Mail size={14} />
                          <span><strong className="text-white">Email:</strong> {tc.student.user.email}</span>
                        </div>
                        {tc.student.class && (
                          <div className="flex items-center gap-2">
                            <GraduationCap size={14} />
                            <span><strong className="text-white">Class:</strong> {tc.student.class.name}
                              {tc.student.class.section
                                ? ` - ${tc.student.class.section}`
                                : ""}</span>
                          </div>
                        )}
                        {tc.reason && (
                          <div className="flex items-center gap-2">
                            <FileText size={14} />
                            <span><strong className="text-white">Reason:</strong> {tc.reason}</span>
                          </div>
                        )}
                        {tc.issuedDate && (
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span><strong className="text-white">Issued Date:</strong>{" "}
                              {new Date(tc.issuedDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span><strong className="text-white">Requested:</strong>{" "}
                            {new Date(tc.createdAt).toLocaleDateString()}</span>
                        </div>
                        {tc.approvedBy && (
                          <div className="flex items-center gap-2">
                            <User size={14} />
                            <span><strong className="text-white">Approved by:</strong> {tc.approvedBy.name}</span>
                          </div>
                        )}
                      </div>
                      {tc.tcDocumentUrl && (
                        <motion.a
                          href={tc.tcDocumentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center gap-2 mt-4 text-green-400 hover:text-green-300 font-medium transition"
                        >
                          <Download size={16} />
                          View TC Document
                        </motion.a>
                      )}
                    </div>
                    {tc.status === "PENDING" && (
                      <div className="flex gap-2 md:flex-col md:gap-3">
                        <motion.button
                          onClick={() => handleApprove(tc.id)}
                          disabled={loading}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-gradient-to-r from-green-500/80 to-green-600/80 hover:from-green-600 hover:to-green-500 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 border border-green-500/30 hover:border-green-400 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check size={18} />
                          Approve
                        </motion.button>
                        <motion.button
                          onClick={() => handleReject(tc.id)}
                          disabled={loading}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-gradient-to-r from-red-500/80 to-red-600/80 hover:from-red-600 hover:to-red-500 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 border border-red-500/30 hover:border-red-400 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X size={18} />
                          Reject
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Clock, CheckCircle, FileText } from "lucide-react";
import StatCard from "../../common/statCard";
import CertificateRequestCard from "./CertificateRequestCard";
import CertificatesCard from "./CertificatesCard";
import ApprovedCertificates from "./ApprovedCertificates";

interface CertificateRequest {
  id: string;
  certificateType: string | null;
  reason: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  issuedDate: string | null;
  tcDocumentUrl: string | null;
  student: {
    user: { name: string | null };
  };
}

interface Certificate {
  id: string;
  title: string;
  description: string | null;
  issuedDate: string;
  certificateUrl: string | null;
  student: {
    user: { name: string | null };
  };
}

export default function ParentCertificatesTab() {
  const { data: session } = useSession();
  const [certificateRequests, setCertificateRequests] = useState<CertificateRequest[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [certificateType, setCertificateType] = useState("");
  const [requestReason, setRequestReason] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const certificateTypes = [
    { value: "TRANSFER", label: "Transfer Certificate (TC)" },
    { value: "BONAFIDE", label: "Bonafide Certificate" },
    { value: "CHARACTER", label: "Character Certificate" },
    { value: "CONDUCT", label: "Conduct Certificate" },
    { value: "MIGRATION", label: "Migration Certificate" },
    { value: "LEAVING", label: "Leaving Certificate" },
    { value: "PROVISIONAL", label: "Provisional Certificate" },
    { value: "ATTENDANCE", label: "Attendance Certificate" },
    { value: "MEDICAL", label: "Medical Certificate" },
    { value: "SPORTS", label: "Sports Certificate" },
    { value: "ACHIEVEMENT", label: "Achievement Certificate" },
    { value: "OTHER", label: "Other" },
  ];

  const fetchData = useCallback(async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      // Fetch certificate requests
      const certReqRes = await fetch("/api/certificates/requests/list", { credentials: "include" });
      if (certReqRes.ok) {
        const certReqData = await certReqRes.json();
        setCertificateRequests(certReqData.certificateRequests || []);
        if (certReqData.certificateRequests?.[0]?.student?.user?.name) {
          setStudentName((prev) => prev || certReqData.certificateRequests[0].student.user.name || "");
        }
      }

      // Fetch certificates
      const certRes = await fetch("/api/certificates/list", { credentials: "include" });
      if (certRes.ok) {
        const certData = await certRes.json();
        setCertificates(certData.certificates || []);
        if (certData.certificates?.[0]?.student?.user?.name) {
          setStudentName((prev) => prev || certData.certificates[0].student.user.name || "");
        }
      }

      // Get student name from session if available
      if (session.user.name) {
        setStudentName((prev) => prev || session.user.name || "");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRequestCertificate = async () => {
    if (!certificateType) {
      setMessage({ text: "Please select a certificate type", type: "error" });
      return;
    }
    if (!requestReason.trim()) {
      setMessage({ text: "Please provide a reason for the certificate request", type: "error" });
      return;
    }

    setRequestLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/certificates/requests/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          certificateType,
          reason: requestReason 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ text: data.message || "Failed to submit request", type: "error" });
        return;
      }

      setMessage({ text: "Certificate request submitted successfully!", type: "success" });
      setCertificateType("");
      setRequestReason("");
      setShowRequestModal(false);
      
      // Refresh data
      await fetchData();
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Error requesting certificate:", err);
      setMessage({ text: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setRequestLoading(false);
    }
  };

  const pendingRequests = certificateRequests.filter((req) => req.status === "PENDING");
  const approvedRequests = certificateRequests.filter((req) => req.status === "APPROVED");
  const totalIssued = certificates.length + approvedRequests.length;

  const certificateStats = [
    {
      title: "PROCESSING",
      value: pendingRequests.length.toString(),
      icon: Clock,
      iconBg: "bg-orange-500/20",
      iconBorder: "border-orange-400/30",
      iconColor: "text-orange-400",
    },
    {
      title: "TOTAL ISSUED",
      value: totalIssued.toString(),
      icon: CheckCircle,
      iconBg: "bg-lime-400/20",
      iconBorder: "border-lime-300/30",
      iconColor: "text-lime-400",
    },
  ];

  return (
    <div className=" lg:p-8 min-h-[calc(100vh-80px)]">
      <div className="space-y-8 transition-all duration-300 animate-fadeIn">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg w-full sm:w-auto p-6 md:p-8">
            <h3 className="text-xl lg:text-3xl font-bold text-white">
              Certificates
            </h3>
            <p className="text-xs lg:text-base text-gray-400 mt-1">
              Manage certificates for {studentName || "Student"}
            </p>
          </div>

          <button 
            onClick={() => setShowRequestModal(true)}
            className="w-full sm:w-auto px-6 py-4 bg-[#A3E635] text-black rounded-2xl hover:bg-[#A3E635]/90 transition-all font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.4)] hover:scale-[1.02] active:scale-[0.98] min-h-[44px] text-sm lg:text-base whitespace-nowrap"
          >
            <FileText />
            Request Certificate
          </button>

        </div>

        {/* ================= MESSAGE ================= */}
        {message && (
          <div className={`p-4 rounded-2xl border ${
            message.type === "success" 
              ? "bg-green-500/20 text-green-400 border-green-500/30" 
              : "bg-red-500/20 text-red-400 border-red-500/30"
          }`}>
            {message.text}
          </div>
        )}

        {/* ================= REQUEST MODAL ================= */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Request Certificate</h3>
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setCertificateType("");
                    setRequestReason("");
                    setMessage(null);
                  }}
                  className="text-gray-400 hover:text-white transition"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Certificate Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={certificateType}
                    onChange={(e) => setCertificateType(e.target.value)}
                    className="w-full bg-[#2d2d2d] border border-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#A3E635] focus:border-transparent"
                  >
                    <option value="" className="bg-[#2d2d2d]">Select Certificate Type</option>
                    {certificateTypes.map((type) => (
                      <option key={type.value} value={type.value} className="bg-[#2d2d2d]">
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reason for Request <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    placeholder="Please provide a reason for requesting this certificate..."
                    rows={4}
                    className="w-full bg-[#2d2d2d] border border-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#A3E635] focus:border-transparent placeholder-gray-500 resize-none"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleRequestCertificate}
                    disabled={requestLoading || !certificateType || !requestReason.trim()}
                    className="flex-1 px-4 py-3 bg-[#A3E635] text-black font-semibold rounded-lg hover:bg-[#A3E635]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {requestLoading ? "Submitting..." : "Submit Request"}
                  </button>
                  <button
                    onClick={() => {
                      setShowRequestModal(false);
                      setCertificateType("");
                      setRequestReason("");
                      setMessage(null);
                    }}
                    className="px-4 py-3 bg-[#2d2d2d] text-white font-semibold rounded-lg hover:bg-[#404040] transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STAT CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {certificateStats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <StatCard
                key={index}
                className="relative h-28 p-6 bg-gradient backdrop-blur-xl text-white rounded-2xl shadow-lg"
              >
                {/* Left Content */}
                <div className="flex flex-col">
                  <span className="text-xs tracking-wide text-white/80 uppercase">
                    {stat.title}
                  </span>
                  <span className="text-2xl font-semibold">
                    {stat.value}
                  </span>
                </div>

                {/* Upper Right Icon */}
                <div
                  className={`absolute top-4 right-4 
                              w-12 h-12 rounded-full 
                              flex items-center justify-center 
                              ${stat.iconBg} ${stat.iconBorder} border`}
                >
                  <Icon className={`${stat.iconColor} w-5 h-5`} />
                </div>
              </StatCard>
            );
          })}

        </div>
        <div className="mt-6 lg:mt-8">
          <CertificatesCard />
           </div>

        {/* ================= CERTIFICATE REQUEST CARDS ================= */}
        <div className="space-y-6 bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] border-solid rounded-2xl shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-0 overflow-hidden">
          <div className="px-3 lg:px-6 py-3 lg:py-4 border-b border-white/[0.05] bg-white/[0.02]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-sm lg:text-lg font-semibold text-white truncate">Pending Requests</h2>
              <p className="text-xs lg:text-sm text-gray-400 mt-0.5">Track application status</p>
            </div>
            <span className="px-2 lg:px-3 py-1 bg-orange-500/20 text-orange-500 rounded-full text-xs font-bold flex-shrink-0 border border-orange-500/30">{pendingRequests.length} Active</span>
          </div>
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-400">Loading...</div>
          ) : pendingRequests.length === 0 ? (
            <div className="p-6 text-center text-gray-400">No pending requests</div>
          ) : (
            pendingRequests.map((req) => {
              const requestDate = new Date(req.createdAt);
              const daysElapsed = Math.floor((Date.now() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
              const expectedDate = new Date(requestDate);
              expectedDate.setDate(expectedDate.getDate() + 7);
              
              const certificateTypeLabel = certificateTypes.find(t => t.value === req.certificateType)?.label || req.certificateType || "Certificate";
              
              return (
                <CertificateRequestCard
                  key={req.id}
                  title={certificateTypeLabel}
                  purpose={req.reason || "Certificate Request"}
                  requestId={`CR${req.id.slice(-6).toUpperCase()}`}
                  status="processing"
                  requestDate={requestDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  secondDateLabel="Expected Date"
                  secondDate={expectedDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  daysElapsed={`${daysElapsed} days`}
                  progress={Math.min(70, daysElapsed * 10)}
                />
              );
            })
          )}
          
          {approvedRequests.map((req) => {
            const requestDate = new Date(req.createdAt);
            const issuedDate = req.issuedDate ? new Date(req.issuedDate) : null;
            const daysElapsed = issuedDate ? Math.floor((Date.now() - issuedDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
            
            const certificateTypeLabel = certificateTypes.find(t => t.value === req.certificateType)?.label || req.certificateType || "Certificate";
            
            return (
              <CertificateRequestCard
                key={req.id}
                title={certificateTypeLabel}
                purpose={req.reason || "Certificate Request"}
                requestId={`CR${req.id.slice(-6).toUpperCase()}`}
                status="ready"
                requestDate={requestDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                secondDateLabel="Issued Date"
                secondDate={issuedDate ? issuedDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                daysElapsed={`${daysElapsed} days`}
                highPriority={false}
                downloadUrl={req.tcDocumentUrl}
              />
            );
          })}

        </div>
        <div className="mt-6 lg:mt-8">
          <ApprovedCertificates certificates={certificates} />
           </div>

      </div>
    </div>
  );
}

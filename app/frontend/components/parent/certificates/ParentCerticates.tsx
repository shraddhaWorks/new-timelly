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
      const certReqRes = await fetch("/api/certificates/requests/list", { credentials: "include" });
      if (certReqRes.ok) {
        const certReqData = await certReqRes.json();
        setCertificateRequests(certReqData.certificateRequests || []);
        if (certReqData.certificateRequests?.[0]?.student?.user?.name) {
          setStudentName((prev) => prev || certReqData.certificateRequests[0].student.user.name || "");
        }
      }

      const certRes = await fetch("/api/certificates/list", { credentials: "include" });
      if (certRes.ok) {
        const certData = await certRes.json();
        setCertificates(certData.certificates || []);
        if (certData.certificates?.[0]?.student?.user?.name) {
          setStudentName((prev) => prev || certData.certificates[0].student.user.name || "");
        }
      }

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
      setMessage({ text: "Please provide a reason", type: "error" });
      return;
    }

    setRequestLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/certificates/requests/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ certificateType, reason: requestReason }),
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
      await fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ text: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setRequestLoading(false);
    }
  };

  const pendingRequests = certificateRequests.filter((req) => req.status === "PENDING");
  const approvedRequests = certificateRequests.filter((req) => req.status === "APPROVED");
  const totalIssued = certificates.length + approvedRequests.length;

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-[calc(100vh-80px)]">
      <div className="space-y-6 md:space-y-8 animate-fadeIn p-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg w-full md:w-auto p-4 md:p-6 lg:p-8">

          <div>
            <h3 className="text-lg md:text-xl lg:text-3xl font-bold text-white">
              Certificates
            </h3>
            <p className="text-xs md:text-sm lg:text-base text-gray-400 mt-1">
              Manage certificates for {studentName || "Student"}
            </p>
          </div>

          <button
            onClick={() => setShowRequestModal(true)}
            className="w-full md:w-auto px-4 md:px-6 py-3 md:py-4 bg-[#A3E635] text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
          >
            <FileText className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">Request Certificate</span>
          </button>

        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard className="relative h-24 md:h-28 p-4 md:p-6 rounded-2xl">
            <div>
              <span className="text-xs uppercase text-white/70">Processing</span>
              <div className="text-xl md:text-2xl font-semibold">
                {pendingRequests.length}
              </div>
            </div>
            <Clock className="absolute top-4 right-4 w-5 h-5 text-orange-400" />
          </StatCard>

          <StatCard className="relative h-24 md:h-28 p-4 md:p-6 rounded-2xl">
            <div>
              <span className="text-xs uppercase text-white/70">Total Issued</span>
              <div className="text-xl md:text-2xl font-semibold">
                {totalIssued}
              </div>
            </div>
            <CheckCircle className="absolute top-4 right-4 w-5 h-5 text-lime-400" />
          </StatCard>
        </div>

        {/* CERTIFICATES */}
        <CertificatesCard />

        {/* APPROVED CERTIFICATES */}
        <ApprovedCertificates certificates={certificates} />

      </div>
    </div>
  );
}



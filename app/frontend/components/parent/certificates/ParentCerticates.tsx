
"use client";

import { Clock, CheckCircle, FileText } from "lucide-react";
import StatCard from "../../common/statCard";
import CertificateRequestCard from "./CertificateRequestCard";
import CertificatesCard from "./CertificatesCard";
import ApprovedCertificates from "./ApprovedCertificates";

export default function ParentCertificatesTab() {
  const certificateStats = [
    {
      title: "PROCESSING",
      value: "1",
      icon: Clock,
      iconBg: "bg-orange-500/20",
      iconBorder: "border-orange-400/30",
      iconColor: "text-orange-400",
    },
    {
      title: "TOTAL ISSUED",
      value: "3",
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
              Manage certificates for Aarav Kumar
            </p>
          </div>

          <button className="w-full sm:w-auto px-6 py-4 bg-[#A3E635] text-black rounded-2xl hover:bg-[#A3E635]/90 transition-all font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.4)] hover:scale-[1.02] active:scale-[0.98] min-h-[44px] text-sm lg:text-base whitespace-nowrap">
            <FileText />
            Request Certificate
          </button>

        </div>

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
            <span className="px-2 lg:px-3 py-1 bg-orange-500/20 text-orange-500 rounded-full text-xs font-bold flex-shrink-0 border border-orange-500/30">2 Active</span>
          </div>
          </div>
          {/* Processing Card */}
          <CertificateRequestCard
            title="Bonafide Certificate"
            purpose="Bank Account Opening"
            requestId="REQ2026011801"
            status="processing"
            requestDate="18 Jan 2026"
            secondDateLabel="Expected Date"
            secondDate="25 Jan 2026"
            daysElapsed="24 days"
            progress={70}
          />

          {/* Ready Card */}
          <CertificateRequestCard
            title="Character Certificate"
            purpose="Scholarship Application"
            requestId="REQ2026011502"
            status="ready"
            requestDate="15 Jan 2026"
            secondDateLabel="Approved Date"
            secondDate="20 Jan 2026"
            daysElapsed="27 days"
            highPriority
          />

        </div>
        <div className="mt-6 lg:mt-8">
          <ApprovedCertificates />
           </div>

      </div>
    </div>
  );
}

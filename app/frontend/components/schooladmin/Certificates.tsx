"use client";

import PageHeader from "../common/PageHeader";
import { CircleAlert, Clock, FileText, SquareCheck } from "lucide-react";
import StatCard from "../common/statCard";
import CertificatesTab from "./certificatesTab/CertificatesTab";

export default function SchoolAdminCertificatesTab() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6 text-gray-200">
      
      {/* ===== Page Header ===== */}
      <PageHeader
        title="Certificate Requests"
        subtitle="Manage and process student certificate applications."
      />

      {/* ===== Stats Section ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <StatCard
          title="Total Requests"
          value={<span className="text-xl sm:text-2xl font-semibold">0</span>}
          icon={
            <FileText className="text-blue-400/20 w-12 h-12 sm:w-14 sm:h-14 lg:w-[70px] lg:h-[70px]" />
          }
          iconVariant="plain"
        />

        <StatCard
          title="Pending"
          value={<span className="text-xl sm:text-2xl font-semibold">0</span>}
          icon={
            <Clock className="text-orange-400/20 w-12 h-12 sm:w-14 sm:h-14 lg:w-[70px] lg:h-[70px]" />
          }
          iconVariant="plain"
        />

        <StatCard
          title="Approved"
          value={<span className="text-xl sm:text-2xl font-semibold">0</span>}
          icon={
            <SquareCheck className="text-lime-400/20 w-12 h-12 sm:w-14 sm:h-14 lg:w-[70px] lg:h-[70px]" />
          }
          iconVariant="plain"
        />

        <StatCard
          title="Rejected"
          value={<span className="text-xl sm:text-2xl font-semibold">0</span>}
          icon={
            <CircleAlert className="text-red-400/20 w-12 h-12 sm:w-14 sm:h-14 lg:w-[70px] lg:h-[70px]" />
          }
          iconVariant="plain"
        />
      </div>

      {/* ===== Certificates Content ===== */}
      <div className="mt-6 w-full overflow-x-auto">
        <CertificatesTab />
      </div>

    </div>
  );
}

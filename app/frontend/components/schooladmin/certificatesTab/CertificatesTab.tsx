"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Download,
} from "lucide-react";

type Status = "pending" | "approved" | "rejected";

interface CertificateRequest {
  id: number;
  student: string;
  className: string;
  type: string;
  purpose: string;
  date: string;
  status: Status;
}

const DATA: CertificateRequest[] = [
  {
    id: 1,
    student: "Aarav Kumar",
    className: "10-A",
    type: "Transfer Certificate",
    purpose: "Transferring to another school",
    date: "Jan 25, 2026",
    status: "pending",
  },
  {
    id: 2,
    student: "Diya Patel",
    className: "9-A",
    type: "Character Certificate",
    purpose: "College application",
    date: "Jan 26, 2026",
    status: "pending",
  },
  {
    id: 3,
    student: "Arjun Shah",
    className: "10-B",
    type: "Transfer Certificate",
    purpose: "Transferring to another school",
    date: "Jan 20, 2026",
    status: "approved",
  },
  {
    id: 4,
    student: "Sneha Gupta",
    className: "12-C",
    type: "Bonafide Certificate",
    purpose: "Passport Application",
    date: "Jan 15, 2026",
    status: "approved",
  },
  {
    id: 5,
    student: "Rohan Mehra",
    className: "11-B",
    type: "Leave Certificate",
    purpose: "Invalid Reason",
    date: "Jan 10, 2026",
    status: "rejected",
  },
];

export default function CertificatesTab() {
  const [activeTab, setActiveTab] = useState<Status>("pending");

  const filtered = DATA.filter((d) => d.status === activeTab);

  const count = (status: Status) =>
    DATA.filter((d) => d.status === status).length;

  return (
    <div className="  w-full">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 overflow-hidden">

        {/* ================= TABS ================= */}
        <div className="grid grid-cols-3 text-[11px] sm:text-sm font-medium">
          {(["pending", "approved", "rejected"] as Status[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 transition relative ${
                activeTab === tab
                  ? "text-lime-400"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {tab === "pending" && `Pending (${count("pending")})`}
              {tab === "approved" && `Approved (${count("approved")})`}
              {tab === "rejected" && `Rejected (${count("rejected")})`}

              {activeTab === tab && (
                <span className="absolute left-0 bottom-0 w-full h-[2px] bg-lime-400" />
              )}
            </button>
          ))}
        </div>

        {/* ================= MOBILE CARDS (<md) ================= */}
        <div className="md:hidden p-4 space-y-4">
          {filtered.map((row) => (
            <div
              key={row.id}
              className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{row.student}</div>
                  <div className="text-xs text-white/70">{row.type}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-[11px]">
                  {row.className}
                </span>
              </div>

              <div className="text-xs text-white/70 space-y-1">
                <div>
                  <span className="text-white/50">Purpose: </span>
                  {row.purpose}
                </div>
                <div>
                  <span className="text-white/50">Requested: </span>
                  {row.date}
                </div>
              </div>

              {row.status === "pending" && (
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-1 px-3 py-2 rounded-full bg-lime-400 text-black text-xs font-semibold">
                    <CheckCircle size={14} />
                    Approve
                  </button>
                  <button className="flex items-center justify-center gap-1 px-3 py-2 rounded-full bg-red-500 text-white text-xs font-semibold">
                    <XCircle size={14} />
                    Reject
                  </button>
                </div>
              )}

              {row.status === "approved" && (
                <button className="w-full flex items-center justify-center gap-1 px-3 py-2 rounded-full bg-white/10 text-xs">
                  <Download size={14} />
                  Download
                </button>
              )}

              {row.status === "rejected" && (
                <span className="text-red-400 font-medium text-xs">
                  Rejected
                </span>
              )}
            </div>
          ))}
        </div>

        {/* ================= TABLE (md to lg) ================= */}
        <div className="hidden md:block lg:hidden overflow-x-auto hidden md:block">
          <table className="w-full text-sm">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-white/5 transition-all">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium">{row.student}</div>
                    <div className="text-xs text-white/60">{row.date}</div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs">
                      {row.className}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-sm">{row.type}</div>
                    <div className="text-xs text-white/60">{row.purpose}</div>
                  </td>

                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {row.status === "pending" && (
                      <div className="flex justify-end gap-1.5">
                        <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-lime-400 text-black text-xs font-semibold">
                          <CheckCircle size={14} />
                          <span className="hidden md:inline">Approve</span>
                        </button>
                        <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-red-500 text-white text-xs font-semibold">
                          <XCircle size={14} />
                          <span className="hidden md:inline">Reject</span>
                        </button>
                      </div>
                    )}

                    {row.status === "approved" && (
                      <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/10 text-xs">
                        <Download size={14} />
                        <span className="hidden md:inline">Download</span>
                      </button>
                    )}

                    {row.status === "rejected" && (
                      <span className="text-red-400 font-medium text-xs">
                        Rejected
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= TABLE (lg+) ================= */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
    <thead className="bg-white/5 border-b border-white/10">
      <tr>
        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">STUDENT NAME</th>
        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">CLASS</th>
        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">CERTIFICATE TYPE</th>
        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
          PURPOSE
        </th>
        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
          REQUEST DATE
        </th>
        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">ACTIONS</th>
      </tr>
    </thead>

    <tbody className="divide-y divide-white/10">
      {filtered.map((row) => (
        <tr
          key={row.id}
          className="hover:bg-white/5 transition-all"
        >
          <td className="px-6 py-4 whitespace-nowrap">
            {row.student}
          </td>

          <td className="px-6 py-4 whitespace-nowrap">
            <span className="px-3 py-1 rounded-full bg-white/10 text-xs">
              {row.className}
            </span>
          </td>

          <td className="px-6 py-4 whitespace-nowrap">
            {row.type}
          </td>

          <td className="px-6 py-4 text-white/70 hidden lg:table-cell">
            {row.purpose}
          </td>

          <td className="px-6 py-4 text-white/70 hidden md:table-cell">
            {row.date}
          </td>

          {/* ================= ACTIONS ================= */}
          <td className="px-6 py-4 text-right whitespace-nowrap">
            {row.status === "pending" && (
              <div className="flex justify-end gap-2">
                <button className="flex items-center gap-1 px-3 py-2 rounded-full bg-lime-400 text-black text-xs font-semibold">
                  <CheckCircle size={14} />
                  <span className="hidden sm:inline">Approve</span>
                </button>
                <button className="flex items-center gap-1 px-3 py-2 rounded-full bg-red-500 text-white text-xs font-semibold">
                  <XCircle size={14} />
                  <span className="hidden sm:inline">Reject</span>
                </button>
              </div>
            )}

            {row.status === "approved" && (
              <button className="flex items-center gap-1 px-3 py-2 rounded-full bg-white/10 text-xs">
                <Download size={14} />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}

            {row.status === "rejected" && (
              <span className="text-red-400 font-medium">
                Rejected
              </span>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


        

      </div>
    </div>
  );
}


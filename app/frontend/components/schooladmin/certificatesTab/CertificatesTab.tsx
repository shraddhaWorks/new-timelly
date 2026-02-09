"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Download, Loader2 } from "lucide-react";
import type { TCListItem } from "../Certificates";

type TabStatus = "pending" | "approved" | "rejected";

const STATUS_MAP: Record<string, TabStatus> = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function classNameDisplay(tc: TCListItem): string {
  const c = tc.student?.class;
  if (!c) return "—";
  return c.section ? `${c.name}-${c.section}` : c.name;
}

interface CertificatesTabProps {
  tcs: TCListItem[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export default function CertificatesTab({
  tcs,
  loading,
  error,
  onRefresh,
}: CertificatesTabProps) {
  const [activeTab, setActiveTab] = useState<TabStatus>("pending");
  const [actingId, setActingId] = useState<string | null>(null);

  const filtered = tcs.filter(
    (t) => STATUS_MAP[t.status] === activeTab
  );

  const count = (status: TabStatus) =>
    tcs.filter((t) => STATUS_MAP[t.status] === status).length;

  const handleApprove = async (id: string) => {
    setActingId(id);
    try {
      const res = await fetch(`/api/tc/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Approve failed");
      onRefresh();
    } catch (e: any) {
      alert(e?.message || "Failed to approve");
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActingId(id);
    try {
      const res = await fetch(`/api/tc/${id}/reject`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Reject failed");
      onRefresh();
    } catch (e: any) {
      alert(e?.message || "Failed to reject");
    } finally {
      setActingId(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-2xl bg-white/5 border border-white/10 p-6 text-center text-red-400">
        {error}
        <button
          onClick={onRefresh}
          className="mt-3 text-sm text-lime-400 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 overflow-hidden">
        <div className="grid grid-cols-3 text-[11px] sm:text-sm font-medium">
          {(["pending", "approved", "rejected"] as TabStatus[]).map((tab) => (
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

        {/* Mobile cards */}
        <div className="md:hidden p-4 space-y-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-white/60 py-6 text-center">
              No {activeTab} requests
            </p>
          ) : (
            filtered.map((row) => (
              <div
                key={row.id}
                className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">
                      {row.student?.user?.name ?? "—"}
                    </div>
                    <div className="text-xs text-white/70">
                      Transfer Certificate
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white/10 text-[11px]">
                    {classNameDisplay(row)}
                  </span>
                </div>
                <div className="text-xs text-white/70 space-y-1">
                  <div>
                    <span className="text-white/50">Purpose: </span>
                    {row.reason || "—"}
                  </div>
                  <div>
                    <span className="text-white/50">Requested: </span>
                    {formatDate(row.createdAt)}
                  </div>
                </div>
                {STATUS_MAP[row.status] === "pending" && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      disabled={!!actingId}
                      onClick={() => handleApprove(row.id)}
                      className="flex items-center justify-center gap-1 px-3 py-2 rounded-full bg-lime-400 text-black text-xs font-semibold disabled:opacity-50"
                    >
                      {actingId === row.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <CheckCircle size={14} />
                      )}
                      Approve
                    </button>
                    <button
                      disabled={!!actingId}
                      onClick={() => handleReject(row.id)}
                      className="flex items-center justify-center gap-1 px-3 py-2 rounded-full bg-red-500 text-white text-xs font-semibold disabled:opacity-50"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                  </div>
                )}
                {STATUS_MAP[row.status] === "approved" && (
                  row.tcDocumentUrl ? (
                    <a
                      href={row.tcDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1 px-3 py-2 rounded-full bg-white/10 hover:bg-white/15 text-xs"
                    >
                      <Download size={14} />
                      Download
                    </a>
                  ) : (
                    <span className="w-full flex items-center justify-center gap-1 px-3 py-2 rounded-full bg-white/5 text-white/50 text-xs cursor-default">
                      <Download size={14} />
                      N/A
                    </span>
                  )
                )}
                {STATUS_MAP[row.status] === "rejected" && (
                  <span className="text-red-400 font-medium text-xs">
                    Rejected
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Table md–lg */}
        <div className="hidden md:block lg:hidden overflow-x-auto">
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-white/60 text-sm">
                    No {activeTab} requests
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-all">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium">
                        {row.student?.user?.name ?? "—"}
                      </div>
                      <div className="text-xs text-white/60">
                        {formatDate(row.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full bg-white/10 text-xs">
                        {classNameDisplay(row)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">Transfer Certificate</div>
                      <div className="text-xs text-white/60">
                        {row.reason || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {STATUS_MAP[row.status] === "pending" && (
                        <div className="flex justify-end gap-1.5">
                          <button
                            disabled={!!actingId}
                            onClick={() => handleApprove(row.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-lime-400 text-black text-xs font-semibold disabled:opacity-50"
                          >
                            {actingId === row.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <CheckCircle size={14} />
                            )}
                            <span className="hidden md:inline">Approve</span>
                          </button>
                          <button
                            disabled={!!actingId}
                            onClick={() => handleReject(row.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-red-500 text-white text-xs font-semibold disabled:opacity-50"
                          >
                            <XCircle size={14} />
                            <span className="hidden md:inline">Reject</span>
                          </button>
                        </div>
                      )}
                      {STATUS_MAP[row.status] === "approved" && (
                        row.tcDocumentUrl ? (
                          <a
                            href={row.tcDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs"
                          >
                            <Download size={14} />
                            <span className="hidden md:inline">Download</span>
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/5 text-white/50 text-xs cursor-default">
                            <Download size={14} />
                            <span className="hidden md:inline">N/A</span>
                          </span>
                        )
                      )}
                      {STATUS_MAP[row.status] === "rejected" && (
                        <span className="text-red-400 font-medium text-xs">
                          Rejected
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table lg+ */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  STUDENT NAME
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  CLASS
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  CERTIFICATE TYPE
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  PURPOSE
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  REQUEST DATE
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-white/60 text-sm"
                  >
                    No {activeTab} requests
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-all">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.student?.user?.name ?? "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full bg-white/10 text-xs">
                        {classNameDisplay(row)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      Transfer Certificate
                    </td>
                    <td className="px-6 py-4 text-white/70">
                      {row.reason || "—"}
                    </td>
                    <td className="px-6 py-4 text-white/70">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {STATUS_MAP[row.status] === "pending" && (
                        <div className="flex justify-end gap-2">
                          <button
                            disabled={!!actingId}
                            onClick={() => handleApprove(row.id)}
                            className="flex items-center gap-1 px-3 py-2 rounded-full bg-lime-400 text-black text-xs font-semibold disabled:opacity-50"
                          >
                            {actingId === row.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <CheckCircle size={14} />
                            )}
                            <span className="hidden sm:inline">Approve</span>
                          </button>
                          <button
                            disabled={!!actingId}
                            onClick={() => handleReject(row.id)}
                            className="flex items-center gap-1 px-3 py-2 rounded-full bg-red-500 text-white text-xs font-semibold disabled:opacity-50"
                          >
                            <XCircle size={14} />
                            <span className="hidden sm:inline">Reject</span>
                          </button>
                        </div>
                      )}
                      {STATUS_MAP[row.status] === "approved" && (
                        row.tcDocumentUrl ? (
                          <a
                            href={row.tcDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-white/10 hover:bg-white/15 text-xs"
                          >
                            <Download size={14} />
                            <span className="hidden sm:inline">Download</span>
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-white/5 text-white/50 text-xs cursor-default">
                            <Download size={14} />
                            <span className="hidden sm:inline">N/A</span>
                          </span>
                        )
                      )}
                      {STATUS_MAP[row.status] === "rejected" && (
                        <span className="text-red-400 font-medium">
                          Rejected
                        </span>
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
  );
}

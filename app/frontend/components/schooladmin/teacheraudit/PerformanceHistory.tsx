"use client";

import { History, Zap } from "lucide-react";
import type { AuditRecord } from "./types";
import { categoryToLabel } from "./types";

interface PerformanceHistoryProps {
  records: AuditRecord[];
}

export default function PerformanceHistory({ records }: PerformanceHistoryProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-5">
      <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/80 mb-3">
        <History className="w-4 h-4 flex-shrink-0" />
        Performance History
      </h4>
      {records.length === 0 ? (
        <p className="text-white/50 text-sm">No records yet.</p>
      ) : (
        <div className="space-y-3">
          {records.map((r) => (
            <div
              key={r.id}
              className="flex items-start justify-between gap-3 rounded-lg bg-white/5 border border-white/10 p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-white text-sm">
                    {categoryToLabel(r.category, r.customCategory)}
                  </span>
                  <span className="text-white/50 text-xs">
                    {new Date(r.createdAt).toLocaleDateString("en-CA")}
                  </span>
                </div>
                <p className="text-white/70 text-sm mt-1">{r.description}</p>
              </div>
              <span
                className={`flex items-center gap-1 flex-shrink-0 text-sm font-semibold ${
                  r.scoreImpact >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                <Zap className="w-4 h-4 flex-shrink-0" />
                {r.scoreImpact >= 0 ? `+${r.scoreImpact}` : r.scoreImpact}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

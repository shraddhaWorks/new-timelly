import { Calendar, Clock, CheckCircle2, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { CircularRow } from "./types";
import { getImportanceBorderColor, getInitial } from "./helpers";
import { CIRCULAR_PUBLISHED_GREEN } from "@/app/frontend/constants/colors";

export default function CircularCard({ c }: { c: CircularRow }) {
  return (
    <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
      <div
        className="h-1"
        style={{ background: getImportanceBorderColor(c.importanceLevel) }}
      />

      <div className="p-4 space-y-3">
        <span className="text-xs text-white/50 font-mono">
          {c.referenceNumber}
        </span>

        <h3 className="text-lg font-bold text-white line-clamp-2">
          {c.subject}
        </h3>

        <p className="text-sm text-white/70 line-clamp-3">
          {c.content}
        </p>

        {(c.recipients?.length > 0 || c.targetClass || (c as { targetClasses?: unknown[] }).targetClasses?.length) && (
          <div className="flex flex-wrap gap-1.5 text-xs">
            {((c as { targetClasses?: { name: string; section: string | null }[] }).targetClasses ?? (c.targetClass ? [c.targetClass] : [])).map((cls) => (
              <span key={(cls as { id?: string }).id ?? cls.name} className="px-2 py-0.5 rounded-lg bg-lime-400/20 text-lime-400">
                {cls.name}{cls.section ? ` ${cls.section}` : ""}
              </span>
            ))}
            {(c.recipients ?? []).filter((r) => r !== "all").map((r) => (
              <span key={r} className="px-2 py-0.5 rounded-lg bg-white/10 text-white/80 capitalize">
                {r}
              </span>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 text-sm text-white">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ background: CIRCULAR_PUBLISHED_GREEN }}
            >
              {getInitial(c.issuedBy?.name)}
            </div>
            {c.issuedBy?.name}
          </div>

          <div className="flex items-center gap-1 text-white/70 text-sm">
            <Calendar size={14} />
            {formatDate(c.date)}
          </div>
        </div>
      </div>
    </div>
  );
}

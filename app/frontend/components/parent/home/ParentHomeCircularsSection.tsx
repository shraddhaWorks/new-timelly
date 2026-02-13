"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import SearchInput from "../../common/SearchInput";
import CircularNoticeCard from "../../common/CircularNoticeCard";
import { ParentCircular } from "./types";

const ACCENT_COLORS = ["bg-red-500", "bg-yellow-400", "bg-blue-500", "bg-lime-400"];
const IMPORTANCE_FILTERS = ["all", "high", "medium", "low"] as const;

type ImportanceFilter = (typeof IMPORTANCE_FILTERS)[number];

type Props = {
  circulars: ParentCircular[];
};

function normalizeImportance(value?: string | null): ImportanceFilter {
  const lower = value?.toLowerCase();
  if (lower === "high" || lower === "medium" || lower === "low") return lower;
  return "medium";
}

export default function ParentHomeCircularsSection({ circulars }: Props) {
  const [search, setSearch] = useState("");
  const [importance, setImportance] = useState<ImportanceFilter>("all");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return circulars.filter((item) => {
      const itemImportance = normalizeImportance(item.importanceLevel);
      const matchImportance = importance === "all" ? true : importance === itemImportance;
      const matchQuery =
        query.length === 0
          ? true
          : item.subject.toLowerCase().includes(query) ||
            item.referenceNumber.toLowerCase().includes(query) ||
            item.content.toLowerCase().includes(query);
      return matchImportance && matchQuery;
    });
  }, [circulars, importance, search]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="w-1.5 h-12 rounded-full bg-lime-400 mt-1" />
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">Circulars & Notices</h3>
            <p className="text-sm text-gray-400 mt-1">Create and manage school-wide circulars</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="w-full lg:max-w-md">
            <SearchInput
              value={search}
              onChange={setSearch}
              icon={Search}
              showSearchIcon
              placeholder="Search circulars by title.."
              variant="glass"
              className="text-sm"
            />
          </div>

          <div className="flex gap-2">
            {IMPORTANCE_FILTERS.map((filter) => {
              const active = importance === filter;
              const label =
                filter === "all"
                  ? "All Importance"
                  : `${filter.charAt(0).toUpperCase()}${filter.slice(1)}`;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setImportance(filter)}
                  className={`h-[42px] px-4 border rounded-xl text-sm font-medium whitespace-nowrap ${
                    active
                      ? "bg-lime-400/10 text-lime-300 border-lime-400/40"
                      : "bg-white/5 text-white/60 border-white/15 hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
          No circulars found for the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c, index) => (
            <CircularNoticeCard
              key={c.id}
              referenceNumber={c.referenceNumber}
              subject={c.subject}
              content={c.content}
              publishStatus={c.publishStatus}
              date={c.date}
              issuedBy={c.issuedBy?.name ?? "School Admin"}
              attachments={c.attachments}
              accentClassName={ACCENT_COLORS[index % ACCENT_COLORS.length]}
            />
          ))}
        </div>
      )}
    </section>
  );
}

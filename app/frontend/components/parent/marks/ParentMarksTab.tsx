"use client";

import { useState, useEffect, useCallback } from "react";
import PageHeader from "../../common/PageHeader";
import DataTable from "../../common/TableLayout";
import { Column } from "@/app/frontend/types/superadmin";
import { AlertCircle } from "lucide-react";

type MarkRow = {
  id: string;
  subject: string;
  marks: number;
  totalMarks: number;
  grade: string | null;
  suggestions: string | null;
  createdAt: string;
  class: { id: string; name: string; section: string | null };
  teacher?: { id: string; name: string | null; email: string | null };
};

function getPercentage(marks: number, total: number): string {
  if (total <= 0) return "--";
  return `${((marks / total) * 100).toFixed(1)}%`;
}

export default function ParentMarksTab() {
  const [marks, setMarks] = useState<MarkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/marks/view");
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to load marks");
        setMarks([]);
        return;
      }
      setMarks(Array.isArray(data.marks) ? data.marks : []);
    } catch {
      setError("Something went wrong");
      setMarks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarks();
  }, [fetchMarks]);

  const columns: Column<MarkRow>[] = [
    { header: "SUBJECT", accessor: "subject" },
    {
      header: "MARKS",
      align: "center",
      render: (row: MarkRow) => (
        <span className="font-medium text-white">
          {row.marks} / {row.totalMarks}
        </span>
      ),
    },
    {
      header: "PERCENTAGE",
      align: "center",
      render: (row: MarkRow) => (
        <span className="font-medium text-white">
          {getPercentage(row.marks, row.totalMarks)}
        </span>
      ),
    },
    {
      header: "GRADE",
      align: "center",
      render: (row: MarkRow) => {
        const g = row.grade || "--";
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs border ${
              g === "A+"
                ? "bg-lime-400/10 text-lime-400 border-lime-400/30"
                : "bg-white/5 text-gray-200 border-white/20"
            }`}
          >
            {g}
          </span>
        );
      },
    },
    {
      header: "CLASS",
      align: "center",
      render: (row: MarkRow) => (
        <span className="text-white/80">
          {row.class?.name}
          {row.class?.section ? ` - ${row.class.section}` : ""}
        </span>
      ),
    },
    {
      header: "DATE",
      align: "center",
      render: (row: MarkRow) => (
        <span className="text-white/70 text-sm">
          {new Date(row.createdAt).toLocaleDateString("en-IN")}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen text-white px-3 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <PageHeader
            title="Marks"
            subtitle="View your child's marks and grades"
          />
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-lime-500/30 border-t-lime-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading marks...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen text-white px-3 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <PageHeader
            title="Marks"
            subtitle="View your child's marks and grades"
          />
          <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center">
            <AlertCircle className="w-16 h-16 text-amber-400" />
            <p className="text-white font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white px-3 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Marks"
          subtitle="View your child's marks and grades"
        />

        <div className="glass-card rounded-2xl overflow-hidden border border-white/10 flex flex-col">
          <div className="p-6 border-b border-white/10 bg-white/[0.02]">
            <h3 className="font-bold text-white text-lg">Marks Overview</h3>
            <p className="text-sm text-white/60 mt-1">
              All subjects and grades for the current session
            </p>
          </div>

          {marks.length === 0 ? (
            <div className="p-12 text-center text-white/60">
              No marks recorded yet. Marks will appear here once teachers enter them.
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <DataTable<MarkRow>
                  columns={columns}
                  rounded={false}
                  data={marks}
                  rowKey={(row) => row.id}
                />
              </div>

              <div className="md:hidden space-y-4 p-4">
                {marks.map((row) => {
                  const percentage = getPercentage(row.marks, row.totalMarks);
                  const g = row.grade || "--";
                  return (
                    <div
                      key={row.id}
                      className="rounded-2xl p-5 border border-white/10 bg-gradient-to-br from-purple-700/40 via-indigo-700/30 to-purple-900/40 backdrop-blur-xl shadow-xl"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-semibold">{row.subject}</div>
                          <div className="text-xs text-white/60">
                            {row.class?.name}
                            {row.class?.section ? ` - ${row.class.section}` : ""} •{" "}
                            {new Date(row.createdAt).toLocaleDateString("en-IN")}
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs border bg-lime-400/20 text-lime-400 border-lime-400/40">
                          {g}
                        </span>
                      </div>
                      <div className="mt-5 flex justify-between text-sm">
                        <span className="text-white/60">Marks</span>
                        <span className="text-white font-semibold">
                          {row.marks} / {row.totalMarks} ({percentage})
                        </span>
                      </div>
                      {row.suggestions && (
                        <p className="mt-3 text-xs text-white/50 border-t border-white/10 pt-3">
                          {row.suggestions}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-white/[0.02] border-t border-white/10">
                <div className="text-sm text-gray-400">
                  TOTAL <span className="text-white font-semibold ml-1">{marks.length}</span> entries
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

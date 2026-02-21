"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PageHeader from "../common/PageHeader";

import CircularFilters from "./circularTab/CircularFilters";
import CircularList from "./circularTab/CircularList";
import CircularForm from "./circularTab/CircularForm";
import { CircularRow } from "./circularTab/types";
import { Plus, Scroll, X } from "lucide-react";

export default function SchoolAdminCircularsTab() {
  const [circulars, setCirculars] = useState<CircularRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [importance, setImportance] = useState("All Importance");
  const [recipient, setRecipient] = useState("all");
  const [classId, setClassId] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCirculars = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ status: "all" });
      if (recipient && recipient !== "all") params.set("recipient", recipient);
      if (classId) params.set("classId", classId);
      const res = await fetch(`/api/circular/list?${params}`);
      const data = await res.json();
      setCirculars(data.circulars ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [recipient, classId]);

  useEffect(() => {
    fetchCirculars();
  }, [fetchCirculars]);

  const filteredCirculars = useMemo(() => {
    return circulars.filter((c) => {
      if (search && !c.subject.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (importance !== "All Importance" && c.importanceLevel !== importance) {
        return false;
      }
      return true;
    });
  }, [circulars, search, importance]);

  return (
    <div className="min-h-screen text-white">
      {/* HEADER */}
     
      <PageHeader
      className=""
         icon={<Scroll className="w-5 h-7 size-1/12" />}
        title="Circulars & Notices"
        subtitle="Create and manage school-wide circulars"
        transparent={true}
        rightSlot={
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="
              flex items-center justify-center gap-2
              px-5 py-3
              rounded-full
              bg-lime-400 text-black font-semibold
              hover:bg-lime-300 transition
              w-full sm:w-auto
            "
          >
            {showForm ? (
              <>
              <X className="w-5 h-5" />
              <span>Cancel</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" /><span>Create Circular</span>
              </>
            )}
          </button>
        }
      />

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto mt-4 sm:mt-6 space-y-4 sm:space-y-6">
        {/* FORM (pushes content down) */}
        {showForm && (
          <div className="w-full">
            <CircularForm
              onClose={() => setShowForm(false)}
              onSuccess={async () => {
                setShowForm(false);
                await fetchCirculars();
              }}
            />
          </div>
        )}

        {/* FILTER CARD */}
        <div className="p-3 sm:p-4">
          <CircularFilters
            search={search}
            onSearch={setSearch}
            importance={importance}
            onImportance={setImportance}
            recipient={recipient}
            onRecipient={setRecipient}
            classId={classId}
            onClassId={setClassId}
          />
        </div>

        {/* LIST / LOADER */}
        {loading ? (
          <div className="flex justify-center items-center py-12 sm:py-16">
            <div className="h-8 w-8 sm:h-10 sm:w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        ) : (
          <CircularList circulars={filteredCirculars} />
        )}
      </div>
    </div>
  );
}

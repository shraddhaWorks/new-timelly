"use client";

import { useEffect, useMemo, useState } from "react";
import { CreditCard, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import PageHeader from "../common/PageHeader";
import SearchInput from "../common/SearchInput";
import TableLayout from "../common/TableLayout";
import Spinner from "../common/Spinner";
import { Column } from "../../types/superadmin";

type BillingMode = "PARENT_SUBSCRIPTION" | "SCHOOL_PAID";

export interface SubscriptionRow {
  id: string;
  name: string;
  location: string;
  createdAt: string;
  billingMode: BillingMode;
  parentSubscriptionAmount: number | null;
  parentSubscriptionTrialDays: number;
  isActive: boolean;
}

export default function Subscriptions() {
  const [rows, setRows] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<SubscriptionRow | null>(null);

  const fetchSchools = async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set("search", searchTerm.trim());
      const res = await fetch(`/api/superadmin/schools?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load schools");
      }
      const list = (data.schools ?? []).map((s: any) => ({
        id: s.id,
        name: s.name,
        location: s.location,
        createdAt: s.createdAt,
        billingMode: (s.billingMode ?? "PARENT_SUBSCRIPTION") as BillingMode,
        parentSubscriptionAmount:
          typeof s.parentSubscriptionAmount === "number" ? s.parentSubscriptionAmount : null,
        parentSubscriptionTrialDays:
          typeof s.parentSubscriptionTrialDays === "number" ? s.parentSubscriptionTrialDays : 0,
        isActive: typeof s.isActive === "boolean" ? s.isActive : true,
      }));
      setRows(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error loading subscriptions");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (
    id: string,
    patch: Partial<
      Pick<
        SubscriptionRow,
        "name" | "billingMode" | "parentSubscriptionAmount" | "parentSubscriptionTrialDays" | "isActive"
      >
    >
  ) => {
    setSavingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/superadmin/schools/${id}/subscription`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update subscription");
      }
      const u = data.school;
      setRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                name: u.name ?? r.name,
                billingMode: (u.billingMode ?? "PARENT_SUBSCRIPTION") as BillingMode,
                parentSubscriptionAmount:
                  typeof u.parentSubscriptionAmount === "number" ? u.parentSubscriptionAmount : null,
                parentSubscriptionTrialDays:
                  typeof u.parentSubscriptionTrialDays === "number" ? u.parentSubscriptionTrialDays : 0,
                isActive: typeof u.isActive === "boolean" ? u.isActive : true,
              }
            : r
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error updating subscription");
    } finally {
      setSavingId(null);
    }
  };

  const columns = useMemo<Column<SubscriptionRow>[]>(
    () => [
      {
        header: "School",
        render: (r) => (
          <div className="flex flex-col">
            <span className="text-white font-medium">{r.name}</span>
            <span className="text-xs text-white/50">{r.location || "-"}</span>
          </div>
        ),
      },
      {
        header: "Created",
        align: "center",
        render: (r) => (
          <span className="text-xs text-white/60">
            {new Date(r.createdAt).toLocaleDateString("en-IN")}
          </span>
        ),
      },
      {
        header: "Mode",
        align: "center",
        render: (r) => (
          <div className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-white/15 bg-white/5">
            {r.billingMode === "SCHOOL_PAID" ? (
              <>
                <ToggleRight className="w-3.5 h-3.5 text-lime-300" />
                <span className="text-white/80">School Paid</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-white/80">Parent Subscription</span>
              </>
            )}
          </div>
        ),
      },
      {
        header: "Amount (₹ / year)",
        align: "center",
        render: (r) =>
          r.billingMode === "PARENT_SUBSCRIPTION" ? (
            <span className="text-white text-sm">
              {typeof r.parentSubscriptionAmount === "number"
                ? `₹${r.parentSubscriptionAmount.toLocaleString("en-IN")}`
                : "-"}
            </span>
          ) : (
            <span className="text-white/40 text-xs">Included (school paid)</span>
          ),
      },
      {
        header: "Trial Days",
        align: "center",
        render: (r) =>
          r.billingMode === "PARENT_SUBSCRIPTION" ? (
            <span className="text-white">{r.parentSubscriptionTrialDays ?? 0}</span>
          ) : (
            <span className="text-white/40 text-xs">-</span>
          ),
      },
      {
        header: "Status",
        align: "center",
        render: (r) => (
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
              r.isActive
                ? "bg-emerald-500/10 border-emerald-400/40 text-emerald-300"
                : "bg-red-500/10 border-red-400/40 text-red-300"
            }`}
          >
            {r.isActive ? "Active" : "Deactivated"}
          </span>
        ),
      },
      {
        header: "Actions",
        align: "center",
        render: (r) => (
          <button
            type="button"
            onClick={() => setEditing(r)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 text-xs text-white hover:bg-white/10"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        ),
      },
    ],
    []
  );

  const handleModalSave = async () => {
    if (!editing) return;
    await handleSave(editing.id, {
      name: editing.name,
      billingMode: editing.billingMode,
      parentSubscriptionAmount: editing.parentSubscriptionAmount ?? null,
      parentSubscriptionTrialDays: editing.parentSubscriptionTrialDays ?? 0,
      isActive: editing.isActive,
    });
    setEditing(null);
  };

  return (
    <main className="flex-1 overflow-y-auto flex flex-col items-center">
      <div className="w-full min-h-screen space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-6">
        <PageHeader
          title="Subscriptions"
          subtitle="Manage SaaS subscription mode, pricing, and activation for each school"
          rightSlot={
            <div className="w-full max-w-sm">
              <SearchInput
                value={search}
                onChange={(v) => {
                  setSearch(v);
                  void fetchSchools(v);
                }}
                placeholder="Search school"
              />
            </div>
          }
        />

        {error && (
          <div className="text-red-400 text-sm py-2">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : (
          <TableLayout
            columns={columns}
            data={rows}
            emptyText="No schools found"
            rowKey={(row) => row.id}
          />
        )}

        <div className="mt-4 text-xs text-white/40 flex items-center gap-2">
          <CreditCard className="w-3.5 h-3.5" />
          <span>
            Deactivating a school locks access for its admins, teachers, and parents. They will see a
            Timelly notice to contact support when trying to use the portal.
          </span>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-3">
          <div className="w-full max-w-lg rounded-2xl bg-[#020617] border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Edit Subscription</h2>
              <button
                type="button"
                className="text-white/60 hover:text-white text-sm"
                onClick={() => setEditing(null)}
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-white/60 mb-1">School name</p>
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-lime-400/60"
                />
              </div>

              <div>
                <p className="text-xs text-white/60 mb-1">Subscription mode</p>
                <div className="inline-flex rounded-xl bg-white/5 border border-white/10 p-1">
                  <button
                    type="button"
                    onClick={() =>
                      setEditing((prev) =>
                        prev ? { ...prev, billingMode: "SCHOOL_PAID" } : prev
                      )
                    }
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium ${
                      editing.billingMode === "SCHOOL_PAID"
                        ? "bg-lime-400 text-black"
                        : "text-white/70 hover:bg-white/5"
                    }`}
                  >
                    School Paid
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditing((prev) =>
                        prev ? { ...prev, billingMode: "PARENT_SUBSCRIPTION" } : prev
                      )
                    }
                    className={`ml-1 px-3 py-1.5 text-xs rounded-lg font-medium ${
                      editing.billingMode === "PARENT_SUBSCRIPTION"
                        ? "bg-lime-400 text-black"
                        : "text-white/70 hover:bg-white/5"
                    }`}
                  >
                    Parent Subscription
                  </button>
                </div>
              </div>

              {editing.billingMode === "PARENT_SUBSCRIPTION" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-white/60 mb-1">Amount (₹ / year)</p>
                      <input
                        type="number"
                        min={0}
                        value={editing.parentSubscriptionAmount ?? ""}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            parentSubscriptionAmount:
                              e.target.value === "" ? null : Number(e.target.value),
                          })
                        }
                        className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-lime-400/60"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-1">Free trial days</p>
                      <input
                        type="number"
                        min={0}
                        value={editing.parentSubscriptionTrialDays ?? 0}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            parentSubscriptionTrialDays:
                              e.target.value === "" ? 0 : Number(e.target.value),
                          })
                        }
                        className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-lime-400/60"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <p className="text-xs text-white/60 mb-1">School status</p>
                <button
                  type="button"
                  onClick={() =>
                    setEditing((prev) =>
                      prev ? { ...prev, isActive: !prev.isActive } : prev
                    )
                  }
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    editing.isActive
                      ? "bg-emerald-500/10 border-emerald-400/40 text-emerald-300"
                      : "bg-red-500/10 border-red-400/40 text-red-300"
                  }`}
                >
                  {editing.isActive ? "Active" : "Deactivated"}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-lg border border-white/15 text-xs text-white/80 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingId === editing.id}
                onClick={handleModalSave}
                className="px-4 py-2 rounded-lg bg-lime-400 text-black text-xs font-semibold hover:bg-lime-300 disabled:opacity-60"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


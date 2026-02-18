"use client";

import PageHeader from "../common/PageHeader";
import HeaderActionButton from "../common/HeaderActionButton";

import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  Download,
  Plus,
  Upload,
  User,
  Users,
  Search,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import { useEffect, useState } from "react";
import AddClassPanel from "./classes-panels/AddClassPanel";
import AddSectionPanel from "./classes-panels/AddSectionPanel";
import UploadCsvPanel from "./classes-panels/UploadCsvPanel";
import ClassDetailsPanel from "./classes-panels/ClassDetailsPanel";
import EditClassPanel from "./classes-panels/EditClassPanel";
import DeleteClassPanel from "./classes-panels/DeleteClassPanel";
import SearchInput from "../common/SearchInput";
import SelectInput from "../common/SelectInput";
import InlinePanelTable from "../common/InlinePanelTable";;
import Spinner from "../common/Spinner";
import StatCard from "./StatCard";


export default function SchoolAdminClassesTab() {
  const [activeAction, setActiveAction] = useState<
    "class" | "section" | "csv" | "none"
  >("class");
  const [search, setSearch] = useState("");
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<"view" | "edit" | "delete" | null>(null);
  const [mobileEdit, setMobileEdit] = useState<{ className: string; section: string } | null>(null);
  const [classRows, setClassRows] = useState<
    {
      id: string;
      name: string;
      section: string;
      students: number;
      teacher: string;
      subject: string;
    }[]
  >([]);
  const [totalClasses, setTotalClasses] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [avgSize, setAvgSize] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  const loadClasses = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [classesRes, studentsRes, teachersRes] = await Promise.all([
        fetch("/api/class/list", { method: "GET" }),
        fetch("/api/student/list", { method: "GET" }),
        fetch("/api/teacher/list", { method: "GET" }),
      ]);

      if (!classesRes.ok) {
        throw new Error("Failed to load classes.");
      }

      const [classesData, studentsData, teachersData] = await Promise.all([
        classesRes.json(),
        studentsRes.ok ? studentsRes.json() : Promise.resolve(null),
        teachersRes.ok ? teachersRes.json() : Promise.resolve(null),
      ]);

      const rows = Array.isArray(classesData?.classes)
        ? classesData.classes
        : [];
      const studentCount = Array.isArray(studentsData?.students)
        ? studentsData.students.length
        : 0;
      const teacherCount = Array.isArray(teachersData?.teachers)
        ? teachersData.teachers.length
        : 0;

      setClassRows(
        rows.map((row: any) => ({
          id: row.id,
          name: row.name ?? "Untitled",
          section: row.section ? `Section ${row.section}` : "—",
          students: row?._count?.students ?? 0,
          teacher: row?.teacher?.name ?? "Unassigned",
          subject: row?.teacher?.email ?? "",
        }))
      );
      setTotalClasses(rows.length);
      setTotalStudents(studentCount);
      setTotalTeachers(teacherCount);
      setAvgSize(rows.length > 0 ? Math.round(studentCount / rows.length) : 0);
    } catch (err: any) {
      setClassRows([]);
      setLoadError(err?.message || "Failed to load classes.");
      setTotalClasses(0);
      setTotalStudents(0);
      setTotalTeachers(0);
      setAvgSize(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;
    if (!isActive) return;
    loadClasses();
    return () => {
      isActive = false;
    };
  }, []);

  const filteredRows = classRows.filter((row) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      row.name.toLowerCase().includes(q) ||
      row.section.toLowerCase().includes(q) ||
      row.teacher.toLowerCase().includes(q) ||
      row.subject.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const pagedRows = filteredRows.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const tableColumns = [
    {
      header: "CLASS NAME",
      render: (row: (typeof classRows)[number]) => (
        <span className="text-white font-medium">{row.name}</span>
      ),
    },
    {
      header: "SECTION",
      render: (row: (typeof classRows)[number]) => (
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
          {row.section}
        </span>
      ),
    },
    {
      header: "STUDENTS",
      align: "center" as const,
      render: (row: (typeof classRows)[number]) => (
        <span className="text-white font-semibold">{row.students}</span>
      ),
    },
    {
      header: "CLASS TEACHER",
      render: (row: (typeof classRows)[number]) => (
        <div>
          <div className="text-white font-medium">{row.teacher}</div>
          <div className="text-xs text-white/40">{row.subject}</div>
        </div>
      ),
    },
    {
      header: "ACTIONS",
      align: "center" as const,
      render: (row: (typeof classRows)[number]) => (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (activeRowId === row.id && panelMode === "view") {
                closePanel();
                return;
              }
              setActiveRowId(row.id);
              setPanelMode("view");
            }}
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (activeRowId === row.id && panelMode === "edit") {
                closePanel();
                return;
              }
              setActiveRowId(row.id);
              setPanelMode("edit");
            }}
            className="p-2 rounded-lg text-white/50 hover:text-green-400 hover:bg-white/10 transition-colors cursor-pointer"
            title="Edit"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (activeRowId === row.id && panelMode === "delete") {
                closePanel();
                return;
              }
              setActiveRowId(row.id);
              setPanelMode("delete");
            }}
            className="p-2 rounded-lg text-white/50 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const handleReportClick = () => {
    window.alert("Downloading Classes Report...");
  };

  const activeRow = activeRowId
    ? classRows.find((row) => row.id === activeRowId) ?? null
    : null;

  const closePanel = () => {
    setPanelMode(null);
    setActiveRowId(null);
    setMobileEdit(null);
  };

  const renderButton = (
    type: "class" | "section" | "csv" | "report",
    Icon: any,
    label: string,
    onClick: () => void,
    primary?: boolean
  ) => {
    const isActive =
      (type === "class" && activeAction === "class") ||
      (type === "section" && activeAction === "section") ||
      (type === "csv" && activeAction === "csv");

    return (
      <>
        {/* MOBILE */}
        <div className="xl:hidden">
          {isActive ? (
            <HeaderActionButton
              icon={Icon}
              label={label}
              primary={primary}
              onClick={onClick}
            />
          ) : (
            <button
              onClick={onClick}
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
            >
              <Icon size={18} />
            </button>
          )}
        </div>

        {/* DESKTOP */}
        <div className="hidden xl:block">
          <HeaderActionButton
            icon={Icon}
            label={label}
            primary={primary}
            onClick={onClick}
          />
        </div>
      </>
    );
  };

  return (
    <div className=" pb-24 lg:pb-6">
      <div className="w-full space-y-6 text-gray-200">
        {/* ================= HEADER ================= */}
        <PageHeader
          title="Classes Management"
          subtitle="Manage all classes, sections, and class teachers"
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/10 shadow-lg flex flex-col xl:flex-row xl:items-center justify-between gap-4"
          rightSlot={
            <div className="w-full xl:w-auto">
              <div className="flex flex-wrap gap-2 sm:gap-3 xl:justify-end">
                {renderButton(
                  "class",
                  Plus,
                  "Add Class",
                  () => setActiveAction("class"),
                  true
                )}

                {renderButton(
                  "section",
                  ChevronDown,
                  "Add Section",
                  () => setActiveAction("section")
                )}

                {renderButton(
                  "csv",
                  Upload,
                  "Upload CSV",
                  () => setActiveAction("csv")
                )}

                {renderButton(
                  "report",
                  Download,
                  "Report",
                  handleReportClick
                )}
              </div>
            </div>
          }
        />

        {activeAction === "class" && (
          <AddClassPanel
            onCancel={() => setActiveAction("none")}
            onSuccess={() => {
              setActiveAction("none");
              loadClasses();
            }}
          />
        )}
        {activeAction === "section" && (
          <AddSectionPanel
            onCancel={() => setActiveAction("none")}
            onSuccess={() => {
              setActiveAction("none");
              loadClasses();
            }}
          />
        )}
        {activeAction === "csv" && (
          <UploadCsvPanel onCancel={() => setActiveAction("none")} />
        )}

        {isLoading ? (
          <div className="py-6 flex items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Spinner size={28} label="Loading stats..." />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              icon={<BookOpen size={18} />}
              iconClassName="text-green-400"
              label="Total Classes"
              value={String(totalClasses)}
            />
            <StatCard
              icon={<Users size={18} />}
              iconClassName="text-violet-400"
              label="Total Students"
              value={String(totalStudents)}
            />
            <StatCard
              icon={<AlertTriangle size={18} />}
              iconClassName="text-orange-400"
              label="Avg Size"
              value={String(avgSize)}
            />
            <StatCard
              icon={<User size={18} />}
              iconClassName="text-blue-400"
              label="Teachers"
              value={String(totalTeachers)}
            />
          </div>
        )}

        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border-b border-white/10">
            <div className="text-lg font-semibold text-white">All Classes</div>
            <div className="w-full md:w-[260px]">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search classes..."
                icon={Search}
                variant="glass"
              />
            </div>
          </div>

          <div className="px-4 pb-4 lg:px-0 lg:pb-0 md:px-0 md:pb-0">
            {/* Desktop table with inline panels */}
            <div className="hidden lg:block">
              <InlinePanelTable
                columns={tableColumns}
                data={pagedRows}
                emptyText="No classes found"
                activeRowId={activeRowId}
                panelKey={panelMode}
                renderPanel={(row) => {
                  if (panelMode === "view") {
                    return <ClassDetailsPanel row={row} onClose={closePanel} />;
                  }
                  if (panelMode === "edit") {
                    return (
                      <EditClassPanel
                        row={row}
                        onClose={closePanel}
<<<<<<< HEAD
                        onSuccess={loadClasses}
=======
                        onSaved={loadClasses}
>>>>>>> 3cec6fb7725c5f659d0a643f57d62b48199c9a63
                      />
                    );
                  }
                  if (panelMode === "delete") {
                    return (
                      <DeleteClassPanel
                        row={row}
                        onCancel={closePanel}
                        onConfirm={() => {
                          closePanel();
                          loadClasses();
                        }}
                      />
                    );
                  }
                  return null;
                }}
              />
            </div>

            {/* Mobile/tablet cards */}
            <div className="lg:hidden space-y-4">
              {filteredRows.length === 0 && !isLoading && (
                <div className="text-center py-10 text-white/60">
                  {loadError ?? "No classes found"}
                </div>
              )}
              {isLoading && (
                <div className="text-center py-10 text-white/60">
                  <Spinner/>
                </div>
              )}
              {pagedRows.map((row) => (
                <div
                  key={row.id}
                  className="mb-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-white font-semibold">{row.name}</div>
                      <div className="mt-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                        {row.section}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] uppercase tracking-wide text-white/50">Students</div>
                      <div className="text-white font-semibold text-lg">{row.students}</div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                    <div className="text-[11px] uppercase tracking-wide text-white/40">
                      Class Teacher
                    </div>
                    <div className="text-white font-medium">{row.teacher}</div>
                  </div>

                  {activeRowId === row.id && panelMode === "edit" ? (
                    <div className="mt-4 border-t border-white/10 pt-3 space-y-3">
                      <button
                        type="button"
                        onClick={closePanel}
                        className="w-full rounded-xl bg-lime-400/30 text-lime-200 border border-lime-400/40 py-2 text-sm font-semibold hover:bg-lime-400/35 transition"
                      >
                        Close
                      </button>

                      <SearchInput
                        label="Class Name"
                        value={mobileEdit?.className ?? row.name}
                        onChange={(value) =>
                          setMobileEdit((prev) => ({
                            className: value,
                            section: prev?.section ?? row.section.replace("Section ", ""),
                          }))
                        }
                        placeholder="Class name"
                        variant="glass"
                      />

                      <SelectInput
                        label="Section"
                        value={mobileEdit?.section ?? row.section.replace("Section ", "")}
                        onChange={(value) =>
                          setMobileEdit((prev) => ({
                            className: prev?.className ?? row.name,
                            section: value,
                          }))
                        }
                        options={[
                          { label: "A", value: "A" },
                          { label: "B", value: "B" },
                          { label: "C", value: "C" },
                        ]}
                      />

                      <button
                        type="button"
                        className="w-full rounded-xl bg-lime-400 text-black font-semibold py-2.5 hover:bg-lime-300 transition"
                      >
                        Save Changes
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveRowId(row.id);
                        setPanelMode("edit");
                        setMobileEdit({
                          className: row.name,
                          section: row.section.replace("Section ", ""),
                        });
                      }}
                      className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                  )}
                </div>
              ))}
            </div>

            {filteredRows.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-white/10 text-white/70">
                <div className="text-xs">
                  Showing {Math.min(startIndex + 1, filteredRows.length)}-
                  {Math.min(endIndex, filteredRows.length)} of {filteredRows.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
                  >
                    Prev
                  </button>
                  <div className="text-xs">
                    Page {safePage} of {totalPages}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

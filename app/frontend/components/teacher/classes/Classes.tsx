"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, GraduationCap, Users } from "lucide-react";
import StatCard from "../../common/statCard";
import Spinner from "../../common/Spinner";
import { useTeacherClasses } from "./hooks/useTeacherClasses";
import { useClassMetrics } from "./hooks/useClassMetrics";
import ClassCards from "./components/ClassCards";
import StudentsSection from "./components/StudentsSection";

const getClassLabel = (name?: string | null, section?: string | null) =>
  name ? `${name}${section ? `-${section}` : ""}` : "—";

export default function TeacherClasses() {
  const { classes, students, loading, error } = useTeacherClasses();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  const selectedClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId) ?? classes[0] ?? null,
    [classes, selectedClassId]
  );

  const classStudents = useMemo(() => {
    if (!selectedClass?.id) return [];
    return students.filter((s) => s.class?.id === selectedClass.id);
  }, [students, selectedClass?.id]);

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return classStudents;
    const q = search.toLowerCase();
    return classStudents.filter((s) => {
      const name = s.user?.name?.toLowerCase() ?? "";
      const roll = s.rollNo?.toLowerCase() ?? "";
      const admission = s.admissionNumber?.toLowerCase() ?? "";
      return name.includes(q) || roll.includes(q) || admission.includes(q);
    });
  }, [classStudents, search]);

  const metrics = useClassMetrics(selectedClass?.id ?? null, classStudents);

  const studentsWithMetrics = useMemo(
    () =>
      filteredStudents.map((student) => ({
        ...student,
        metrics: metrics.byStudentId[student.id] ?? {
          attendancePct: null,
          avgMarksPct: null,
          grade: null,
        },
      })),
    [filteredStudents, metrics.byStudentId]
  );

  const totalClasses = classes.length;
  const totalStudents = students.length;
  const activeStudents = classStudents.length;

  return (
    <div className="min-h-screen text-white px-3 sm:px-6 lg:px-8 py-4 space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-7 shadow-lg">
        <h2 className="text-2xl sm:text-3xl font-bold">My Classes</h2>
        <p className="text-white/60 mt-2">
          Manage your classes and view student information.
        </p>
      </section>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
          <Spinner label="Loading classes..." />
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
          {error}
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              {
                title: "Total Classes",
                value: totalClasses,
                icon: <BookOpen size={22} className="text-lime-400" />,
              },
              {
                title: "Total Students",
                value: totalStudents,
                icon: <Users size={22} className="text-lime-400" />,
              },
              {
                title: "Active Class",
                value: getClassLabel(selectedClass?.name, selectedClass?.section),
                icon: <GraduationCap size={22} className="text-lime-400" />,
              },
              {
                title: "Active Students",
                value: activeStudents,
                icon: <Users size={22} className="text-lime-400" />,
              },
            ].map((card) => (
              <StatCard
                key={card.title}
                title={card.title}
                value={card.value}
                icon={card.icon}
                className="bg-white/5"
              />
            ))}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Classes</h3>
                <p className="text-white/60 text-sm">Tap a class to view students</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-white/50">
                <span className="w-2.5 h-2.5 rounded-full bg-lime-400" />
                Selected
              </div>
            </div>

            <ClassCards
              classes={classes}
              selectedId={selectedClass?.id ?? null}
              onSelect={(id) => {
                setSelectedClassId(id);
                setExpandedStudentId(null);
              }}
            />
          </section>

          <StudentsSection
            classTitle={getClassLabel(selectedClass?.name, selectedClass?.section)}
            students={studentsWithMetrics}
            search={search}
            onSearch={setSearch}
            expandedId={expandedStudentId}
            onToggleExpanded={(id) =>
              setExpandedStudentId((prev) => (prev === id ? null : id))
            }
          />
          {metrics.loading && (
            <div className="text-sm text-white/60 flex items-center gap-2">
              <Spinner size={16} label="Loading class metrics..." />
            </div>
          )}
          {metrics.error && (
            <div className="text-sm text-red-200">{metrics.error}</div>
          )}
        </>
      )}
    </div>
  );
}

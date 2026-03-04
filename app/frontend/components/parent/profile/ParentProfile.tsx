"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Download,
  GraduationCap,
  Award,
  TrendingUp,
  BookOpen,
  Clock,
  Calendar,
  BarChart3,
  User,
  Phone,
  FileText,
} from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import Spinner from "../../common/Spinner";

type StudentProfile = {
  student: {
    id: string;
    name: string;
    admissionNumber: string;
    email: string;
    photoUrl: string | null;
    rollNo: string;
    dob: string;
    age: number | null;
    address: string;
    phone: string;
    fatherName: string;
    motherName?: string;
    class: { id: string; name: string; section: string | null; displayName: string } | null;
  };
  attendanceTrends: Array<{ month: string; present: number; total: number; pct: number }>;
  academicPerformance: Array<{ subject: string; score: number }>;
  certificates: Array<{ id: string; title: string; issuedDate: string }>;
};

function InfoTag({ value, icon: Icon }: { value: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/5 border border-white/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-white text-xs sm:text-sm transition-all duration-200 hover:border-white/20 hover:bg-white/10 truncate max-w-full">
      {Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-lime-400 shrink-0" />}
      <span className="truncate">{value}</span>
    </div>
  );
}

export default function ParentProfile() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [user, setUser] = useState<{ name: string | null; photoUrl: string | null; mobile: string | null } | null>(null);
  const [homeworkTotal, setHomeworkTotal] = useState(0);
  const [homeworkSubmitted, setHomeworkSubmitted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const studentId = (session?.user as { studentId?: string | null })?.studentId ?? null;

  const fetchData = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      setError("No student linked to this account.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [userRes, studentRes, homeworkRes] = await Promise.all([
        fetch("/api/user/me", { credentials: "include" }),
        fetch(`/api/student/${studentId}`, { credentials: "include" }),
        fetch("/api/homework/list", { credentials: "include" }),
      ]);
      if (userRes.ok) {
        const d = await userRes.json();
        setUser(d.user ?? null);
      }
      if (studentRes.ok) {
        const d = await studentRes.json();
        setProfile(d as StudentProfile);
      } else {
        const d = await studentRes.json().catch(() => ({}));
        setError(d.message || "Failed to load profile");
      }
      if (homeworkRes.ok) {
        const d = await homeworkRes.json();
        const list = d.homeworks ?? [];
        setHomeworkTotal(list.length);
        setHomeworkSubmitted(list.filter((h: { hasSubmitted?: boolean }) => h.hasSubmitted).length);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      setLoading(false);
      setError("Please sign in.");
      return;
    }
    fetchData();
  }, [session?.user, status, fetchData]);

  const generatePdf = async () => {
    if (!profile) return;
    setPdfLoading(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pageWidth = 595;
      const pageHeight = 842;
      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - 50;

      const lineHeight = 14;
      const ensureSpace = (need: number) => {
        if (y < need) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - 40;
        }
      };
      const draw = (text: string, x: number, size: number, bold: boolean) => {
        ensureSpace(lineHeight);
        page.drawText(text, {
          x,
          y,
          size,
          font: bold ? boldFont : font,
          color: rgb(0.1, 0.1, 0.1),
        });
        y -= size + 2;
      };

      draw("Student Profile & Overview", 50, 18, true);
      y -= 8;
      draw(`Name: ${profile.student.name}`, 50, 11, false);
      draw(`Admission: ${profile.student.admissionNumber}`, 50, 11, false);
      draw(`Class: ${profile.student.class?.displayName ?? "—"}`, 50, 11, false);
      draw(`Roll: ${profile.student.rollNo || "—"}`, 50, 11, false);
      draw(`DOB: ${profile.student.dob || "—"}`, 50, 11, false);
      draw(`Guardian: ${profile.student.fatherName || "—"}`, 50, 11, false);
      draw(`Contact: ${profile.student.phone || "—"}`, 50, 11, false);
      y -= 16;

      draw("Attendance Summary", 50, 14, true);
      y -= 6;
      profile.attendanceTrends.forEach((t) => {
        draw(`${t.month}: ${t.present}/${t.total} (${t.pct}%)`, 50, 10, false);
      });
      y -= 16;

      draw("Academic Performance", 50, 14, true);
      y -= 6;
      profile.academicPerformance.forEach((a) => {
        draw(`${a.subject}: ${a.score}%`, 50, 10, false);
      });
      y -= 16;

      if (profile.certificates.length > 0) {
        draw("Certificates", 50, 14, true);
        y -= 6;
        profile.certificates.slice(0, 10).forEach((c) => {
          draw(`${c.title} - ${c.issuedDate}`, 50, 10, false);
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `student-profile-${profile.student.admissionNumber}-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to generate PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <Spinner/>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen p-4 sm:p-6 md:p-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const s = profile.student;
  const photoUrl = s.photoUrl || user?.photoUrl || null;
  const attendancePct =
    profile.attendanceTrends.length > 0
      ? Math.round(
          profile.attendanceTrends.reduce((a, t) => a + t.pct, 0) / profile.attendanceTrends.length
        )
      : 0;
  const overallGrade =
    profile.academicPerformance.length > 0
      ? (() => {
          const avg = Math.round(
            profile.academicPerformance.reduce((a, x) => a + x.score, 0) /
              profile.academicPerformance.length
          );
          if (avg >= 90) return "A+";
          if (avg >= 80) return "A";
          if (avg >= 70) return "B+";
          if (avg >= 60) return "B";
          return "C";
        })()
      : "—";

  const stats = [
    { label: "Overall grade", value: overallGrade, icon: Award },
    { label: "Attendance", value: `${attendancePct}%`, icon: TrendingUp },
    { label: "Total assignments", value: String(homeworkTotal), icon: BookOpen },
    { label: "Submitted", value: String(homeworkSubmitted), icon: Clock },
    { label: "Certificates", value: String(profile.certificates.length), icon: Calendar },
  ];

  return (
    <div className="min-h-screen p-3 sm:p-5 md:p-6 pb-20 sm:pb-6 overflow-x-hidden">
      <main className="max-w-6xl mx-auto space-y-5 md:space-y-7">
        {/* Header: title + Download only */}
        <section className="rounded-xl sm:rounded-2xl md:rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white truncate">Student Profile</h1>
              <p className="text-white/60 text-xs sm:text-sm mt-0.5 sm:mt-1 hidden sm:block">Manage student records and information</p>
            </div>
          
          </div>
        </section>

        {/* Profile card: image + name + tags */}
        <section className="rounded-xl sm:rounded-2xl md:rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-3 sm:p-4 md:p-6 lg:p-8 transition-all duration-200 hover:border-white/20">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 md:gap-6 min-w-0 flex-1">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="p-2.5 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-lime-400/20 shrink-0 transition-transform duration-200 hover:scale-105">
                  <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-lime-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white truncate">
                    {s.name || "Student"}
                  </h2>
                  <p className="text-white/60 text-sm mt-0.5">Student profile overview</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {s.class?.displayName && <InfoTag value={s.class.displayName} icon={BookOpen} />}
                {s.rollNo && <InfoTag value={`Roll: ${s.rollNo}`} icon={User} />}
                <InfoTag value={s.admissionNumber} icon={FileText} />
              </div>
            </div>
            <div className="shrink-0 flex justify-center md:justify-end">
                <div className="relative h-24 w-24 sm:h-32 sm:w-32 md:h-44 md:w-44 lg:h-52 lg:w-52 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-white/20 bg-white/5 transition-all duration-200 hover:border-lime-400/40 hover:shadow-lg">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoUrl}
                    alt={s.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-white/5">
                    <User className="w-16 h-16 sm:w-20 sm:h-20 text-white/40" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-5">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-3 sm:p-4 md:p-6 text-center transition-all duration-200 hover:border-white/20 hover:shadow-lg hover:scale-[1.02]"
            >
              <item.icon className="mx-auto w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-lime-400 mb-1.5 sm:mb-2 md:mb-3" />
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-white truncate">{item.value}</h3>
              <p className="text-white/60 text-xs sm:text-sm uppercase tracking-wide mt-1">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* Academic performance – bar graph */}
        {profile.academicPerformance.length > 0 && (
          <section className="rounded-xl sm:rounded-2xl md:rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-3 sm:p-4 md:p-6 lg:p-8 transition-all duration-200 hover:border-white/20 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <h2 className="flex items-center gap-2 text-base sm:text-xl md:text-2xl font-bold text-white">
                <BarChart3 className="w-6 h-6 text-lime-400" />
                Academic performance
              </h2>
            </div>
            <div className="overflow-x-auto no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
              <div className="flex gap-1 sm:gap-2 md:gap-6 min-w-[280px] sm:min-w-[400px] md:min-w-[620px]" style={{ minHeight: 180 }}>
              {/* Y-axis labels */}
              <div
                className="flex flex-col justify-between text-white/60 text-[10px] sm:text-xs md:text-sm shrink-0 py-1"
                style={{ height: 180 }}
              >
                {[100, 75, 50, 25, 0].map((val) => (
                  <span key={val}>{val}</span>
                ))}
              </div>
              {/* Bar chart area with grid */}
              <div className="flex-1 relative" style={{ height: 180 }}>
                {/* Horizontal grid lines */}
                {[0, 25, 50, 75, 100].map((pct) => (
                  <div
                    key={pct}
                    className="absolute left-0 right-0 border-t border-white/10"
                    style={{ bottom: `${(pct / 100) * 160}px` }}
                  />
                ))}
                {/* Bars */}
                <div className="absolute inset-0 flex items-end justify-around gap-1 sm:gap-2">
                  {profile.academicPerformance.map((a) => (
                    <div
                      key={a.subject}
                      className="flex flex-col items-center flex-1 min-w-0 group"
                      title={`${a.subject}: ${a.score}%`}
                    >
                      <div
                        className="w-full max-w-[3rem] sm:max-w-[4rem] rounded-t-lg bg-lime-400 flex justify-center items-end pb-1 text-black font-bold text-xs sm:text-sm transition-all duration-200 hover:bg-lime-300 cursor-default"
                        style={{
                          height: `${Math.max(10, (a.score / 100) * 160)}px`,
                        }}
                      >
                        {a.score}
                      </div>
                      <span className="text-white/80 text-[9px] sm:text-[10px] md:text-xs mt-1 sm:mt-2 truncate w-full text-center">
                        {a.subject}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              </div>
            </div>
          </section>
        )}

        {/* Student details (read-only) */}
        <section className="rounded-xl sm:rounded-2xl md:rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-3 sm:p-4 md:p-6 lg:p-8 transition-all duration-200 hover:border-white/20">
          <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-lime-400" />
            Student details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {[
              { label: "Full name", value: s.name },
              { label: "Admission number", value: s.admissionNumber },
              { label: "Class", value: s.class?.displayName ?? "—" },
              { label: "Roll number", value: s.rollNo || "—" },
              { label: "DOB", value: s.dob || "—" },
              { label: "Gender", value: (s as { gender?: string }).gender ?? "—" },
              { label: "Address", value: s.address || "—" },
              { label: "Phone", value: s.phone || "—" },
              { label: "Email", value: s.email || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="group">
                <p className="text-white/50 text-xs sm:text-sm mb-1 uppercase tracking-wide">{label}</p>
                <p className="text-white font-medium rounded-lg sm:rounded-xl bg-white/5 border border-white/10 px-3 py-2 sm:px-4 sm:py-3 transition-colors group-hover:border-white/20 text-sm sm:text-base break-words">
                  {value || "—"}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Parent / guardian info */}
        <section className="rounded-xl sm:rounded-2xl md:rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-3 sm:p-4 md:p-6 lg:p-8 transition-all duration-200 hover:border-white/20">
          <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
            <Phone className="w-6 h-6 text-lime-400" />
            Parent / guardian
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <div className="rounded-lg sm:rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-3 transition-colors hover:border-white/20 min-w-0">
              <User className="w-5 h-5 text-lime-400 shrink-0" />
              <div>
                <p className="text-white/50 text-xs">Guardian name</p>
                <p className="text-white font-medium">{s.fatherName || "—"}</p>
              </div>
            </div>
            <div className="rounded-lg sm:rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-3 transition-colors hover:border-white/20 min-w-0">
              <Phone className="w-5 h-5 text-lime-400 shrink-0" />
              <div>
                <p className="text-white/50 text-xs">Contact</p>
                <p className="text-white font-medium">{s.phone || user?.mobile || "—"}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

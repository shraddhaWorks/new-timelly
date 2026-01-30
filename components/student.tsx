"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Newspaper, BookOpen, Award, CreditCard, MessageCircle, FileText, Calendar, User, CheckCircle2, XCircle, Clock, Send, ExternalLink, Download, LayoutDashboard, ClipboardList, Megaphone, Bus, Building2, BarChart3 } from "lucide-react";
import PayButton from "./PayButton";
import BusBooking from "./BusBooking";
import HostelBooking from "./HostelBooking";
import TimetableView from "./TimetableView";
import CommunicationPage from "@/app/communication/page";

interface Mark {
  id: string;
  subject: string;
  marks: number;
  totalMarks: number;
  grade: string | null;
  suggestions: string | null;
  createdAt: string;
  class: { id: string; name: string; section: string | null };
  teacher?: { id: string; name: string | null; email: string | null };
}

interface Attendance {
  id: string;
  date: string;
  period: number;
  status: string;
  class: { id: string; name: string; section: string | null };
  teacher?: { id: string; name: string | null; email: string | null };
}

interface Event {
  id: string;
  title: string;
  description: string;
  amount: number | null;
  photo: string | null;
  eventDate: string | null;
  class: { id: string; name: string; section: string | null } | null;
  teacher: { id: string; name: string | null; email: string | null };
  _count: { registrations: number };
  isRegistered?: boolean;
  registrationStatus?: string | null;
}

interface NewsFeed {
  id: string;
  title: string;
  description: string;
  mediaUrl: string | null;
  mediaType: string | null;
  createdAt: string;
  createdBy: { id: string; name: string | null; email: string | null };
}

interface Homework {
  id: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string | null;
  createdAt: string;
  class: { id: string; name: string; section: string | null };
  teacher: { id: string; name: string | null; email: string | null };
  hasSubmitted?: boolean;
  submission?: { id: string; content: string | null; fileUrl: string | null; submittedAt: string } | null;
}

interface Certificate {
  id: string;
  title: string;
  description: string | null;
  issuedDate: string;
  certificateUrl: string | null;
  template: { id: string; name: string; description: string | null };
  issuedBy: { id: string; name: string | null; email: string | null };
}

interface TransferCertificate {
  id: string;
  reason: string | null;
  status: string;
  issuedDate: string | null;
  tcDocumentUrl: string | null;
  createdAt: string;
}

interface StudentFee {
  id: string;
  totalFee: number;
  discountPercent: number;
  finalFee: number;
  amountPaid: number;
  remainingFee: number;
  installments: number;
}

interface Appointment {
  id: string;
  status: string;
  teacherId: string;
  studentId: string;
  note?: string | null;
  requestedAt?: string;
}
interface LibraryBook {
  id: string;
  bookName: string;
  bookNumber?: string | null;
  issueDate: string;
  expectedDate: string;
  returnDate?: string | null;
  overdueDays: number;
  fineAmount: number;
  status: "ISSUED" | "RETURNED" | "OVERDUE";
}

export default function StudentDashboardPage() {
  const { data: session, status } = useSession();
  const [marks, setMarks] = useState<Mark[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [newsFeeds, setNewsFeeds] = useState<NewsFeed[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [tc, setTc] = useState<TransferCertificate | null>(null);
  const [fee, setFee] = useState<StudentFee | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "marks" | "attendance" | "events" | "newsfeed" | "homework" | "certificates" | "tc" | "payments" | "communication" | "bus" | "hostel" | "timetable" | "library">("overview");
  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>([]);

  useEffect(() => {
    if (session && session.user.role === "STUDENT") {
      fetchAllData();
    }
  }, [session]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchMarks(),
        fetchAttendance(),
        fetchEvents(),
        fetchNewsFeeds(),
        fetchHomeworks(),
        fetchCertificates(),
        fetchTC(),
        fetchFee(),
        fetchAppointments(),
        fetchLibraryBooks(),
      ]);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFee = async () => {
    try {
      const res = await fetch("/api/fees/mine");
      const data = await res.json();
      if (res.ok && data.fee) {
        setFee(data.fee);
      }
    } catch (err) {
      console.error("Error fetching fee:", err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/communication/appointments");
      const data = await res.json();
      if (res.ok && data.appointments) {
        setAppointments(data.appointments);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  const fetchMarks = async () => {
    try {
      const res = await fetch("/api/marks/view");
      const data = await res.json();
      if (res.ok && data.marks) {
        setMarks(data.marks);
      }
    } catch (err) {
      console.error("Error fetching marks:", err);
    }
  };

  const fetchAttendance = async () => {
    try {
      const startDate = new Date(new Date().setDate(new Date().getDate() - 30))
        .toISOString()
        .split("T")[0];
      const endDate = new Date().toISOString().split("T")[0];
      const res = await fetch(
        `/api/attendance/view?startDate=${startDate}&endDate=${endDate}`
      );
      const data = await res.json();
      if (res.ok && data.attendances) {
        setAttendances(data.attendances);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events/list");
      const data = await res.json();
      if (res.ok && data.events) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  const fetchNewsFeeds = async () => {
    try {
      const res = await fetch("/api/newsfeed/list");
      const data = await res.json();
      if (res.ok && data.newsFeeds) {
        setNewsFeeds(data.newsFeeds);
      }
    } catch (err) {
      console.error("Error fetching news feeds:", err);
    }
  };

  const fetchHomeworks = async () => {
    try {
      const res = await fetch("/api/homework/list");
      const data = await res.json();
      if (res.ok && data.homeworks) {
        setHomeworks(data.homeworks);
      }
    } catch (err) {
      console.error("Error fetching homeworks:", err);
    }
  };

  const fetchCertificates = async () => {
    try {
      const res = await fetch("/api/certificates/list");
      const data = await res.json();
      if (res.ok && data.certificates) {
        setCertificates(data.certificates);
      }
    } catch (err) {
      console.error("Error fetching certificates:", err);
    }
  };

  const fetchTC = async () => {
    try {
      const res = await fetch("/api/tc/list");
      const data = await res.json();
      if (res.ok && data.tcs && data.tcs.length > 0) {
        setTc(data.tcs[0]); // Get the most recent TC
      }
    } catch (err) {
      console.error("Error fetching TC:", err);
    }
  };

  const handleSubmitHomework = async (homeworkId: string, content: string, fileUrl?: string) => {
    try {
      const res = await fetch("/api/homework/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeworkId, content, fileUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to submit homework");
        return;
      }

      alert("Homework submitted successfully!");
      fetchHomeworks();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const handleApplyTC = async (reason: string) => {
    if (!confirm("Are you sure you want to apply for Transfer Certificate? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch("/api/tc/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to apply for TC");
        return;
      }

      alert("TC request submitted successfully! Waiting for admin approval.");
      fetchTC();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };


  const fetchLibraryBooks = async () => {
    try {
      const res = await fetch("/api/library/my-books");
      const data = await res.json();
      console.log("Library books data:", data);
      if (res.ok) {
        setLibraryBooks(data || []);
      }
    } catch (err) {
      console.error("Error fetching library books:", err);
    }
  };


  const calculateAttendanceStats = () => {
    const present = attendances.filter((a) => a.status === "PRESENT").length;
    const absent = attendances.filter((a) => a.status === "ABSENT").length;
    const late = attendances.filter((a) => a.status === "LATE").length;
    const total = attendances.length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : "0";

    return { present, absent, late, total, percentage };
  };

  const calculateMarksStats = () => {
    if (marks.length === 0) return { average: 0, totalSubjects: 0, highest: 0 };

    const totalPercentage = marks.reduce((sum, mark) => {
      return sum + (mark.marks / mark.totalMarks) * 100;
    }, 0);
    const average = (totalPercentage / marks.length).toFixed(1);
    const highest = Math.max(
      ...marks.map((mark) => (mark.marks / mark.totalMarks) * 100)
    ).toFixed(1);

    return {
      average: parseFloat(average),
      totalSubjects: marks.length,
      highest: parseFloat(highest),
    };
  };

  const handleRegisterEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to register for this event?")) return;

    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to register");
        return;
      }

      alert("Successfully registered for the event!");
      fetchEvents();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "ABSENT":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "LATE":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-[#2d2d2d] text-[#808080] border-[#404040]";
    }
  };

  const getGradeColor = (grade: string | null) => {
    if (!grade) return "bg-[#2d2d2d] text-[#808080]";
    if (grade === "A+") return "bg-green-500/20 text-green-400";
    if (grade === "A") return "bg-green-500/20 text-green-400";
    if (grade === "B+") return "bg-blue-500/20 text-blue-400";
    if (grade === "B") return "bg-blue-500/20 text-blue-400";
    if (grade === "C") return "bg-yellow-500/20 text-yellow-400";
    if (grade === "D") return "bg-orange-500/20 text-orange-400";
    return "bg-red-500/20 text-red-400";
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#808080]"></div>
          <p className="mt-4 text-white font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "STUDENT") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-[#1a1a1a] border border-[#333333] p-8 rounded-2xl shadow-2xl text-center">
          <p className="text-red-400 text-lg font-medium">Access Denied</p>
          <p className="text-[#808080] mt-2">This page is only for students.</p>
        </div>
      </div>
    );
  }

  const attendanceStats = calculateAttendanceStats();
  const marksStats = calculateMarksStats();
  const recentMarks = marks.slice(0, 5);
  const recentAttendance = attendances.slice(0, 5);
  const upcomingEvents = events
    .filter((e) => !e.isRegistered)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-[#333333] shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Welcome, {session.user?.name || "Student"}!
              </h1>
              <p className="text-[#808080] mt-1 text-sm md:text-base">Your academic dashboard</p>
            </div>
            <div className="bg-[#2d2d2d] border border-[#404040] px-4 py-2 rounded-lg">
              <p className="text-sm text-white font-medium">Student Portal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <div className="flex gap-2 bg-[#1a1a1a] border border-[#333333] rounded-lg p-1 shadow-lg overflow-x-auto scrollbar-hide">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "newsfeed", label: "News Feed", icon: Newspaper },
            { id: "homework", label: "Homework", icon: BookOpen },
            { id: "marks", label: "Marks", icon: ClipboardList },
            { id: "attendance", label: "Attendance", icon: CheckCircle2 },
            { id: "events", label: "Events", icon: Megaphone },
            { id: "certificates", label: "Certificates", icon: Award },
            { id: "tc", label: "TC", icon: FileText },
            { id: "payments", label: "Payments", icon: CreditCard },
            { id: "communication", label: "Communication", icon: MessageCircle },
            { id: "bus", label: "Bus Booking", icon: Bus },
            { id: "hostel", label: "Hostel Booking", icon: Building2 },
            { id: "timetable", label: "Timetable", icon: Calendar },
            { id: "library", label: "Library", icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-shrink-0 px-3 md:px-4 py-2 md:py-3 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-1.5 md:gap-2 ${activeTab === tab.id
                    ? "bg-[#404040] text-white shadow-md"
                    : "text-[#808080] hover:bg-[#2d2d2d] hover:text-white"
                  }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Attendance Card */}
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-2xl p-6 border-l-4 border-[#808080]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#808080] text-sm font-medium">Attendance</p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {attendanceStats.percentage}%
                    </p>
                    <p className="text-xs text-[#6b6b6b] mt-1">
                      {attendanceStats.present} present out of {attendanceStats.total}
                    </p>
                  </div>
                  <div className="bg-[#2d2d2d] rounded-full p-4">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                </div>
              </div>

              {/* Marks Card */}
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-2xl p-6 border-l-4 border-[#808080]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#808080] text-sm font-medium">Average Marks</p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {marksStats.average}%
                    </p>
                    <p className="text-xs text-[#6b6b6b] mt-1">
                      {marksStats.totalSubjects} subjects
                    </p>
                  </div>
                  <div className="bg-[#2d2d2d] rounded-full p-4">
                    <ClipboardList className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
              </div>

              {/* Events Card */}
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-2xl p-6 border-l-4 border-[#808080]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#808080] text-sm font-medium">Upcoming Events</p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {upcomingEvents.length}
                    </p>
                    <p className="text-xs text-[#6b6b6b] mt-1">
                      Available for registration
                    </p>
                  </div>
                  <div className="bg-[#2d2d2d] rounded-full p-4">
                    <Megaphone className="w-8 h-8 text-purple-400" />
                  </div>
                </div>
              </div>

              {/* Homework Card */}
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-2xl p-6 border-l-4 border-[#808080]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#808080] text-sm font-medium">Pending Homework</p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {homeworks.filter((h) => !h.hasSubmitted).length}
                    </p>
                    <p className="text-xs text-[#6b6b6b] mt-1">
                      {homeworks.filter((h) => h.hasSubmitted).length} submitted
                    </p>
                  </div>
                  <div className="bg-[#2d2d2d] rounded-full p-4">
                    <BookOpen className="w-8 h-8 text-orange-400" />
                  </div>
                </div>
              </div>

              {/* Certificates Card */}
              <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-2xl p-6 border-l-4 border-[#808080]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#808080] text-sm font-medium">Certificates</p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {certificates.length}
                    </p>
                    <p className="text-xs text-[#6b6b6b] mt-1">
                      Total issued
                    </p>
                  </div>
                  <div className="bg-[#2d2d2d] rounded-full p-4">
                    <span className="text-3xl">🏆</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Marks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
              <div className="relative">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-blue-400" />
                    Recent Marks
                  </h2>
                  <motion.button
                    onClick={() => setActiveTab("marks")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-[#808080] hover:text-white text-sm font-medium transition"
                  >
                    View All →
                  </motion.button>
                </div>
                {recentMarks.length === 0 ? (
                  <p className="text-[#808080] text-center py-8">No marks available yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentMarks.map((mark, index) => (
                      <motion.div
                        key={mark.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -4, scale: 1.01 }}
                        className="flex items-center justify-between p-4 bg-[#2d2d2d]/50 rounded-lg hover:bg-[#404040]/50 transition border border-[#333333] hover:border-[#404040]"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-white">{mark.subject}</p>
                          <p className="text-sm text-[#808080]">
                            {mark.class.name} {mark.class.section ? `- ${mark.class.section}` : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-400">
                            {mark.marks}/{mark.totalMarks}
                          </p>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getGradeColor(
                              mark.grade
                            )}`}
                          >
                            {mark.grade || "N/A"}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Attendance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
              <div className="relative">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">✅ Recent Attendance</h2>
                  <motion.button
                    onClick={() => setActiveTab("attendance")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-[#808080] hover:text-white text-sm font-medium transition"
                  >
                    View All →
                  </motion.button>
                </div>
                {recentAttendance.length === 0 ? (
                  <p className="text-[#808080] text-center py-8">No attendance records yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentAttendance.map((att, index) => (
                      <motion.div
                        key={att.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -4, scale: 1.01 }}
                        className="flex items-center justify-between p-4 bg-[#2d2d2d]/50 rounded-lg hover:bg-[#404040]/50 transition border border-[#333333] hover:border-[#404040]"
                      >
                        <div>
                          <p className="font-semibold text-white">
                            {new Date(att.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-[#808080]">
                            Period {att.period} • {att.class.name}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            att.status
                          )}`}
                        >
                          {att.status}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent News Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
              <div className="relative">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">📰 Latest News</h2>
                  <motion.button
                    onClick={() => setActiveTab("newsfeed")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-[#808080] hover:text-white text-sm font-medium transition"
                  >
                    View All →
                  </motion.button>
                </div>
                {newsFeeds.slice(0, 3).length === 0 ? (
                  <p className="text-[#808080] text-center py-8">No news available</p>
                ) : (
                  <div className="space-y-4">
                    {newsFeeds.slice(0, 3).map((feed, index) => (
                      <motion.div
                        key={feed.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -4, scale: 1.01 }}
                        className="bg-[#2d2d2d]/50 rounded-lg p-4 border border-[#333333] hover:bg-[#404040]/50 transition hover:border-[#404040]"
                      >
                        <h3 className="font-bold text-white mb-2">{feed.title}</h3>
                        <p className="text-sm text-[#808080] line-clamp-2">{feed.description}</p>
                        <p className="text-xs text-[#6b6b6b] mt-2">
                          {new Date(feed.createdAt).toLocaleDateString()}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Pending Homework */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
              <div className="relative">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-orange-400" />
                    Pending Homework
                  </h2>
                  <motion.button
                    onClick={() => setActiveTab("homework")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-[#808080] hover:text-white text-sm font-medium transition"
                  >
                    View All →
                  </motion.button>
                </div>
                {homeworks.filter((h) => !h.hasSubmitted).slice(0, 3).length === 0 ? (
                  <p className="text-[#808080] text-center py-8">No pending homework</p>
                ) : (
                  <div className="space-y-3">
                    {homeworks
                      .filter((h) => !h.hasSubmitted)
                      .slice(0, 3)
                      .map((homework, index) => (
                        <motion.div
                          key={homework.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -4, scale: 1.01 }}
                          className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 hover:bg-orange-500/30 transition"
                        >
                          <h3 className="font-bold text-orange-400 mb-1">{homework.title}</h3>
                          <p className="text-sm text-[#808080]">
                            {homework.subject} • {homework.class.name}
                          </p>
                          {homework.dueDate && (
                            <p className="text-xs text-[#6b6b6b] mt-1">
                              Due: {new Date(homework.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </motion.div>
                      ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Upcoming Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
              <div className="relative">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">🎉 Upcoming Events</h2>
                  <motion.button
                    onClick={() => setActiveTab("events")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-[#808080] hover:text-white text-sm font-medium transition"
                  >
                    View All →
                  </motion.button>
                </div>
                {upcomingEvents.length === 0 ? (
                  <p className="text-[#808080] text-center py-8">No upcoming events</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {upcomingEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="relative overflow-hidden bg-gradient-to-br from-[#2d2d2d] to-[#1a1a1a] rounded-xl p-4 border border-[#333333] hover:border-green-500/50 transition-all duration-300 shadow-lg"
                      >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/20 to-transparent rounded-bl-full"></div>
                        <div className="relative">
                          <h3 className="font-bold text-white mb-2">{event.title}</h3>
                          <p className="text-sm text-[#808080] line-clamp-2 mb-3">
                            {event.description}
                          </p>
                          {event.eventDate && (
                            <p className="text-xs text-[#6b6b6b] mb-3">
                              📅 {new Date(event.eventDate).toLocaleDateString()}
                            </p>
                          )}
                          <motion.button
                            onClick={() => handleRegisterEvent(event.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-gradient-to-r from-green-500/80 to-green-600/80 hover:from-green-600 hover:to-green-500 text-white py-2 rounded-lg text-sm font-semibold transition-all duration-300 border border-green-500/30 hover:border-green-400 shadow-lg"
                          >
                            Register Now
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Marks Tab */}
        {activeTab === "marks" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
            <div className="relative">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-blue-400" />
                My Marks Report
              </h2>
              {marks.length === 0 ? (
                <p className="text-[#808080] text-center py-12">No marks available yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-[#2d2d2d] border-b border-[#333333]">
                      <tr>
                        <th className="px-4 py-3 text-left text-white font-semibold">Subject</th>
                        <th className="px-4 py-3 text-left text-white font-semibold">Marks</th>
                        <th className="px-4 py-3 text-left text-white font-semibold">Total</th>
                        <th className="px-4 py-3 text-left text-white font-semibold">Percentage</th>
                        <th className="px-4 py-3 text-left text-white font-semibold">Grade</th>
                        <th className="px-4 py-3 text-left text-white font-semibold">Class</th>
                        <th className="px-4 py-3 text-left text-white font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#333333]">
                      {marks.map((mark, index) => (
                        <motion.tr
                          key={mark.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ backgroundColor: "#2d2d2d" }}
                          className="hover:bg-[#2d2d2d]/50 transition"
                        >
                          <td className="px-4 py-3 font-medium text-white">{mark.subject}</td>
                          <td className="px-4 py-3 text-white">{mark.marks}</td>
                          <td className="px-4 py-3 text-white">{mark.totalMarks}</td>
                          <td className="px-4 py-3 text-white">
                            {((mark.marks / mark.totalMarks) * 100).toFixed(1)}%
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getGradeColor(
                                mark.grade
                              )}`}
                            >
                              {mark.grade || "N/A"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#808080]">
                            {mark.class.name} {mark.class.section ? `- ${mark.class.section}` : ""}
                          </td>
                          <td className="px-4 py-3 text-[#808080]">
                            {new Date(mark.createdAt).toLocaleDateString()}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {marks.some((m) => m.suggestions) && (
                <div className="mt-6 pt-6 border-t border-[#404040]">
                  <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                    💡 Teacher Suggestions
                  </h3>
                  <div className="space-y-4">
                    {marks
                      .filter((m) => m.suggestions)
                      .map((mark, index) => (
                        <motion.div
                          key={mark.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-l-4 border-green-500/50 bg-[#2d2d2d]/50 pl-4 p-3 rounded-r-lg"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-white">{mark.subject}</span>
                            <span className="text-sm text-[#808080]">
                              {new Date(mark.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[#808080]">{mark.suggestions}</p>
                        </motion.div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Attendance Tab */}
        {activeTab === "attendance" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
            <div className="relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">✅ My Attendance</h2>
                <div className="bg-[#2d2d2d] border border-[#404040] px-4 py-2 rounded-lg">
                  <p className="text-sm text-white">
                    <span className="font-semibold">{attendanceStats.percentage}%</span> overall
                  </p>
                </div>
              </div>

              {/* Attendance Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-green-500/20 border border-green-500/30 p-4 rounded-lg text-center"
                >
                  <p className="text-2xl font-bold text-green-400">{attendanceStats.present}</p>
                  <p className="text-sm text-[#808080]">Present</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-red-500/20 border border-red-500/30 p-4 rounded-lg text-center"
                >
                  <p className="text-2xl font-bold text-red-400">{attendanceStats.absent}</p>
                  <p className="text-sm text-[#808080]">Absent</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-yellow-500/20 border border-yellow-500/30 p-4 rounded-lg text-center"
                >
                  <p className="text-2xl font-bold text-yellow-400">{attendanceStats.late}</p>
                  <p className="text-sm text-[#808080]">Late</p>
                </motion.div>
              </div>

              {attendances.length === 0 ? (
                <p className="text-[#808080] text-center py-12">No attendance records found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-[#2d2d2d] border-b border-[#333333]">
                      <tr>
                        <th className="px-4 py-3 text-left text-white font-semibold">Date</th>
                        <th className="px-4 py-3 text-left text-white font-semibold">Period</th>
                        <th className="px-4 py-3 text-left text-white font-semibold">Class</th>
                        <th className="px-4 py-3 text-left text-white font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#333333]">
                      {attendances.map((att, index) => (
                        <motion.tr
                          key={att.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ backgroundColor: "#2d2d2d" }}
                          className="hover:bg-[#2d2d2d]/50 transition"
                        >
                          <td className="px-4 py-3 text-white">
                            {new Date(att.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-white">Period {att.period}</td>
                          <td className="px-4 py-3 text-[#808080]">
                            {att.class.name} {att.class.section ? `- ${att.class.section}` : ""}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                                att.status
                              )}`}
                            >
                              {att.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-white flex items-center gap-2"
            >
              🎉 Events & Workshops
            </motion.h2>
            {events.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-12 border border-[#333333] text-center"
              >
                <p className="text-[#808080] text-lg">No events available</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-xl shadow-2xl overflow-hidden border border-[#333333] hover:border-green-500/50 transition-all duration-300"
                  >
                    {event.photo && (
                      <img
                        src={event.photo}
                        alt={event.title}
                        className="w-full h-48 object-cover opacity-80"
                      />
                    )}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/20 to-transparent rounded-bl-full"></div>
                    <div className="p-6 relative">
                      <h3 className="text-xl font-bold mb-2 text-white">{event.title}</h3>
                      <p className="text-[#808080] mb-4 line-clamp-3">{event.description}</p>

                      <div className="space-y-2 mb-4 text-sm">
                        {event.class && (
                          <p className="text-[#808080]">
                            <span className="font-medium text-white">Class:</span> {event.class.name}
                            {event.class.section ? ` - ${event.class.section}` : ""}
                          </p>
                        )}
                        {event.amount && (
                          <p className="text-[#808080]">
                            <span className="font-medium text-white">Amount:</span> ₹{event.amount}
                          </p>
                        )}
                        {event.eventDate && (
                          <p className="text-[#808080]">
                            <span className="font-medium text-white">Date:</span>{" "}
                            {new Date(event.eventDate).toLocaleString()}
                          </p>
                        )}
                        <p className="text-[#808080]">
                          <span className="font-medium text-white">Registrations:</span>{" "}
                          {event._count.registrations}
                        </p>
                      </div>

                      <motion.button
                        onClick={() => handleRegisterEvent(event.id)}
                        disabled={event.isRegistered}
                        whileHover={!event.isRegistered ? { scale: 1.02 } : {}}
                        whileTap={!event.isRegistered ? { scale: 0.98 } : {}}
                        className={`w-full py-2 rounded-lg font-semibold transition-all duration-300 border ${event.isRegistered
                            ? "bg-[#2d2d2d] text-[#808080] cursor-not-allowed border-[#333333]"
                            : "bg-gradient-to-r from-green-500/80 to-green-600/80 hover:from-green-600 hover:to-green-500 text-white border-green-500/30 hover:border-green-400 shadow-lg"
                          }`}
                      >
                        {event.isRegistered
                          ? `Registered (${event.registrationStatus || "PENDING"})`
                          : "Register Now"}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* News Feed Tab */}
        {activeTab === "newsfeed" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Newspaper className="w-8 h-8 text-[#808080]" />
              <h2 className="text-3xl font-bold text-white">News Feed</h2>
            </div>
            {newsFeeds.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-12 text-center border border-[#333333]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
                <div className="relative">
                  <Newspaper className="w-16 h-16 text-[#6b6b6b] mx-auto mb-4" />
                  <p className="text-[#808080] text-lg">No news feeds available</p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {newsFeeds.map((feed, index) => (
                  <motion.div
                    key={feed.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 border border-[#333333] hover:border-[#404040] transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
                    <div className="relative">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <Newspaper className="w-5 h-5 text-[#808080]" />
                          {feed.title}
                        </h3>
                        <span className="text-sm text-[#808080] flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(feed.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[#b0b0b0] mb-4 whitespace-pre-wrap">{feed.description}</p>
                      {feed.mediaUrl && (
                        <div className="mt-4 rounded-lg overflow-hidden border border-[#404040]">
                          {feed.mediaType === "VIDEO" ? (
                            <video
                              src={feed.mediaUrl}
                              controls
                              className="w-full rounded-lg max-h-96"
                            />
                          ) : (
                            <img
                              src={feed.mediaUrl}
                              alt={feed.title}
                              className="w-full rounded-lg max-h-96 object-cover"
                            />
                          )}
                        </div>
                      )}
                      <p className="text-sm text-[#808080] mt-4 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Posted by: {feed.createdBy.name}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Homework Tab */}
        {activeTab === "homework" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-8 h-8 text-[#808080]" />
              <h2 className="text-3xl font-bold text-white">My Homework</h2>
            </div>
            {homeworks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-12 text-center border border-[#333333]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
                <div className="relative">
                  <BookOpen className="w-16 h-16 text-[#6b6b6b] mx-auto mb-4" />
                  <p className="text-[#808080] text-lg">No homework assigned yet</p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {homeworks.map((homework, index) => (
                  <motion.div
                    key={homework.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 border border-[#333333] hover:border-[#404040] transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
                    <div className="relative">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-[#808080]" />
                            {homework.title}
                          </h3>
                          <p className="text-sm text-[#808080] mt-1 flex items-center gap-2">
                            <span>Subject: {homework.subject}</span>
                            <span>•</span>
                            <span>Class: {homework.class.name}{homework.class.section ? ` - ${homework.class.section}` : ""}</span>
                          </p>
                        </div>
                        {homework.hasSubmitted && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-sm font-medium flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Submitted
                          </motion.span>
                        )}
                      </div>
                      <p className="text-[#b0b0b0] mb-4 whitespace-pre-wrap">{homework.description}</p>
                      {homework.dueDate && (
                        <p className="text-sm text-[#808080] mb-4 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Due Date: {new Date(homework.dueDate).toLocaleDateString()}
                        </p>
                      )}
                      {homework.hasSubmitted && homework.submission ? (
                        <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg mb-4">
                          <p className="font-medium text-green-400 mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Your Submission:
                          </p>
                          {homework.submission.content && (
                            <p className="text-[#b0b0b0] mb-2">{homework.submission.content}</p>
                          )}
                          {homework.submission.fileUrl && (
                            <a
                              href={homework.submission.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:text-green-300 flex items-center gap-1 transition"
                            >
                              <ExternalLink className="w-4 h-4" />
                              View Submitted File
                            </a>
                          )}
                          <p className="text-xs text-[#808080] mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Submitted on: {new Date(homework.submission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4 space-y-3">
                          <textarea
                            id={`homework-${homework.id}`}
                            placeholder="Enter your submission..."
                            className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent placeholder-[#6b6b6b]"
                            rows={4}
                          />
                          <input
                            type="text"
                            id={`file-${homework.id}`}
                            placeholder="File URL (optional)"
                            className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent placeholder-[#6b6b6b]"
                          />
                          <motion.button
                            onClick={() => {
                              const content = (
                                document.getElementById(`homework-${homework.id}`) as HTMLTextAreaElement
                              )?.value;
                              const fileUrl = (
                                document.getElementById(`file-${homework.id}`) as HTMLInputElement
                              )?.value;
                              handleSubmitHomework(homework.id, content, fileUrl || undefined);
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 border border-[#333333] hover:border-[#808080] shadow-lg"
                          >
                            <Send className="w-5 h-5" />
                            Submit Homework
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Certificates Tab */}
        {activeTab === "certificates" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-8 h-8 text-[#808080]" />
              <h2 className="text-3xl font-bold text-white">My Certificates</h2>
            </div>
            {certificates.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-12 text-center border border-[#333333]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
                <div className="relative">
                  <Award className="w-16 h-16 text-[#6b6b6b] mx-auto mb-4" />
                  <p className="text-[#808080] text-lg">No certificates issued yet</p>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((cert, index) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -8 }}
                    className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 border border-[#333333] hover:border-[#404040] transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
                    <div className="relative">
                      <div className="text-center mb-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 mb-3">
                          <Award className="w-8 h-8 text-yellow-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">{cert.title}</h3>
                        {cert.description && (
                          <p className="text-sm text-[#808080] mt-2">{cert.description}</p>
                        )}
                      </div>
                      <div className="space-y-2 text-sm text-[#b0b0b0]">
                        <p className="flex items-center gap-2">
                          <span className="font-medium text-white">Template:</span> {cert.template.name}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#808080]" />
                          <span className="font-medium text-white">Issued:</span>{" "}
                          {new Date(cert.issuedDate).toLocaleDateString()}
                        </p>
                        <p className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[#808080]" />
                          <span className="font-medium text-white">Issued by:</span> {cert.issuedBy.name}
                        </p>
                      </div>
                      {cert.certificateUrl && (
                        <motion.a
                          href={cert.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="mt-4 block w-full bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white text-center py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 border border-[#333333] hover:border-[#808080] shadow-lg"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Certificate
                        </motion.a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 border border-[#333333] space-y-6"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-8 h-8 text-[#808080]" />
                  <div>
                    <h2 className="text-3xl font-bold text-white">My Payments</h2>
                    <p className="text-[#808080] text-sm">Pay fees securely online</p>
                  </div>
                </div>
                <Link
                  href="/payments"
                  className="text-[#808080] hover:text-white text-sm font-medium flex items-center gap-1 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open full payment page
                </Link>
              </div>

              {fee ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -4 }}
                      className="relative overflow-hidden p-5 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30"
                    >
                      <p className="text-sm text-[#808080] mb-2">Payable (after discount)</p>
                      <p className="text-3xl font-bold text-green-400">₹{fee.finalFee}</p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -4 }}
                      className="relative overflow-hidden p-5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30"
                    >
                      <p className="text-sm text-[#808080] mb-2">Paid so far</p>
                      <p className="text-3xl font-bold text-blue-400">₹{fee.amountPaid}</p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -4 }}
                      className="relative overflow-hidden p-5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30"
                    >
                      <p className="text-sm text-[#808080] mb-2">Remaining</p>
                      <p className="text-3xl font-bold text-amber-400">₹{fee.remainingFee}</p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -4 }}
                      className="relative overflow-hidden p-5 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30"
                    >
                      <p className="text-sm text-[#808080] mb-2">Installments allowed</p>
                      <p className="text-3xl font-bold text-purple-400">{fee.installments}</p>
                    </motion.div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-xs text-[#808080]">
                      <span>Progress</span>
                      <span>
                        ₹{fee.amountPaid.toFixed(2)} / ₹{fee.finalFee.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-3 w-full bg-[#2d2d2d] rounded-full overflow-hidden border border-[#404040]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((fee.amountPaid / fee.finalFee) * 100, 100)}%` }}
                        transition={{ duration: 1 }}
                        className="h-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                      />
                    </div>
                  </div>

                  {fee.remainingFee <= 0 ? (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2 text-green-400 font-semibold p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      All fees paid. Thank you!
                    </motion.div>
                  ) : (
                    <div className="max-w-sm">
                      <PayButton amount={fee.remainingFee} onSuccess={fetchFee} />
                      <p className="text-xs text-[#808080] mt-2">
                        Need part-payment? Open the full page to pick installments.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-[#808080] py-8">
                  Fee details not set. Please contact your school admin.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Communication Tab */}
        {activeTab === "communication" && (
          <div className="relative -mx-4 md:-mx-6 -mb-8 h-[calc(100vh-280px)] md:h-[calc(100vh-220px)] min-h-[600px]">
            <CommunicationPage />
          </div>
        )}

        {/* Bus Booking Tab */}
        {activeTab === "bus" && (
          <div className="space-y-6">
            <BusBooking />
          </div>
        )}

        {/* Hostel Booking Tab */}
        {activeTab === "hostel" && (
          <div className="space-y-6">
            <HostelBooking />
          </div>
        )}

        {/* Timetable Tab */}
        {activeTab === "timetable" && (
          <div className="space-y-6">
            <TimetableView />
          </div>
        )}

        {/* TC Tab */}
        {activeTab === "tc" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-8 h-8 text-[#808080]" />
              <h2 className="text-3xl font-bold text-white">Transfer Certificate</h2>
            </div>
            {tc ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 border border-[#333333]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
                <div className="relative space-y-4">
                  <div>
                    <p className="font-medium text-[#808080] mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Status:
                    </p>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2 ${tc.status === "APPROVED"
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : tc.status === "REJECTED"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        }`}
                    >
                      {tc.status === "APPROVED" && <CheckCircle2 className="w-4 h-4" />}
                      {tc.status === "REJECTED" && <XCircle className="w-4 h-4" />}
                      {tc.status === "PENDING" && <Clock className="w-4 h-4" />}
                      {tc.status}
                    </span>
                  </div>
                  {tc.reason && (
                    <div>
                      <p className="font-medium text-white mb-2">Reason:</p>
                      <p className="text-[#b0b0b0]">{tc.reason}</p>
                    </div>
                  )}
                  {tc.issuedDate && (
                    <div>
                      <p className="font-medium text-white mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Issued Date:
                      </p>
                      <p className="text-[#b0b0b0]">
                        {new Date(tc.issuedDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {tc.tcDocumentUrl && (
                    <div>
                      <motion.a
                        href={tc.tcDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 inline-flex items-center gap-2 border border-[#333333] hover:border-[#808080] shadow-lg"
                      >
                        <Download className="w-5 h-5" />
                        Download TC Document
                      </motion.a>
                    </div>
                  )}
                  <p className="text-sm text-[#808080] flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Requested on: {new Date(tc.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 border border-[#333333]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
                <div className="relative">
                  <p className="text-[#b0b0b0] mb-6">
                    You haven't applied for a Transfer Certificate yet.
                  </p>
                  <div className="space-y-4">
                    <textarea
                      id="tc-reason"
                      placeholder="Enter reason for TC request..."
                      className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent placeholder-[#6b6b6b]"
                      rows={4}
                    />
                    <motion.button
                      onClick={() => {
                        const reason = (
                          document.getElementById("tc-reason") as HTMLTextAreaElement
                        )?.value;
                        handleApplyTC(reason);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 border border-[#333333] hover:border-[#808080] shadow-lg"
                    >
                      <FileText className="w-5 h-5" />
                      Apply for TC
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
        {activeTab === "library" && (
  <div className="space-y-4">
    <h2 className="text-xl font-bold text-white flex items-center gap-2">
      <BookOpen /> My Library Books
    </h2>

    {libraryBooks.length === 0 ? (
      <p className="text-gray-400">No books issued yet.</p>
    ) : (
      libraryBooks.map((b) => (
        <div
          key={b.id}
          className="bg-[#1a1a1a] border border-[#333] rounded p-4 space-y-1"
        >
          {/* Book / Subject */}
          <p className="text-white font-semibold">
            📘 {b.bookName}
          </p>

          {/* Dates */}
          <p className="text-sm text-gray-400">
            Issued: {new Date(b.issueDate).toLocaleDateString()} | Expected:{" "}
            {new Date(b.expectedDate).toLocaleDateString()}
          </p>

          {/* Returned */}
          {b.returnDate && (
            <p className="text-sm text-green-400">
              Returned: {new Date(b.returnDate).toLocaleDateString()}
            </p>
          )}

          {/* Status */}
          <p
            className={`text-sm font-bold ${
              b.status === "OVERDUE"
                ? "text-red-400"
                : b.status === "RETURNED"
                ? "text-green-400"
                : "text-yellow-400"
            }`}
          >
            Status: {b.status}
          </p>

          {/* Overdue & Fine (IMPORTANT FIX) */}
          {b.overdueDays > 0 && (
            <p className="text-sm text-red-400">
              ⏰ Overdue: {b.overdueDays} days | 💰 Fine: ₹{b.fineAmount}
            </p>
          )}
        </div>
      ))
    )}
  </div>
)}


      </div>
    </div>
  );
}

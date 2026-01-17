"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, TrendingUp, Filter, FileText, GraduationCap, User } from "lucide-react";

interface Attendance {
  id: string;
  date: string;
  period: number;
  status: string;
  class: { id: string; name: string; section: string | null };
  teacher?: { id: string; name: string | null; email: string | null };
}

export default function ViewAttendancePage() {
  const { data: session, status } = useSession();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      fetchAttendance();
    }
  }, [session, startDate, endDate]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/attendance/view?startDate=${startDate}&endDate=${endDate}`
      );
      const data = await res.json();
      if (!res.ok) {
        console.error("Failed to fetch attendance:", data.message);
        setAttendances([]);
        return;
      }
      if (data.attendances) {
        setAttendances(data.attendances);
      } else {
        setAttendances([]);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
            <CheckCircle2 size={14} />
            {status}
          </span>
        );
      case "ABSENT":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
            <XCircle size={14} />
            {status}
          </span>
        );
      case "LATE":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            <Clock size={14} />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#2d2d2d] text-[#808080] border border-[#404040]">
            {status}
          </span>
        );
    }
  };

  const presentCount = attendances.filter(a => a.status === "PRESENT").length;
  const absentCount = attendances.filter(a => a.status === "ABSENT").length;
  const lateCount = attendances.filter(a => a.status === "LATE").length;
  const totalCount = attendances.length;
  const presentPercentage = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : "0";

  if (status === "loading") return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#808080] mx-auto mb-4"></div>
        <p className="text-white">Loading session…</p>
      </div>
    </div>
  );
  if (!session) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="p-6 text-red-400">Not authenticated</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#808080]" />
            My Attendance
          </h1>
          <p className="text-[#808080] text-sm md:text-base">View and track your attendance records</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-[#808080]" />
            </div>
            <p className="text-3xl font-bold text-white">{presentPercentage}%</p>
            <p className="text-sm text-[#808080] mt-1">Attendance Rate</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">{presentCount}</p>
            <p className="text-sm text-[#808080] mt-1">Present</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-3xl font-bold text-white">{absentCount}</p>
            <p className="text-sm text-[#808080] mt-1">Absent</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">{lateCount}</p>
            <p className="text-sm text-[#808080] mt-1">Late</p>
          </div>
        </div>

        {/* Date Filter */}
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Filter size={20} />
            Filter by Date Range
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                <Calendar size={16} />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        {loading ? (
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#808080] mx-auto mb-4"></div>
            <p className="text-white">Loading...</p>
          </div>
        ) : attendances.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-[#808080] opacity-50" />
            <p className="text-[#808080] text-lg">No attendance records found</p>
          </div>
        ) : (
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#2d2d2d] border-b border-[#333333]">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        Date
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        Period
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                        <GraduationCap size={16} />
                        Class
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">
                      Status
                    </th>
                    {session.user.role !== "STUDENT" && (
                      <th className="px-4 py-4 text-left text-sm font-medium text-white">
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          Teacher
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333333]">
                  {attendances.map((att) => (
                    <tr key={att.id} className="hover:bg-[#2d2d2d] transition">
                      <td className="px-4 py-4 text-white">
                        {new Date(att.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 text-[#808080]">
                          <Clock size={14} />
                          Period {att.period}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-white">
                          <GraduationCap size={14} className="text-[#808080]" />
                          {att.class.name} {att.class.section ? `- ${att.class.section}` : ""}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(att.status)}
                      </td>
                      {session.user.role !== "STUDENT" && att.teacher && (
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-[#808080]">
                            <User size={14} />
                            {att.teacher.name}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

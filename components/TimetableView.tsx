"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, BookOpen, Coffee, UtensilsCrossed, Clock, GraduationCap, User, AlertCircle } from "lucide-react";

interface TimetableEntry {
  id: string;
  day: string;
  period: number;
  type: "SUBJECT" | "BREAK" | "LUNCH";
  subject?: string | null;
  teacherName?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  class: {
    id: string;
    name: string;
    section: string | null;
  };
}

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function TimetableView() {
  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/timetable/my-class");
      const data = await res.json();
      if (res.ok && data.timetables) {
        setTimetables(data.timetables);
      }
    } catch (err) {
      console.error("Error fetching timetable:", err);
    } finally {
      setLoading(false);
    }
  };

  const getEntry = (day: string, period: number): TimetableEntry | null => {
    return timetables.find((t) => t.day === day && t.period === period) || null;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SUBJECT":
        return <BookOpen className="w-4 h-4" />;
      case "BREAK":
        return <Coffee className="w-4 h-4" />;
      case "LUNCH":
        return <UtensilsCrossed className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "SUBJECT":
        return "bg-blue-500/20 border-blue-500/30 text-blue-400";
      case "BREAK":
        return "bg-yellow-500/20 border-yellow-500/30 text-yellow-400";
      case "LUNCH":
        return "bg-green-500/20 border-green-500/30 text-green-400";
      default:
        return "bg-[#2d2d2d] border-[#404040] text-[#808080]";
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#2d2d2d] to-[#404040] rounded-xl flex items-center justify-center border border-[#333333] shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">My Timetable</h2>
          </motion.div>
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#808080] mx-auto mb-4"></div>
            <p className="text-white">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-[#2d2d2d] to-[#404040] rounded-xl flex items-center justify-center border border-[#333333] shadow-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">My Timetable</h2>
        </motion.div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-lg p-12 text-center"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#808080] mx-auto mb-4"></div>
            <p className="text-white">Loading timetable...</p>
          </motion.div>
        ) : timetables.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-lg p-12 text-center"
          >
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-[#808080] opacity-50" />
            <p className="text-[#808080] text-lg">
              No timetable found for your class. Please contact your admin.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
            <div className="relative">
              <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#404040] to-[#2d2d2d] rounded-lg flex items-center justify-center border border-[#333333]">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Class: {timetables[0]?.class.name} {timetables[0]?.class.section ? `- ${timetables[0]?.class.section}` : ""}
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#2d2d2d] border-b border-[#333333]">
                      <th className="border border-[#404040] p-3 text-left font-semibold text-white">Day / Period</th>
                      {PERIODS.map((period) => (
                        <th key={period} className="border border-[#404040] p-3 text-center min-w-[150px] font-semibold text-white">
                          Period {period}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map((day, dayIndex) => (
                      <motion.tr
                        key={day}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: dayIndex * 0.05 }}
                        className="hover:bg-[#2d2d2d]/50 transition"
                      >
                        <td className="border border-[#404040] p-3 font-semibold bg-[#2d2d2d]/50 text-white">{day}</td>
                        {PERIODS.map((period, periodIndex) => {
                          const entry = getEntry(day, period);
                          return (
                            <motion.td
                              key={period}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: (dayIndex * PERIODS.length + periodIndex) * 0.01 }}
                              className="border border-[#404040] p-2"
                            >
                              {entry ? (
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  className={`p-3 rounded-lg border ${getTypeColor(entry.type)}`}
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    {getTypeIcon(entry.type)}
                                    <span className="font-semibold text-xs">{entry.type}</span>
                                  </div>
                                  {entry.type === "SUBJECT" && (
                                    <>
                                      {entry.subject && (
                                        <div className="font-medium text-sm mb-1 text-white">{entry.subject}</div>
                                      )}
                                      {entry.teacherName && (
                                        <div className="text-xs text-[#808080] mb-2 flex items-center gap-1">
                                          <User size={12} />
                                          {entry.teacherName}
                                        </div>
                                      )}
                                    </>
                                  )}
                                  {(entry.startTime || entry.endTime) && (
                                    <div className="text-xs flex items-center gap-1 mt-2 pt-2 border-t border-[#404040] text-[#808080]">
                                      <Clock className="w-3 h-3" />
                                      {entry.startTime} - {entry.endTime}
                                    </div>
                                  )}
                                </motion.div>
                              ) : (
                                <div className="p-3 text-[#808080] text-sm text-center">-</div>
                              )}
                            </motion.td>
                          );
                        })}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Plus, Save, X, Clock, BookOpen, Coffee, UtensilsCrossed } from "lucide-react";

interface Class {
  id: string;
  name: string;
  section: string | null;
}

interface TimetableEntry {
  id?: string;
  day: string;
  period: number;
  type: "SUBJECT" | "BREAK" | "LUNCH";
  subject?: string | null;
  teacherName?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function TimetableManagement() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchTimetable();
    }
  }, [selectedClassId]);

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/class/list");
      const data = await res.json();
      if (data.classes) {
        setClasses(data.classes);
        if (data.classes.length > 0) {
          setSelectedClassId(data.classes[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  const fetchTimetable = async () => {
    if (!selectedClassId) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/timetable/list?classId=${selectedClassId}`);
      const data = await res.json();
      if (res.ok && data.timetables) {
        setTimetables(data.timetables);
      } else {
        setTimetables([]);
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

  const updateEntry = (day: string, period: number, updates: Partial<TimetableEntry>) => {
    const existing = getEntry(day, period);
    const newEntry: TimetableEntry = {
      ...existing,
      day,
      period,
      type: updates.type || existing?.type || "SUBJECT",
      ...updates,
    };

    setTimetables((prev) => {
      const filtered = prev.filter((t) => !(t.day === day && t.period === period));
      return [...filtered, newEntry];
    });
  };

  const handleSaveAll = async () => {
    if (!selectedClassId) {
      setMessage("Please select a class");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      // Save all timetable entries
      const savePromises = timetables.map((entry) =>
        fetch("/api/timetable/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classId: selectedClassId,
            day: entry.day,
            period: entry.period,
            type: entry.type,
            subject: entry.subject || null,
            teacherName: entry.teacherName || null,
            startTime: entry.startTime || null,
            endTime: entry.endTime || null,
          }),
        })
      );

      await Promise.all(savePromises);
      setMessage("Timetable saved successfully!");
      fetchTimetable();
    } catch (err) {
      console.error("Error saving timetable:", err);
      setMessage("Failed to save timetable");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (timetableId: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const res = await fetch(`/api/timetable/delete?id=${timetableId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTimetables((prev) => prev.filter((t) => t.id !== timetableId));
        setMessage("Entry deleted successfully");
      } else {
        setMessage("Failed to delete entry");
      }
    } catch (err) {
      console.error("Error deleting entry:", err);
      setMessage("Failed to delete entry");
    }
  };

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
          <h2 className="text-2xl md:text-3xl font-bold text-white">Timetable Management</h2>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border flex items-center gap-3 ${
              message.includes("success")
                ? "bg-[#2d2d2d] text-white border-[#404040]"
                : "bg-red-500/10 text-red-400 border-red-500/30"
            }`}
          >
            {message.includes("success") ? "✓" : "⚠"}
            {message}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
          <div className="relative">
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                <BookOpen size={16} />
                Select Class
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition"
              >
                <option value="" className="bg-[#2d2d2d]">Select a class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id} className="bg-[#2d2d2d]">
                    {cls.name} {cls.section ? `- ${cls.section}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {selectedClassId && (
              <>
                <div className="flex justify-end mb-6">
                  <motion.button
                    onClick={handleSaveAll}
                    disabled={saving}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 border border-[#333333] hover:border-[#808080] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Save All Changes</span>
                      </>
                    )}
                  </motion.button>
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
                          {PERIODS.map((period) => {
                            const entry = getEntry(day, period);
                            return (
                              <td key={period} className="border border-[#404040] p-2">
                                <TimetableCell
                                  entry={entry}
                                  day={day}
                                  period={period}
                                  onUpdate={(updates) => updateEntry(day, period, updates)}
                                  onDelete={entry?.id ? () => handleDelete(entry.id!) : undefined}
                                />
                              </td>
                            );
                          })}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function TimetableCell({
  entry,
  day,
  period,
  onUpdate,
  onDelete,
}: {
  entry: TimetableEntry | null;
  day: string;
  period: number;
  onUpdate: (updates: Partial<TimetableEntry>) => void;
  onDelete?: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    type: entry?.type || "SUBJECT",
    subject: entry?.subject || "",
    teacherName: entry?.teacherName || "",
    startTime: entry?.startTime || "",
    endTime: entry?.endTime || "",
  });

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      type: entry?.type || "SUBJECT",
      subject: entry?.subject || "",
      teacherName: entry?.teacherName || "",
      startTime: entry?.startTime || "",
      endTime: entry?.endTime || "",
    });
    setIsEditing(false);
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

  if (!entry && !isEditing) {
    return (
      <motion.button
        onClick={() => setIsEditing(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full p-3 border-2 border-dashed border-[#404040] rounded-lg text-[#808080] hover:border-[#808080] hover:text-white text-sm transition-all duration-300 bg-[#2d2d2d]/50 hover:bg-[#404040]/50"
      >
        <Plus className="w-4 h-4 mx-auto" />
        Add
      </motion.button>
    );
  }

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-2 p-3 bg-[#2d2d2d] rounded-lg border border-[#404040]"
      >
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
          className="w-full p-2 text-sm bg-[#1a1a1a] border border-[#404040] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition"
        >
          <option value="SUBJECT" className="bg-[#2d2d2d]">Subject</option>
          <option value="BREAK" className="bg-[#2d2d2d]">Break</option>
          <option value="LUNCH" className="bg-[#2d2d2d]">Lunch</option>
        </select>

        {formData.type === "SUBJECT" && (
          <>
            <input
              type="text"
              placeholder="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full p-2 text-sm bg-[#1a1a1a] border border-[#404040] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
            />
            <input
              type="text"
              placeholder="Teacher Name"
              value={formData.teacherName}
              onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
              className="w-full p-2 text-sm bg-[#1a1a1a] border border-[#404040] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
            />
          </>
        )}

        <input
          type="time"
          placeholder="Start Time"
          value={formData.startTime || ""}
          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          className="w-full p-2 text-sm bg-[#1a1a1a] border border-[#404040] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition"
        />
        <input
          type="time"
          placeholder="End Time"
          value={formData.endTime || ""}
          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          className="w-full p-2 text-sm bg-[#1a1a1a] border border-[#404040] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition"
        />

        <div className="flex gap-2 pt-2">
          <motion.button
            onClick={handleSave}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 border border-[#333333] hover:border-[#808080] shadow-lg"
          >
            Save
          </motion.button>
          <motion.button
            onClick={handleCancel}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 bg-[#2d2d2d] hover:bg-[#404040] text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 border border-[#333333] hover:border-[#808080]"
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`p-3 rounded-lg text-sm border ${getTypeColor(entry!.type)}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getTypeIcon(entry!.type)}
          <span className="font-semibold text-xs">{entry!.type}</span>
        </div>
        <div className="flex gap-2">
          <motion.button
            onClick={() => setIsEditing(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-xs hover:underline text-[#808080] hover:text-white transition"
          >
            Edit
          </motion.button>
          {onDelete && (
            <motion.button
              onClick={onDelete}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-xs hover:underline text-red-400 hover:text-red-300 transition"
            >
              Del
            </motion.button>
          )}
        </div>
      </div>
      {entry!.type === "SUBJECT" && (
        <>
          {entry!.subject && <div className="font-medium text-white mb-1">{entry!.subject}</div>}
          {entry!.teacherName && <div className="text-xs text-[#808080] mb-2">{entry!.teacherName}</div>}
        </>
      )}
      {(entry!.startTime || entry!.endTime) && (
        <div className="text-xs mt-2 pt-2 border-t border-[#404040] flex items-center gap-1 text-[#808080]">
          <Clock className="w-3 h-3" />
          {entry!.startTime} - {entry!.endTime}
        </div>
      )}
    </motion.div>
  );
}

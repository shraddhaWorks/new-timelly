"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Plus, Users, Download, Save, X, UserCheck, GraduationCap } from "lucide-react";

interface Class {
  id: string;
  name: string;
  section: string | null;
}

interface Student {
  id: string;
  user: { id: string; name: string | null; email: string | null };
  class: { id: string; name: string; section: string | null } | null;
  rollNo: string | null;
}

interface Teacher {
  id: string;
  name: string | null;
  email: string | null;
}

interface RoomAllocation {
  id: string;
  roomName: string;
  rows: number;
  columns: number;
  studentsPerBench: number;
  classRooms: Array<{
    id: string;
    class: Class;
  }>;
  studentAssignments: Array<{
    id: string;
    student: Student;
    row: number;
    column: number;
    benchPosition: number;
  }>;
  teacherAssignments: Array<{
    id: string;
    teacher: Teacher;
  }>;
}

export default function RoomAllocationManagement() {
  const [roomAllocations, setRoomAllocations] = useState<RoomAllocation[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"rooms" | "create" | "assign">("rooms");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [message, setMessage] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    roomName: "",
    rows: "",
    columns: "",
    studentsPerBench: "1",
    classIds: [] as string[],
  });

  // Assignment state
  const [studentAssignments, setStudentAssignments] = useState<Array<{
    studentId: string;
    row: number;
    column: number;
    benchPosition: number;
  }>>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [selectedClassForAssignment, setSelectedClassForAssignment] = useState<string>("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [autoAssigning, setAutoAssigning] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      const room = roomAllocations.find((r) => r.id === selectedRoom);
      if (room) {
        setStudentAssignments(
          room.studentAssignments.map((a) => ({
            studentId: a.student.id,
            row: a.row,
            column: a.column,
            benchPosition: a.benchPosition,
          }))
        );
        setSelectedTeachers(room.teacherAssignments.map((t) => t.teacher.id));
      }
    }
  }, [selectedRoom, roomAllocations]);

  // Filter students by selected class
  const studentsForSelectedClass = selectedClassForAssignment
    ? students.filter((s) => s.class?.id === selectedClassForAssignment)
    : [];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomsRes, classesRes, studentsRes, teachersRes] = await Promise.all([
        fetch("/api/room-allocation/list"),
        fetch("/api/class/list"),
        fetch("/api/student/list"),
        fetch("/api/teacher/list"),
      ]);

      const roomsData = await roomsRes.json();
      const classesData = await classesRes.json();
      const studentsData = await studentsRes.json();
      const teachersData = await teachersRes.json();

      if (roomsRes.ok && roomsData.roomAllocations) {
        setRoomAllocations(roomsData.roomAllocations);
      }
      if (classesRes.ok && classesData.classes) {
        setClasses(classesData.classes);
      }
      if (studentsRes.ok && studentsData.students) {
        setStudents(studentsData.students);
      }
      if (teachersRes.ok && teachersData.teachers) {
        setTeachers(teachersData.teachers);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!formData.roomName || !formData.rows || !formData.columns) {
      setMessage("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch("/api/room-allocation/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: formData.roomName,
          rows: parseInt(formData.rows),
          columns: parseInt(formData.columns),
          studentsPerBench: parseInt(formData.studentsPerBench),
          classIds: formData.classIds,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Room created successfully!");
        setFormData({
          roomName: "",
          rows: "",
          columns: "",
          studentsPerBench: "1",
          classIds: [],
        });
        fetchData();
        setActiveTab("rooms");
      } else {
        setMessage(data.message || "Failed to create room");
      }
    } catch (err: any) {
      setMessage(err?.message || "Failed to create room");
    }
  };

  const handleAssignStudents = async () => {
    if (!selectedRoom || studentAssignments.length === 0) {
      setMessage("Please select a room and assign students");
      return;
    }

    try {
      const res = await fetch("/api/room-allocation/assign-students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomAllocationId: selectedRoom,
          assignments: studentAssignments,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Students assigned successfully!");
        fetchData();
      } else {
        setMessage(data.message || "Failed to assign students");
      }
    } catch (err: any) {
      setMessage(err?.message || "Failed to assign students");
    }
  };

  const handleAssignTeachers = async () => {
    if (!selectedRoom) {
      setMessage("Please select a room");
      return;
    }

    try {
      const res = await fetch("/api/room-allocation/assign-teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomAllocationId: selectedRoom,
          teacherIds: selectedTeachers,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Teachers assigned successfully!");
        fetchData();
      } else {
        setMessage(data.message || "Failed to assign teachers");
      }
    } catch (err: any) {
      setMessage(err?.message || "Failed to assign teachers");
    }
  };

  const handleDownloadPDF = async (roomId: string, copies: number = 1) => {
    try {
      const res = await fetch("/api/room-allocation/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomAllocationId: roomId,
          copies: copies,
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `room-allocation-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setMessage("PDF downloaded successfully!");
      } else {
        const data = await res.json();
        setMessage(data.message || "Failed to download PDF");
      }
    } catch (err: any) {
      setMessage(err?.message || "Failed to download PDF");
    }
  };

  const handleAutoAssign = async () => {
    if (!selectedRoom || selectedStudentIds.length === 0) {
      setMessage("Please select a room and at least one student");
      return;
    }

    try {
      setAutoAssigning(true);
      setMessage("");

      const res = await fetch("/api/room-allocation/auto-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomAllocationId: selectedRoom,
          studentIds: selectedStudentIds,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`Successfully auto-assigned ${selectedStudentIds.length} student(s)!`);
        setSelectedStudentIds([]);
        setSelectedClassForAssignment("");
        fetchData();
      } else {
        setMessage(data.message || "Failed to auto-assign students");
      }
    } catch (err: any) {
      setMessage(err?.message || "Failed to auto-assign students");
    } finally {
      setAutoAssigning(false);
    }
  };

  const removeStudentAssignment = (studentId: string) => {
    setStudentAssignments(studentAssignments.filter((a) => a.studentId !== studentId));
  };

  const getStudentAtPosition = (row: number, column: number, benchPosition: number) => {
    return studentAssignments.find(
      (a) => a.row === row && a.column === column && a.benchPosition === benchPosition
    );
  };

  const selectedRoomData = roomAllocations.find((r) => r.id === selectedRoom);

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
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Room Allocation Management</h2>
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

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 border-b border-[#333333]"
        >
          <motion.button
            onClick={() => setActiveTab("rooms")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2.5 rounded-t-lg font-semibold transition-all duration-300 ${
              activeTab === "rooms"
                ? "bg-gradient-to-r from-[#404040] to-[#6b6b6b] text-white shadow-lg border-t border-l border-r border-[#808080]"
                : "text-[#808080] hover:text-white bg-[#2d2d2d] border border-transparent"
            }`}
          >
            Rooms
          </motion.button>
          <motion.button
            onClick={() => setActiveTab("create")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2.5 rounded-t-lg font-semibold transition-all duration-300 ${
              activeTab === "create"
                ? "bg-gradient-to-r from-[#404040] to-[#6b6b6b] text-white shadow-lg border-t border-l border-r border-[#808080]"
                : "text-[#808080] hover:text-white bg-[#2d2d2d] border border-transparent"
            }`}
          >
            Create Room
          </motion.button>
          <motion.button
            onClick={() => setActiveTab("assign")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2.5 rounded-t-lg font-semibold transition-all duration-300 ${
              activeTab === "assign"
                ? "bg-gradient-to-r from-[#404040] to-[#6b6b6b] text-white shadow-lg border-t border-l border-r border-[#808080]"
                : "text-[#808080] hover:text-white bg-[#2d2d2d] border border-transparent"
            }`}
          >
            Assign Students/Teachers
          </motion.button>
        </motion.div>

      {activeTab === "rooms" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
          <div className="relative">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#808080] mx-auto mb-4"></div>
                <p className="text-[#808080]">Loading...</p>
              </div>
            ) : roomAllocations.length === 0 ? (
              <div className="text-center py-12">
                <Building2 size={48} className="mx-auto text-[#808080] mb-4" />
                <p className="text-[#808080] text-lg">No rooms created yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roomAllocations.map((room, index) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="relative overflow-hidden bg-gradient-to-br from-[#2d2d2d] to-[#1a1a1a] rounded-xl p-5 border border-[#333333] hover:border-[#404040] transition-all duration-300 shadow-lg"
                  >
                    <h3 className="font-bold text-xl mb-3 text-white flex items-center gap-2">
                      <Building2 size={20} className="text-[#808080]" />
                      {room.roomName}
                    </h3>
                    <div className="space-y-2 mb-4 text-sm">
                      <p className="text-[#808080]">
                        📏 {room.rows} rows × {room.columns} columns × {room.studentsPerBench} per bench
                      </p>
                      <p className="text-white font-semibold">
                        👥 Capacity: {room.rows * room.columns * room.studentsPerBench}
                      </p>
                      <p className="text-[#808080]">
                        📚 Classes: {room.classRooms.length}
                      </p>
                      <p className="text-[#808080]">
                        🎓 Students: {room.studentAssignments.length}
                      </p>
                      <p className="text-[#808080]">
                        👨‍🏫 Teachers: {room.teacherAssignments.length}
                      </p>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-[#333333]">
                      <motion.button
                        onClick={() => handleDownloadPDF(room.id, 1)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white px-3 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm font-semibold border border-[#333333] hover:border-[#808080]"
                      >
                        <Download className="w-4 h-4" />
                        PDF
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          const copies = prompt("How many copies?", "1");
                          if (copies) {
                            handleDownloadPDF(room.id, parseInt(copies) || 1);
                          }
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 bg-gradient-to-r from-green-500/80 to-green-600/80 hover:from-green-600 hover:to-green-500 text-white px-3 py-2 rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-semibold border border-green-500/30 hover:border-green-400"
                      >
                        Multiple
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === "create" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white flex items-center gap-3">
              <Plus className="w-7 h-7 text-[#808080]" />
              Create New Room
            </h2>
            <form onSubmit={handleCreateRoom} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                  <Building2 size={16} />
                  Room Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.roomName}
                  onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
                  className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                  placeholder="e.g., Room A-101"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#808080] mb-2">Rows <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.rows}
                    onChange={(e) => setFormData({ ...formData, rows: e.target.value })}
                    className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#808080] mb-2">Columns <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.columns}
                    onChange={(e) => setFormData({ ...formData, columns: e.target.value })}
                    className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#808080] mb-2">Students per Bench</label>
                  <select
                    value={formData.studentsPerBench}
                    onChange={(e) => setFormData({ ...formData, studentsPerBench: e.target.value })}
                    className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition"
                  >
                    <option value="1" className="bg-[#2d2d2d]">1</option>
                    <option value="2" className="bg-[#2d2d2d]">2</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                  <GraduationCap size={16} />
                  Classes (Optional)
                </label>
                <div className="max-h-40 overflow-y-auto bg-[#2d2d2d]/50 border border-[#404040] rounded-lg p-3 space-y-2">
                  {classes.map((cls) => (
                    <motion.label
                      key={cls.id}
                      whileHover={{ scale: 1.02, x: 4 }}
                      className="flex items-center gap-2 p-2 hover:bg-[#404040]/50 rounded transition cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.classIds.includes(cls.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, classIds: [...formData.classIds, cls.id] });
                          } else {
                            setFormData({ ...formData, classIds: formData.classIds.filter((id) => id !== cls.id) });
                          }
                        }}
                        className="w-4 h-4 text-[#808080] bg-[#1a1a1a] border-[#404040] rounded focus:ring-[#808080] cursor-pointer"
                      />
                      <span className="text-white text-sm">{cls.name} {cls.section ? `- ${cls.section}` : ""}</span>
                    </motion.label>
                  ))}
                </div>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 border border-[#333333] hover:border-[#808080] shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Create Room
              </motion.button>
            </form>
          </div>
        </motion.div>
      )}

      {activeTab === "assign" && (
        <div className="space-y-6">
          {/* Room Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 border border-[#333333] hover:border-[#404040] transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
            <div className="relative">
              <label className="block text-sm font-medium text-[#808080] mb-3 flex items-center gap-2">
                <Building2 size={16} />
                Select Room <span className="text-red-400">*</span>
              </label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition"
              >
                <option value="" className="bg-[#2d2d2d]">Select a room</option>
                {roomAllocations.map((room) => (
                  <option key={room.id} value={room.id} className="bg-[#2d2d2d]">
                    {room.roomName} ({room.rows}×{room.columns}, {room.studentsPerBench} per bench)
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {selectedRoomData && (
            <>
              {/* Seating Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 border border-[#333333] hover:border-[#404040] transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
                <div className="relative">
                  <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                    <Building2 size={20} className="text-[#808080]" />
                    Seating Chart
                  </h3>
                  <div className="overflow-x-auto p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
                    <div className="inline-block">
                      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${selectedRoomData.columns + 1}, minmax(100px, 1fr))` }}>
                        {/* Header */}
                        <div className="p-2 font-bold text-center border border-[#404040] bg-[#2d2d2d] text-white"></div>
                        {Array.from({ length: selectedRoomData.columns }, (_, i) => (
                          <div key={i} className="p-2 font-bold text-center border border-[#404040] bg-[#2d2d2d] text-white">
                            C{i + 1}
                          </div>
                        ))}

                        {/* Rows */}
                        {Array.from({ length: selectedRoomData.rows }, (_, rowIndex) => (
                          <>
                            <div className="p-2 font-bold text-center border border-[#404040] bg-[#2d2d2d] text-white">
                              R{rowIndex + 1}
                            </div>
                            {Array.from({ length: selectedRoomData.columns }, (_, colIndex) => {
                              const row = rowIndex + 1;
                              const col = colIndex + 1;
                              const assignment1 = getStudentAtPosition(row, col, 1);
                              const assignment2 = selectedRoomData.studentsPerBench === 2 ? getStudentAtPosition(row, col, 2) : null;

                              return (
                                <motion.div
                                  key={colIndex}
                                  whileHover={{ scale: 1.05 }}
                                  className="p-2 border border-[#404040] min-h-[70px] bg-[#2d2d2d] rounded transition"
                                >
                                  {assignment1 && (
                                    <div className="text-xs mb-1 p-1.5 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30 font-medium">
                                      {students.find((s) => s.id === assignment1.studentId)?.user.name || "N/A"}
                                    </div>
                                  )}
                                  {assignment2 && (
                                    <div className="text-xs p-1.5 bg-green-500/20 text-green-400 rounded border border-green-500/30 font-medium">
                                      {students.find((s) => s.id === assignment2.studentId)?.user.name || "N/A"}
                                    </div>
                                  )}
                                  {!assignment1 && !assignment2 && (
                                    <div className="text-xs text-[#6b6b6b] text-center pt-2">Empty</div>
                                  )}
                                </motion.div>
                              );
                            })}
                          </>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Automatic Student Assignment */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 border border-[#333333] hover:border-[#404040] transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
                <div className="relative">
                  <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                    <Users size={20} className="text-[#808080]" />
                    Auto Assign Students
                  </h3>
                  <p className="text-sm text-[#808080] mb-6">
                    Select a class and students. The system will automatically assign them to valid positions based on seating constraints.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                        <GraduationCap size={16} />
                        Select Class
                      </label>
                      <select
                        value={selectedClassForAssignment}
                        onChange={(e) => {
                          setSelectedClassForAssignment(e.target.value);
                          setSelectedStudentIds([]);
                        }}
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

                    {selectedClassForAssignment && studentsForSelectedClass.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-[#808080] mb-3">
                          Select Students ({selectedStudentIds.length} selected)
                        </label>
                        <div className="max-h-60 overflow-y-auto bg-[#2d2d2d]/50 border border-[#404040] rounded-lg p-3 space-y-2">
                          <motion.label
                            whileHover={{ scale: 1.02, x: 4 }}
                            className="flex items-center gap-2 p-2 hover:bg-[#404040]/50 rounded transition cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedStudentIds.length === studentsForSelectedClass.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStudentIds(studentsForSelectedClass.map((s) => s.id));
                                } else {
                                  setSelectedStudentIds([]);
                                }
                              }}
                              className="w-4 h-4 text-[#808080] bg-[#1a1a1a] border-[#404040] rounded focus:ring-[#808080] cursor-pointer"
                            />
                            <span className="font-semibold text-white">Select All ({studentsForSelectedClass.length})</span>
                          </motion.label>
                          {studentsForSelectedClass
                            .filter((s) => !studentAssignments.some((a) => a.studentId === s.id))
                            .map((student, index) => (
                              <motion.label
                                key={student.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.02, x: 4 }}
                                className="flex items-center gap-2 p-2 hover:bg-[#404040]/50 rounded transition cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedStudentIds.includes(student.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedStudentIds([...selectedStudentIds, student.id]);
                                    } else {
                                      setSelectedStudentIds(selectedStudentIds.filter((id) => id !== student.id));
                                    }
                                  }}
                                  className="w-4 h-4 text-[#808080] bg-[#1a1a1a] border-[#404040] rounded focus:ring-[#808080] cursor-pointer"
                                />
                                <span className="text-white text-sm">
                                  {student.user.name} {student.rollNo ? `(Roll: ${student.rollNo})` : ""}
                                </span>
                              </motion.label>
                            ))}
                        </div>
                      </div>
                    )}

                    {selectedClassForAssignment && studentsForSelectedClass.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400"
                      >
                        No students found in this class or all students are already assigned.
                      </motion.div>
                    )}

                    <motion.button
                      onClick={handleAutoAssign}
                      disabled={!selectedRoom || selectedStudentIds.length === 0 || autoAssigning}
                      whileHover={{ scale: autoAssigning ? 1 : 1.02 }}
                      whileTap={{ scale: autoAssigning ? 1 : 0.98 }}
                      className="w-full bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 border border-[#333333] hover:border-[#808080] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {autoAssigning ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Assigning...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>Auto Assign {selectedStudentIds.length} Student(s)</span>
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Currently Assigned Students */}
                  {studentAssignments.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-[#404040]">
                      <h4 className="font-semibold mb-4 text-white flex items-center gap-2">
                        <UserCheck size={18} className="text-[#808080]" />
                        Currently Assigned Students ({studentAssignments.length})
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {studentAssignments.map((assignment, index) => {
                          const student = students.find((s) => s.id === assignment.studentId);
                          return (
                            <motion.div
                              key={assignment.studentId}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ scale: 1.02, x: 4 }}
                              className="flex items-center justify-between p-3 border border-[#404040] rounded-lg text-sm bg-[#2d2d2d]/50 hover:bg-[#404040]/50 transition"
                            >
                              <span className="text-white">
                                {student?.user.name} - Row {assignment.row}, Col {assignment.column}
                                {selectedRoomData.studentsPerBench === 2 && `, Bench ${assignment.benchPosition}`}
                              </span>
                              <motion.button
                                onClick={() => removeStudentAssignment(assignment.studentId)}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-red-400 hover:text-red-300 transition"
                              >
                                <X className="w-4 h-4" />
                              </motion.button>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Teacher Assignment */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 border border-[#333333] hover:border-[#404040] transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
                <div className="relative">
                  <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                    <GraduationCap size={20} className="text-[#808080]" />
                    Assign Teachers
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto bg-[#2d2d2d]/50 border border-[#404040] rounded-lg p-3">
                    {teachers.map((teacher, index) => (
                      <motion.label
                        key={teacher.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        className="flex items-center gap-2 p-2 hover:bg-[#404040]/50 rounded transition cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTeachers.includes(teacher.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTeachers([...selectedTeachers, teacher.id]);
                            } else {
                              setSelectedTeachers(selectedTeachers.filter((id) => id !== teacher.id));
                            }
                          }}
                          className="w-4 h-4 text-[#808080] bg-[#1a1a1a] border-[#404040] rounded focus:ring-[#808080] cursor-pointer"
                        />
                        <span className="text-white text-sm">{teacher.name} ({teacher.email})</span>
                      </motion.label>
                    ))}
                  </div>
                  <motion.button
                    onClick={handleAssignTeachers}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-6 w-full bg-gradient-to-r from-green-500/80 to-green-600/80 hover:from-green-600 hover:to-green-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 border border-green-500/30 hover:border-green-400 shadow-lg"
                  >
                    <Save className="w-5 h-5" />
                    Save Teacher Assignments
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </div>
      )}
    </div>
    </div>
  );
}

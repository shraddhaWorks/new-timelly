"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, CheckCircle2, XCircle, Clock, User, Calendar, FileText, ArrowRight } from "lucide-react";

type AppointmentStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";

interface Appointment {
  id: string;
  studentId: string;
  teacherId: string;
  status: AppointmentStatus;
  note?: string | null;
}

interface ChatMessage {
  id: string;
  appointmentId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface TeacherLite {
  id: string;
  name: string | null;
  email: string | null;
}

export default function CommunicationPage() {
  const { data: session, status } = useSession();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [teachers, setTeachers] = useState<TeacherLite[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const socketRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

  /* ================= SOCKET CONNECT ================= */
  useEffect(() => {
    if (status !== "authenticated") return;

    const socket = io(socketUrl, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [socketUrl, status]);

  /* ================= FETCH APPOINTMENTS ================= */
  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/communication/appointments")
      .then((res) => res.json())
      .then((data) => setAppointments(data.appointments || []));

    if (session?.user?.role === "STUDENT") {
      fetch("/api/teacher/list")
        .then((res) => res.json())
        .then((data) => setTeachers(data.teachers || []));
    }
  }, [status, session?.user?.role]);

  /* ================= JOIN ROOM + REALTIME ================= */
  useEffect(() => {
    if (!selected || !socketRef.current) return;

    const roomId = selected.id;

    socketRef.current.emit("join-room", roomId);

    const handler = (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    socketRef.current.on("receive-message", handler);

    // Fetch initial messages (merge, don't override)
    fetch(`/api/communication/messages?appointmentId=${roomId}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages((prev) => {
          const map = new Map(prev.map((m) => [m.id, m]));
          (data.messages || []).forEach((m: ChatMessage) =>
            map.set(m.id, m)
          );
          return Array.from(map.values());
        });
      });

    return () => {
      socketRef.current.emit("leave-room", roomId);
      socketRef.current.off("receive-message", handler);
    };
  }, [selected]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= ACTIONS ================= */
  const sendMessage = async () => {
    if (!selected || !newMessage.trim() || selected.status !== "APPROVED")
      return;

    const res = await fetch("/api/communication/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appointmentId: selected.id,
        content: newMessage.trim(),
      }),
    });

    if (!res.ok) return;

    const msg: ChatMessage = await res.json();
    setNewMessage("");

    setMessages((prev) => [...prev, msg]);

    socketRef.current?.emit("send-message", {
      roomId: selected.id,
      message: msg,
    });
  };

  const createAppointment = async () => {
    if (!selectedTeacherId) return alert("Select a teacher");

    setSaving(true);
    try {
      const res = await fetch("/api/communication/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId: selectedTeacherId, note }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message);
      setAppointments((p) => [data.appointment, ...p]);
      setNote("");
    } finally {
      setSaving(false);
    }
  };

  const approveAppointment = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(
        `/api/communication/appointments/${id}/approve`,
        { method: "POST" }
      );
      if (!res.ok) return;

      setAppointments((p) =>
        p.map((a) => (a.id === id ? { ...a, status: "APPROVED" } : a))
      );

      if (selected?.id === id)
        setSelected({ ...selected, status: "APPROVED" });
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading")
    return (
      <div className="h-screen grid place-items-center bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] text-white">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 animate-pulse text-[#808080]" />
          <span>Loading chat…</span>
        </div>
      </div>
    );

  const role = session?.user?.role;

  /* ================= UI ================= */
  return (
    <div className="h-screen flex bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a]">
      {/* SIDEBAR */}
      <div className="w-[360px] bg-[#1a1a1a] border-r border-[#333333] flex flex-col">
        <div className="px-4 py-4 border-b border-[#333333] bg-gradient-to-r from-[#2d2d2d] to-[#1a1a1a]">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#808080]" />
            Appointments
          </h2>
        </div>

        {role === "STUDENT" && (
          <div className="p-4 space-y-3 border-b border-[#333333] bg-[#2d2d2d]/50">
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition"
            >
              <option value="" className="bg-[#2d2d2d]">Select Teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#2d2d2d]">
                  {t.name || t.email}
                </option>
              ))}
            </select>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note"
              rows={2}
              className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent placeholder-[#6b6b6b] resize-none"
            />

            <motion.button
              onClick={createAppointment}
              disabled={saving || !selectedTeacherId}
              whileHover={{ scale: saving ? 1 : 1.02 }}
              whileTap={{ scale: saving ? 1 : 0.98 }}
              className="w-full bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 border border-[#333333] hover:border-[#808080] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Requesting...</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4" />
                  Request Appointment
                </>
              )}
            </motion.button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {appointments.map((a, index) => (
            <motion.button
              key={a.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, x: 4 }}
              onClick={() => setSelected(a)}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                selected?.id === a.id
                  ? "bg-[#404040] border border-[#808080] shadow-lg"
                  : "bg-[#2d2d2d]/50 border border-[#333333] hover:bg-[#404040]/50 hover:border-[#404040]"
              }`}
            >
              <div className="font-medium text-sm text-white flex items-center gap-2 mb-1">
                <MessageCircle className="w-4 h-4 text-[#808080]" />
                Appointment #{a.id.slice(0, 6)}
              </div>
              <div className={`text-xs flex items-center gap-1 ${
                a.status === "APPROVED" ? "text-green-400" :
                a.status === "REJECTED" ? "text-red-400" :
                "text-yellow-400"
              }`}>
                {a.status === "APPROVED" && <CheckCircle2 className="w-3 h-3" />}
                {a.status === "REJECTED" && <XCircle className="w-3 h-3" />}
                {a.status === "PENDING" && <Clock className="w-3 h-3" />}
                {a.status}
              </div>

              {role === "TEACHER" && a.status !== "APPROVED" && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    approveAppointment(a.id);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-2 text-xs bg-gradient-to-r from-green-500/80 to-green-600/80 hover:from-green-600 hover:to-green-500 text-white px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 border border-green-500/30"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Approve
                </motion.button>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* CHAT */}
      <div className="flex-1 flex flex-col bg-[#1a1a1a]">
        {selected ? (
          <>
            <div className="h-16 bg-gradient-to-r from-[#2d2d2d] to-[#1a1a1a] border-b border-[#333333] px-6 flex items-center font-medium text-white shadow-lg">
              <MessageCircle className="w-5 h-5 text-[#808080] mr-3" />
              Appointment #{selected.id.slice(0, 6)}
              <span className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${
                selected.status === "APPROVED" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                selected.status === "REJECTED" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              }`}>
                {selected.status}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-[#1a1a1a] to-[#2d2d2d]">
              <AnimatePresence>
                {messages.map((m, index) => {
                  const mine = m.senderId === session?.user?.id;

                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex ${
                        mine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`max-w-[70%] border rounded-xl px-4 py-3 shadow-lg ${
                          mine
                            ? "bg-gradient-to-br from-[#404040] to-[#6b6b6b] border-[#808080] text-white"
                            : "bg-[#2d2d2d] border-[#404040] text-[#b0b0b0]"
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                        <div className={`text-[10px] text-right mt-2 ${
                          mine ? "text-[#b0b0b0]" : "text-[#808080]"
                        }`}>
                          {new Date(m.createdAt).toLocaleTimeString()}
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            <div className="h-20 bg-gradient-to-r from-[#2d2d2d] to-[#1a1a1a] border-t border-[#333333] px-6 flex items-center gap-3 shadow-lg">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                disabled={selected.status !== "APPROVED"}
                placeholder={selected.status === "APPROVED" ? "Type a message..." : "Appointment must be approved to chat"}
                className="flex-1 bg-[#2d2d2d] border border-[#404040] text-white rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent placeholder-[#6b6b6b] disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <motion.button
                whileHover={{ scale: selected.status === "APPROVED" ? 1.05 : 1 }}
                whileTap={{ scale: selected.status === "APPROVED" ? 0.95 : 1 }}
                onClick={sendMessage}
                disabled={selected.status !== "APPROVED" || !newMessage.trim()}
                className="bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 border border-[#333333] hover:border-[#808080] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Send
              </motion.button>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 grid place-items-center text-[#808080]"
          >
            <div className="text-center space-y-4">
              <MessageCircle className="w-16 h-16 text-[#6b6b6b] mx-auto" />
              <p className="text-lg">Select an appointment to start chatting</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

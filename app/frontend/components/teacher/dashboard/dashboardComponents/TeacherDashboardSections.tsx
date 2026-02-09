"use client";

import {
  AlertCircle,
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  FileText,
  MessageCircle,
  MessageSquare,
  Ticket,
  Users,
} from "lucide-react";
import StatCard from "../../../common/statCard";
import { formatNumber, formatRelativeTime } from "../../../../utils/format";
import { TeacherDashboardData } from "./types";

const STATUS_COLORS = ["bg-red-500", "bg-yellow-400", "bg-blue-500"];

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "T";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatEventDate(value?: string | null) {
  if (!value) return "TBD";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "TBD";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatEventTime(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function fileLabel(path: string) {
  const parts = path.split("/");
  return parts[parts.length - 1] || "Attachment";
}

interface DashboardContentProps {
  data: TeacherDashboardData;
  onManageClasses: () => void;
  onOpenChat: () => void;
}

export function TeacherDashboardContent({
  data,
  onManageClasses,
  onOpenChat,
}: DashboardContentProps) {
  const stats = data.stats;
  const notifications = data.notifications.length
    ? data.notifications
    : [
      {
        id: "ntf-1",
        title: "Parent Message from Aarav's Father",
        message: "Regarding homework submission for this week.",
        type: "ALERT",
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
      {
        id: "ntf-2",
        title: "Staff Meeting Tomorrow",
        message: "All teachers are requested to attend at 3:00 PM.",
        type: "INFO",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "ntf-3",
        title: "Marks Entry Deadline",
        message: "Please submit Term 1 marks by Jan 30th.",
        type: "WARN",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "ntf-4",
        title: "Workshop Registration Open",
        message: "New teaching methodologies workshop is live.",
        type: "UPDATE",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  const recentChats = data.recentChats.length
    ? data.recentChats
    : [
      {
        id: "chat-1",
        parentName: "Mr. Rajesh Kumar",
        studentName: "Aarav Kumar",
        status: "OPEN",
        note: "Thank you for the feedback on the assignment.",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "chat-2",
        parentName: "Mrs. Meena Patel",
        studentName: "Diya Patel",
        status: "OPEN",
        note: "When is the next test scheduled?",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "chat-3",
        parentName: "Mr. Amit Shah",
        studentName: "Rohan Shah",
        status: "OPEN",
        note: "Could you share additional resources?",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

  return (
    <>
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard className="bg-white/5">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/5 rounded-xl group-hover:bg-lime-400/20 transition-colors">
              <Users size={20} className="w-5 h-5 text-lime-400" />
            </div>
            <span className="px-2 py-1 bg-lime-400/10 text-lime-400 text-[10px] font-bold 
            uppercase tracking-wider rounded-lg border border-lime-400/20">
              ACTIVE
            </span>
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Total Classes</h3>
            <p className="text-3xl font-bold text-white mb-1">{stats.totalClasses}</p>
            <p className="text-xs text-gray-500">
              {formatNumber(stats.totalStudents)} total students
            </p>
          </div>
        </StatCard>

        <StatCard className="bg-white/5">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-white/5 rounded-xl group-hover:bg-lime-400/20 transition-colors">
              <BookOpen size={20} className="w-5 h-5 text-lime-400" />
            </div>
            <span className="px-2 py-1 bg-white/5 text-gray-400 text-[10px] 
            font-bold uppercase tracking-wider rounded-lg border border-white/10">
              TOTAL
            </span>
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Total Students</h3>
            <p className="text-3xl font-bold text-white mb-1">{formatNumber(stats.totalStudents)}</p>
            <p className="text-xs text-gray-500">Across all classes</p>
          </div>
        </StatCard>

        <StatCard className="bg-white/5">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-white/5 rounded-xl group-hover:bg-lime-400/20 transition-colors">
              <MessageCircle size={20} className="w-5 h-5 text-lime-400" />
            </div>
            <span className="px-2 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold
             uppercase tracking-wider rounded-lg border border-red-500/20">
              ACTION
            </span>
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Pending Chats</h3>
            <p className="text-3xl font-bold text-white mb-1">{stats.pendingChats}</p>
            <p className="text-xs text-gray-500">Parent messages</p>
          </div>
        </StatCard>

        <StatCard className="bg-white/5">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-white/5 rounded-xl group-hover:bg-lime-400/20 transition-colors">
              <Bell size={20} className="w-5 h-5 text-lime-400" />
            </div>
            <span className="px-2 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase 
            tracking-wider rounded-lg border border-red-500/20">
              NEW
            </span>
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Unread Alerts</h3>
            <p className="text-3xl font-bold text-white mb-1">{stats.unreadAlerts}</p>
            <p className="text-xs text-gray-500">Important updates</p>
          </div>
        </StatCard>
      </section>

      <section className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="w-1.5 h-6 bg-lime-400 rounded-full" />
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">Circulars & Notices</h3>
            <p className="text-sm text-gray-400 mt-1">Create and manage school-wide circulars</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {data.circulars.map((c, index) => (
            <div
              key={c.id}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl group flex flex-col"
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-red-500 ${STATUS_COLORS[index % STATUS_COLORS.length]}`} />
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>{c.referenceNumber}</span>
                <span className="px-2 py-1 rounded-full bg-white/10 text-white/70 font-semibold">
                  {c.publishStatus}
                </span>
              </div>
              <h4 className="text-xl font-bold text-white mb-4 leading-tight group-hover:text-lime-400 transition-colors">{c.subject}</h4>
              <div className="bg-black/20 rounded-xl p-5 border border-white/5 mb-6 flex-1 flex flex-col">
                <p className="text-sm text-gray-400 italic font-serif leading-relaxed line-clamp-4 mb-4">
                  {c.content}
                </p>
              </div>

              {c.attachments && c.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {c.attachments.slice(0, 2).map((file) => (
                    <div
                      key={file}
                      className="flex items-center justify-between p-2.5 rounded-lg 
                      bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group/file cursor-pointer"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText size={16} className="lucide lucide-file-text w-3.5 h-3.5" />
                        <span className="text-xs text-gray-300 truncate font-medium">{fileLabel(file)}</span>
                      </div>
                      <ArrowRight size={14} className="lucide lucide-download w-3.5 h-3.5 text-gray-500
                       group-hover/file:text-lime-400 transition-colors" />
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-auto pt-4 flex items-center justify-between text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-lime-400/20 text-lime-300 flex items-center justify-center font-semibold overflow-hidden">
                    {c.issuedByPhoto ? (
                      <img
                        src={c.issuedByPhoto}
                        alt={c.issuedBy ?? "Publisher"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(c.issuedBy ?? "School")
                    )}
                  </div>
                  <span>{c.issuedBy ?? "School Admin"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>{new Date(c.date).toLocaleDateString("en-GB")}</span>
                </div>
              </div>
            </div>
          ))}

          {data.circulars.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/60">
              No circulars available.
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="min-h-[520px] background-blur-2xl border border-white/10 bg-transparent rounded-2xl overflow-hidden border border-white/5 flex flex-col justify-center 
          items-center p-8 sm:p-10 text-center group hover:border-lime-400/30 transition-all">
            <div className="p-6 rounded-full bg-white/5 group-hover:bg-lime-400/10 transition-colors mb-4">
              <Users size={22} className="lucide lucide-users w-10 h-10 text-gray-400 group-hover:text-lime-400 transition-colors" />
            </div>
            <h3 className="font-bold text-white text-2xl mb-2">Classes Handling</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
              You are currently handling{" "}
              <span className="text-lime-400 font-bold">{stats.totalClasses} classes</span>. Manage your
              schedule, students, and subjects from the detailed view.
            </p>
            <button
              type="button"
              onClick={onManageClasses}
              className="px-8 py-3 bg-lime-400 text-black font-bold rounded-xl hover:bg-lime-500 
              transition-all shadow-[0_0_20px_rgba(163,230,53,0.3)] flex items-center gap-2"
            >
              Manage Classes
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="min-h-[500px] rounded-2xl border border-white/10 bg-white/5 p-6 rounded-2xl overflow-hidden border border-white/5 flex flex-col overflow-y-auto no-scrollbar scrollbar-thumb-white/10">
            <h3 className="text-xl font-semibold text-white">Upcoming Events</h3>
            <p className="text-sm text-white/60 mt-1">Meetings, workshops & deadlines</p>

            <div className="mt-4 space-y-3 divide-y divide-white/5">
              {data.events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-white/5 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/5 rounded-xl text-gray-400 group-hover:bg-lime-400/10
                     group-hover:text-lime-400 transition-all border border-white/5">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-200 text-sm group-hover:text-white">{event.title}</h3>
                      <p className="text-xs text-gray-400">
                        {formatEventDate(event.eventDate)}
                        {formatEventTime(event.eventDate) ? (
                          <span className="mx-2 text-gray-500">•</span>
                        ) : null}
                        {formatEventTime(event.eventDate)}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-white/5 text-gray-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/10
                   group-hover:border-lime-400/20 group-hover:text-lime-400 transition-colors">
                    {event.type}
                  </span>
                </div>
              ))}
              {data.events.length === 0 && (
                <div className="text-sm text-white/60">No upcoming events.</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-6">
          <div className="rounded-2xl border border-white/10 background-blur-2xl bg-white/5 p-6">
            <h3 className="text-xl font-semibold text-white">Notifications</h3>
            <p className="text-sm text-white/60 mt-1">Recent alerts and updates</p>

            <div className="mt-4 space-y-3 divide-y divide-white/5 overflow-y-auto max-h-[400px] no-scrollbar scrollbar-thumb-white/10">
              {notifications.map((n) => (
                <div key={n.id} className="flex gap-3 rounded-xl p-3
                p-5 hover:bg-white/5 transition-all cursor-pointer group">
                  <div className="p-2 rounded-lg mt-0.5 bg-red-500/10 text-red-400 border border-red-500/20 h-8">
                    <CircleAlert size={18} className="lucide lucide-circle-alert w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-200 text-sm truncate
                       group-hover:text-white transition-colors">{n.title}</h4>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-wider font-medium">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-sm text-white/60">No notifications yet.</div>
              )}
            </div>
          </div>

          <div className="min-h-[500px] rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">Recent Parent Chats</h3>
                <p className="text-sm text-white/60 mt-1">Latest messages from parents</p>
              </div>
              <button
                type="button"
                onClick={onOpenChat}
                className="px-3 py-1.5 bg-lime-400/10 hover:bg-lime-400/20 
                text-lime-400 border border-lime-400/20 rounded-lg font-medium transition-all text-xs"
              >
                View All
              </button>
            </div>

            <div className="mt-4 space-y-3 divide-y divide-white/5 overflow-y-auto no-scrollbar scrollbar-thumb-white/10">
              {recentChats.map((chat) => (
                <div key={chat.id} className="flex items-start gap-4 p-5 hover:bg-white/5 transition-all cursor-pointer group ">
                  <div className="p-2.5 bg-white/5 rounded-xl text-gray-400 group-hover:bg-lime-400/10
                   group-hover:text-lime-400 transition-all border border-white/5">
                    <MessageSquare size={18} className="lucide lucide-message-square w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-200 text-sm group-hover:text-white transition-colors">{chat.parentName}</h4>
                    <p className="text-xs text-lime-400/80 mb-1">Parent of {chat.studentName}</p>
                    <p className="text-xs text-gray-400 line-clamp-1 group-hover:text-gray-300">
                      {chat.note || "No message preview available."}
                    </p>
                    <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-wider font-medium">
                      {formatRelativeTime(chat.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle2 size={14} className="text-lime-300" />
                  </div>
                </div>
              ))}
              {recentChats.length === 0 && (
                <div className="text-sm text-white/60">No recent chats.</div>
              )}
            </div>

            {/* <button
              type="button"
              onClick={onOpenChat}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full border border-lime-400/40 bg-lime-400/10 px-4 py-2 text-sm font-semibold text-lime-300"
            >
              Open Chat
              <ArrowRight size={14} />
            </button> */}
          </div>
        </div>
      </section>
    </>
  );
}

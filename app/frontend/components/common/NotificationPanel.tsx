"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import SectionHeader from "./SectionHeader";
import SecondaryButton from "./SecondaryButton";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationPanelProps {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications?take=50", { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/mark-all-read", { method: "PATCH", credentials: "include" });
      await loadNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const markOneRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH", credentials: "include" });
      await loadNotifications();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <aside className="relative w-full sm:w-[420px] h-full
        bg-[#0b1220] border-l border-white/10
        shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <SectionHeader title="Notifications"/>
            <p className="text-sm text-gray-300 m-1">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>

          <button onClick={onClose}>
            <X className="text-white" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-white/60" />
              <span className="ml-2 text-sm text-white/60">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-white/40">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationItem
                key={n.id}
                title={n.title}
                description={n.message}
                time={formatTime(n.createdAt)}
                priority={!n.isRead}
                isRead={n.isRead}
                onClick={() => markOneRead(n.id)}
              />
            ))
          )}
        </div>
        
        {/* Mark all */}
        {notifications.length > 0 && unreadCount > 0 && (
          <div className="p-4 border-t border-white/10">
            <SecondaryButton title="Mark All as Read" onClick={markAllRead} />
          </div>
        )}
      </aside>
    </div>
  );
}

function NotificationItem({
  title,
  description,
  time,
  priority,
  isRead,
  onClick,
}: {
  title: string;
  description: string;
  time: string;
  priority?: boolean;
  isRead?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl bg-white/5 p-4 border border-white/10 hover:bg-white/10 transition ${
        isRead ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">{title}</h3>
        {priority && !isRead && (
          <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
            New
          </span>
        )}
      </div>

      <p className="text-sm text-gray-300 mt-1 line-clamp-2">
        {description}
      </p>

      <p className="text-xs text-gray-400 mt-2">
        {time}
      </p>
    </button>
  );
}

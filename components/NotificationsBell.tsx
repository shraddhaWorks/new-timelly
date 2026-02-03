"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications?take=10");
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/mark-all-read", { method: "PATCH" });
      await load();
    } catch {
      // ignore
    }
  };

  const markOneRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      await load();
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 bg-[#1a1a1a] border border-[#333333] text-white hover:bg-[#2d2d2d] transition"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-hidden rounded-xl bg-[#101010] border border-[#333333] shadow-2xl z-40">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#333333]">
            <div>
              <p className="text-sm font-semibold text-white">Notifications</p>
              <p className="text-xs text-[#808080]">
                {unreadCount > 0 ? `You have ${unreadCount} unread` : "All caught up"}
              </p>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs text-[#808080] hover:text-white"
            >
              Mark all as read
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-6 text-[#808080]">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-xs">Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#808080]">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markOneRead(n.id)}
                  className={`w-full text-left px-4 py-3 border-b border-[#202020] last:border-b-0 hover:bg-[#181818] transition ${
                    n.isRead ? "opacity-70" : ""
                  }`}
                >
                  <p className="text-xs uppercase tracking-wide text-[#808080] mb-1">
                    {n.type}
                  </p>
                  <p className="text-sm font-medium text-white">{n.title}</p>
                  <p className="text-xs text-[#808080] mt-1 line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-[#555] mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}


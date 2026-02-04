"use client";

import { X } from "lucide-react";
import SectionHeader from "./SectionHeader";
import SecondaryButton from "./SecondaryButton";

interface NotificationPanelProps {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
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
              6 unread
            </p>
          </div>

          <button onClick={onClose}>
            <X className="text-white" />
          </button>
        </div>


        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-6">
          <NotificationItem
            title="New Parent Message"
            description="Mr. Rajesh Kumar sent you a message regarding Aarav's homework."
            time="10 mins ago"
            priority
          />

          <NotificationItem
            title="Staff Meeting Tomorrow"
            description="All teachers are requested to attend the staff meeting at 3:00 PM."
            time="2 hours ago"
          />

          <NotificationItem
            title="Marks Entry Deadline"
            description="Please submit all Term 1 marks by January 30th, 2026."
            time="5 hours ago"
            priority
          />
        </div>
        
        {/* Mark all */}
        <SecondaryButton title="Mark All as Read"/>
      </aside>
    </div>
  );
}

function NotificationItem({
  title,
  description,
  time,
  priority,
}: {
  title: string;
  description: string;
  time: string;
  priority?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white/5 p-4 border border-white/10">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">{title}</h3>
        {priority && (
          <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
            High Priority
          </span>
        )}
      </div>

      <p className="text-sm text-gray-300 mt-1">
        {description}
      </p>

      <p className="text-xs text-gray-400 mt-2">
        {time}
      </p>
    </div>
  );
}

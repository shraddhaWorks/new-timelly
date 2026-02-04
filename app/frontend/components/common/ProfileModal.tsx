"use client";

import { X, Mail, Phone, MapPin, User } from "lucide-react";

export default function ProfileModal({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-neutral-900/90 border border-white/10 p-6 relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4"
        >
          <X className="text-white" />
        </button>

        {/* Header */}
        <div className="flex gap-4 items-center mb-6">
          <img
            src="https://th.bing.com/th/id/OIP.DEJkHVGN8dM_kyeZA8t3fgHaHa?w=191&h=191&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3"
            className="h-16 w-16 rounded-xl"
          />

          <div>
            <h2 className="text-white text-lg font-semibold">
              Mrs. Priya Sharma
            </h2>
            <p className="text-lime-300 text-sm">
              Mathematics Teacher
            </p>

            <span className="inline-block mt-1 px-3 py-0.5 text-xs rounded-full
              bg-lime-500/20 text-lime-400">
              ACTIVE
            </span>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <Info icon={<Mail />} label="Email" value="priya.sharma@timelly.school.com" />
          <Info icon={<Phone />} label="Phone" value="+91 98765 12345" />
          <Info icon={<User />} label="Employee ID" value="EMP2021/015" />
          <Info icon={<MapPin />} label="Address" value="456, Teachers Colony, New Delhi - 110017" />
        </div>

        <button className="mt-6 w-full py-3 rounded-xl bg-lime-500/20
          text-lime-400 font-medium">
          Edit Profile
        </button>
      </div>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 items-center bg-lime/5 p-3 rounded-xl">
      <div className="text-lime-400">{icon}</div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-white text-sm">{value}</p>
      </div>
    </div>
  );
}

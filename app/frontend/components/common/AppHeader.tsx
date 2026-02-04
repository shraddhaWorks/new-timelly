"use client";

import { Bell, Menu } from "lucide-react";
import { useState } from "react";
import SectionHeader from "./SectionHeader";
import SearchInput from "./SearchInput";
import { PRIMARY_COLOR } from "../../constants/colors";
import NotificationPanel from "./NotificationPanel";
import ProfileModal from "./ProfileModal";


interface AppHeaderProps {
  title: string;
  onMenuClick?: () => void;
}

const AVATAR_URL =
  "https://th.bing.com/th/id/OIP.DEJkHVGN8dM_kyeZA8t3fgHaHa?w=191&h=191&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3";

export default function AppHeader({
  title,
  onMenuClick,
}: AppHeaderProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      <header className="
  px-4 md:px-6 h-16
  flex items-center justify-between
  bg-transparent
  border-b border-white/10
">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              className="md:hidden"
              onClick={onMenuClick}
            >
              <Menu className="text-white" />
            </button>
          )}
          <div className="flex flex-col">
            <SectionHeader title={title} />
            <p className="text-sm text-gray-300 m-1">Welcome</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <SearchInput showSearchIcon={true} />

          <button
            onClick={() => setShowNotifications(true)}
            className="relative"
          >
            <Bell className="text-white" />
            <span className="absolute -top-1 -right-1 h-2 w-2
              rounded-full" style={style.notificatioDot} />
          </button>

          {/* Avatar */}
          <img
            src={AVATAR_URL}
            onClick={() => setShowProfile(true)}
            className="h-9 w-9 rounded-full cursor-pointer
              border border-white/20 object-cover"
          />
        </div>
      </header>

      {/* Notification Panel */}
      {showNotifications && (
        <NotificationPanel
          onClose={() => setShowNotifications(false)}
        />
      )}

      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal onClose={() => setShowProfile(false)} />
      )}
    </>
  );
}


const style = {
  notificatioDot: {
    backgroundColor: `${PRIMARY_COLOR}`
  }
}
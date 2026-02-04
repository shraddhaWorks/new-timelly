"use client";

import { Bell, Menu } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import SectionHeader from "./SectionHeader";
import SearchInput from "./SearchInput";
import { PRIMARY_COLOR } from "../../constants/colors";
import NotificationPanel from "./NotificationPanel";
import ProfileModal from "./ProfileModal";
import { AVATAR_URL } from "../../constants/images";


interface AppHeaderProps {
  title: string;
  onMenuClick?: () => void;
}

// Header uses session data for avatar/name when available

export default function AppHeader({
  title,
  onMenuClick,
}: AppHeaderProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { data: session } = useSession();
  const displayName = session?.user?.name ?? "User";
  const avatarUrl = session?.user?.image ?? "/avatar.png";

  return (
    <>
    <header
        className="
          sticky top-0 z-40
          h-16 px-4 md:px-6
          flex items-center justify-between
          bg-white/10
          backdrop-blur-xl
          border-b border-white/10
          shadow-[0_8px_32px_rgba(0,0,0,0.25)]
        "
      >
        {/* LEFT */}
        <div className="flex items-center gap-3">
  {onMenuClick && (
    <button
      className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
      onClick={onMenuClick}
    >
      <Menu className="text-white" />
    </button>
  )}

  <div className="leading-tight">
    <SectionHeader title={title} />
    <p className="text-xs md:text-sm text-white/60">
      Welcome back, {displayName.split(" ")[0]}
    </p>
  </div>
</div>


        {/* RIGHT */}
        <div className="flex items-center gap-2 md:gap-4">

          {/* Notifications */}
          <SearchInput showSearchIcon={true} />

                <button
          onClick={() => setShowNotifications(true)}
          className="
            relative p-2 rounded-xl
            bg-white/5 hover:bg-white/10
            transition
          "
        >
            <Bell className="text-white" />
            <span className="absolute -top-1 -right-1 h-2 w-2
              rounded-full" style={style.notificatioDot} />
          </button>

          {/* Avatar */}
          <button
          onClick={() => setShowProfile(true)}
          className="
            flex items-center gap-2
            px-2 py-1.5 rounded-xl
            bg-white/5 hover:bg-white/10
            transition
          "
        >
            <img
              src={AVATAR_URL}
              alt={displayName}
              className="h-9 w-9 rounded-full cursor-pointer border border-white/20 object-cover"
            />
            <span className="hidden md:inline text-sm text-white/90">Profile</span>
          </button>
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
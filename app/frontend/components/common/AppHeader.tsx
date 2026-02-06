"use client";

import { Bell, Search, SearchAlert, SearchIcon, Settings } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import SectionHeader from "./SectionHeader";
import SearchInput from "./SearchInput";
import NotificationPanel from "./NotificationPanel";
import ProfileModal from "./ProfileModal";
import { AVATAR_URL } from "../../constants/images";

interface AppHeaderProps {
  title: string;
}

export default function AppHeader({ title }: AppHeaderProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const { data: session } = useSession();
  const displayName = session?.user?.name ?? "User";

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">

          {/* LEFT */}
          <div>
            <SectionHeader title={title} />
            <p className="text-xs text-white/60 hidden md:block">
              Welcome back, {displayName.split(" ")[0]}
            </p>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 md:gap-4">

            {/* SEARCH */}
            <div className="hidden md:block">
              <SearchInput showSearchIcon icon={Search}/>
            </div>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10"
              onClick={() => setShowSearch(true)}
            >
              <Search className="text-white"/>
            </button>

            {/* NOTIFICATIONS */}
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 rounded-lg hover:bg-white/10"
            >
              <Bell className="text-white" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-lime-400 rounded-full" />
            </button>

            {/* SETTINGS */}
            <button
              className="p-2 rounded-lg hover:bg-white/10"
              onClick={() => alert("Navigate to settings")}
            >
              <Settings className="text-white" />
            </button>

            {/* PROFILE */}
            <button
              onClick={() => setShowProfile(true)}
              className="p-1 rounded-xl bg-white/5 hover:bg-white/10"
            >
              <img
                src={AVATAR_URL}
                className="w-9 h-9 rounded-lg border border-white/10"
              />
            </button>
          </div>
        </div>
      </header>

      {/* PANELS */}
      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}

      {showProfile && (
        <ProfileModal onClose={() => setShowProfile(false)} />
      )}

      {/* MOBILE SEARCH PLACEHOLDER */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start p-4 md:hidden">
          <div className="w-full bg-neutral-900 rounded-xl p-4">
            <SearchInput icon={Search} showSearchIcon/>
            <button
              onClick={() => setShowSearch(false)}
              className="mt-3 text-sm text-white/60"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

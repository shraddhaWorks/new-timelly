"use client";

import { Bell, Search, SearchAlert, SearchIcon, Settings } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SectionHeader from "./SectionHeader";
import SearchInput from "./SearchInput";
import NotificationPanel from "./NotificationPanel";
import ProfileModal from "./ProfileModal";
import { AVATAR_URL } from "../../constants/images";

export type HeaderProfile = {
  name: string;
  subtitle?: string;
  image?: string | null;
  email?: string;
  phone?: string;
  userId?: string;
  address?: string;
  status?: string;
};

interface AppHeaderProps {
  title: string;
  profile?: HeaderProfile;
  /** When true, do not show search and notification icons (e.g. Super Admin) */
  hideSearchAndNotifications?: boolean;
}

export default function AppHeader({ title, profile, hideSearchAndNotifications = false }: AppHeaderProps) {
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const { data: session } = useSession();
  const displayName = (profile?.name && profile.name.trim()) ? profile.name : (session?.user?.name ?? "User");
  const avatarUrl = (profile?.image != null && profile.image !== "") ? profile.image : (session?.user?.image ?? AVATAR_URL);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">

          {/* LEFT */}
          <div>
            <SectionHeader title={title} />
            <p className="text-xs pl-1.5 text-white/60 hidden md:block">
              Welcome back, {displayName.split(" ")[0]}
            </p>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 md:gap-4">

            {/* SEARCH - hidden for Super Admin */}
            {!hideSearchAndNotifications && (
              <>
                <div className="hidden md:block">
                  <SearchInput showSearchIcon icon={Search}/>
                </div>
                <button
                  className="md:hidden p-2 rounded-lg hover:bg-white/10"
                  onClick={() => setShowSearch(true)}
                >
                  <Search className="text-white"/>
                </button>
              </>
            )}

            {/* NOTIFICATIONS - hidden for Super Admin */}
            {!hideSearchAndNotifications && (
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 rounded-lg hover:bg-white/10"
              >
                <Bell className="text-white" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-lime-400 rounded-full" />
              </button>
            )}

            {/* SETTINGS */}
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-white/10"
              onClick={() => router.push("/settings")}
              title="Settings"
            >
              <Settings className="text-white" />
            </button>

            {/* PROFILE - always show */}
            <button
              onClick={() => setShowProfile(true)}
              className="p-1 rounded-xl bg-white/5 hover:bg-white/10 flex-shrink-0"
              title="My profile"
            >
              <img
                src={avatarUrl}
                alt=""
                className="w-9 h-9 rounded-lg border border-white/10 object-cover"
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
        <ProfileModal
          profile={
            profile
              ? {
                  name: profile.name,
                  image: profile.image,
                  role: profile.subtitle,
                  email: profile.email,
                  phone: profile.phone,
                  userId: profile.userId,
                  address: profile.address,
                  status: profile.status,
                }
              : undefined
          }
          onClose={() => setShowProfile(false)}
          onOpenSettings={() => {
            setShowProfile(false);
            router.push("/settings");
          }}
        />
      )}

      {/* MOBILE SEARCH PLACEHOLDER - only when search is shown */}
      {!hideSearchAndNotifications && showSearch && (
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

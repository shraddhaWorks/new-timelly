"use client";

import { Bell, Search, Settings } from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: session } = useSession();
  const displayName = (profile?.name && profile.name.trim()) ? profile.name : (session?.user?.name ?? "User");
  const avatarUrl = (profile?.image != null && profile.image !== "") ? profile.image : (session?.user?.image ?? AVATAR_URL);

  const openSettings = () => {
    if (pathname?.startsWith("/frontend/pages/")) {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("tab", "settings");
      router.push(`${pathname}?${params.toString()}`);
      return;
    }
    router.push("/settings");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSearchSubmit = (queryValue?: string) => {
    const query = (queryValue || searchQuery).trim();
    if (!query) return;

    const currentPath = pathname || "";

    // Navigate based on current path
    if (currentPath.startsWith("/frontend/pages/parent")) {
      router.push(`/frontend/pages/parent?tab=dashboard&search=${encodeURIComponent(query)}`);
    } else if (currentPath.startsWith("/frontend/pages/teacher")) {
      router.push(`/frontend/pages/teacher?tab=dashboard&search=${encodeURIComponent(query)}`);
    } else if (currentPath.startsWith("/frontend/pages/schooladmin")) {
      router.push(`/frontend/pages/schooladmin?tab=students&search=${encodeURIComponent(query)}`);
    } else {
      // Default: navigate to current page with search query
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("search", query);
      router.push(`${currentPath}?${params.toString()}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const inputValue = (e.target as HTMLInputElement).value;
      handleSearchSubmit(inputValue);
    }
  };

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
                  <SearchInput 
                    showSearchIcon 
                    icon={Search}
                    iconClickable={true}
                    onIconClick={() => handleSearchSubmit(searchQuery)}
                    value={searchQuery}
                    onChange={handleSearch}
                    onKeyDown={handleKeyDown}
                    placeholder="Search..."
                    className="w-[200px] md:w-[250px]"
                  />
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
              onClick={openSettings}
              title="Settings"
            >
              <Settings className="text-white" />
            </button>

            {/* PROFILE - always show */}
            <button
              type="button"
              onClick={() => {
                setShowProfile(true);
              }}
              className="p-1 rounded-xl bg-white/5 hover:bg-white/10 flex-shrink-0 transition"
              title="My profile"
            >
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-9 h-9 rounded-lg border border-white/10 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = AVATAR_URL;
                }}
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
            openSettings();
          }}
        />
      )}

      {/* MOBILE SEARCH PLACEHOLDER - only when search is shown */}
      {!hideSearchAndNotifications && showSearch && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start p-4 md:hidden">
          <div className="w-full bg-neutral-900 rounded-xl p-4">
            <SearchInput 
              icon={Search} 
              showSearchIcon
              value={searchQuery}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
              placeholder="Search..."
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  handleSearchSubmit(searchQuery);
                  setShowSearch(false);
                }}
                className="px-4 py-2 bg-lime-400 text-black rounded-lg text-sm font-medium"
              >
                Search
              </button>
              <button
                onClick={() => setShowSearch(false)}
                className="px-4 py-2 text-sm text-white/60 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

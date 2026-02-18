"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { SidebarItem } from "../../types/sidebar";
import BrandLogo from "./TimellyLogo";
import { PRIMARY_COLOR } from "../../constants/colors";
import { AVATAR_URL } from "../../constants/images";
import { useMemo } from "react";

type Props = {
  menuItems: SidebarItem[];
  profile?: {
    name: string;
    subtitle?: string;
    image?: string | null;
  };
  activeTab?: string;
  onLogoutRequest?: () => void;
};

export default function AppSidebar({ menuItems, profile, activeTab = "dashboard", onLogoutRequest }: Props) {
  const router = useRouter();
  const { data: session } = useSession();

  const displayName = (profile?.name && profile.name.trim()) ? profile.name : (session?.user?.name ?? "User");
  const subtitle = profile?.subtitle ?? session?.user?.role ?? "";
  const avatarUrl = (profile?.image != null && profile.image !== "") ? profile.image : (session?.user?.image ?? AVATAR_URL);

  // Only filter menu items for TEACHER role. Other roles see full menu.
  const allowedFeatures = (session?.user as any)?.allowedFeatures ?? [];
  const isTeacher = session?.user?.role === "TEACHER";

  const handleClick = async (item: SidebarItem) => {
    if (item.action === "logout") {
      if (onLogoutRequest) {
        onLogoutRequest();
        return;
      }
      await signOut({ callbackUrl: "/" });
      return;
    }
    if (item.href) router.push(item.href);
  };

  const isAllowed = (item: SidebarItem) => {
    if (!isTeacher) return true;
    if (!item.tab && !item.permission) return true;
    if (!allowedFeatures || allowedFeatures.length === 0) return true;
    if (item.tab && allowedFeatures.includes(item.tab)) return true;
    if (item.permission && allowedFeatures.includes(String(item.permission))) return true;
    return false;
  };

  const { mainItems, bottomItems } = useMemo(() => {
    const allowed = menuItems.filter(isAllowed);
    const bottom = allowed.filter(
      (item) => item.action === "logout" || item.tab === "settings"
    );
    const main = allowed.filter(
      (item) => item.action !== "logout" && item.tab !== "settings"
    );
    return { mainItems: main, bottomItems: bottom };
  }, [menuItems, isTeacher, allowedFeatures]);

  return (
    <aside
      className="
        hidden lg:flex
        w-64 h-full flex-col
        bg-white/10 backdrop-blur-2xl
        border-r border-white/10
        shadow-[8px_0_32px_rgba(0,0,0,0.35)]
      "
    >
      {/* Logo */}
      <div className="h-21 flex items-center px-4 border-b border-white/10">
        <BrandLogo isbrandLogoWhite />
      </div>

      {/* Profile */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="flex items-center gap-3">
            <img
              src={avatarUrl}
              alt=""
              className="w-10 h-10 rounded-xl border border-white/20 object-cover"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white break-words line-clamp-2">
                {displayName}
              </p>
              <p className="text-xs text-white/60 break-words line-clamp-2">{subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto no-scrollbar">
          {mainItems.map((item) => {
            const isActive = item.tab === activeTab;
            const Icon = item.icon;

            return (
              <motion.button
                key={item.label}
                whileHover={{ x: 4 }}
                onClick={() => handleClick(item)}
                className={`
                  w-full flex items-center gap-4 px-5 py-3 rounded-xl
                  transition min-w-0
                  ${
                    isActive
                      ? "bg-lime-400/10 text-lime-400 border border-lime-400/20 shadow-[0_0_22px_rgba(163,230,53,0.18)]"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <Icon
                  size={20}
                  className="flex-shrink-0"
                  style={{ color: isActive ? PRIMARY_COLOR : "#9ca3af" }}
                />
                <div className="min-w-0 text-left">
                  <span className="block truncate text-sm ">{item.label}</span>
                  {item.description && (
                    <span className="block truncate text-xs text-white/55">{item.description}</span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {bottomItems.length > 0 && (
          <div className="px-4 pb-4 pt-2 space-y-3 border-t border-white/10">
            {bottomItems.map((item) => {
              const isActive = item.tab === activeTab;
              const isLogout = item.action === "logout";
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.label}
                  whileHover={{ x: 4 }}
                  onClick={() => handleClick(item)}
                  className={`
                    w-full flex items-center gap-4 px-5 py-3 rounded-xl
                    transition min-w-0
                    ${
                      isLogout
                        ? "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        : isActive
                        ? "bg-lime-400/10 text-lime-400 border border-lime-400/20"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  <Icon
                    size={20}
                    className="flex-shrink-0"
                    style={{
                      color: isLogout ? "#f87171" : isActive ? PRIMARY_COLOR : "#9ca3af",
                    }}
                  />
                  <span className="truncate text-sm">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

    </aside>
  );
}

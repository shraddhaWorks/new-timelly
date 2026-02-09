"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { SidebarItem } from "../../types/sidebar";
import BrandLogo from "./TimellyLogo";
import { PRIMARY_COLOR } from "../../constants/colors";
import { AVATAR_URL } from "../../constants/images";

type Props = {
  menuItems: SidebarItem[];
  profile?: {
    name: string;
    subtitle?: string;
    image?: string | null;
  };
};

export default function AppSidebar({ menuItems, profile }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const activeTab = useSearchParams().get("tab") ?? "dashboard";

  const displayName = (profile?.name && profile.name.trim()) ? profile.name : (session?.user?.name ?? "User");
  const subtitle = profile?.subtitle ?? session?.user?.role ?? "";
  const avatarUrl = (profile?.image != null && profile.image !== "") ? profile.image : (session?.user?.image ?? AVATAR_URL);

  // Only filter menu items for TEACHER role. Other roles see full menu.
  const allowedFeatures = (session?.user as any)?.allowedFeatures ?? [];
  const isTeacher = session?.user?.role === "TEACHER";

  const handleClick = async (item: SidebarItem) => {
    if (item.action === "logout") {
      await signOut({ callbackUrl: "/admin/login" });
      return;
    }
    if (item.href) router.push(item.href);
  };

  return (
    <aside
      className="
        hidden md:flex
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
      <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto no-scrollbar">
        {menuItems
          .filter((item) => {
            // Only apply filtering for teachers
            if (!isTeacher) return true;

            // always show action items (logout) or items without tab/permission
            if (!item.tab && !item.permission) return true;

            // legacy: empty allowedFeatures => unrestricted
            if (!allowedFeatures || allowedFeatures.length === 0) return true;

            if (item.tab && allowedFeatures.includes(item.tab)) return true;

            if (item.permission && allowedFeatures.includes(String(item.permission))) return true;

            return false;
          })
          .map(item => {
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
                    ? "bg-lime-400/10 text-lime-400 border border-lime-400/20"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }
              `}
            >
              <Icon
                size={20}
                className="flex-shrink-0"
                style={{ color: isActive ? PRIMARY_COLOR : "#9ca3af" }}
              />
              <span className="truncate text-sm">{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </aside>
  );
}

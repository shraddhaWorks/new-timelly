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
  };
};

export default function AppSidebar({ menuItems, profile }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const activeTab = useSearchParams().get("tab") ?? "dashboard";

  const displayName = session?.user?.name ?? profile?.name ?? "User";
  const subtitle = session?.user?.role ?? profile?.subtitle;

  const handleClick = async (item: SidebarItem) => {
    if (item.action === "logout") {
      await signOut({ callbackUrl: "/" });
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
      <div className="h-20 flex items-center px-4 border-b border-white/10">
        <BrandLogo isbrandLogoWhite />
      </div>

      {/* Profile */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="flex items-center gap-3">
            <img
              src={session?.user?.image ?? AVATAR_URL}
              className="w-10 h-10 rounded-xl border border-white/20"
            />
            <div>
              <p className="text-sm font-semibold text-white truncate">
                {displayName}
              </p>
              <p className="text-xs text-white/60 truncate">{subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto no-scrollbar">
        {menuItems.map(item => {
          const isActive = item.tab === activeTab;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.label}
              whileHover={{ x: 4 }}
              onClick={() => handleClick(item)}
              className={`
                w-full flex items-center gap-4 px-5 py-3 rounded-xl
                transition
                ${
                  isActive
                    ? "bg-lime-400/10 text-lime-400 border border-lime-400/20"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }
              `}
            >
              <Icon
                style={{ color: isActive ? PRIMARY_COLOR : "#9ca3af" }}
              />
              {item.label}
            </motion.button>
          );
        })}
      </div>
    </aside>
  );
}

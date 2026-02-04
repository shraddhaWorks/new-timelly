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
  onClose?: () => void;
};

export default function AppSidebar({
  menuItems,
  profile,
  onClose,
}: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const activeTab =
    useSearchParams().get("tab") ?? "dashboard";

  const displayName = session?.user?.name ?? profile?.name ?? "User";
  const subtitle = session?.user?.role ?? profile?.subtitle;

  const handleClick = async (item: SidebarItem) => {
    if (item.action === "logout") {
      await signOut({ callbackUrl: "/" });
      return;
    }

    if (item.href) {
      router.push(item.href);
      onClose?.();
    }
  };

  return (
    <aside
      className="
    w-64 h-full flex flex-col
    bg-white/10
    backdrop-blur-2xl
    border-r border-white/10
    shadow-[8px_0_32px_rgba(0,0,0,0.35)]
  "
    >


      {/* LOGO */}
      <div className="h-16 flex items-center px-4 border-b border-white/10 gap-1">
        <BrandLogo isbrandLogoWhite />
      </div>

      {/* PROFILE */}
      <div className="px-4 py-4 border-b border-white/10">
        <div
          className="bg-white/5 rounded-xl p-3 border border-white/10 backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <img
              src={session?.user?.image ?? AVATAR_URL}
              alt={displayName}
              className="w-10 h-10 rounded-xl object-cover border border-white/20 group-hover:border-lime-400/50 transition-colors"
            />

            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-100 text-sm truncate group-hover:text-lime-400 transition-colors">
                {displayName}
              </div>
              {subtitle && (
                <div className="text-xs text-gray-400 truncate">{subtitle}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MENU */}
      <div className="flex-1 px-3 overflow-y-auto">
        {menuItems.map(item => {
          const isActive = item.tab === activeTab;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.label}
              whileHover={{ x: 4 }}
              onClick={() => handleClick(item)}
              className={`
              w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 group text-gray-400 hover:bg-white/5 hover:text-gray-100 hover:scale-[1.01]
              ${isActive
                  ? "w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 group bg-lime-400/10 text-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.15)] border border-lime-400/20"
                  : "text-white/60 hover:text-white hover:blur(6px)"
                }
              `}
            >
              <Icon
                className="text-lg"
                style={{
                  color: isActive
                    ? PRIMARY_COLOR
                    : "#9ca3af",
                }}
              />
              {item.label}
            </motion.button>
          );
        })}
      </div>
    </aside>
  );
}

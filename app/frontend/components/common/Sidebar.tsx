"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { SidebarItem } from "../../types/sidebar";
import BrandLogo from "./TimellyLogo";

const ACTIVE_COLOR = "#43b771";

type Props = {
  menuItems: SidebarItem[];
  profile: {
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
  const activeTab =
    useSearchParams().get("tab") ?? "dashboard";

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
    <aside className="w-64 h-full flex flex-col border-r border-white/10">

      {/* LOGO */}
      <div className="h-14 flex items-center px-4">
        <BrandLogo isbrandLogoWhite />
      </div>

      {/* PROFILE */}
      <div className="px-4 py-4 flex gap-3">
        <div className="w-10 h-10 rounded-full bg-[#43b771] text-white flex items-center justify-center font-semibold">
          {profile.name[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">
            {profile.name}
          </p>
          {profile.subtitle && (
            <p className="text-xs text-lime-400">
              {profile.subtitle}
            </p>
          )}
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
              className={`w-full mb-2 flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition
                ${
                  isActive
                    ? "text-[#43b771] bg-[#43b771]/10"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
            >
              <Icon
                className="text-lg"
                style={{
                  color: isActive
                    ? ACTIVE_COLOR
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

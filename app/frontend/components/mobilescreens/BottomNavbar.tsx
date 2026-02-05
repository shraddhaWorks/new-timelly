"use client";

import { MoreHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { SidebarItem } from "../../types/sidebar";

export default function BottomNavBar({
  menuItems,
  onMoreClick,
}: {
  menuItems: SidebarItem[];
  onMoreClick: () => void;
}) {
  const router = useRouter();
  const activeTab = useSearchParams().get("tab") ?? "dashboard";

  const tabItems = menuItems.filter(item => item.tab);
  const displayedItems = tabItems.slice(0, 4);

  // 🔥 KEY FIX
  const hasLogout = menuItems.some(item => item.action === "logout");
  const hasMoreItems = tabItems.length > 4 || hasLogout;

  return (
    <nav
      className="
        fixed bottom-0 inset-x-0 z-40 md:hidden
        bg-[#0b1220]/95 backdrop-blur-xl
        border-t border-white/10
      "
    >
      <div className="flex justify-around items-end py-3 px-2">
        {displayedItems.map(item => {
          const Icon = item.icon;
          const isActive = item.tab === activeTab;

          return (
            <button
              key={item.label}
              onClick={() => item.href && router.push(item.href)}
              className={`
                flex flex-col items-center
                gap-1
                w-[64px]
                px-1
                transition-all
                ${isActive ? "text-lime-400" : "text-white/60"}
              `}
            >
              <Icon size={20} />
              <span
                className="
                  text-[11px]
                  text-center
                  leading-tight
                  break-words
                  whitespace-normal
                "
              >
                {item.label}
              </span>
            </button>
          );
        })}

        {/* ✅ ALWAYS SHOW MORE IF LOGOUT EXISTS */}
        {hasMoreItems && (
          <button
            onClick={onMoreClick}
            className="
              flex flex-col items-center
              gap-1
              w-[64px]
              text-white/60
            "
          >
            <MoreHorizontal size={20} />
            <span className="text-[11px] text-center leading-tight">
              More
            </span>
          </button>
        )}
      </div>
    </nav>
  );
}

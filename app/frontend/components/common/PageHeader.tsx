"use client";

import { Bell, Menu } from "lucide-react";
import SearchInput from "./SearchInput";
import SectionHeader from "./SectionHeader";

type Props = {
  title: string;
  onMenuClick?: () => void;
};

export default function AppHeader({
  title,
  onMenuClick,
}: Props) {
  return (
    <header className="h-16 px-4 flex items-center justify-between border-b border-white/10">

      {/* LEFT */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="text-white" />
          </button>
        )}
        <SectionHeader title={title} />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <SearchInput showSearchIcon />
        <Bell className="text-white" />
        <img
          src="/avatar.png"
          className="h-9 w-9 rounded-full border border-white/20"
        />
      </div>
    </header>
  );
}

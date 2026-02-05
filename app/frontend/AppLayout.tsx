"use client";

import { useState } from "react";
import { SidebarItem } from "./types/sidebar";
import AppSidebar from "./components/common/Sidebar";
import AppHeader from "./components/common/AppHeader";
;
import MobileMoreOptions from "./components/mobilescreens/MobileMoreOptions";
import BottomNavBar from "./components/mobilescreens/BottomNavbar";

type Props = {
  title: string;
  menuItems: SidebarItem[];
  profile: {
    name: string;
    subtitle?: string;
  };
  activeTab: string;
  children?: React.ReactNode;
};

export default function AppLayout({
  title,
  menuItems,
  profile,
  activeTab,
  children,
}: Props) {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:block">
        <AppSidebar menuItems={menuItems} profile={profile} />
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col pb-16 md:pb-0">
        <AppHeader title={title} />

        <main className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <BottomNavBar
        menuItems={menuItems}
        onMoreClick={() => setShowMore(true)}
      />

      {/* MORE OPTIONS SHEET */}
      {showMore && (
        <MobileMoreOptions
          items={menuItems}
          onClose={() => setShowMore(false)}
        />
      )}
    </div>
  );
}

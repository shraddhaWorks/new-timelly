"use client";

import { useState } from "react";
import { SidebarItem } from "./types/sidebar";
import AppSidebar from "./components/common/Sidebar";
import AppHeader from "./components/common/PageHeader";


type Props = {
  title: string;
  menuItems: SidebarItem[];
  profile: {
    name: string;
    subtitle?: string;
  };
  children?: React.ReactNode;
};

export default function AppLayout({
  title,
  menuItems,
  profile,
  children,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">

      <aside className="hidden md:block">
        <AppSidebar menuItems={menuItems} profile={profile} />
      </aside>

      <div className="flex-1 flex flex-col">
        <AppHeader
          title={title}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 md:hidden">
          <div className="w-64 h-full">
            <AppSidebar
              menuItems={menuItems}
              profile={profile}
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

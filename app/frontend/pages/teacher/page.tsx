"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import AppLayout from "../../AppLayout";
import { SidebarItem } from "../../types/sidebar";

const TEACHER_TAB_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  attendance: "Attendance",
  marks: "Marks",
  homework: "Homework",
  classes: "Classes",
};

const TEACHER_MENU_ITEMS: SidebarItem[] = [
  // TODO: Add teacher menu items
];

export default function TeacherDashboard() {
  const { data: session } = useSession();
  const tab = useSearchParams().get("tab") ?? "dashboard";
  const title = TEACHER_TAB_TITLES[tab] ?? tab.toUpperCase();

  return (
    <AppLayout
      title={title}
      menuItems={TEACHER_MENU_ITEMS}
      profile={{
        name: session?.user?.name ?? "Teacher",
        subtitle: "Teacher",
      }}
      children={<div>{/* TODO: render tab content here based on `tab` */}</div>}
    />
  );
}

"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import AppLayout from "../../AppLayout";
import { TEACHER_MENU_ITEMS } from "../../constants/sidebar";
import RequiredRoles from "../../auth/RequiredRoles";

const TEACHER_TAB_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  attendance: "Attendance",
  marks: "Marks",
  homework: "Homework",
  classes: "Classes",
  leaves: "Leave Request",
  circulars: "Circulars",
  settings: "Settings",
};

export default function TeacherDashboard() {
  const { data: session } = useSession();
  const tab = useSearchParams().get("tab") ?? "dashboard";
  const title = TEACHER_TAB_TITLES[tab] ?? tab.toUpperCase();

  return (
    <RequiredRoles allowedRoles={["TEACHER"]}>
      <AppLayout
        activeTab={tab}
        title={title}
        menuItems={TEACHER_MENU_ITEMS}
        profile={{
          name: session?.user?.name ?? "Teacher",
          subtitle: "Teacher",
        }}
        children={
          <div>{/* TODO: render tab content here based on `tab` */}</div>
        }
      />
    </RequiredRoles>
  );
}

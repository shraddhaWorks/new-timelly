"use client";

import { useSearchParams } from "next/navigation";
import AppLayout from "../../AppLayout";
import { PARENT_MENU_ITEMS } from "../../constants/sidebar";
import RequiredRoles from "../../auth/RequiredRoles";

const PARENT_TAB_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  homework: "Homework",
  attendance: "Attendance",
  marks: "Marks",
  chat: "Chat",
  fees: "Fees",
  certificates: "Certificates",
};

export default function ParentDashboardClient() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "dashboard";
  const title = PARENT_TAB_TITLES[tab] ?? tab.toUpperCase();

  return (
    <RequiredRoles allowedRoles={["STUDENT"]}>
      <AppLayout
        title={title}
        menuItems={PARENT_MENU_ITEMS}
        profile={{ name: "Parent", subtitle: "Student Parent" }}
      >
        <div>{/* render tab content here */}</div>
      </AppLayout>
    </RequiredRoles>
  );
}

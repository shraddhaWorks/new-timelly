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

export default function ParentDashboard() {
  const tab = useSearchParams().get("tab") ?? "dashboard";
  const title = PARENT_TAB_TITLES[tab] ?? tab.toUpperCase();

  return (
  <RequiredRoles allowedRoles={['STUDENT']}> 
    <AppLayout
      title={title}
      activeTab={tab}
      menuItems={PARENT_MENU_ITEMS}
      profile={{ name: "Parent", subtitle: "Student Parent" }}
      children={<div>{/* TODO: render tab content here based on `tab` */}</div>}
    />
  </RequiredRoles>
  );
}

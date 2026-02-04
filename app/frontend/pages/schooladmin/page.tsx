"use client";

import { useSearchParams } from "next/navigation";
import AppLayout from "../../AppLayout";
import { SCHOOLADMIN_MENU_ITEMS, SCHOOLADMIN_TAB_TITLES } from "../../constants/sidebar";
import RequiredRoles from "../../auth/RequiredRoles";

export default function SchoolAdminDashboard() {
  const tab = useSearchParams().get("tab") ?? "dashboard";
  const title = SCHOOLADMIN_TAB_TITLES[tab] ?? tab.toUpperCase();

  return (
  <RequiredRoles allowedRoles={['SCHOOLADMIN']}> 
    <AppLayout
      title={title}
      menuItems={SCHOOLADMIN_MENU_ITEMS}
      profile={{ name: "School Admin" }}
      children={<div>{/* TODO: render tab content here based on `tab` */}</div>}
    />
  </RequiredRoles>
  );
}

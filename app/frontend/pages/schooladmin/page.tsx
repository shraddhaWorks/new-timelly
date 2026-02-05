"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppLayout from "../../AppLayout";
import { SCHOOLADMIN_MENU_ITEMS, SCHOOLADMIN_TAB_TITLES } from "../../constants/sidebar";
import RequiredRoles from "../../auth/RequiredRoles";
import SchoolAdminStudentsTab from "../../components/schooladmin/Students";
import SchoolAdminAddUserTab from "../../components/schooladmin/AddUser";
import SchoolAdminClassesTab from "../../components/schooladmin/Classes";
import SchoolAdminDashboard from "../../components/schooladmin/Dashboard";
import SchoolTeacherLeavesTab from "../../components/schooladmin/TeacherLeaves";
import SchoolCercularsTab from "../../components/schooladmin/circulars";
import NewsFeed from "../../components/schooladmin/Newsfeed";

function SchoolAdminContent() {
  const tab = useSearchParams().get("tab") ?? "dashboard";
  const title = SCHOOLADMIN_TAB_TITLES[tab] ?? tab.toUpperCase();
  const renderComponent = () => {
    switch (tab) {
      case "dashboard":
        return <div><h2>School Admin Dashboard</h2></div>;
      case "students":
        return <SchoolAdminStudentsTab/>;
      case "add-user":
        return <SchoolAdminAddUserTab/>;
      case "classes":
        return <SchoolAdminClassesTab/>;
      case "student-details":
        return ;
      case "teachers":
        return;
      case "teacher-leaves":
        return <SchoolTeacherLeavesTab/>;
      case "teacher-audit":
        return;
      case "workshops":
        return;
      case "newsfeed":
        return <NewsFeed/>;
      case "certificates":
        return;
      case "exams":
        return;
      case "analysis":
        return;
      case "fees":
        return;
      case "settings":
        return;
      case "circulars":
        return <SchoolCercularsTab/>;
      default:
        return <div>Not found</div>;
    }
  }

  return (
    <RequiredRoles allowedRoles={["SCHOOLADMIN"]}>
      <AppLayout
        activeTab={tab}
        title={title}
        menuItems={SCHOOLADMIN_MENU_ITEMS}
        profile={{ name: "School Admin" }}
        children={renderComponent()}
      />
    </RequiredRoles>
  );
}

export default function SchoolAdmin() {
  return (
    <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center text-white/70">Loading...</div>}>
      <SchoolAdminContent />
    </Suspense>
  );
}

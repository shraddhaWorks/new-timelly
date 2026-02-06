"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppLayout from "../../AppLayout";
import { SCHOOLADMIN_MENU_ITEMS, SCHOOLADMIN_TAB_TITLES } from "../../constants/sidebar";
import RequiredRoles from "../../auth/RequiredRoles";
import SchoolAdminStudentsTab from "../../components/schooladmin/Students";
import SchoolAdminAddUserTab from "../../components/schooladmin/AddUser";
import SchoolAdminClassesTab from "../../components/schooladmin/Classes";
import SchoolAdminDashboard from "../../components/schooladmin/Dashboard";
import SchoolTeacherLeavesTab from "../../components/schooladmin/TeacherLeaves";
// import SchoolCercularsTab from "../../components/schooladmin/circulars";
import NewsFeed from "../../components/schooladmin/Newsfeed";
import TeacherAuditTab from "../../components/schooladmin/TeacherAudit";
import { ExamsPageInner } from "@/app/schoolAdmin/exams/page";
import SchoolAdminTeacherTab from "../../components/schooladmin/teacherTab";
import SchoolAdminCircularsTab from "../../components/schooladmin/circularTab";

function SchoolAdminContent() {
  const tab = useSearchParams().get("tab") ?? "dashboard";
  const title = SCHOOLADMIN_TAB_TITLES[tab] ?? tab.toUpperCase();
  const [profile, setProfile] = useState<{ name: string; subtitle?: string; image?: string | null }>({
    name: "School Admin",
    subtitle: "School Admin",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/user/me");
        const data = await res.json();
        if (cancelled || !res.ok) return;
        const u = data.user;
        if (u) {
          setProfile({
            name: u.name ?? "School Admin",
            subtitle: "School Admin",
            image: u.photoUrl ?? null,
          });
        }
      } catch {
        // keep default profile
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
        return <SchoolAdminTeacherTab/>
      case "teacher-leaves":
        return <SchoolTeacherLeavesTab/>;
      case "teacher-audit":
        return <TeacherAuditTab />;
      case "workshops":
        return;
      case "newsfeed":
        return <NewsFeed/>;
        case "circulars":
        return <SchoolAdminCircularsTab/>;
      case "certificates":
        return;
      case "exams":
        return <ExamsPageInner />;
      case "analysis":
        return;
      case "fees":
        return;
      case "settings":
        return;
      // case "circulars":
      //   return <SchoolCercularsTab/>;
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
        profile={profile}
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

"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import RequiredRoles from "../../auth/RequiredRoles";
import AppLayout from "../../AppLayout";
import { PARENT_MENU_ITEMS } from "../../constants/sidebar";
import ParentHomeTab from "../../components/parent/home/ParentHome";
import ParentProfileTab from "../../components/parent/profile/ParentProfile";
import ParentAttendanceTab from "../../components/parent/attendance/ParentAttendance";
import ParentHomeworkTab from "../../components/parent/homework/ParentHomework";
import ParentMarksTab from "../../components/parent/marks/ParentMarksTab";
import ParentExamsTab from "../../components/parent/examsSyllabus/ParentExamsTab";
import ParentFeesTab from "../../components/parent/fees/ParentFeesTab";
import ParentChatsTab from "../../components/parent/chat/ParentChat";
import ParentWorkshopsTab from "../../components/parent/workshops/ParentWorkshopsTab";
import ParentCertificatesTab from "../../components/parent/certificates/ParentCerticates";
import ParentLeavesTab from "../../components/parent/leaves/LeaveApplications";
import ParentSettingsTab from "../../components/parent/settings/ParentSettings";
import ParentAnalyticsTab from "../../components/parent/analytics/ParentAnalyticsTab";
import Spinner from "../../components/common/Spinner";

const PARENT_TAB_TITLES: Record<string, string> = {
  dashboard: "Home",
  profile: "Profile",
  homework: "Homework",
  attendance: "Attendance",
  marks: "Marks",
  exams: "Exams & Syllabus",
  fees: "Fees",
  chat: "Chat",
  workshops: "Workshops",
  certificates: "Certificates",
  leave: "Leave Application",
  settings: "Settings",
  analytics:"Analytics"
};

function ParentDashboardInner() {
  const tab = useSearchParams().get("tab") ?? "dashboard";
  const title = PARENT_TAB_TITLES[tab] ?? tab.toUpperCase();

  const [profile, setProfile] = useState({
    name: "Parent",
    subtitle: "Parent",
    image: null as string | null,
  });

  const renderTabContent = () => {
    switch (tab) {
      case "analytics":
        return <ParentAnalyticsTab/>
      case "dashboard":
        return <ParentHomeTab />;
      case "profile":
        return <ParentProfileTab />;
      case "homework":
        return <ParentHomeworkTab />;
      case "attendance":
        return <ParentAttendanceTab />;
      case "marks":
        return <ParentMarksTab />;
      case "exams":
        return <ParentExamsTab />;
      case "fees":
        return <ParentFeesTab />;
      case "chat":
        return <ParentChatsTab />;
      case "workshops":
        return <ParentWorkshopsTab />;
      case "certificates":
        return <ParentCertificatesTab />;
      case "leave":
        return <ParentLeavesTab />;
      case "settings":
        return <ParentSettingsTab />;
      default:
        return <div>Unknown Tab</div>;
    }
  };

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
            name: u.name ?? "Parent",
            subtitle: "Parent",
            image: u.photoUrl ?? null,
          });
        }
      } catch {
        // fallback default
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <RequiredRoles allowedRoles={["STUDENT"]}>
      <AppLayout
        activeTab={tab}
        title={title}
        menuItems={PARENT_MENU_ITEMS}
        profile={profile}
      >
        {renderTabContent()}
      </AppLayout>
    </RequiredRoles>
  );
}

export default function ParentDashboardContent() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white/70">
          <Spinner/>
        </div>
      }
    >
      <ParentDashboardInner />
    </Suspense>
  );
}

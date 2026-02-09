"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import AppLayout from "../../AppLayout";
import { TEACHER_MENU_ITEMS } from "../../constants/sidebar";
import RequiredRoles from "../../auth/RequiredRoles";
import RequireFeature from "../../auth/RequireFeature";
import TeacherDashboard from "../../components/teacher/dashboard/Dashboard";
import TeacherClasses from "../../components/teacher/classes/Classes";
import TeacherMarksTab from "../../components/teacher/marks/Marks";
import TeacherHomeworkTab from "../../components/teacher/homework/Homework";
import TeacherAttendanceTab from "../../components/teacher/attendance/Attendance";
import TeacherExamsTab from "../../components/teacher/exams/Exams";
import TeacherWorkshopsTab from "../../components/teacher/workshops/WorkShops";
import TeacherNewsfeed from "../../components/teacher/newsfeed/Newsfeed";
import TeacherParentChatTab from "../../components/teacher/parentchat/ParentChat";
import TeacherLeavesTab from "../../components/teacher/leave/Leave";
import TeacherProfileTab from "../../components/teacher/profile/Profile";
import TeacherSettingsTab from "../../components/teacher/settings/Settings";

const TEACHER_TAB_TITLES = {
  dashboard: "Dashboard",
  attendance: "Attendance",
  marks: "Marks",
  homework: "Homework",
  classes: "Classes",
  leaves: "Leave Request",
  circulars: "Circulars",
  newsfeed: "Newsfeed",
  chat: "Parent Chat",
  exams: "Exams",
  workshops: "Workshops",
  profile: "Profile",
  settings: "Settings",
};

export default function TeacherDashboardContent() {
  const { data: session } = useSession();
  const tab = useSearchParams().get("tab") ?? "dashboard";
  const title = (TEACHER_TAB_TITLES as any)[tab] ?? tab.toUpperCase();
  const [profile, setProfile] = useState({
    name: session?.user?.name ?? "Teacher",
    subtitle: "Teacher",
    image: null as string | null,
  });

  const renderTabContent = () => {
    switch (tab) {      
      case "dashboard":
        return <TeacherDashboard/>;
      case "classes":
        return <TeacherClasses/>;
      case "marks":
        return <TeacherMarksTab/>;  
      case "homework":
        return <TeacherHomeworkTab/>;
      case "attendance":
        return <TeacherAttendanceTab/>;  
      case "exams":      
        return <TeacherExamsTab/>;
      case "workshops":       
       return <TeacherWorkshopsTab/>;
      case "newsfeed":
        return <TeacherNewsfeed/>;
      case "chat":
        return <TeacherParentChatTab/>;
      case "leaves":
        return <TeacherLeavesTab/>;
      case "profile":
        return <TeacherProfileTab/>;
      case "settings":
        return <TeacherSettingsTab/>;
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
            name: u.name ?? "Teacher",
            subtitle: "Teacher",
            image: u.photoUrl ?? null,
          });
        }
      } catch {
        // keep session-based default
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.name]);

    return (
      <RequiredRoles allowedRoles={["TEACHER"]}>
        <RequireFeature requiredFeature={tab}>
          <AppLayout
            activeTab={tab}
            title={title}
            menuItems={TEACHER_MENU_ITEMS}
            profile={profile}
            children={
              renderTabContent()
            }
          />
        </RequireFeature>
      </RequiredRoles>
    );
}


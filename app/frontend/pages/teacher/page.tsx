"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import AppLayout from "../../AppLayout";
import { TEACHER_MENU_ITEMS } from "../../constants/sidebar";
import RequiredRoles from "../../auth/RequiredRoles";
import HomeworkPage from "../../components/teacher/Homework";

const TEACHER_TAB_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  attendance: "Attendance",
  marks: "Marks",
  classes: "Classes",
  homework: "Homework",
  leaves: "Leave Request",
  circulars: "Circulars",
  settings: "Settings",
};

function TeacherDashboardContent() {
  const { data: session } = useSession();
  const tab = useSearchParams().get("tab") ?? "dashboard";
  const title = TEACHER_TAB_TITLES[tab] ?? tab.toUpperCase();
  const [profile, setProfile] = useState<{ name: string; subtitle?: string; image?: string | null }>({
    name: session?.user?.name ?? "Teacher",
    subtitle: "Teacher",
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
      <AppLayout
        activeTab={tab}
        title={title}
        menuItems={TEACHER_MENU_ITEMS}
        profile={profile}
        children={
          <div>
            <HomeworkPage/>
          </div>
        }
      />
    </RequiredRoles>
  );
}

export default function TeacherDashboard() {
  return (
    <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center text-white/70">Loading...</div>}>
      <TeacherDashboardContent />
    </Suspense>
  );
}

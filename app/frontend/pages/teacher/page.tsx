"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import AppLayout from "../../AppLayout";
import { TEACHER_MENU_ITEMS } from "../../constants/sidebar";
import RequiredRoles from "../../auth/RequiredRoles";
import RequireFeature from "../../auth/RequireFeature";

const TEACHER_TAB_TITLES = {
  dashboard: "Dashboard",
  attendance: "Attendance",
  marks: "Marks",
  homework: "Homework",
  classes: "Classes",
  leaves: "Leave Request",
  circulars: "Circulars",
  settings: "Settings",
};

function TeacherDashboardContent() {
  const { data: session } = useSession();
  const tab = useSearchParams().get("tab") ?? "dashboard";
  const title = (TEACHER_TAB_TITLES as any)[tab] ?? tab.toUpperCase();
  const [profile, setProfile] = useState({
    name: session?.user?.name ?? "Teacher",
    subtitle: "Teacher",
    image: null as string | null,
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
        <RequireFeature requiredFeature={tab}>
          <AppLayout
            activeTab={tab}
            title={title}
            menuItems={TEACHER_MENU_ITEMS}
            profile={profile}
            children={
              <div>{/* TODO: render tab content here based on `tab` */}</div>
            }
          />
        </RequireFeature>
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

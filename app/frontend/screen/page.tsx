"use client";

import { useEffect } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ScreenPage() {
  const router = useRouter();

  useEffect(() => {
    async function redirectByRole() {
      const session = await getSession();
      if (!session?.user) return;

      const roleRoutes: Record<string, string> = {
        SUPERADMIN: "/frontend/pages/superadmin",
        SCHOOLADMIN: "/frontend/pages/schooladmin",
        TEACHER: "/frontend/pages/teacher",
        STUDENT: "/frontend/pages/parent",
      };

      router.replace(roleRoutes[session.user.role] || "/unauthorized");
    }

    redirectByRole();
  }, []);

  return null;
}

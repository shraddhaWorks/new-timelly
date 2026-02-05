"use client";

import { ReactNode, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthLoadingFallback from "../components/common/AuthLoadingFallback";

// Allowed roles from your schema
type UserRoles = "SUPERADMIN" | "SCHOOLADMIN" | "TEACHER" | "STUDENT";

interface RequireRoleProps {
  children: ReactNode;
  allowedRoles: UserRoles[];
}

export default function RequireRole({ children, allowedRoles }: RequireRoleProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Wait for session

    const role = session?.user?.role as UserRoles | undefined;

    // If user is not logged in -> send to login
    if (status === "unauthenticated" || !role) {
      router.replace("/");
      return;
    }

    // If role doesn't match -> unauthorized
    if (!allowedRoles.includes(role)) {
      router.replace("/unauthorized");
    }
  }, [session?.user?.role, status, router, allowedRoles]);

  if (status === "loading") {
    return <AuthLoadingFallback />;
  }

  // Show loading while redirecting unauthenticated users
  if (status === "unauthenticated") {
    return <AuthLoadingFallback />;
  }

  return <>{children}</>;
}

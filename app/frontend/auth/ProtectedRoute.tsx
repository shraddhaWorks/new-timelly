"use client";

import { ReactNode, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthLoadingFallback from "../components/common/AuthLoadingFallback";

type UserRoles = "SUPERADMIN" | "SCHOOLADMIN" | "TEACHER" | "STUDENT";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRoles[];
  fallback?: ReactNode;
}

/**
 * Enhanced ProtectedRoute Component
 * 
 * Wraps protected pages to ensure:
 * 1. User is authenticated (logged in)
 * 2. User has the correct role (if allowedRoles specified)
 * 3. Redirects unauthorized users appropriately
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
  fallback = <AuthLoadingFallback />,
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Wait for session to load
    if (status === "loading") return;

    // User is not authenticated - redirect to login
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    // User is authenticated, check role if specified
    if (status === "authenticated" && allowedRoles) {
      const userRole = session?.user?.role as UserRoles | undefined;

      if (!userRole || !allowedRoles.includes(userRole)) {
        // User doesn't have required role - show unauthorized page
        router.replace("/unauthorized");
        return;
      }
    }
  }, [session, status]); // ✅ REMOVED router and allowedRoles - causes infinite loop

  // Show loading state while checking authentication
  if (status === "loading") {
    return fallback;
  }

  // Show loading state if unauthenticated (will redirect)
  if (status === "unauthenticated") {
    return fallback;
  }

  // Show loading state if authenticated but role check is needed
  if (status === "authenticated" && allowedRoles) {
    const userRole = session?.user?.role as UserRoles | undefined;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return fallback;
    }
  }

  // User is authenticated and authorized - render children
  return <>{children}</>;
}

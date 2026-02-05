"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/app/frontend/constants/routes";
import LoginForm from "@/components/auth/LoginForm";

export default function Home() {
  const router = useRouter();
  const { status, data: session } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session?.user?.role) {
      const roleRoutes: Record<string, string> = {
        SUPERADMIN: ROUTES.SUPERADMIN,
        SCHOOLADMIN: ROUTES.SCHOOLADMIN,
        STUDENT: ROUTES.PARENT,
        TEACHER: ROUTES.TEACHER,
      };
      const destination = roleRoutes[session.user.role] || ROUTES.UNAUTHORIZED;
      router.push(destination);
      return;
    }
  }, [status, session?.user?.role, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Loading</h2>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <LoginForm />
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ROUTES } from "../constants/routes";

export default function ScreenPage() {
    const router = useRouter();
    const { status } = useSession();

    useEffect(() => {
        async function redirectByRole() {
            const session = await getSession();
            if (!session?.user) return;

            const roleRoutes: Record<string, string> = {
                SUPERADMIN: ROUTES.SUPERADMIN,
                SCHOOLADMIN: ROUTES.SCHOOLADMIN,
                STUDENT: ROUTES.PARENT,
                TEACHER: ROUTES.TEACHER,
            };

            router.replace(roleRoutes[session.user.role] || "/unauthorized");
        }

        redirectByRole();
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/");
        }
    }, [status, router]);

    if (status === "loading") {
        return null;
    }

    return null;
}

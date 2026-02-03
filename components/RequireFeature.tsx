"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHasFeature } from "@/lib/usePermissions";
import type { FeatureId } from "@/lib/features";

interface RequireFeatureProps {
  children: ReactNode;
  feature: FeatureId;
}

/**
 * Renders children only if the current user has access to the given feature.
 * Otherwise redirects to unauthorized.
 */
export default function RequireFeature({ children, feature }: RequireFeatureProps) {
  const hasFeature = useHasFeature(feature);
  const router = useRouter();

  useEffect(() => {
    if (!hasFeature) {
      router.replace("/unauthorized");
    }
  }, [hasFeature, router]);

  if (!hasFeature) {
    return <p className="text-white p-6">Loading...</p>;
  }

  return <>{children}</>;
}

"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "strong" | "card";
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "card", children, ...props }, ref) => {
    const glassClass =
      variant === "strong"
        ? "glass-strong"
        : variant === "card"
          ? "glass-card"
          : "glass";
    return (
      <div
        ref={ref}
        className={cn(glassClass, "rounded-2xl", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassCard.displayName = "GlassCard";

export default GlassCard;

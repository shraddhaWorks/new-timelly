"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, padding = "md", children, ...props }, ref) => {
    const paddingClass = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    }[padding];
    return (
      <div
        ref={ref}
        className={cn("glass rounded-xl", paddingClass, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassPanel.displayName = "GlassPanel";

export default GlassPanel;

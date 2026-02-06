"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode; // buttons, filters, actions
  className?: string;   // extra Tailwind classes
  center?: boolean;     // center align content
  transparent?: boolean; // transparent background
}

export default function PageHeader({
  title,
  subtitle,
  rightSlot,
  className = "",
  center = false,
  transparent = false,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        rounded-3xl p-6 mb-8
        flex flex-col md:flex-row md:items-center md:justify-between gap-4
        ${
          transparent
            ? "bg-transparent"
            : "bg-white/5 backdrop-blur-xl border-b border-white/10"
        }
        ${className}
      `}
    >
      <div className={center ? "flex flex-col items-center text-center" : ""}>
        <h1 className="text-[24px] font-bold text-white">
          {title}
        </h1>

        {subtitle && (
          <p className="text-[14px] text-white/60 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {rightSlot && (
        <div className={center ? "flex justify-center" : ""}>
          {rightSlot}
        </div>
      )}
    </motion.div>
  );
}

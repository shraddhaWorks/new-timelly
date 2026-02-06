"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  rightSlot?: ReactNode;
  className?: string;
  center?: boolean;
  transparent?: boolean;
}

export default function PageHeader({
  title,
  subtitle,
  icon,
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
        ${transparent ? "bg-transparent" : "bg-white/5 backdrop-blur-xl border-b border-white/10"}
        ${className}
      `}
    >
      {/* LEFT */}
      <div
        className={`
          flex gap-3
          ${center ? "flex-col items-center text-center" : "items-start"}
        `}
      >
        {icon && (
          <div className="p-2 rounded-xl text-lime-400">
            {icon}
          </div>
        )}

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {title}
          </h1>

          {subtitle && (
            <p className="text-sm text-white/70 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* RIGHT */}
      {rightSlot && (
        <div className={center ? "flex justify-center" : "shrink-0"}>
          {rightSlot}
        </div>
      )}
    </motion.div>
  );
}

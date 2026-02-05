"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode; // for buttons, filters, etc
  className?: string; // optional custom classes
}

export default function PageHeader({
  title,
  subtitle,
  rightSlot,
  className = "",
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl p-6 mb-8 bg-gradient-to-r from-[#2b1c47] via-[#3a235a] to-[#4a5c2f] flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${className}`}
    >
      <div>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-white/60">{subtitle}</p>}
      </div>

      {rightSlot && <div>{rightSlot}</div>}
    </motion.div>
  );
}
"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatItem {
  label: string;
  value: number | string;
  color?: string; // text color
}

interface StatusItem {
  label: string;
  active?: boolean;
}

interface TeacherStatCardProps {
  avatar: string;
  name: string;
  code: string;
  percentage: number;
  stats: StatItem[];
  statuses: StatusItem[];
  className?: string;
}

export default function TeacherStatCard({
  avatar,
  name,
  code,
  percentage,
  stats,
  statuses,
  className = "",
}: TeacherStatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`
        bg-gradient-to-br from-[#4b2a7c] to-[#3a1f63]
        rounded-3xl p-4
        shadow-xl
        transition-all duration-300
        ${className}
      `}
    >
      {/* ===== Top Section ===== */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={avatar}
            alt={name}
            className="w-14 h-14 rounded-full object-cover border-2 border-white/20"
          />

          <div>
            <p className="text-white font-semibold text-base truncate max-w-[140px]">
              {name}
            </p>
            <p className="text-white/50 text-sm">{code}</p>
          </div>
        </div>

        <div className="bg-lime-400/90 text-black text-sm font-bold px-3 py-1 rounded-lg">
          {percentage}%
        </div>
      </div>

      {/* ===== Stats Row ===== */}
      <div className="grid grid-cols-4 gap-4 mt-4 text-center">
        {stats.map((stat, idx) => (
          <div key={idx}>
            <p
              className={`text-lg font-bold ${
                stat.color || "text-white"
              }`}
            >
              {stat.value}
            </p>
            <p className="text-xs text-white/50">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ===== Status Pills ===== */}
      <div className="grid grid-cols-4 gap-3 mt-4">
        {statuses.map((status, idx) => (
          <div
            key={idx}
            className={`
              flex items-center justify-center
              h-10 rounded-xl text-sm font-semibold
              ${
                status.active
                  ? "bg-lime-400 text-black"
                  : "bg-white/10 text-white/40"
              }
            `}
          >
            {status.label}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

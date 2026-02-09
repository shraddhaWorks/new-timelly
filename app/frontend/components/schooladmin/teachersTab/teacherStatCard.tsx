// "use client";

// import { ReactNode } from "react";
// import { motion } from "framer-motion";

// interface StatItem {
//   label: string;
//   value: number | string;
//   color?: string; // text color
// }

// interface StatusItem {
//   label: string;
//   active?: boolean;
// }

// interface TeacherStatCardProps {
//   avatar: string;
//   name: string;
//   code: string;
//   percentage: number;
//   stats: StatItem[];
//   statuses: StatusItem[];
//   className?: string;
// }

// export default function TeacherStatCard({
//   avatar,
//   name,
//   code,
//   percentage,
//   stats,
//   statuses,
//   className = "",
// }: TeacherStatCardProps) {
//   return (
//     <motion.div
//       whileHover={{ y: -4 }}
//       className={`
//         bg-gradient-to-br from-[#4b2a7c] to-[#3a1f63]
//         rounded-3xl p-4
//         shadow-xl
//         transition-all duration-300
//         ${className}
//       `}
//     >
//       {/* ===== Top Section ===== */}
//       <div className="p-3 flex items-center gap-3 border-b border-white/5 bg-white/[0.02]">
//         <div className="flex items-center gap-3">
//           <img
//             src={avatar}
//             alt={name}
//             className="w-14 h-14 rounded-full object-cover border-2 border-white/20"
//           />

//           <div>
//             <p className="text-white font-semibold text-base truncate max-w-[140px]">
//               {name}
//             </p>
//             <p className="text-white/50 text-sm">{code}</p>
//           </div>
//         </div>

//         <div className="bg-lime-400/90 text-black text-sm font-bold px-3 py-1 rounded-lg">
//           {percentage}%
//         </div>
//       </div>

//       {/* ===== Stats Row ===== */}
//       <div className="px-3 py-2 bg-black/20 grid grid-cols-4 gap-1 text-center border-b border-white/5">
//         {stats.map((stat, idx) => (
//           <div key={idx}>
//             <p
//               className={`text-lg font-bold ${
//                 stat.color || "text-white"
//               }`}
//             >
//               {stat.value}
//             </p>
//             <p className="text-xs text-white/50">{stat.label}</p>
//           </div>
//         ))}
//       </div>

//       {/* ===== Status Pills ===== */}
//       <div className="p-2 grid grid-cols-4 gap-1.5">
//         {statuses.map((status, idx) => (
//           <div
//             key={idx}
//             className={`
//               flex items-center justify-center
//               h-10 rounded-xl text-sm font-semibold
//               ${
//                 status.active
//                   ? "bg-lime-400 text-black"
//                   : "bg-white/10 text-white/40"
//               }
//             `}
//           >
//             {status.label}
//           </div>
//         ))}
//       </div>
//     </motion.div>
//   );
// }


"use client";
import { motion } from "framer-motion";

interface TeacherStatCardProps {
  avatar: string; name: string; code: string; percentage: number;
  stats: { label: string; value: any; color?: string }[];
  statuses: { label: string; active?: boolean }[];
  onStatusChange?: (label: string) => void;
}

export default function TeacherStatCard({ avatar, name, code, percentage, stats, statuses, onStatusChange }: TeacherStatCardProps) {
  return (
    <motion.div whileHover={{ y: -4 }} className="bg-[#0F172A]/40 rounded-2xl border border-white/10 flex flex-col overflow-hidden hover:border-lime-400/30 transition-all">
      <div className="p-4 flex items-center justify-between gap-3 bg-white/[0.03]">
        <div className="flex items-center gap-3 min-w-0">
          <img src={avatar} className="w-11 h-11 rounded-full object-cover ring-2 ring-white/10" alt={name} />
          <div className="truncate">
            <p className="text-white font-bold text-sm truncate">{name}</p>
            <p className="text-white/40 text-[10px] uppercase tracking-tighter">{code}</p>
          </div>
        </div>
        <div className="shrink-0 bg-lime-400 text-black text-[10px] font-black px-2 py-1 rounded-md">{percentage}%</div>
      </div>

      <div className="grid grid-cols-4 gap-1 p-3 bg-black/20 border-b border-white/5">
        {stats.map((s, i) => (
          <div key={i} className="text-center">
            <p className={`text-sm font-bold ${s.color || "text-white"}`}>{s.value}</p>
            <p className="text-[10px] text-white/30 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="p-3 grid grid-cols-4 gap-2">
        {statuses.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onStatusChange?.(s.label)}
            className={`h-9 rounded-xl text-xs font-bold transition-all ${
              s.active ? "bg-lime-400 text-black shadow-[0_0_15px_rgba(163,230,53,0.3)]" : "bg-white/5 text-white/30 hover:bg-white/10"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
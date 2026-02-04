// "use client";

// import { ReactNode } from "react";
// import { motion } from "framer-motion";

// interface StatCardProps {
//   title: string;
//   value: string | number;
//   icon?: ReactNode;
//   footer?: ReactNode;
//   className?: string;
// }

// export default function StatCard({
//   title,
//   value,
//   icon,
//   footer,
//   className = "",
// }: StatCardProps) {
//   return (
//     <motion.div
//       whileHover={{ y: -4 }}
//       className={`
//         bg-white/5 backdrop-blur-xl
//         rounded-2xl p-4 md:p-5
//         shadow-lg
//         hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]
//         hover:-translate-y-1
//         transition-all duration-300
//         border border-white/10
//         group
//         ${className}
//       `}
//     >
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-white/60 text-sm">{title}</p>
//           <h2 className="text-3xl font-bold text-white mt-1">{value}</h2>
//         </div>

//         {icon && (
//           <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white">
//             {icon}
//           </div>
//         )}
//       </div>

//       {footer && (
//         <div className="mt-4 text-sm text-white/60">
//           {footer}
//         </div>
//       )}
//     </motion.div>
//   );
// }


"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  title?: string;
  value?: string | number;
  icon?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export default function StatCard({
  title,
  value,
  icon,
  footer,
  className = "",
  children,
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`
        bg-white/5 backdrop-blur-xl
        rounded-2xl p-4 md:p-5
        shadow-lg
        hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]
        hover:-translate-y-1
        transition-all duration-300
        border border-white/10
        group
        ${className}
      `}
    >
      {/* Header */}
      {(title || value || icon) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <p className="text-white/60 text-sm">{title}</p>
            )}
            {value && (
              <h2 className="text-3xl font-bold text-white mt-1">
                {value}
              </h2>
            )}
          </div>

          {icon && (
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white">
              {icon}
            </div>
          )}
        </div>
      )}

      {/* Custom Content */}
      {children}

      {/* Footer */}
      {footer && (
        <div className="mt-4 text-sm text-white/60">
          {footer}
        </div>
      )}
    </motion.div>
  );
}

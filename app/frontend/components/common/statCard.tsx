// "use client";

// import { ReactNode } from "react";
// import { motion } from "framer-motion";

// interface StatCardProps {
//   title?: string;
//   value?: string | number | ReactNode;
//   icon?: ReactNode;
//   footer?: ReactNode;
//   className?: string;
//   children?: ReactNode;
//   iconVariant?: "boxed" | "plain";
// }

// export default function StatCard({
//   title,
//   value,
//   icon,
//   footer,
//   className = "",
//   children,
//   iconVariant = "boxed",
// }: StatCardProps) {
//   return (
//     <motion.div
//       whileHover={{ y: -4 }} className={`
//          bg-white/5 backdrop-blur-xl
//          rounded-2xl p-4 md:p-5
//          shadow-lg
//          hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]
//          hover:-translate-y-1
//          transition-all duration-300
//          border border-white/10
//          group
//          ${className}
//       `}
//     >
//       {/* ================= BIG BACKGROUND ICON (RIGHT) ================= */}
//       {icon && (
//         <div
//           className="
//             absolute right-6 top-1/2 -translate-y-1/2
            
//             text-white/15
//             pointer-events-none
//             z-0
//           "
//         >
//           {icon}
//         </div>
//       )}

//       {/* ================= CONTENT ================= */}
//       <div className="relative z-10">
//         {(title || value || icon) && (
//           <div className="flex items-start justify-between mb-4">
//             {/* LEFT SIDE */}
//             <div className="space-y-2">
//               {/* ---- Small boxed icon + title ---- */}
//               <div className="flex items-center gap-3">
//                 {icon && (
//                   <div className="
//     w-10 h-10 rounded-xl
//     bg-black/1 backdrop-blur
//     flex items-center justify-center
//   ">
//                     <div className="scale-[0.45] saturate-150 brightness-110">
//                       {icon}
//                     </div>
//                   </div>
//                 )}


//                 {title && (
//                   <p className="text-white/70 text-sm font-medium">
//                     {title}
//                   </p>
//                 )}
//               </div>

//               {/* ---- Value ---- */}
//               {value && (
//                 <h2 className="text-4xl font-bold text-white">
//                   {value}
//                 </h2>
//               )}
//             </div>
//           </div>
//         )}

//         {children}

//         {footer && (
//           <div className="mt-4 text-sm text-white/60">
//             {footer}
//           </div>
//         )}
//       </div>
//     </motion.div>
//   );
// }


"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  title?: string;
  value?: string | number | ReactNode;
  icon?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children?: ReactNode;
  iconVariant?: "boxed" | "plain";
  showBgIcon?: boolean; // ✅ NEW (IMPORTANT)
}

export default function StatCard({
  title,
  value,
  icon,
  footer,
  className = "",
  children,
  iconVariant = "boxed",
  showBgIcon = false, // ✅ default: single icon
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`
        relative overflow-hidden
        bg-white/5 backdrop-blur-xl
        rounded-2xl p-4 md:p-5
        shadow-lg
        hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]
        transition-all duration-300
        border border-white/10
        group
        ${className}
      `}
    >
      {/* ================= OPTIONAL BIG BACKGROUND ICON ================= */}
      {showBgIcon && icon && (
        <div
          className="
            absolute right-6 top-1/2 -translate-y-1/2
            scale-[2.6]
            text-white/15
            pointer-events-none
            z-0
          "
        >
          {icon}
        </div>
      )}

      {/* ================= CONTENT ================= */}
      <div className="relative z-10">
        {(title || value || icon) && (
          <div className="flex items-start justify-between mb-4">
            {/* LEFT SIDE */}
            <div className="space-y-2">
              {/* ---- Small icon + title ---- */}
              <div className="flex items-center gap-3">
                {icon && (
                  <div
                    className="
                      w-10 h-10 rounded-xl
                      bg-black/20 backdrop-blur
                      flex items-center justify-center
                    "
                  >
                    <div className="scale-[0.45] saturate-150 brightness-110">
                      {icon}
                    </div>
                  </div>
                )}

                {title && (
                  <p className="text-white/70 text-sm font-medium">
                    {title}
                  </p>
                )}
              </div>

              {/* ---- Value ---- */}
              {value && (
                <h2 className="text-4xl font-bold text-white">
                  {value}
                </h2>
              )}
            </div>
          </div>
        )}

        {children}

        {footer && (
          <div className="mt-4 text-sm text-white/60">
            {footer}
          </div>
        )}
      </div>
    </motion.div>
  );
}

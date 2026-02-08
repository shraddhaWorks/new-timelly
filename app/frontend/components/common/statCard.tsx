import { ReactNode } from "react";

interface StatCardProps {
  icon?: ReactNode;
  iconClassName?: string;
  label?: string;
  title?: string;
  value: ReactNode;
  footer?: ReactNode;
  iconVariant?: "boxed" | "plain";
  className?: string;
  children?: ReactNode;
<<<<<<< HEAD
=======
  iconVariant?: "boxed" | "plain";

  /* ✅ Progress bar props */
  progress?: number; // 0 - 100
  progressColor?: string; // tailwind class
>>>>>>> 02430399f804431055e05ed75b73d6ec738f9f6f
}

export default function StatCard({
  icon,
  iconClassName,
  label,
  title,
  value,
  footer,
  iconVariant = "boxed",
  className,
  children,
<<<<<<< HEAD
=======
  iconVariant = "boxed",
  progress,
  progressColor = "bg-lime-400",
>>>>>>> 02430399f804431055e05ed75b73d6ec738f9f6f
}: StatCardProps) {
  const heading = label ?? title ?? "";
  return (
<<<<<<< HEAD
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur ${className ?? ""}`}>
      <div className="flex items-center gap-3">
        {icon ? (
          <div
            className={
              iconVariant === "plain"
                ? `text-white/50 ${iconClassName ?? ""}`
                : `flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 ${iconClassName ?? "text-lime-300"}`
            }
          >
            {icon}
=======
    <motion.div
      whileHover={{ y: -4 }}
      className={`
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
>>>>>>> 02430399f804431055e05ed75b73d6ec738f9f6f
          </div>
        ) : null}
        <div>
          {heading ? (
            <div className="text-[11px] uppercase tracking-wide text-white/60">
              {heading}
            </div>
          ) : null}
          <div className="text-lg font-semibold text-white">{value}</div>
          {footer ? (
            <div className="text-xs text-white/50 mt-1">{footer}</div>
          ) : null}
        </div>
<<<<<<< HEAD
      </div>
=======
      )}

      {/* ✅ Progress Bar */}
      {typeof progress === "number" && (
        <div className="mt-3">
          <div className="h-2 w-full rounded-full bg-white/15 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`h-full rounded-full ${progressColor}`}
            />
          </div>
        </div>
      )}

>>>>>>> 02430399f804431055e05ed75b73d6ec738f9f6f
      {children}
    </div>
  );
}

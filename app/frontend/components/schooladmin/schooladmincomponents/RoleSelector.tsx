"use client";

import { Shield } from "lucide-react";
import clsx from "clsx";

interface RoleSelectorProps {
  value: "SCHOOLADMIN" | "TEACHER" | "STUDENT";
  onChange: (role: "SCHOOLADMIN" | "TEACHER" | "STUDENT") => void;
}

const ROLES = [
  { value: "TEACHER", label: "Teacher" },
//   { value: "SCHOOLADMIN", label: "Admin" },
//   { value: "STUDENT", label: "Student" },
] as const;

export default function RoleSelector({
  value,
  onChange,
}: RoleSelectorProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-white mb-3">
        User Role
      </label>

      <div
        className="
          flex flex-wrap gap-3
        "
      >
        {ROLES.map((role) => {
          const isActive = value === role.value;

          return (
            <label
              key={role.value}
              className={clsx(
                "relative cursor-pointer select-none",
                "flex items-center gap-2",
                "px-5 py-2.5 rounded-2xl",
                "text-sm font-medium",
                "transition-all duration-200",
                "border",
                isActive
                  ? "border-lime-400 text-lime-400 bg-lime-400/10"
                  : "border-white/10 text-white/70 bg-white/5 hover:bg-white/10"
              )}
            >
              {/* Hidden Radio */}
              <input
                type="radio"
                name="role"
                value={role.value}
                checked={true} // {isActive} // Always checked to allow label click, but visually indicated by styles
                onChange={() => onChange(role.value)}
                className="hidden"
              />

              <Shield
                size={16}
                className={clsx(
                  "transition-colors",
                  isActive ? "text-lime-400" : "text-white/40"
                )}
              />

              {role.label}
            </label>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, ComponentType } from "react";
import { Search, LucideProps } from "lucide-react";
import clsx from "clsx";

interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;

  icon?: ComponentType<LucideProps>;
  showSearchIcon?: boolean;

  disabled?: boolean;
  className?: string;
  type?: string;

  iconClassName?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  icon,
  showSearchIcon = true,
  disabled = false,
  className,
  type = "text",
  iconClassName = "text-gray-400",
}: SearchInputProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const Icon = icon ?? (showSearchIcon ? Search : null);

  return (
    <div className={clsx("relative w-full", className)}>
      {/* ICON */}
      {mounted && Icon && (
        <Icon
          size={18}
          className={clsx(
            "absolute left-4 top-1/2 -translate-y-1/2",
            "z-10 pointer-events-none", 
            iconClassName
          )}
        />
      )}

      <input
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className={clsx(
          "relative z-0", // optional, but explicit
          "w-full h-9 rounded-xl",
          "bg-white/10 backdrop-blur-xl",
          "border border-white/10",
          "text-white placeholder-white/40 text-sm",
          "outline-none transition-all",
          mounted && Icon ? "pl-11 pr-4" : "px-4",
          "focus:border-lime-400/50"
        )}
      />
    </div>
  );
}

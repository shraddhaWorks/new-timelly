"use client";

import clsx from "clsx";
import { PRIMARY_COLOR, HOVER_COLOR } from "../../constants/colors";

interface SelectOption {
  label: string;
  value?: string;
  disabled?: boolean;
}

interface SelectInputProps {
  value?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
}

export default function SelectInput({
  value,
  onChange,
  options,
  disabled = false,
  className,
  label,
  error,
}: SelectInputProps) {
  return (
    <div className={clsx("w-full", className)}>
      {label && (
        <label className="block text-xs sm:text-sm mb-1 text-white/70">
          {label}
        </label>
      )}

      <div className="relative w-full">
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          aria-invalid={!!error}
          className={clsx(
            "w-full rounded-xl appearance-none cursor-pointer",
            "pl-4 pr-10 py-2.5 sm:py-3",
            "bg-black/20 border border-white/10",
            "text-gray-200 text-sm sm:text-base",
            "focus:outline-none focus:ring-0",
            "hover:border-[var(--hover-color)]",
            "focus:border-[var(--primary-color)]",
            disabled && "opacity-60 cursor-not-allowed"
          )}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            ["--primary-color" as any]: PRIMARY_COLOR,
            ["--hover-color" as any]: HOVER_COLOR,
          }}
        >
          {options.map((option) => (
            <option
              key={`${option.label}-${option.value ?? option.label}`}
              value={option.value ?? option.label}
              disabled={option.disabled}
              className="bg-[#2a1f3a]"
            >
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/70">
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      {error && (
        <p
          className="text-sm mt-1 !text-red-500"
          style={{ color: "#ef4444" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

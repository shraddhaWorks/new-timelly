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
        <label className="block text-xs md:text-sm font-medium text-gray-400 mb-2">
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
            "pl-4 pr-4 py-2.5 sm:py-3 ",
            "bg-[#0F172A]/50 border border-white/10",
            "text-gray-200 text-sm sm:text-base",
            "focus:outline-none focus:ring-0",
            "hover:border-[var(--hover-color)]",
            "focus:border-[var(--primary-color)]",
            disabled && "opacity-60 cursor-not-allowed"
          )}
          style={{
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

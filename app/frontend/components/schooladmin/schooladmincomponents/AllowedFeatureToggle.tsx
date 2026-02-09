"use client";

interface FeatureToggleProps {
  label: string;
  checked?: boolean;
  onChange: () => void;
}

export default function AllowedFeatureToggle({
  label,
  checked = false,
  onChange,
}: FeatureToggleProps) {
  return (
    <label className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white/5 border border-white/10
      hover:border-lime-400/40 cursor-pointer transition ">
      <span className="text-sm text-white/80">{label}</span>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex flex-shrink-0 h-6 w-12 border-2 border-transparent rounded-full 
          transition-colors ease-in-out duration-200 
          focus:outline-noneflex items-center gap-2 text-sm text-gray-400
          hover:text-lime-400 transition-colors ${
          checked ? "bg-lime-400" : "bg-white/10"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

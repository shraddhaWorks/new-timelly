"use client";

import { useRouter, useSearchParams } from "next/navigation";

type TabItem = {
  label: string;
  value: string;
};

interface PageTabsProps {
  tabs: TabItem[];
  queryKey?: string; // default = "tab"
}

export default function PageTabs({
  tabs,
  queryKey = "tab",
}: PageTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Accept legacy query values (e.g. "add-user", "all-users") and normalize
  const rawActive = searchParams.get(queryKey) ?? tabs[0].value;
  const active =
    rawActive === "add-user"
      ? "add"
      : rawActive === "all-users"
      ? "all"
      : rawActive;

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(queryKey, value);

    // When switching between internal views, clear editing context like userId
    if (queryKey === "view" && value === "add") {
      params.delete("userId");
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex bg-[#0F172A]/50 p-1 rounded-xl border border-white/10">
      {tabs.map((tab) => {
        const isActive = active === tab.value;

        return (
          <button
            key={tab.value}
            onClick={() => handleChange(tab.value)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all
              ${
                isActive
                  ? "bg-lime-400 text-black shadow-lg"
                  : "text-white/70 hover:text-white"
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

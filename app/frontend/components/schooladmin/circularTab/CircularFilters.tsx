import { Search } from "lucide-react";
import { IMPORTANCE_LEVELS } from "@/lib/constants";
import { CIRCULAR_PRIMARY } from "@/app/frontend/constants/colors";

interface Props {
  search: string;
  onSearch: (v: string) => void;
  importance: string;
  onImportance: (v: string) => void;
}

export default function CircularFilters({
  search,
  onSearch,
  importance,
  onImportance,
}: Props) {
  return (
    <div
      className="
      bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between"
    >
      {/* SEARCH */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search circulars by title or reference no..."
          className="
            w-full
            pl-11 pr-4 py-3
            rounded-xl
            bg-black/20
            text-white
            placeholder:text-white/50
            focus:outline-none
          "
        />
      </div>

      {/* IMPORTANCE FILTERS */}
      <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
        {/* {["All Importance", ...IMPORTANCE_LEVELS].map((opt) => {
          const isActive = importance === opt;

          return (
            <button
              key={opt}
              onClick={() => onImportance(opt)}
              className={`
               px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border bg-white/5 text-gray-400 border-white/10 hover:bg-white/10
                ${
                  isActive
                    ? "text-black"
                    : "text-white/70 hover:text-white"
                }
              `}
              style={{
                background: isActive
                  ? CIRCULAR_PRIMARY
                  : "rgba(255,255,255,0.08)",
              }}
            >
              {opt}
            </button>
          );
        })} */}
        {["All Importance", ...IMPORTANCE_LEVELS].map((opt) => {
  const isActive = importance === opt;

  return (
    <button
      key={opt}
      onClick={() => onImportance(opt)}
      className={`
        px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap
        transition-all border
        ${
          isActive
            ? "bg-lime-400/10 text-lime-400 border-lime-400/30"
            : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
        }
      `}
    >
      {opt}
    </button>
  );
})}

      </div>
    </div>
  );
}

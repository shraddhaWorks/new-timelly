import { Plus, Save } from "lucide-react";
import SearchInput from "../../common/SearchInput";

export default function AddClassPanel() {
  return (
    <div className="bg-[#0F172A]/50 rounded-2xl p-6 border border-white/10 animate-fadeIn shadow-inner">
      <div className="flex items-center gap-2 text-white font-semibold mb-4">
        <Plus size={18} className="text-lime-400" />
        Add New Class
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <SearchInput
          label="Class Name"
          placeholder="e.g. Class 10"
          showSearchIcon={false}
        />

        <SearchInput
          label="Section"
          placeholder="e.g. A"
          showSearchIcon={false}
        />

        <SearchInput
          label="Class Teacher"
          placeholder="Select Teacher"
          showSearchIcon={false}
        />

        <SearchInput
          label="Max Students"
          placeholder="e.g. 50"
          showSearchIcon={false}
        />
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/70 hover:bg-white/10">
          Cancel
        </button>
        <button className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-3.5 py-2 text-xs font-semibold text-black hover:bg-lime-300">
          <Save size={14} />
          Save Class
        </button>
      </div>
    </div>
  );
}

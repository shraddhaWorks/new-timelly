import { Plus, Save } from "lucide-react";
import SearchInput from "../../common/SearchInput";
import SelectInput from "../../common/SelectInput";

export default function AddSectionPanel() {
  return (
    <div className="bg-[#0F172A]/50 rounded-2xl p-6 border border-white/10 animate-fadeIn shadow-inner">
      <div className="flex items-center gap-2 text-white font-semibold mb-4">
        <Plus size={18} className="text-lime-400" />
        Add New Section
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        <SelectInput
          label="Select Class"
          options={[
            { label: "Select Class", value: "", disabled: true },
            { label: "Class 10", value: "class-10" },
            { label: "Class 9", value: "class-9" },
          ]}
        />

        <SearchInput
          label="Section Name"
          placeholder="e.g. C"
          showSearchIcon={false}
        />

        <SelectInput
          label="Class Teacher"
          options={[
            { label: "Select Teacher", value: "", disabled: true },
            { label: "Mrs. Priya Sharma", value: "priya-sharma" },
            { label: "Mr. Rajesh Kumar", value: "rajesh-kumar" },
          ]}
        />
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 cursor-pointer">
          Cancel
        </button>
        <button className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-3.5 py-2 text-xs font-semibold text-black hover:bg-lime-300 cursor-pointer">
          <Save size={14} />
          Save Section
        </button>
      </div>
    </div>
  );
}

import { Upload } from "lucide-react";

export default function UploadCsvPanel() {
  return (
    <div className="bg-[#0F172A]/50 rounded-2xl p-6 border border-white/10 animate-fadeIn shadow-inner">
      <div className="flex items-center gap-2 text-white font-semibold mb-4">
        <Upload size={18} className="text-lime-400" />
        Upload CSV
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4">
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <Upload size={18} className="text-white/70" />
          </div>
          <div className="text-sm text-white/80">Click to upload or drag and drop</div>
          <div className="text-xs text-white/40 mt-1">CSV file (max. 10MB)</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs font-semibold text-white/80 mb-2">Instructions:</div>
          <ul className="space-y-1 text-xs text-white/60">
            <li>File must be in .csv format</li>
            <li>Required columns: Class Name, Section, Class Teacher, Max Students</li>
            <li>Ensure no duplicate entries</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/70 hover:bg-white/10">
          Cancel
        </button>
        <button className="rounded-xl bg-lime-400 px-3.5 py-2 text-xs font-semibold text-black hover:bg-lime-300">
          Upload File
        </button>
      </div>
    </div>
  );
}

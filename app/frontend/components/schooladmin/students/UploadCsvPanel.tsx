"use client";

import { Upload, X } from "lucide-react";

type Props = {
  uploadFile: File | null;
  onFileChange: (file: File | null) => void;
  uploading: boolean;
  onCancel: () => void;
  onUpload: () => void;
};

export default function UploadCsvPanel({
  uploadFile,
  onFileChange,
  uploading,
  onCancel,
  onUpload,
}: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0F172A] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="text-lg font-semibold text-white">Upload CSV File</div>
          <button onClick={onCancel} className="text-white/60 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <label className="block w-full rounded-2xl border border-dashed border-lime-400/70 bg-white/5 p-8 text-center cursor-pointer hover:bg-white/10 transition-all shadow-[0_0_0_1px_rgba(163,230,53,0.15)]">
            <input
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={(e) => onFileChange(e.target.files?.[0] || null)}
            />
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <Upload size={20} className="text-white/70" />
            </div>
            <div className="text-sm text-white/80">
              Click to upload or drag and drop
            </div>
            <div className="text-xs text-white/40 mt-1">
              CSV file (max. 10MB)
            </div>
            {uploadFile && (
              <div className="mt-2 text-xs text-lime-300">{uploadFile.name}</div>
            )}
          </label>

          <div className="rounded-2xl border border-sky-300/30 bg-sky-900/10 p-4 text-xs text-sky-200/80">
            <div className="text-xs font-semibold text-sky-200 mb-2">Note:</div>
            CSV should include: Student ID, Name, Class, Section, Date of Birth,
            Parent Name, Parent Email, Parent Phone, Address, Status.
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white/70 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={onUpload}
              disabled={uploading}
              className="rounded-xl bg-lime-400 px-6 py-2 text-sm font-semibold text-black hover:bg-lime-300 disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

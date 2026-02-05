"use client";

import { useState, useCallback } from "react";
import { Image as ImageIcon, Paperclip, Send, X } from "lucide-react";
import { fileToBase64, getClipboardImageAsBase64 } from "../../../utils/image";

interface CreatePostProps {
  onPublished: () => void;
}

export default function CreatePost({ onPublished }: CreatePostProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) return;
    try {
      const b64 = await fileToBase64(file);
      setPhotoBase64(b64);
    } catch {
      setError("Failed to read image");
    }
    e.target.value = "";
  }, []);

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const b64 = await getClipboardImageAsBase64(e.clipboardData);
    if (b64) {
      e.preventDefault();
      setPhotoBase64(b64);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required");
      return;
    }
    setPosting(true);
    try {
      const res = await fetch("/api/newsfeed/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          photo: photoBase64 || undefined,
          mediaUrl: photoBase64 || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create post");
      setTitle("");
      setDescription("");
      setPhotoBase64(null);
      onPublished();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create post");
    } finally {
      setPosting(false);
    }
  };

  return (
    <section
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6"
      onPaste={handlePaste}
    >
      <h3 className="text-base md:text-lg font-medium mb-3 md:mb-4">Create New Post</h3>
      <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
        <input
          type="text"
          placeholder="Post title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 md:py-3 text-sm md:text-base text-white placeholder:text-white/40 focus:outline-none focus:ring-1 ring-white/30"
        />
        <textarea
          placeholder="What would you like to share..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm md:text-base text-white placeholder:text-white/40 focus:outline-none focus:ring-1 ring-white/30 resize-none"
        />

        {/* Photo: file picker + paste (screenshot) */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-gray-300 hover:text-white transition text-xs md:text-sm cursor-pointer">
            <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
            <span>Photo</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
          <span className="text-white/50 text-xs">or paste screenshot (Ctrl+V)</span>
        </div>
        {photoBase64 && (
          <div className="relative inline-block">
            <img
              src={photoBase64}
              alt="Attached"
              className="max-h-40 rounded-xl border border-white/10 object-cover"
            />
            <button
              type="button"
              onClick={() => setPhotoBase64(null)}
              className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 pt-2">
          <span className="text-white/50 text-xs sm:block">Paste (Ctrl+V) to attach image</span>
          <button
            type="submit"
            disabled={posting}
            className="w-full sm:w-auto bg-[#b4f42c] text-black px-4 py-2.5 md:px-6 md:py-2.5 rounded-full font-bold text-xs md:text-sm flex items-center justify-center gap-2 hover:bg-[#a3e028] transition disabled:opacity-60 shrink-0"
          >
            <Send className="w-3.5 h-3.5 md:w-4 md:h-4" /> {posting ? "Publishing..." : "Publish"}
          </button>
        </div>
      </form>
    </section>
  );
}

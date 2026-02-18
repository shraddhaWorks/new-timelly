"use client";

import { useState, useCallback } from "react";
import { Image as ImageIcon, Send, X, Loader2 } from "lucide-react";
import { uploadImage } from "../../../utils/upload";

function getClipboardImageFile(clipboardData: DataTransfer | null): File | null {
  if (!clipboardData?.items?.length) return null;
  const item = Array.from(clipboardData.items).find((i) => i.type.startsWith("image/"));
  if (!item) return null;
  return item.getAsFile();
}

interface CreatePostProps {
  onPublished: () => void;
}

export default function CreatePost({ onPublished }: CreatePostProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) return;
    setPhotoUploading(true);
    setError("");
    try {
      const url = await uploadImage(file, "newsfeed");
      setPhotoUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setPhotoUploading(false);
    }
    e.target.value = "";
  }, []);

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const file = getClipboardImageFile(e.clipboardData);
    if (!file) return;
    e.preventDefault();
    setPhotoUploading(true);
    setError("");
    try {
      const url = await uploadImage(file, "newsfeed");
      setPhotoUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setPhotoUploading(false);
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
          photo: photoUrl || undefined,
          mediaUrl: photoUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create post");
      setTitle("");
      setDescription("");
      setPhotoUrl(null);
      onPublished();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create post");
    } finally {
      setPosting(false);
    }
  };

  return (
    <section
      className="min-w-0 w-full max-w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-5 lg:p-6 xl:p-8 box-border"
      onPaste={handlePaste}
    >
      <h3 className="text-base md:text-lg lg:text-xl font-medium mb-3 md:mb-4 lg:mb-5">Create New Post</h3>
      <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4 lg:space-y-5">
        <input
          type="text"
          placeholder="Post title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full min-w-0 max-w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl px-3 py-2.5 sm:px-4 md:py-3 lg:px-5 lg:py-3.5 text-base md:text-base lg:text-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-1 ring-white/30"
        />
        <textarea
          placeholder="What would you like to share..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full min-w-0 max-w-full bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl px-3 py-3 sm:px-4 lg:px-5 lg:py-4 text-base md:text-base lg:text-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-1 ring-white/30 resize-none"
        />

        {/* Photo: file picker or paste image → upload to Supabase */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4">
          <label className="flex items-center gap-2 min-h-[44px] text-gray-300 hover:text-white transition text-xs md:text-sm lg:text-base cursor-pointer touch-manipulation py-1">
            {photoUploading ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 lg:w-5 lg:h-5 animate-spin shrink-0" /> : <ImageIcon className="w-4 h-4 md:w-5 md:h-5 lg:w-5 lg:h-5 shrink-0" />}
            <span>{photoUploading ? "Uploading…" : "Photo"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={photoUploading}
            />
          </label>
          <span className="text-white/50 text-[10px] sm:text-xs lg:text-sm">or paste image (Ctrl+V)</span>
        </div>
        {photoUrl && (
          <div className="relative inline-block max-w-full">
            <img
              src={photoUrl}
              alt="Attached"
              className="max-h-32 sm:max-h-40 md:max-h-48 lg:max-h-52 xl:max-h-56 rounded-xl lg:rounded-2xl border border-white/10 object-cover max-w-full"
            />
            <button
              type="button"
              onClick={() => setPhotoUrl(null)}
              aria-label="Remove photo"
              className="absolute top-1.5 right-1.5 lg:top-2 lg:right-2 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 touch-manipulation md:min-w-[44px] md:min-h-[44px]"
            >
              <X size={18} className="lg:w-5 lg:h-5" />
            </button>
          </div>
        )}

        {error && <p className="text-red-400 text-sm lg:text-base">{error}</p>}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 lg:gap-4 pt-2 lg:pt-3">
          <span className="text-white/50 text-xs sm:block lg:text-sm">High-quality images are stored in Supabase</span>
          <button
            type="submit"
            disabled={posting}
            className="w-full sm:w-auto min-h-[44px] bg-[#b4f42c] text-black px-5 py-3 md:px-6 md:py-3 lg:px-8 lg:py-3 xl:px-10 xl:py-3 rounded-full font-bold text-base md:text-sm lg:text-base flex items-center justify-center gap-2 hover:bg-[#a3e028] transition disabled:opacity-60 shrink-0 touch-manipulation"
          >
            <Send className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" /> {posting ? "Publishing..." : "Publish"}
          </button>
        </div>
      </form>
    </section>
  );
}

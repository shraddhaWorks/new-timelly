"use client";

import { Heart } from "lucide-react";
import { formatRelativeTime } from "../../../utils/format";
import type { NewsFeedItem } from "../../../hooks/useNewsFeeds";

interface PostCardProps {
  post: NewsFeedItem;
  onLike: (id: string) => void;
}

export default function PostCard({ post, onLike }: PostCardProps) {
  const authorName = post.createdBy?.name ?? "School";
  const timeStr = formatRelativeTime(post.createdAt);

  return (
    <article className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden">
      {/* Header: avatar + name + time, Published pill */}
      <div className="p-3 sm:p-4 flex justify-between items-start gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 flex-shrink-0 overflow-hidden ring-2 ring-white/10">
            <div className="w-full h-full flex items-center justify-center text-white/90 text-sm font-semibold">
              {authorName[0]?.toUpperCase() ?? "?"}
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm sm:text-base leading-tight truncate text-white">{authorName}</p>
            <p className="text-xs text-gray-400 mt-0.5">{timeStr}</p>
          </div>
        </div>
        <span className="bg-[#82922c]/30 text-[#d4ff00] text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full border border-[#d4ff00]/20 font-medium shrink-0">
          Published
        </span>
      </div>

      {((post.photos && post.photos.length > 0) || post.photo) && (
        <div className="w-full aspect-video sm:h-64 md:h-80 max-h-80 overflow-hidden bg-black/20">
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-0 h-full">
            {(post.photos && post.photos.length > 0 ? post.photos : [post.photo!]).map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="w-full h-full min-w-full object-cover snap-center snap-always"
              />
            ))}
          </div>
        </div>
      )}

      <div className="p-4 sm:p-5 md:p-6 bg-[#2d1b2d]/90 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => onLike(post.id)}
          className="flex items-center gap-2 text-gray-300 mb-3 sm:mb-4 cursor-pointer hover:text-red-400 transition touch-manipulation"
        >
          <Heart
            className={`w-4 h-4 sm:w-5 sm:h-5 transition ${post.likedByMe ? "fill-red-500 text-red-500" : ""}`}
          />
          <span className="text-xs sm:text-sm font-medium">{post.likes}</span>
        </button>

        <h4 className="text-base sm:text-lg font-bold mb-2 text-white leading-tight">{post.title}</h4>
        <p className="text-gray-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
          {post.description}
        </p>
      </div>
    </article>
  );
}

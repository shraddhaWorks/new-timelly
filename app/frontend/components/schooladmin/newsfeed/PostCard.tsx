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
    <article className="min-w-0 w-full max-w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden">
      {/* Header: avatar + name + time, Published pill */}
      <div className="p-3 sm:p-4 md:p-5 lg:p-6 flex justify-between items-start gap-2 md:gap-3 flex-wrap">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1 overflow-hidden">
          <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full bg-white/20 flex-shrink-0 overflow-hidden ring-2 ring-white/10">
            <div className="w-full h-full flex items-center justify-center text-white/90 text-sm md:text-base font-semibold">
              {authorName[0]?.toUpperCase() ?? "?"}
            </div>
          </div>
          <div className="min-w-0 overflow-hidden">
            <p className="font-semibold text-sm sm:text-base lg:text-lg leading-tight truncate text-white">{authorName}</p>
            <p className="text-xs md:text-sm text-gray-400 mt-0.5 truncate">{timeStr}</p>
          </div>
        </div>
        <span className="bg-[#82922c]/30 text-[#d4ff00] text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 md:px-3.5 md:py-1.5 py-1 rounded-full border border-[#d4ff00]/20 font-medium shrink-0">
          Published
        </span>
      </div>

      {post.photo && (
        <div className="w-full max-w-full aspect-video sm:h-64 md:h-64 lg:h-80 xl:h-96 xl:max-h-[28rem] max-h-80 overflow-hidden bg-black/20 flex-shrink-0">
          <img
            src={post.photo}
            alt=""
            className="w-full h-full max-w-full object-cover block"
          />
        </div>
      )}

      <div className="p-3 sm:p-4 md:p-4 lg:p-5 xl:p-8 bg-[#2d1b2d]/90 backdrop-blur-xl min-w-0">
        <button
          type="button"
          onClick={() => onLike(post.id)}
          className="flex items-center gap-2 md:gap-2.5 text-gray-300 mb-2 sm:mb-3 md:mb-4 cursor-pointer hover:text-red-400 transition touch-manipulation min-h-[44px] min-w-[44px] -my-1"
        >
          <Heart
            className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 shrink-0 transition ${post.likedByMe ? "fill-red-500 text-red-500" : ""}`}
          />
          <span className="text-xs sm:text-sm lg:text-base font-medium">{post.likes}</span>
        </button>

        <h4 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold mb-1.5 sm:mb-2 lg:mb-3 text-white leading-tight break-words">{post.title}</h4>
        <p className="text-gray-200 text-xs sm:text-sm lg:text-base leading-relaxed whitespace-pre-wrap break-words">
          {post.description}
        </p>
      </div>
    </article>
  );
}

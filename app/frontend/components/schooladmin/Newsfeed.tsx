"use client";

import { useNewsFeeds } from "../../hooks/useNewsFeeds";
import CreatePost from "./newsfeed/CreatePost";
import PostCard from "./newsfeed/PostCard";

export default function NewsFeed() {
  const { feeds, loading, error, refetch, toggleLike } = useNewsFeeds();

  return (
    <div className="min-w-0 w-full min-h-screen text-white font-sans overflow-x-hidden p-3 sm:p-4 md:p-4 lg:p-6 xl:p-8 2xl:p-10">
      <main className="min-w-0 w-full max-w-3xl mx-auto space-y-4 md:space-y-5 lg:space-y-6 xl:space-y-8">
        <section className="min-w-0 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-5 lg:p-7 xl:p-10">
          <h2 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold mb-1 md:mb-2 lg:mb-3 text-white break-words">News Feed</h2>
          <p className="text-sm md:text-sm lg:text-base xl:text-lg text-gray-300 break-words">Create and manage school announcements</p>
        </section>

        <CreatePost onPublished={refetch} />

        {error && (
          <div className="min-w-0 rounded-xl lg:rounded-2xl bg-red-500/20 border border-red-500/30 px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-3.5 lg:px-5 lg:py-4 text-red-300 text-xs sm:text-sm md:text-base break-words">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8 sm:py-12 lg:py-16 xl:py-20">
            <div className="animate-spin rounded-full h-10 w-10 lg:h-12 lg:w-12 border-2 border-white/30 border-t-white" />
          </div>
        ) : feeds.length === 0 ? (
          <div className="min-w-0 rounded-2xl lg:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 md:p-6 lg:p-8 xl:p-12 text-center text-white/60 text-sm sm:text-base lg:text-lg">
            No posts yet. Create the first one above.
          </div>
        ) : (
          <div className="min-w-0 space-y-4 md:space-y-5 lg:space-y-6 xl:space-y-8">
            {feeds.map((post) => (
              <PostCard key={post.id} post={post} onLike={toggleLike} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

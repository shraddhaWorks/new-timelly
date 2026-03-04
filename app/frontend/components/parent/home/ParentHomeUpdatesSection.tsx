"use client";

import { useEffect, useState } from "react";
import { Calendar, Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { formatRelativeTime } from "../../../utils/format";
import { ParentEvent, ParentFeed } from "./types";

type Props = {
  feeds: ParentFeed[];
  events: ParentEvent[];
};

type EventUpdate = {
  id: string;
  title: string;
  description?: string | null;
  eventDate?: string | null;
  createdAt?: string | null;
  photo?: string | null;
  type?: string | null;
  teacher?: { name?: string | null } | null;
};

function formatEventBadge(value?: string | null) {
  if (!value) return { top: "TBD", bottom: "" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { top: "TBD", bottom: "" };
  const sameDay = date.toDateString() === new Date().toDateString();
  if (sameDay) {
    return {
      top: "Today",
      bottom: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };
  }
  return {
    top: date.toLocaleDateString("en-US", { month: "short" }),
    bottom: String(date.getDate()),
  };
}

export default function ParentHomeUpdatesSection({ feeds: _feeds, events }: Props) {
  const [schoolUpdates, setSchoolUpdates] = useState<EventUpdate[]>([]);
  const [updatesLoading, setUpdatesLoading] = useState(true);
  const [updatesError, setUpdatesError] = useState<string | null>(null);
  const [likesState, setLikesState] = useState<
    Record<string, { liked: boolean; count: number }>
  >({});

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setUpdatesLoading(true);
        setUpdatesError(null);

        const res = await fetch("/api/events/list", {
          credentials: "include",
          cache: "no-store",
        });
        const payload = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(payload?.message || "Failed to load school updates");
        }
        if (!active) return;

        setSchoolUpdates(Array.isArray(payload?.events) ? payload.events : []);
      } catch (e) {
        if (!active) return;
        setUpdatesError(e instanceof Error ? e.message : "Failed to load school updates");
      } finally {
        if (active) setUpdatesLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleLike = (eventId: string) => {
    setLikesState((prev) => {
      const current = prev[eventId] ?? { liked: false, count: 0 };
      const nextLiked = !current.liked;
      return {
        ...prev,
        [eventId]: {
          liked: nextLiked,
          count: Math.max(0, current.count + (nextLiked ? 1 : -1)),
        },
      };
    });
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
      <div className="lg:col-span-3 space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 w-full">
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#A3E635] flex-shrink-0" />
          <h3 className="text-base sm:text-xl font-bold text-white flex items-center gap-2 w-full">
            School Updates
          </h3>
        </div>

        {updatesLoading ? (
          <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 text-white/70 text-sm sm:text-base">
            Loading school updates...
          </div>
        ) : updatesError ? (
          <div className="rounded-xl sm:rounded-2xl border border-red-400/20 bg-red-500/10 p-4 sm:p-6 text-red-100 text-sm sm:text-base">
            {updatesError}
          </div>
        ) : schoolUpdates.length === 0 ? (
          <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 text-white/70 text-sm sm:text-base">
            No school updates available.
          </div>
        ) : (
          <div className="space-y-4 max-h-[680px] overflow-y-auto no-scrollbar pr-1">
            {schoolUpdates.map((event) => (
              <article
                key={event.id}
                className="overflow-hidden rounded-xl sm:rounded-2xl bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] border-solid shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)]"
              >
                <header className="flex items-center justify-between px-4 py-4 sm:px-5 sm:py-5 border-b border-white/10 gap-2">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={event.photo || "https://i.pravatar.cc/120?img=11"}
                      alt={event.teacher?.name ?? "School"}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl object-cover border border-white/[0.1] flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-white text-base sm:text-xl leading-tight truncate">
                        {event.teacher?.name || "School Admin"}
                      </h4>
                      <p className="text-sm text-[rgb(204,213,238)] mt-0.5 truncate">
                        {event.type || "Event"} -{" "}
                        {formatRelativeTime(event.eventDate || event.createdAt || new Date().toISOString())}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-white/[0.05] rounded-lg transition-all text-gray-400 hover:text-white flex-shrink-0">
                    <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5 text-white/50" />
                  </button>
                </header>

                <div className="px-4 py-4 sm:px-5 sm:py-5">
                  <h5 className="font-bold text-white text-2xl sm:text-3xl leading-tight mb-2 line-clamp-2">
                    {event.title}
                  </h5>
                  <p className="text-gray-300 text-base sm:text-lg leading-relaxed line-clamp-3">
                    {event.description || "Stay updated with this school event."}
                  </p>
                  <span className="mt-4 inline-block rounded-full border border-[#A3E635]/25 bg-[#A3E635]/10 px-4 py-1 text-sm font-bold uppercase tracking-wide text-[#A3E635]">
                    EVENT
                  </span>

                  {event.photo && (
                    <div className="mt-4 overflow-hidden rounded-[24px] border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={event.photo}
                        alt={event.title}
                        className="aspect-[16/8.8] w-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="border-t border-white/10 px-4 sm:px-5 py-3 text-white/75 text-sm">
                  <span className="font-semibold">{likesState[event.id]?.count ?? 0} likes</span>
                </div>

                <footer className="border-t border-white/10 px-4 sm:px-5 py-3">
                  <button
                    type="button"
                    onClick={() => handleLike(event.id)}
                    aria-pressed={Boolean(likesState[event.id]?.liked)}
                    className={`flex items-center gap-2 text-lg font-semibold transition ${
                      likesState[event.id]?.liked ? "text-red-300" : "text-white/70 hover:text-white"
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        likesState[event.id]?.liked ? "fill-red-400 text-red-400" : ""
                      }`}
                    />
                    {likesState[event.id]?.liked ? "Liked" : "Like"}
                  </button>
                </footer>
              </article>
            ))}
          </div>
        )}
      </div>

      <aside className="bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] border-solid rounded-xl sm:rounded-2xl shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-4 sm:p-5 h-full flex flex-col">
        <h4 className="font-bold text-white text-base sm:text-lg mb-3 sm:mb-4 flex items-center gap-2 w-full min-h-[32px]">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-lime-400 flex-shrink-0" />
          Upcoming Events
        </h4>
        <div className="space-y-3 sm:space-y-4 flex-1 max-h-[520px] overflow-y-auto no-scrollbar pr-1">
          {events.slice(0, 4).map((event) => {
            const badge = formatEventBadge(event.eventDate);
            return (
              <div
                key={event.id}
                className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] transition-colors"
              >
                <div className="p-1.5 sm:p-2 bg-[#A3E635]/10 rounded-lg text-[#A3E635] font-bold text-xs text-center min-w-[2.5rem] sm:min-w-[3rem] flex-shrink-0">
                  <p className="text-xs">{badge.top}</p>
                  <p className="text-xs">{badge.bottom}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="font-semibold text-gray-200 text-xs sm:text-sm truncate">{event.title}</h5>
                  <p className="text-[11px] sm:text-xs text-[rgb(204,213,238)]">{event.type || "Event"}</p>
                </div>
              </div>
            );
          })}
          {events.length === 0 && <p className="text-white/65 text-lg">No upcoming events.</p>}
        </div>
      </aside>
    </section>
  );
}

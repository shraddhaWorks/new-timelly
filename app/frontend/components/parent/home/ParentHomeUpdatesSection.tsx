"use client";

import { Calendar, MessageCircle, MoreHorizontal } from "lucide-react";
import { formatRelativeTime } from "../../../utils/format";
import { ParentEvent, ParentFeed } from "./types";

type Props = {
  feeds: ParentFeed[];
  events: ParentEvent[];
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

export default function ParentHomeUpdatesSection({ feeds, events }: Props) {
  const latestFeed = feeds[0] ?? null;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="w-5 h-5 text-[#A3E635]" />
          <h3 className="text-xl font-bold text-white flex items-center gap-2">School Updates</h3>
        </div>

        {!latestFeed ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            No school updates available.
          </div>
        ) : (
          <article className="bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] border-solid 
          rounded-2xl shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] overflow-hidden">
            <header className="flex items-center justify-between p-5 border-b border-white/[0.05]">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={latestFeed.photo || "https://i.pravatar.cc/120?img=11"}
                  alt={latestFeed.createdBy?.name ?? "School"}
                  className="w-12 h-12 rounded-xl object-cover border border-white/[0.1]"
                />
                <div>
                  <h4 className="font-semibold text-white text-base">
                    {latestFeed.createdBy?.name || "School Admin"}
                  </h4>
                  <p className="text-xs text-[rgb(204,213,238)] mt-0.5">
                    {formatRelativeTime(latestFeed.createdAt)}
                  </p>
                </div>
              </div>
             <button className="p-2 hover:bg-white/[0.05] rounded-lg transition-all text-gray-400 hover:text-white"><MoreHorizontal className="h-5 w-5 text-white/50" /></button>
            </header>

            <div className="px-5 py-4">
              <h5 className="font-bold text-white text-lg mb-2">{latestFeed.title}</h5>
              <p className="text-gray-300 text-sm leading-relaxed">{latestFeed.description}</p>
              <span className="inline-block px-3 py-1 rounded-lg text-xs
               font-semibold bg-[#A3E635]/10 text-[#A3E635] border border-[#A3E635]/20 uppercase tracking-wide mb-2 mt-2">
                EVENT
              </span>
              {latestFeed.photo && (
                <div className="rounded-xl overflow-hidden border border-white/[0.05]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={latestFeed.photo}
                    alt={latestFeed.title}
                    className="w-full aspect-video object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
            </div>

            <footer className="border-t border-white/10 px-6 py-4 text-white/70 text-xl">
              {latestFeed.likes ?? 0} likes
            </footer>
          </article>
        )}
      </div>

      <aside className="bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] border-solid rounded-2xl shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-5">
        <h4 className="font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-lime-400" />
          Upcoming Events
        </h4>
        <div className="space-y-4">
          {events.slice(0, 3).map((event) => {
            const badge = formatEventBadge(event.eventDate);
            return (
              <div
                key={event.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] transition-colors"
              >
                <div className="p-2 bg-[#A3E635]/10 rounded-lg text-[#A3E635] font-bold text-xs text-center min-w-[3rem]">
                  <p className="text-xs">{badge.top}</p>
                  <p className="text-xs">{badge.bottom}</p>
                </div>
                <div className="min-w-0">
                  <h5 className="font-semibold text-gray-200 text-sm">{event.title}</h5>
                  <p className="text-xs text-[rgb(204,213,238)]">{event.type || "Event"}</p>
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

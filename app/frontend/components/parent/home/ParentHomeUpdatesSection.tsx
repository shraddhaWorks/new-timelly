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
    <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="h-7 w-7 text-lime-400" />
          <h3 className="text-4xl md:text-5xl font-bold text-white">School Updates</h3>
        </div>

        {!latestFeed ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            No school updates available.
          </div>
        ) : (
          <article className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
            <header className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={latestFeed.photo || "https://i.pravatar.cc/120?img=11"}
                  alt={latestFeed.createdBy?.name ?? "School"}
                  className="h-16 w-16 rounded-full object-cover border border-white/20"
                />
                <div>
                  <h4 className="text-3xl md:text-4xl font-bold text-white">
                    {latestFeed.createdBy?.name || "School Admin"}
                  </h4>
                  <p className="text-white/65 text-xl">
                    {formatRelativeTime(latestFeed.createdAt)}
                  </p>
                </div>
              </div>
              <MoreHorizontal className="h-6 w-6 text-white/50" />
            </header>

            <div className="p-6 space-y-5">
              <h5 className="text-3xl md:text-4xl font-bold text-white leading-tight">{latestFeed.title}</h5>
              <p className="text-xl md:text-2xl text-white/75 leading-relaxed">{latestFeed.description}</p>
              <span className="inline-flex rounded-full border border-lime-400/20 bg-lime-400/10 px-5 py-2 text-lg font-semibold text-lime-300">
                EVENT
              </span>
              {latestFeed.photo && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={latestFeed.photo}
                    alt={latestFeed.title}
                    className="w-full h-[340px] object-cover rounded-[2rem] border border-white/10"
                  />
                </>
              )}
            </div>

            <footer className="border-t border-white/10 px-6 py-4 text-white/70 text-xl">
              {latestFeed.likes ?? 0} likes
            </footer>
          </article>
        )}
      </div>

      <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 h-fit">
        <h4 className="text-4xl md:text-5xl font-bold text-white flex items-center gap-3">
          <Calendar className="h-8 w-8 text-lime-400" />
          Upcoming Events
        </h4>
        <div className="mt-5 space-y-4">
          {events.slice(0, 3).map((event) => {
            const badge = formatEventBadge(event.eventDate);
            return (
              <div
                key={event.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-4"
              >
                <div className="min-w-[86px] rounded-3xl bg-lime-400/15 px-3 py-2 text-center text-lime-300">
                  <p className="text-2xl font-bold">{badge.top}</p>
                  <p className="text-3xl font-bold leading-tight">{badge.bottom}</p>
                </div>
                <div className="min-w-0">
                  <h5 className="text-3xl font-bold text-white truncate">{event.title}</h5>
                  <p className="text-xl text-white/70">{event.type || "Event"}</p>
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

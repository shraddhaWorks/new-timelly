"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle, List, Search, Users } from "lucide-react";
import PageHeader from "../../common/PageHeader";
import EventCard from "../../schooladmin/workshops/EventCard";
import EventDetailsModal from "../../schooladmin/workshops/EventDetailsModal";
import Spinner from "../../common/Spinner";

interface EventItem {
  id: string;
  title: string;
  description?: string | null;
  eventDate?: string | null;
  location?: string | null;
  mode?: string | null;
  additionalInfo?: string | null;
  photo?: string | null;
  teacher?: { name?: string | null; email?: string | null; photoUrl?: string | null } | null;
  _count?: { registrations: number };
}

function StatTile({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow backdrop-blur-xl">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-white/10 flex items-center justify-center text-lime-300">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wide text-white/60">{title}</div>
          <div className="text-lg font-semibold text-white truncate">{value}</div>
        </div>
      </div>
    </div>
  );
}

export default function ParentWorkshopsTab() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [eventDetails, setEventDetails] = useState<EventItem | null>(null);

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      setEventsError(null);
      const res = await fetch("/api/events/list");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load workshops");
      setEvents(Array.isArray(data?.events) ? data.events : []);
    } catch (err: any) {
      setEventsError(err?.message || "Failed to load workshops");
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!detailsOpen || !selectedEventId) return;

    const controller = new AbortController();
    const fetchDetails = async () => {
      try {
        setDetailsLoading(true);
        setDetailsError(null);
        const res = await fetch(`/api/events/create/${selectedEventId}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to load event details");
        setEventDetails(data?.event ?? null);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        setDetailsError(err?.message || "Failed to load event details");
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchDetails();
    return () => controller.abort();
  }, [detailsOpen, selectedEventId]);

  const filteredEvents = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return events;
    return events.filter((event) =>
      [event.title, event.description, event.teacher?.name, event.location, event.mode]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [events, query]);

  const stats = useMemo(() => {
    const now = Date.now();
    const upcoming = events.filter((event) => {
      if (!event.eventDate) return false;
      const time = new Date(event.eventDate).getTime();
      return !Number.isNaN(time) && time >= now;
    }).length;

    const completed = events.filter((event) => {
      if (!event.eventDate) return false;
      const time = new Date(event.eventDate).getTime();
      return !Number.isNaN(time) && time < now;
    }).length;

    const participants = events.reduce(
      (sum, event) => sum + (event._count?.registrations ?? 0),
      0
    );

    return { total: events.length, upcoming, completed, participants };
  }, [events]);

  return (
    <div className="overflow-x-hidden">
      <div className="relative px-3 sm:px-4 lg:px-8 py-4 max-w-7xl mx-auto space-y-6 pb-8 text-white">
        <PageHeader
          title="Workshops & Events"
          subtitle="Manage and conduct workshops for students"
          rightSlot={
            <div className="relative w-full md:w-[320px] min-w-0">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-lime-400/40"
              />
            </div>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 min-w-0">
          <StatTile title="TOTAL" value={`${stats.total}`} icon={<List size={20} />} />
          <StatTile title="UPCOMING" value={`${stats.upcoming}`} icon={<CalendarDays size={20} />} />
          <StatTile title="PARTICIPANTS" value={`${stats.participants}`} icon={<Users size={20} />} />
          <StatTile title="COMPLETED" value={`${stats.completed}`} icon={<CheckCircle size={20} />} />
        </div>

        {loadingEvents && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70 text-center">
            <Spinner />
          </div>
        )}

        {eventsError && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {eventsError}
          </div>
        )}

        {!loadingEvents && !eventsError && filteredEvents.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/50">
            No workshops found.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 min-w-0">
          {filteredEvents.map((event) => {
            const dateValue = event.eventDate ? new Date(event.eventDate) : null;
            const status =
              dateValue && !Number.isNaN(dateValue.getTime()) && dateValue.getTime() < Date.now()
                ? "completed"
                : "upcoming";

            return (
              <EventCard
                key={event.id}
                title={event.title}
                description={event.description}
                eventDate={event.eventDate}
                location={event.location}
                mode={event.mode}
                registrations={event._count?.registrations ?? 0}
                teacherName={event.teacher?.name ?? ""}
                status={status}
                photo={event.photo}
                additionalInfo={event.additionalInfo}
                showActions={false}
                onViewDetails={() => {
                  setSelectedEventId(event.id);
                  setDetailsOpen(true);
                }}
              />
            );
          })}
        </div>

        <EventDetailsModal
          open={detailsOpen}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedEventId(null);
            setEventDetails(null);
            setDetailsError(null);
          }}
          loading={detailsLoading}
          error={detailsError}
          event={eventDetails}
        />
      </div>
    </div>
  );
}

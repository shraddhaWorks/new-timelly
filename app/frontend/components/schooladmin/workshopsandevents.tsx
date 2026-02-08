"use client";

import HeaderActionButton from "../common/HeaderActionButton";
import PageHeader from "../common/PageHeader";
import CreateHub from "./workshops/CreateHub";
import CreateEventForm from "./workshops/CreateEventForm";
import EventCard from "./workshops/EventCard";
import { CalendarDays, CheckCircle, List, Plus, Users, X } from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";

interface EventItem {
  id: string;
  title: string;
  description?: string | null;
  eventDate?: string | null;
  location?: string | null;
  mode?: string | null;
  additionalInfo?: string | null;
  teacher?: { name?: string | null } | null;
  photo?: string | null;
  _count?: { registrations: number };
}

export default function WorkshopsAndEventsTab() {
  const [activeAction, setActiveAction] = useState<"workshop" | "none">("none");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      setEventsError(null);
      const res = await fetch("/api/events/list");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to load events");
      }
      setEvents(Array.isArray(data?.events) ? data.events : []);
    } catch (err: any) {
      setEventsError(err?.message || "Failed to load events");
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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

    return {
      total: events.length,
      upcoming,
      completed,
      participants,
    };
  }, [events]);

  const StatTile = ({
    title,
    value,
    icon,
  }: {
    title: string;
    value: string;
    icon: ReactNode;
  }) => (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 md:px-5 md:py-4 shadow-lg backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-lime-400">
          {icon}
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-white/60">
            {title}
          </div>
          <div className="text-2xl font-semibold text-white">{value}</div>
        </div>
      </div>
    </div>
  );

  const renderButton = (
    type: "workshop",
    Icon: any,
    label: string,
    onClick: () => void,
    primary?: boolean
  ) => {
    const isActive = type === "workshop" && activeAction === "workshop";

    const effectiveLabel = isActive ? "Cancel" : label;
    const EffectiveIcon = isActive ? X : Icon;
    const effectivePrimary = isActive ? false : primary;
    const effectiveOnClick = isActive ? () => setActiveAction("none") : onClick;

    const cancelButton = (
      <button
        onClick={effectiveOnClick}
        className="inline-flex items-center gap-2 rounded-full bg-lime-400 px-5 py-2 text-sm font-semibold text-black shadow-[0_6px_18px_rgba(163,230,53,0.35)] hover:bg-lime-300 transition cursor-pointer"
      >
        <X size={16} />
        <span>Cancel</span>
      </button>
    );

    return (
      <>
        {/* MOBILE */}
        <div className="xl:hidden">
          {isActive ? (
            cancelButton
          ) : (
            <button
              onClick={effectiveOnClick}
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
            >
              <Icon size={18} />
            </button>
          )}
        </div>

        {/* DESKTOP */}
        <div className="hidden xl:block">
          {isActive ? (
            cancelButton
          ) : (
            <HeaderActionButton
              icon={EffectiveIcon}
              label={effectiveLabel}
              primary={effectivePrimary}
              onClick={effectiveOnClick}
            />
          )}
        </div>
      </>
    );
  };

  return (
    <div className="px-4 md:px-6 pb-24 lg:pb-6 text-gray-200">
      <div className="w-full space-y-6">
        <PageHeader
          title="Workshops & Events"
          subtitle="Plan, manage, and issue certificates for workshops and events"
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/10 shadow-lg flex flex-col xl:flex-row xl:items-center justify-between gap-4"
          rightSlot={
            <div className="w-full xl:w-auto">
              <div className="flex flex-wrap gap-2 sm:gap-3 xl:justify-end">
                {renderButton(
                  "workshop",
                  Plus,
                  "Create Event",
                  () => setActiveAction("workshop"),
                  true
                )}
              </div>
            </div>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile title="TOTAL" value={`${stats.total}`} icon={<List size={24} />} />
          <StatTile title="UPCOMING" value={`${stats.upcoming}`} icon={<CalendarDays size={24} />} />
          <StatTile title="PARTICIPANTS" value={`${stats.participants}`} icon={<Users size={24} />} />
          <StatTile title="COMPLETED" value={`${stats.completed}`} icon={<CheckCircle size={24} />} />
        </div>

        <CreateHub events={events} />

        {activeAction === "workshop" && (
          <CreateEventForm
            onCancel={() => setActiveAction("none")}
            onCreated={fetchEvents}
          />
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Workshops & Events
            </h3>
            {loadingEvents && (
              <span className="text-xs text-white/50">Loading...</span>
            )}
          </div>

          {eventsError && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {eventsError}
            </div>
          )}

          {!loadingEvents && events.length === 0 && !eventsError && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/50">
              No workshops or events yet. Create one above.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {events.map((event) => {
              const dateValue = event.eventDate ? new Date(event.eventDate) : null;
              const status = dateValue && !Number.isNaN(dateValue.getTime())
                ? dateValue.getTime() >= Date.now()
                  ? "upcoming"
                  : "completed"
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
                />
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

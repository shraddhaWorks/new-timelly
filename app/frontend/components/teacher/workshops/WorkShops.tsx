"use client";

import PageHeader from "../../common/PageHeader";
import CreateEventForm from "../../schooladmin/workshops/CreateEventForm";
import EventCard from "../../schooladmin/workshops/EventCard";
import DeleteEventModal from "../../schooladmin/workshops/DeleteEventModal";
import {
  CalendarDays,
  CheckCircle,
  List,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";

interface EventItem {
  id: string;
  title: string;
  description?: string | null;
  eventDate?: string | null;
  location?: string | null;
  mode?: string | null;
  additionalInfo?: string | null;
  photo?: string | null;
  _count?: { registrations: number };
}

export default function TeacherWorkshopsTab() {
  const [activeAction, setActiveAction] = useState<"workshop" | "none">("none");
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const formRef = useRef<HTMLDivElement | null>(null);

  /* ================= FETCH EVENTS ================= */
  const fetchTeacherEvents = async () => {
    try {
      setLoadingEvents(true);
      const res = await fetch("/api/events/list?scope=teacher");
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to load events");
      setEvents(Array.isArray(data?.events) ? data.events : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchTeacherEvents();
  }, []);

  useEffect(() => {
    if (activeAction !== "workshop") return;
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }, [activeAction]);

  /* ================= STATS ================= */
  const StatTile = ({
    title,
    value,
    icon,
  }: {
    title: string;
    value: string;
    icon: ReactNode;
  }) => (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow backdrop-blur-xl">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-white/10 flex items-center justify-center text-lime-300">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wide text-white/60">
            {title}
          </div>
          <div className="text-lg font-semibold text-white truncate">
            {value}
          </div>
        </div>
      </div>
    </div>
  );

  const upcoming = events.filter(
    (e) => e.eventDate && new Date(e.eventDate).getTime() >= Date.now()
  ).length;

  const completed = events.filter(
    (e) => e.eventDate && new Date(e.eventDate).getTime() < Date.now()
  ).length;

  const participants = events.reduce(
    (sum, e) => sum + (e._count?.registrations ?? 0),
    0
  );

  return (
    <div className="overflow-x-hidden">
      <div className="relative px-3 sm:px-4 lg:px-8 py-4 max-w-7xl mx-auto space-y-6 pb-28 text-white">

        {/* ================= HEADER ================= */}
        <PageHeader
          title="Workshops & Events"
          subtitle="Manage and conduct workshops for students"
          rightSlot={
            <div className="hidden lg:flex items-center gap-3 min-w-0">
              <div className="relative w-[260px] min-w-0">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                />
                <input
                  placeholder="Search..."
                  className="w-full h-11 pl-11 pr-4 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-lime-400/40"
                />
              </div>

              <button
                onClick={() =>
                  setActiveAction(activeAction === "workshop" ? "none" : "workshop")
                }
                className="shrink-0 flex items-center gap-2 h-11 px-6 rounded-full bg-lime-400 text-black font-semibold hover:bg-lime-300 transition"
              >
                {activeAction === "workshop" ? <X size={18} /> : <Plus size={18} />}
                {activeAction === "workshop" ? "Cancel" : "Create New Event"}
              </button>
            </div>
          }
        />

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 min-w-0">
          <StatTile title="TOTAL" value={`${events.length}`} icon={<List size={20} />} />
          <StatTile title="UPCOMING" value={`${upcoming}`} icon={<CalendarDays size={20} />} />
          <StatTile title="PARTICIPANTS" value={`${participants}`} icon={<Users size={20} />} />
          <StatTile title="COMPLETED" value={`${completed}`} icon={<CheckCircle size={20} />} />
        </div>

        {/* ================= FORM ================= */}
        {activeAction === "workshop" && (
          <div ref={formRef} className="min-w-0">
            <CreateEventForm
              className="mb-6"
              initialEvent={editingEvent}
              onCancel={() => {
                setActiveAction("none");
                setEditingEvent(null);
              }}
              onCreated={async () => {
                await fetchTeacherEvents();
                setActiveAction("none");
              }}
            />
          </div>
        )}

        {/* ================= EVENTS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 min-w-0">
          {events.map((event) => {
            const upcoming =
              event.eventDate &&
              new Date(event.eventDate).getTime() >= Date.now();

            return (
              <EventCard
                key={event.id}
                title={event.title}
                description={event.description}
                eventDate={event.eventDate}
                location={event.location}
                mode={event.mode}
                registrations={event._count?.registrations ?? 0}
                status={upcoming ? "upcoming" : "completed"}
                photo={event.photo}
                additionalInfo={event.additionalInfo}
                onViewDetails={() => {}}
                onEdit={() => {
                  setEditingEvent(event);
                  setActiveAction("workshop");
                }}
                onDelete={() => setDeleteTarget(event)}
              />
            );
          })}
        </div>

        {/* ================= MOBILE CTA ================= */}
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
          <button
            onClick={() =>
              setActiveAction(activeAction === "workshop" ? "none" : "workshop")
            }
            className="w-full h-12 rounded-full bg-lime-400 text-black font-semibold shadow-lg flex items-center justify-center gap-2"
          >
            {activeAction === "workshop" ? <X size={18} /> : <Plus size={18} />}
            {activeAction === "workshop" ? "Cancel" : "Create Event"}
          </button>
        </div>

        {/* ================= DELETE MODAL ================= */}
        <DeleteEventModal
          open={Boolean(deleteTarget)}
          title={deleteTarget?.title}
          loading={deleteLoading}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async () => {
            if (!deleteTarget) return;
            try {
              setDeleteLoading(true);
              await fetch(`/api/events/${deleteTarget.id}`, { method: "DELETE" });
              setDeleteTarget(null);
              fetchTeacherEvents();
            } finally {
              setDeleteLoading(false);
            }
          }}
        />
      </div>
    </div>
  );
}

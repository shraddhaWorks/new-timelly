"use client";

import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Info,
  X,
} from "lucide-react";
import { AVATAR_URL } from "../../../constants/images";

interface EventDetailsModalProps {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
  event?: {
    id: string;
    title: string;
    description?: string | null;
    eventDate?: string | null;
    location?: string | null;
    mode?: string | null;
    type?: string | null;
    level?: string | null;
    additionalInfo?: string | null;
    photo?: string | null;
    teacher?: { name?: string | null; email?: string | null; photoUrl?: string | null } | null;
    _count?: { registrations: number };
  } | null;
}

function formatDate(dateString?: string | null) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateString?: string | null) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function EventDetailsModal({
  open,
  onClose,
  loading,
  error,
  event,
}: EventDetailsModalProps) {
  if (!open) return null;

  const isUpcoming = event?.eventDate
    ? new Date(event.eventDate).getTime() >= Date.now()
    : true;
  const statusLabel = isUpcoming ? "Upcoming" : "Completed";
  const instructorImage =
    event?.teacher?.photoUrl && event.teacher.photoUrl.trim() !== ""
      ? event.teacher.photoUrl
      : AVATAR_URL;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-[94vw] sm:max-w-2xl lg:max-w-5xl bg-[#0F172A] border border-gray-400/30 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden animate-fadeIn">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-white/60 hover:text-white transition cursor-pointer"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 pr-10">
          <h3 className="text-lg sm:text-2xl font-semibold text-white">
            {event?.title || "Event Details"}
          </h3>
          <span className="inline-flex items-center rounded-full bg-lime-400/20 px-3 py-1 text-xs font-semibold text-lime-300">
            {statusLabel}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] sm:text-sm text-white/70">
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="text-lime-300" />
            <span>{formatDate(event?.eventDate) || "Date"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-lime-300" />
            <span>{formatTime(event?.eventDate) || "Time"}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-lime-300" />
            <span className="truncate">{event?.location || "Location"}</span>
          </div>
        </div>

        <div className="mt-4 max-h-[72vh] overflow-y-auto pr-1 sm:pr-2 no-scrollbar">
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/60">
              Loading event details...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-4 text-sm text-red-300">
              {error}
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                {event?.photo ? (
                  <img
                    src={event.photo}
                    alt={event?.title || "Event"}
                    className="h-48 sm:h-60 w-full object-cover"
                  />
                ) : (
                  <div className="h-48 sm:h-60 w-full bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#0b1220]" />
                )}
              </div>

              <div className="mt-5 sm:mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2 space-y-5">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 sm:px-5 sm:py-4">
                    <div className="flex items-center gap-2 text-white font-semibold">
                      <span className="h-6 w-6 rounded-full text-lime-300 flex items-center justify-center">
                        <Info size={18} />
                      </span>
                      About the Event
                    </div>
                    <p className="mt-3 text-sm text-white/70 leading-relaxed">
                      {event?.description || "No description available."}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 sm:px-5 sm:py-4">
                    <div className="text-sm font-semibold text-white">
                      Additional Information
                    </div>
                    <p className="mt-2 text-gray-400 text-sm italic leading-relaxed">
                      {event?.additionalInfo || "No additional information provided."}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 sm:px-5 sm:py-4">
                    <div className="text-xs uppercase tracking-wide text-white/50">
                      Instructor
                    </div>
                  <div className="mt-3 flex items-center gap-3">
                      <img
                        src={instructorImage}
                        alt={event?.teacher?.name || "Instructor"}
                        className="h-12 w-12 rounded-full border border-white/10 object-cover"
                      />
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {event?.teacher?.name || "Not assigned"}
                        </div>
                        <div className="text-xs text-lime-300">
                          {event?.teacher?.email || "Instructor"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 sm:px-5 sm:py-4">
                    <div className="text-xs uppercase tracking-wide text-white/50">
                      Event Stats
                    </div>
                    <div className="mt-3 space-y-3 text-sm text-white/70">
                      <div className="flex items-center justify-between">
                        <span>Total Seats</span>
                        <span className="text-white">50</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Enrolled</span>
                        <span className="text-lime-300">45</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full w-[90%] rounded-full bg-lime-400" />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span>Fee</span>
                        <span className="text-white">Free</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

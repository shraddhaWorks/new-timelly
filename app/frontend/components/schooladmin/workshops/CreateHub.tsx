"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, Send, Award } from "lucide-react";
import TimellyModernCard from "./themes/TimellyModernCard";
import ClassicGoldCard from "./themes/ClassicGoldCard";
import CreativeSparkCard from "./themes/CreativeSparkCard";
import SuccessPopup from "./SuccessPopup";

type ThemeKey = "timelly-modern" | "classic-gold" | "creative-spark";

interface HubEvent {
  id: string;
  title: string;
  eventDate?: string | null;
  _count?: { registrations: number };
}

interface CreateHubProps {
  events: HubEvent[];
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

export default function CreateHub({ events }: CreateHubProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>("timelly-modern");
  const [showPopup, setShowPopup] = useState(false);
  const [popupStage, setPopupStage] = useState<"generating" | "done">(
    "generating"
  );

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId]
  );

  const themeLabel = useMemo(() => {
    if (selectedTheme === "classic-gold") return "Classic Gold";
    if (selectedTheme === "creative-spark") return "Creative Spark";
    return "Timelly Modern";
  }, [selectedTheme]);

  useEffect(() => {
    if (!showPopup) return;
    setPopupStage("generating");
    const doneTimer = setTimeout(() => setPopupStage("done"), 1400);
    const closeTimer = setTimeout(() => setShowPopup(false), 2600);
    return () => {
      clearTimeout(doneTimer);
      clearTimeout(closeTimer);
    };
  }, [showPopup]);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 md:p-8 backdrop-blur-xl shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center text-lime-400">
            <Award size={24} />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-white">
              Certificate Hub
            </h3>
            <p className="text-sm text-white/60">
              Select an event to bulk issue certificates to all participants
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <div>
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              1. Select Event
            </div>
            <div className="text-xs text-lime-300 border border-lime-400/30 bg-lime-400/10 px-3 py-1 rounded-full">
              {events.length} Events
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {events.map((event) => {
              const isSelected = event.id === selectedEventId;
              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => setSelectedEventId(event.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                    isSelected
                      ? "border-lime-400/70 bg-white/10"
                      : "border-white/10 bg-black/20 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center text-sm font-semibold ${
                        isSelected
                          ? "bg-lime-400 text-black"
                          : "bg-white/10 text-white/50"
                      }`}
                    >
                      {event.title?.[0] ?? "E"}
                    </div>
                    <div className="flex-1">
                      <div
                        className={`font-medium ${
                          isSelected ? "text-white" : "text-white/50"
                        }`}
                      >
                        {event.title}
                      </div>
                      <div
                        className={`text-xs ${
                          isSelected ? "text-white/60" : "text-white/40"
                        }`}
                      >
                        {formatDate(event.eventDate) || "Date"}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 size={18} className="text-lime-300" />
                    )}
                  </div>
                </button>
              );
            })}
            {events.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-6 text-sm text-white/50">
                No events yet. Create one to get started.
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
            2. Select Certificate Theme
          </div>

          {!selectedEvent && (
            <div className="mt-4 rounded-2xl border border-dashed border-white/20 bg-white/5 min-h-[220px] flex items-center justify-center text-white/40">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <ChevronRight className="lucide lucide-chevron-right w-6 h-6 text-gray-600" />
                </div>
                <span>Please select an event from the list to continue</span>
              </div>
            </div>
          )}

          {selectedEvent && (
            <div className="mt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TimellyModernCard
                  selected={selectedTheme === "timelly-modern"}
                  onSelect={() => setSelectedTheme("timelly-modern")}
                />
                <ClassicGoldCard
                  selected={selectedTheme === "classic-gold"}
                  onSelect={() => setSelectedTheme("classic-gold")}
                />
                <CreativeSparkCard
                  selected={selectedTheme === "creative-spark"}
                  onSelect={() => setSelectedTheme("creative-spark")}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPopup(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-lime-400 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-lime-400/30 hover:bg-lime-300 transition"
                >
                  <Send size={16} />
                  Send Certificates to {selectedEvent._count?.registrations ?? 0} Participants
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <SuccessPopup
        open={showPopup}
        title={
          popupStage === "done"
            ? "Generated Certificates Successfully"
            : "Generating Certificates..."
        }
        description={
          popupStage === "done"
            ? `${selectedEvent?._count?.registrations ?? 0} students updated`
            : `Applying ${themeLabel} Theme`
        }
        onClose={() => setShowPopup(false)}
      />
    </section>
  );
}

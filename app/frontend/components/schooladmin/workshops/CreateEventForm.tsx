"use client";

import { useEffect, useRef, useState } from "react";
import { X, Image as ImageIcon, SquarePen, Save, Trash2, Loader2 } from "lucide-react";
import SearchInput from "../../common/SearchInput";
import EventSelectField from "./EventSelectField";
import SuccessPopup from "./SuccessPopup";
import { uploadImage } from "../../../utils/upload";

const eventTypeOptions = [
  { id: "workshop", name: "Workshop" },
  { id: "seminar", name: "Seminar" },
  { id: "competition", name: "Competition" },
  { id: "webinar", name: "Webinar" },
  { id: "event", name: "Events" },
];

const difficultyOptions = [
  { id: "beginner", name: "Beginner" },
  { id: "intermediate", name: "Intermediate" },
  { id: "advanced", name: "Advanced" },
  { id: "alllevels", name: "All Levels" },
];

const modeOptions = [
  { id: "offline", name: "Offline" },
  { id: "online", name: "Online" },
  { id: "hybrid", name: "Hybrid" },
];

interface CreateEventFormProps {
  onCancel?: () => void;
  onCreated?: () => void;
  initialEvent?: {
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
  } | null;
}

export default function CreateEventForm({
  onCancel,
  onCreated,
  initialEvent,
}: CreateEventFormProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [mode, setMode] = useState("");
  const [description, setDescription] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isEditing = Boolean(initialEvent?.id);

  const toDateInputValue = (value?: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-CA");
  };

  const toTimeInputValue = (value?: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  useEffect(() => {
    if (!initialEvent) return;
    setTitle(initialEvent.title ?? "");
    setDescription(initialEvent.description ?? "");
    setType(initialEvent.type ?? "");
    setDifficulty(initialEvent.level ?? "");
    setLocation(initialEvent.location ?? "");
    setMode(initialEvent.mode ?? "");
    setAdditionalInfo(initialEvent.additionalInfo ?? "");
    setDate(toDateInputValue(initialEvent.eventDate));
    setTime(toTimeInputValue(initialEvent.eventDate));
    setPhotoFile(null);
    setPhotoDataUrl(initialEvent.photo ?? null);
  }, [initialEvent]);

  useEffect(() => {
    if (!showSuccess) return;
    const timer = setTimeout(() => {
      setShowSuccess(false);
      onCancel?.();
    }, 1800);
    return () => clearTimeout(timer);
  }, [showSuccess, onCancel]);

  const handlePublish = async () => {
    setError(null);

    if (!title || !description || !type || !difficulty || !location || !mode || !additionalInfo) {
      setError("Please fill all required fields before publishing.");
      return;
    }

    const eventDate =
      date && time
        ? new Date(`${date}T${time}:00`).toISOString()
        : date
          ? new Date(`${date}T00:00:00`).toISOString()
          : null;

    try {
      setSubmitting(true);
      const res = await fetch(isEditing ? `/api/events/${initialEvent?.id}` : "/api/events/create", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          type,
          level: difficulty,
          location,
          mode,
          additionalInfo,
          eventDate,
          photo: photoDataUrl || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to create event");
      }

      if (!isEditing) {
        setTitle("");
        setDate("");
        setTime("");
        setLocation("");
        setType("");
        setDifficulty("");
        setMode("");
        setDescription("");
        setAdditionalInfo("");
        setPhotoFile(null);
        setPhotoDataUrl(null);
      }

      onCreated?.();
      const selectedLabel =
        eventTypeOptions.find((opt) => opt.id === type)?.name ?? "Event";
      const normalizedLabel =
        selectedLabel.toLowerCase() === "events" ? "Event" : selectedLabel;
      setSuccessTitle(
        isEditing
          ? `${normalizedLabel} updated successfully`
          : `${normalizedLabel} created successfully`
      );
      setShowSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-[#0F172A] border border-lime-400/30 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden animate-fadeIn">
      <SuccessPopup
        open={showSuccess}
        title={successTitle}
        description="Your event is now available in the list."
        onClose={() => {
          setShowSuccess(false);
          onCancel?.();
        }}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-xl text-lime-300 flex items-center justify-center">
            <SquarePen size={20} />
          </span>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-white">
              {isEditing ? "Edit Event" : "Create New Event"}
            </h3>
            <p className="text-xs sm:text-sm text-white/50">
              {isEditing
                ? "Update event details, schedule, and media"
                : "Add event details, schedule, and media"}
            </p>
          </div>
        </div>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="text-white/60 hover:text-white cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      <div className="mt-5 sm:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7">
        <div className="space-y-5">
          <div className="text-xs font-bold text-white/50 uppercase tracking-wider">
            Basic Details
          </div>

          <SearchInput
            label="Event Title"
            placeholder="e.g. Science Fair 2026"
            value={title}
            onChange={setTitle}
            variant="glass"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EventSelectField
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={eventTypeOptions}
              placeholder="Select type"
            />
            <EventSelectField
              label="Difficulty Level"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              options={difficultyOptions}
              placeholder="Select level"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm mb-1 text-white/70">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the event..."
              rows={4}
              className="w-full rounded-xl bg-black/30 border border-white/20 text-sm text-white placeholder-white/40 px-4 py-3 focus:outline-none focus:ring-0 focus:border-lime-400/60 no-scrollbar"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm mb-1 text-white/70">
              Additional Info / Certificates
            </label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Details about certificates, prerequisites, or special instructions..."
              rows={4}
              className="w-full rounded-xl bg-black/30 border border-white/20 text-sm text-white placeholder-white/40 px-4 py-3 focus:outline-none focus:ring-0 focus:border-lime-400/60 no-scrollbar"
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="text-xs font-bold text-white/50 uppercase tracking-wider">
            Schedule & Media
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SearchInput
              label="Date"
              placeholder="YYYY-MM-DD"
              value={date}
              onChange={setDate}
              variant="glass"
              type="date"
              inputClassName="[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-90"
            />
            <SearchInput
              label="Time"
              placeholder="HH:MM"
              value={time}
              onChange={setTime}
              variant="glass"
              type="time"
              inputClassName="[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-90"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SearchInput
              label="Location"
              placeholder="Location"
              value={location}
              onChange={setLocation}
              variant="glass"
            />
            <EventSelectField
              label="Mode"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              options={modeOptions}
              placeholder="Select mode"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm mb-2 text-white/70">
              Event Media
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0] ?? null;
                if (!file) {
                  setPhotoFile(null);
                  setPhotoDataUrl(null);
                  e.target.value = "";
                  return;
                }
                setPhotoFile(file);
                setPhotoUploading(true);
                try {
                  const url = await uploadImage(file, "events");
                  setPhotoDataUrl(url);
                } catch (err) {
                  alert(err instanceof Error ? err.message : "Failed to upload image");
                  setPhotoFile(null);
                } finally {
                  setPhotoUploading(false);
                }
                e.target.value = "";
              }}
            />
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {photoDataUrl ? (
                <div className="relative h-32 sm:h-36 rounded-2xl border border-white/10 bg-black/20 overflow-hidden">
                  <img
                    src={photoDataUrl}
                    alt="Event"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoDataUrl(null);
                    }}
                    className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white/80 hover:text-white transition cursor-pointer"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                </div>
              ) : null}

              <button
                type="button"
                disabled={photoUploading}
                onClick={() => fileInputRef.current?.click()}
                className="h-32 sm:h-36 rounded-2xl border border-dashed border-white/30 bg-black/20 text-white/50 flex flex-col items-center justify-center gap-2 hover:border-lime-400/60 hover:text-white/70 transition cursor-pointer disabled:opacity-60"
              >
                {photoUploading ? (
                  <Loader2 size={22} className="animate-spin" />
                ) : (
                  <ImageIcon size={22} />
                )}
                <span className="text-sm">
                  {photoUploading ? "Uploading…" : photoFile ? "Photo selected" : "Add photo (high quality)"}
                </span>
              </button>
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl px-5 py-2.5 border border-white/20 bg-white/5 text-white/70 hover:text-white hover:border-white/40 hover:bg-white/10 transition cursor-pointer text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-6 py-2.5 text-sm font-semibold text-black shadow-lg shadow-lime-400/30 hover:bg-lime-300 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {submitting
                ? isEditing
                  ? "Updating..."
                  : "Publishing..."
                : isEditing
                  ? "Update Event"
                  : "Publish Event"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

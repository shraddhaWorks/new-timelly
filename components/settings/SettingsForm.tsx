"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { User, Lock, Camera, X } from "lucide-react";
import {
  SETTINGS_BG_GRADIENT,
  SETTINGS_CARD_BG,
  SETTINGS_INPUT_BG,
  SETTINGS_TEXT_MAIN,
  SETTINGS_TEXT_MUTED,
} from "@/app/frontend/constants/colors";
import { uploadImage } from "@/app/frontend/utils/upload";

function getClipboardImageFile(clipboardData: DataTransfer | null): File | null {
  if (!clipboardData?.items?.length) return null;
  const item = Array.from(clipboardData.items).find((i) => i.type.startsWith("image/"));
  if (!item) return null;
  return item.getAsFile();
}

type UserMe = {
  id: string;
  name: string | null;
  email: string | null;
  mobile: string | null;
  language: string | null;
  photoUrl: string | null;
  role: string;
};

const inputClass =
  "w-full rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 border border-white/10";

export default function SettingsForm() {
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    mobile: "",
    language: "English",
    photoUrl: "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/user/me");
        const data = await res.json();
        if (res.ok && data.user) {
          const u: UserMe = data.user;
          setUser(u);
          setProfile({
            name: u.name ?? "",
            email: u.email ?? "",
            mobile: u.mobile ?? "",
            language: u.language ?? "English",
            photoUrl: u.photoUrl ?? "",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/user/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          mobile: profile.mobile,
          language: profile.language,
          photoUrl: profile.photoUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to save profile");
      } else {
        setUser(data.user);
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to change password");
      } else {
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadImage(file, "avatars");
      setProfile((p) => ({ ...p, photoUrl: url }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingPhoto(false);
    }
    e.target.value = "";
  }, []);

  const handleAvatarPaste = useCallback(async (e: React.ClipboardEvent) => {
    const file = getClipboardImageFile(e.clipboardData);
    if (!file) return;
    e.preventDefault();
    setUploadingPhoto(true);
    try {
      const url = await uploadImage(file, "avatars");
      setProfile((p) => ({ ...p, photoUrl: url }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingPhoto(false);
    }
  }, []);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: SETTINGS_BG_GRADIENT }}
      >
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/30 border-t-white" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 sm:p-6 md:p-8"
      style={{ background: SETTINGS_BG_GRADIENT }}
      onPaste={handleAvatarPaste}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header card - Settings title + tagline */}
        <div
          className="rounded-2xl p-4 sm:p-6 border border-white/10 backdrop-blur-xl"
          style={{ backgroundColor: SETTINGS_CARD_BG }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: SETTINGS_TEXT_MAIN }}>
            Settings
          </h1>
          <p className="text-sm sm:text-base mt-1" style={{ color: SETTINGS_TEXT_MUTED }}>
            Manage your account preferences
          </p>
        </div>

        {/* Account Settings */}
        <div
          className="rounded-2xl p-4 sm:p-6 border border-white/10 backdrop-blur-xl"
          style={{ backgroundColor: SETTINGS_CARD_BG }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <User size={18} className="text-white/90" />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: SETTINGS_TEXT_MAIN }}>
              Account Settings
            </h2>
          </div>
          <p className="text-sm mb-4" style={{ color: SETTINGS_TEXT_MUTED }}>
            Update your account information
          </p>

          {/* Avatar: preview + upload from computer / paste screenshot */}
          <div className="mb-4">
            <label className="block text-sm mb-2" style={{ color: SETTINGS_TEXT_MUTED }}>
              Profile Photo
            </label>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative group">
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white/20 flex items-center justify-center"
                  style={{ backgroundColor: SETTINGS_INPUT_BG }}
                >
                  {profile.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.photoUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-semibold" style={{ color: SETTINGS_TEXT_MUTED }}>
                      {profile.name?.[0]?.toUpperCase() ?? "?"}
                    </span>
                  )}
                </div>
                <label
                  htmlFor="avatar-file-input"
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                >
                  <Camera size={20} className="text-white" />
                </label>
                <input
                  id="avatar-file-input"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFile}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="avatar-file-input"
                  className="text-sm px-3 py-2 rounded-xl border border-white/20 cursor-pointer hover:bg-white/10 transition inline-block w-fit"
                  style={{ color: SETTINGS_TEXT_MAIN }}
                >
                  Choose from device
                </label>
                <span className="text-xs" style={{ color: SETTINGS_TEXT_MUTED }}>
                  {uploadingPhoto ? "Uploading…" : "Or paste an image (Ctrl+V)"}
                </span>
                {profile.photoUrl && (
                  <button
                    type="button"
                    onClick={() => setProfile((p) => ({ ...p, photoUrl: "" }))}
                    className="text-xs flex items-center gap-1 text-red-300 hover:text-red-200"
                  >
                    <X size={12} /> Remove photo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: SETTINGS_TEXT_MUTED }}>
                Name
              </label>
              <input
                className={inputClass}
                style={{ backgroundColor: SETTINGS_INPUT_BG }}
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: SETTINGS_TEXT_MUTED }}>
                Email Address
              </label>
              <input
                type="email"
                readOnly
                className={inputClass + " cursor-not-allowed opacity-90"}
                style={{ backgroundColor: SETTINGS_INPUT_BG }}
                value={profile.email}
                aria-label="Email (read-only)"
              />
              <p className="text-xs mt-1" style={{ color: SETTINGS_TEXT_MUTED }}>
                Email cannot be changed
              </p>
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: SETTINGS_TEXT_MUTED }}>
                Phone Number
              </label>
              <input
                type="tel"
                className={inputClass}
                style={{ backgroundColor: SETTINGS_INPUT_BG }}
                value={profile.mobile}
                onChange={(e) => setProfile((p) => ({ ...p, mobile: e.target.value }))}
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: SETTINGS_TEXT_MUTED }}>
                Language
              </label>
              <select
                className={inputClass}
                style={{ backgroundColor: SETTINGS_INPUT_BG }}
                value={profile.language}
                onChange={(e) => setProfile((p) => ({ ...p, language: e.target.value }))}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={saveProfile}
            disabled={savingProfile}
            className="mt-4 px-5 py-2.5 rounded-xl font-medium text-white border border-white/20 bg-white/10 hover:bg-white/15 disabled:opacity-50 transition"
          >
            {savingProfile ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Password & Security */}
        <div
          className="rounded-2xl p-4 sm:p-6 border border-white/10 backdrop-blur-xl"
          style={{ backgroundColor: SETTINGS_CARD_BG }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Lock size={18} className="text-white/90" />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: SETTINGS_TEXT_MAIN }}>
              Password & Security
            </h2>
          </div>
          <p className="text-sm mb-4" style={{ color: SETTINGS_TEXT_MUTED }}>
            Change your password
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: SETTINGS_TEXT_MUTED }}>
                Current Password
              </label>
              <input
                type="password"
                className={inputClass}
                style={{ backgroundColor: SETTINGS_INPUT_BG }}
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, currentPassword: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: SETTINGS_TEXT_MUTED }}>
                New Password
              </label>
              <input
                type="password"
                className={inputClass}
                style={{ backgroundColor: SETTINGS_INPUT_BG }}
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, newPassword: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: SETTINGS_TEXT_MUTED }}>
                Confirm Password
              </label>
              <input
                type="password"
                className={inputClass}
                style={{ backgroundColor: SETTINGS_INPUT_BG }}
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))
                }
              />
            </div>
          </div>
          <button
            type="button"
            onClick={savePassword}
            disabled={savingPassword}
            className="mt-4 px-5 py-2.5 rounded-xl font-medium text-white border border-white/20 bg-white/10 hover:bg-white/15 disabled:opacity-50 transition"
          >
            {savingPassword ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

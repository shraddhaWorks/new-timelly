"use client";

import { useEffect, useState } from "react";
import GlassCard from "@/components/ui/GlassCard";

type UserMe = {
  id: string;
  name: string | null;
  email: string | null;
  mobile: string | null;
  language: string | null;
  photoUrl: string | null;
  role: string;
};

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
        body: JSON.stringify(profile),
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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/30 border-t-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <GlassCard variant="strong" className="p-4 md:p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden glass border border-white/10 flex items-center justify-center">
            {profile.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photoUrl} alt={profile.name || "User"} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white/70 text-lg">
                {profile.name?.[0]?.toUpperCase() ?? "U"}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-sm text-white/60">
              Manage your account preferences
            </p>
          </div>
        </GlassCard>

        <GlassCard variant="card" className="p-4 md:p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Account Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Name</label>
              <input
                className="w-full glass-input rounded-lg px-3 py-2 text-white"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Email Address</label>
              <input
                className="w-full glass-input rounded-lg px-3 py-2 text-white"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Phone Number</label>
              <input
                className="w-full glass-input rounded-lg px-3 py-2 text-white"
                value={profile.mobile}
                onChange={(e) => setProfile((p) => ({ ...p, mobile: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Language</label>
              <select
                className="w-full glass-input rounded-lg px-3 py-2 text-white"
                value={profile.language}
                onChange={(e) => setProfile((p) => ({ ...p, language: e.target.value }))}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-white/70 mb-1">Profile Photo URL</label>
              <input
                className="w-full glass-input rounded-lg px-3 py-2 text-white"
                value={profile.photoUrl}
                onChange={(e) => setProfile((p) => ({ ...p, photoUrl: e.target.value }))}
                placeholder="Paste image URL..."
              />
            </div>
          </div>
          <button
            type="button"
            onClick={saveProfile}
            disabled={savingProfile}
            className="mt-4 bg-white/20 text-white border border-white/30 rounded-lg px-4 py-2 font-medium disabled:opacity-50"
          >
            {savingProfile ? "Saving..." : "Save Changes"}
          </button>
        </GlassCard>

        <GlassCard variant="card" className="p-4 md:p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Password &amp; Security</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Current Password</label>
              <input
                type="password"
                className="w-full glass-input rounded-lg px-3 py-2 text-white"
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, currentPassword: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">New Password</label>
              <input
                type="password"
                className="w-full glass-input rounded-lg px-3 py-2 text-white"
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, newPassword: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Confirm Password</label>
              <input
                type="password"
                className="w-full glass-input rounded-lg px-3 py-2 text-white"
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
            className="mt-4 bg-white/20 text-white border border-white/30 rounded-lg px-4 py-2 font-medium disabled:opacity-50"
          >
            {savingPassword ? "Updating..." : "Save Changes"}
          </button>
        </GlassCard>
      </div>
    </div>
  );
}


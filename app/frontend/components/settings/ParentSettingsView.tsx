"use client";

import { Bell, CalendarDays, Globe, Lock, Mail, MapPin, Phone, Shield, ShieldCheck, User, Users } from "lucide-react";
import type { ReactNode } from "react";
import SearchInput from "../common/SearchInput";
import SelectInput from "../common/SelectInput";
import AllowedFeatureToggle from "../schooladmin/schooladmincomponents/AllowedFeatureToggle";
import { CardTitle, Field } from "./SettingsPrimitives";
import {
  CARD_BODY_CLASS,
  CARD_CLASS,
  CARD_HEADER_CLASS,
  CommonSettingsProps,
  LANGUAGE_OPTIONS,
  TIMEZONE_OPTIONS,
  humanizeVisibility,
} from "./portalSettingsTypes";

export default function ParentSettingsView({
  form,
  setForm,
  passwords,
  setPasswords,
  prefs,
  toggleNotification,
}: CommonSettingsProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
      <div className="space-y-6">
        <ParentAccountCard form={form} setForm={setForm} />
        <ParentPasswordCard passwords={passwords} setPasswords={setPasswords} />
        <ParentNotificationsCard prefs={prefs} toggleNotification={toggleNotification} />
      </div>

      <div className="space-y-6">
        <OverviewCard form={form} />
        <PrivacyCard prefs={prefs} />
        <LanguageRegionCard form={form} setForm={setForm} />
      </div>
    </div>
  );
}

function ParentAccountCard({
  form,
  setForm,
}: {
  form: CommonSettingsProps["form"];
  setForm: CommonSettingsProps["setForm"];
}) {
  return (
    <div className={CARD_CLASS}>
      <div className={CARD_HEADER_CLASS}>
        <CardTitle icon={<User className="text-lime-300" size={22} />} title="Parent Account Information" subtitle="Update your personal details" />
      </div>
      <div className={CARD_BODY_CLASS}>
        <div className="flex items-center gap-4">
          <img src={form.photoUrl || "/avatar.jpg"} alt={form.name || "Parent"} className="w-20 h-20 rounded-2xl object-cover border-2 border-white/[0.1] " />
          <div>
            <h3 className="font-bold text-white">Parent Profile Photo</h3>
            <p className="text-sm text-gray-400">JPG, PNG or GIF. Max 2MB</p>
            <button type="button" className="mt-2 px-4 py-2 bg-[#A3E635]/20 text-[#A3E635] border border-[#A3E635]/30
             rounded-xl text-sm font-medium hover:bg-[#A3E635]/30 transition-all hover:scale-105">
              Upload Photo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Field label="Full Name">
            <SearchInput value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} icon={User} variant="glass" className="mt-2" />
          </Field>
          <Field label="Email Address">
            <SearchInput value={form.email} icon={Mail} variant="glass" className="mt-2" disabled />
          </Field>
          <Field label="Phone Number">
            <SearchInput value={form.mobile} onChange={(v) => setForm((p) => ({ ...p, mobile: v }))} icon={Phone} variant="glass" className="mt-2" />
          </Field>
          <Field label="Location">
            <SearchInput value={form.location} onChange={(v) => setForm((p) => ({ ...p, location: v }))} icon={MapPin} variant="glass" className="mt-2" />
          </Field>
        </div>
      </div>
    </div>
  );
}

function ParentPasswordCard({
  passwords,
  setPasswords,
}: {
  passwords: CommonSettingsProps["passwords"];
  setPasswords: CommonSettingsProps["setPasswords"];
}) {
  return (
    <div className={CARD_CLASS}>
      <div className={CARD_HEADER_CLASS}>
        <CardTitle icon={<Lock className="text-lime-300" size={22} />} title="Security & Password" subtitle="Manage your password and security" />
      </div>
      <div className={CARD_BODY_CLASS}>
        <Field label="Current Password">
          <SearchInput value={passwords.currentPassword} onChange={(v) => setPasswords((p) => ({ ...p, currentPassword: v }))} type="password" variant="glass" className="mt-2" />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Field label="New Password">
            <SearchInput value={passwords.newPassword} onChange={(v) => setPasswords((p) => ({ ...p, newPassword: v }))} type="password" variant="glass" className="mt-2" />
          </Field>
          <Field label="Confirm Password">
            <SearchInput value={passwords.confirmPassword} onChange={(v) => setPasswords((p) => ({ ...p, confirmPassword: v }))} type="password" variant="glass" className="mt-2" />
          </Field>
        </div>
        <div className="p-4 bg-[#A3E635]/10 rounded-xl border border-[#A3E635]/20 text-sm text-[#A3E635]">
          <strong>Password Requirements:</strong> At least 8 characters with uppercase, lowercase, number and special character.
        </div>
      </div>
    </div>
  );
}

function ParentNotificationsCard({
  prefs,
  toggleNotification,
}: {
  prefs: CommonSettingsProps["prefs"];
  toggleNotification: CommonSettingsProps["toggleNotification"];
}) {
  return (
    <div className={CARD_CLASS}>
      <div className={CARD_HEADER_CLASS}>
        <CardTitle icon={<Bell className="text-lime-300" size={22} />} title="Notification Preferences" subtitle="Choose what notifications you receive" />
      </div>
      <div className={CARD_BODY_CLASS}>
        <ParentToggle title="Homework Reminders" subtitle="Get notified about new homework" checked={prefs.notifications.homeworkReminders} onToggle={() => toggleNotification("homeworkReminders")} />
        <ParentToggle title="Attendance Alerts" subtitle="Daily attendance updates" checked={prefs.notifications.attendanceAlerts} onToggle={() => toggleNotification("attendanceAlerts")} />
        <ParentToggle title="Marks & Results" subtitle="Exam results and marks updates" checked={prefs.notifications.marksResults} onToggle={() => toggleNotification("marksResults")} highlighted />
        <ParentToggle title="Fee Reminders" subtitle="Payment due date reminders" checked={prefs.notifications.feeReminders} onToggle={() => toggleNotification("feeReminders")} />
        <ParentToggle title="School Events" subtitle="Upcoming events and workshops" checked={prefs.notifications.schoolEvents} onToggle={() => toggleNotification("schoolEvents")} highlighted />
      </div>
    </div>
  );
}

function OverviewCard({ form }: { form: CommonSettingsProps["form"] }) {
  return (
    <div className={CARD_CLASS}>
      <div className={CARD_BODY_CLASS}>
        <h3 className="text-lg font-bold text-white mb-4">Account Overview</h3>
        <Stat icon={<CalendarDays className="text-lime-300" size={24} />} label="Member Since" value="Jan 2023" />
        <Stat icon={<Users className="text-cyan-300" size={24} />} label="Children" value="2 Students" />
        <Stat icon={<ShieldCheck className="text-purple-300" size={24} />} label="Account Status" value="Active" valueClass="text-lime-300" />
        <div className="text-xs text-gray-400">Primary: {form.mobile || "Not set"}</div>
      </div>
    </div>
  );
}

function PrivacyCard({ prefs }: { prefs: CommonSettingsProps["prefs"] }) {
  return (
    <div className={CARD_CLASS}>
      <div className={CARD_HEADER_CLASS}>
        <CardTitle icon={<Shield className="text-lime-300" size={22} />} title="Privacy" subtitle="Control who can see your profile" />
      </div>
      <div className={CARD_BODY_CLASS}>
        <PrivacyItem label="Profile Visibility" helper="Control who can see your profile" value={humanizeVisibility(prefs.privacy.profileVisibility)} />
        <PrivacyItem label="Activity Status" helper="Show when you're active" value="Enabled" />
        <PrivacyItem label="Data Sharing" helper="Share analytics with school" value="Enabled" />
      </div>
    </div>
  );
}

function LanguageRegionCard({
  form,
  setForm,
}: {
  form: CommonSettingsProps["form"];
  setForm: CommonSettingsProps["setForm"];
}) {
  return (
    <div className={CARD_CLASS}>
      <div className={CARD_HEADER_CLASS}>
        <CardTitle icon={<Globe className="text-lime-300" size={22} />} title="Language & Region" subtitle="Preferences for language and timezone" />
      </div>
      <div className={CARD_BODY_CLASS}>
        <Field label="Language">
          <SelectInput value={form.language} onChange={(v) => setForm((p) => ({ ...p, language: v }))} options={LANGUAGE_OPTIONS} className="mt-2" bgColor="white" />
        </Field>
        <Field label="Timezone" className="mt-5">
          <SelectInput value={form.timezone} onChange={(v) => setForm((p) => ({ ...p, timezone: v }))} options={TIMEZONE_OPTIONS} className="mt-2" bgColor="white" />
        </Field>
      </div>
    </div>
  );
}

function ParentToggle({
  title,
  subtitle,
  checked,
  onToggle,
  highlighted = false,
}: {
  title: string;
  subtitle: string;
  checked: boolean;
  onToggle: () => void;
  highlighted?: boolean;
}) {
  return (
    <AllowedFeatureToggle
      label={title}
      description={subtitle}
      checked={checked}
      onChange={onToggle}
      className={`py-4 px-4 ${highlighted ? "bg-white/[0.04] border border-white/10" : "bg-transparent border-0"} rounded-3xl`}
      labelClassName="text-white text-2xl font-semibold"
    />
  );
}

function Stat({
  icon,
  label,
  value,
  valueClass = "text-white",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
      <div className="p-2 bg-[#A3E635]/10 rounded-lg">{icon}</div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className={`font-bold text-white ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
}

function PrivacyItem({ label, helper, value }: { label: string; helper: string; value: string }) {
  return (
    <div className="p-3 rounded-xl hover:bg-white/[0.05] transition-all border border-transparent hover:border-white/[0.05]">
      <p className="font-semibold text-white text-sm">{label}</p>
      <p className="text-xs text-gray-400 mt-1">{helper}</p>
      <p className="text-sm text-[#A3E635] font-medium mt-2">{value}</p>
    </div>
  );
}

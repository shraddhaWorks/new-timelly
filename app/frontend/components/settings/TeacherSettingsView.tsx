"use client";

import { Bell, Lock, Shield, User } from "lucide-react";
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
  VISIBILITY_OPTIONS,
} from "./portalSettingsTypes";

export default function TeacherSettingsView({
  form,
  setForm,
  passwords,
  setPasswords,
  prefs,
  setPrefs,
  toggleNotification,
}: CommonSettingsProps) {
  return (
    <div className="space-y-6">
      <div className={CARD_CLASS}>
        <div className={CARD_HEADER_CLASS}>
          <CardTitle
            icon={<User className="lucide lucide-user w-5 h-5 text-lime-400" size={22} />}
            title="Account Settings"
            subtitle="Update your account information"
            titleClassName="text-lg font-bold text-white leading-none"
            subtitleClassName="text-xs md:text-sm text-gray-400 mt-1"
          />
        </div>
        <div className={CARD_BODY_CLASS}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Field label="Email Address">
              <SearchInput value={form.email} showSearchIcon={false} variant="glass" className="mt-2" disabled />
            </Field>
            <Field label="Phone Number">
              <SearchInput
                value={form.mobile}
                onChange={(v) => setForm((p) => ({ ...p, mobile: v }))}
                showSearchIcon={false}
                variant="glass"
                className="mt-2"
                type="tel"
              />
            </Field>
            <Field label="Language" className="lg:col-span-2">
              <SelectInput
                value={form.language}
                onChange={(v) => setForm((p) => ({ ...p, language: v }))}
                options={LANGUAGE_OPTIONS}
                className="mt-2"
                bgColor="white"
              />
            </Field>
          </div>
        </div>
      </div>

      <div className={CARD_CLASS}>
        <div className={CARD_HEADER_CLASS}>
          <CardTitle
            icon={<Lock className="text-lime-300" size={22} />}
            title="Password & Security"
            subtitle="Manage your password and security settings"
            titleClassName="text-lg font-bold text-white leading-none"
            subtitleClassName="text-xs md:text-sm text-gray-400 mt-1"
          />
        </div>
        <div className={CARD_BODY_CLASS}>
          <Field label="Current Password">
            <SearchInput
              value={passwords.currentPassword}
              onChange={(v) => setPasswords((p) => ({ ...p, currentPassword: v }))}
              type="password"
              variant="glass"
              className="mt-2"
              placeholder="Enter current password"
            />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Field label="New Password">
              <SearchInput
                value={passwords.newPassword}
                onChange={(v) => setPasswords((p) => ({ ...p, newPassword: v }))}
                type="password"
                variant="glass"
                className="mt-2"
                placeholder="Enter new password"
              />
            </Field>
            <Field label="Confirm New Password">
              <SearchInput
                value={passwords.confirmPassword}
                onChange={(v) => setPasswords((p) => ({ ...p, confirmPassword: v }))}
                type="password"
                variant="glass"
                className="mt-2"
                placeholder="Confirm new password"
              />
            </Field>
          </div>
          <button
            type="button"
            className="mt-4 px-3 py-3 rounded-2xl border border-white/20 bg-white/10 text-white/80 hover:bg-white/15 transition font-semibold"
          >
            Change Password
          </button>
        </div>
      </div>

      <div className={CARD_CLASS}>
        <div className={CARD_HEADER_CLASS}>
          <CardTitle
            icon={<Bell className="text-lime-300" size={22} />}
            title="Notification Settings"
            subtitle="Choose how you want to be notified"
            titleClassName="text-lg font-bold text-white leading-none"
            subtitleClassName="text-xs md:text-sm text-gray-400 mt-1"
          />
        </div>
        <div className={CARD_BODY_CLASS}>
          <AllowedFeatureToggle
            label="Email Notifications"
            description="Receive updates via email"
            checked={prefs.notifications.emailNotifications}
            onChange={() => toggleNotification("emailNotifications")}
            className="flex items-center justify-between"
            labelClassName="font-medium text-white"
          />
          <AllowedFeatureToggle
            label="Push Notifications"
            description="Receive push notifications"
            checked={prefs.notifications.pushNotifications}
            onChange={() => toggleNotification("pushNotifications")}
            className="flex items-center justify-between"
            labelClassName="font-medium text-white"
          />
          <div className="mt-5 pt-5 border-t border-white/10 space-y-3">
            <p className="text-white text-4xl font-semibold">Notification Types</p>
            <AllowedFeatureToggle
              label="Parent Messages"
              checked={prefs.notifications.parentMessages}
              onChange={() => toggleNotification("parentMessages")}
              className="flex items-center justify-between"
              labelClassName="font-medium text-white"
            />
            <AllowedFeatureToggle
              label="Workshop Reminders"
              checked={prefs.notifications.workshopReminders}
              onChange={() => toggleNotification("workshopReminders")}
              className="flex items-center justify-between"
              labelClassName="font-medium text-white"
            />
            <AllowedFeatureToggle
              label="Leave Status Updates"
              checked={prefs.notifications.leaveStatusUpdates}
              onChange={() => toggleNotification("leaveStatusUpdates")}
              className="flex items-center justify-between"
              labelClassName="font-medium text-white"
            />
          </div>
        </div>
      </div>

      <div className={CARD_CLASS}>
        <div className={CARD_HEADER_CLASS}>
          <CardTitle
            icon={<Shield className="text-lime-300" size={22} />}
            title="Privacy Settings"
            subtitle="Control your privacy preferences"
            titleClassName="font-bold text-white text-lg flex items-center gap-2"
            subtitleClassName="text-sm text-gray-400 mt-1"
          />
        </div>
        <div className={CARD_BODY_CLASS}>
          <PrivacyRow
            title="Profile Visibility"
            subtitle="Who can see your profile"
            value={prefs.privacy.profileVisibility}
            onChange={(v) => setPrefs((p) => ({ ...p, privacy: { ...p.privacy, profileVisibility: v } }))}
          />
          <PrivacyRow
            title="Contact Information"
            subtitle="Who can see your contact details"
            value={prefs.privacy.contactVisibility}
            onChange={(v) => setPrefs((p) => ({ ...p, privacy: { ...p.privacy, contactVisibility: v } }))}
          />
        </div>
      </div>
    </div>
  );
}

function PrivacyRow({
  title,
  subtitle,
  value,
  onChange,
}: {
  title: string;
  subtitle: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4 py-3 items-center">
      <div>
        <p className="font-medium text-white">{title}</p>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>
      <SelectInput value={value} onChange={onChange} options={VISIBILITY_OPTIONS} bgColor="white" />
    </div>
  );
}

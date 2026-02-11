"use client";

import { Bell, Lock, User } from "lucide-react";
import AllowedFeatureToggle from "../schooladmin/schooladmincomponents/AllowedFeatureToggle";
import SearchInput from "../common/SearchInput";
import SelectInput from "../common/SelectInput";
import { CardTitle, Field } from "./SettingsPrimitives";
import {
  CARD_BODY_CLASS,
  CARD_CLASS,
  CARD_HEADER_CLASS,
  CommonSettingsProps,
  LANGUAGE_OPTIONS,
} from "./portalSettingsTypes";

export default function SchoolAdminSettingsView({
  form,
  setForm,
  passwords,
  setPasswords,
  prefs,
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
            titleClassName="font-bold text-white text-lg flex items-center gap-2"
            subtitleClassName="text-sm text-gray-400 mt-1"
          />
        </div>
        <div className={CARD_BODY_CLASS}>
          <Field label="Email Address">
            <SearchInput value={form.email} showSearchIcon={false} variant="glass" className="mt-2" disabled />
          </Field>
          <Field label="Phone Number" className="mt-4">
            <SearchInput
              value={form.mobile}
              onChange={(v) => setForm((p) => ({ ...p, mobile: v }))}
              showSearchIcon={false}
              variant="glass"
              className="mt-2"
              placeholder="+91 98765 43210"
              type="tel"
            />
          </Field>
          <Field label="Language" className="mt-4">
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

      <div className={CARD_CLASS}>
        <div className={CARD_HEADER_CLASS}>
          <CardTitle
            icon={<Lock className="lucide lucide-lock w-5 h-5 text-lime-400" size={22} />}
            title="Password & Security"
            subtitle="Change your password"
            titleClassName="text-lg font-bold text-gray-100 leading-none"
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
          <Field label="New Password" className="mt-4">
            <SearchInput
              value={passwords.newPassword}
              onChange={(v) => setPasswords((p) => ({ ...p, newPassword: v }))}
              type="password"
              variant="glass"
              className="mt-2"
              placeholder="Enter new password"
            />
          </Field>
          <Field label="Confirm Password" className="mt-4">
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
      </div>

      <div className={CARD_CLASS}>
        <div className={CARD_HEADER_CLASS}>
          <CardTitle
            icon={<Bell className="text-lime-300" size={22} />}
            title="Notifications"
            subtitle="Manage notification preferences"
            titleClassName="text-lg font-bold text-gray-100 leading-none"
            subtitleClassName="text-xs md:text-sm text-gray-400 mt-1"
          />
        </div>
        <div className={CARD_BODY_CLASS}>
          <AllowedFeatureToggle
            label="Email Notifications"
            description="Receive notifications via email"
            checked={prefs.notifications.emailNotifications}
            onChange={() => toggleNotification("emailNotifications")}
            className="bg-transparent hover:border-b-lime-300/40 flex items-center justify-between"
            labelClassName="text-sm font-medium text-gray-200"
          />
          <AllowedFeatureToggle
            label="Push Notifications"
            description="Receive push notifications"
            checked={prefs.notifications.pushNotifications}
            onChange={() => toggleNotification("pushNotifications")}
            className="bg-transparent hover:border-b-lime-300/40 flex items-center justify-between"
            labelClassName="text-sm font-medium text-gray-200"
          />
        </div>
      </div>
    </div>
  );
}

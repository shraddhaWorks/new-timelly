"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Loader, User, Mail, Briefcase, Lock, Shield, User2 } from "lucide-react";
import InputField from "./InputField";
import AllowedFeatureToggle from "./AllowedFeatureToggle";
import RoleSelector from "./RoleSelector";
import { Permission } from "@/app/frontend/enums/permissions";
import Spinner from "../../common/Spinner";

interface UserFormData {
  name: string;
  email: string;
  role: "SCHOOLADMIN" | "TEACHER" | "STUDENT";
  designation?: string;
  username: string;
  password?: string;
  confirmPassword?: string;
  allowedFeatures: string[];
}

interface UserFormProps {
  mode?: "create" | "edit";
  initialData?: UserFormData & { id?: string };
}

const AVAILABLE_FEATURES_FOR_TEACHERS = [
  { key: Permission.DASHBOARD, label: "Dashboard" },
  { key: Permission.CLASSES, label: "Classes" },
  { key: Permission.HOMEWORK, label: "Homework" },
  { key: Permission.MARKS, label: "Marks" },
  { key: Permission.ATTENDANCE, label: "Attendance" },
  { key: Permission.EXAMS, label: "Exams & Syllabus" },
  { key: Permission.WORKSHOPS, label: "Workshops & Events" },
  { key: Permission.NEWSFEED, label: "Newsfeed" },
  { key: Permission.CHAT, label: "Parent Chat" },
  { key: Permission.TEACHER_LEAVES, label: "Leave" },
  { key: Permission.SETTINGS, label: "Settings" },
];

export default function UserForm({ mode = "create", initialData }: UserFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [loading, setLoading] = useState(!!userId && !initialData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<UserFormData>(
    initialData || {
      name: "",
      email: "",
      role: "TEACHER",
      designation: "",
      username: "",
      password: "",
      confirmPassword: "",
      allowedFeatures: [],
    }
  );

  // Keep local form state in sync when parent passes initialData (edit from list)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setLoading(false);
    }
  }, [initialData]);

  // Fetch user data if in edit mode and no initialData was provided (deep link)
  useEffect(() => {
    if (userId && !initialData) {
      const fetchUser = async () => {
        try {
          const res = await fetch(`/api/user/${userId}`);
          if (!res.ok) throw new Error("Failed to fetch user");
          const userData = await res.json();
          setFormData({
            name: userData.name || "",
            email: userData.email || "",
            role: userData.role || "TEACHER",
            designation: userData.designation || "",
            username: userData.username || "",
            password: "",
            confirmPassword: "",
            allowedFeatures: userData.allowedFeatures || [],
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load user data");
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [userId, initialData]);

  const handleChange = (field: keyof UserFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      allowedFeatures: prev.allowedFeatures.includes(feature)
        ? prev.allowedFeatures.filter((f) => f !== feature)
        : [...prev.allowedFeatures, feature],
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Invalid email format");
      return false;
    }
    if (!formData.username.trim()) {
      setError("Username is required");
      return false;
    }
    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters");
      return false;
    }
    if (mode === "create" && !formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password && formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    setError(null);

    try {
      const endpoint = userId ? `/api/user/${userId}` : "/api/user/create";
      const method = userId ? "PUT" : "POST";

      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        designation: formData.designation,
        username: formData.username,
        allowedFeatures: formData.allowedFeatures,
        ...(formData.password && { password: formData.password }),
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Failed to ${userId ? "update" : "create"} user`);
      }

      setSuccess(true);
      setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", "add-user");
        params.set("view", "all");
        router.push(`?${params.toString()}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        {/* <Loader className="animate-spin text-lime-400" size={40} /> */}
        <Spinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Section: Form Fields + Access Control */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form Inputs (2/3 width) */}
        <div className="col-span-1 lg:col-span-2 space-y-6 bg-white/5 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-lime-400/20 flex items-center justify-center">
                <User className="w-5 h-5 text-lime-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">User Information</h2>
                <p className="text-xs text-white/50">
                  Add new users and configure their access to Timelly.
                </p>
              </div>
            </div>
          </div>

          {/* User Role Pills */}
          <div>
            <RoleSelector
              value={formData.role}
              onChange={(role) => handleChange("role", role)}
            />
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Full Name"
              value={formData.name}
              onChange={(v) => handleChange("name", v)}
              placeholder="Enter full name"
              icon={<User className="w-4 h-4" />}
              required
            />

            <InputField
              label="Designation"
              value={formData.designation || ""}
              onChange={(v) => handleChange("designation", v)}
              placeholder="e.g. Senior Teacher"
              icon={<Briefcase className="w-4 h-4" />}
            />

            <InputField
              label="Email Address"
              value={formData.email}
              onChange={(v) => handleChange("email", v)}
              placeholder="user@timelly.school"
              icon={<Mail className="w-4 h-4" />}
              required
            />
               <InputField
              label="Username"
              value={formData.username}
              onChange={(v) => handleChange("username", v)}
              placeholder="Enter username"
              icon={<User className="w-4 h-4" />}
              required
            />

            <InputField
              label={`Password ${mode === "create" ? "" : "(Leave blank to keep unchanged)"}`}
              value={formData.password || ""}
              onChange={(v) => handleChange("password", v)}
              placeholder="Enter password"
              icon={<Lock className="w-4 h-4" />}
              type="password"
              required={mode === "create"}
            />

            {formData.password && (
              <InputField
                label="Confirm Password"
                value={formData.confirmPassword || ""}
                onChange={(v) => handleChange("confirmPassword", v)}
                placeholder="Confirm password"
                icon={<Lock className="w-4 h-4" />}
                type="password"
                required
              />
            )}
          </div>
        </div>

        {/* Right: Access Control Toggles (1/3 width) */}
        <div className="col-span-1 bg-black/20 bg-gradient-to-b from-white/10/5
         to-white/0 rounded-2xl p-5 flex flex-col gap-4 
          bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 h-full">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2"><Shield className="lucide lucide-shield w-5 h-5 text-lime-400" /> Access Control</h3>
              <p className="text-[11px] text-white/50">
                Choose which modules this user can access.
              </p>
            </div>
            <span className="text-[11px] font-medium text-lime-300 px-3 py-1 bg-lime-400/10 text-lime-400
             text-xs font-bold rounded-full border border-lime-400/20">
              {formData.allowedFeatures.length} Active
            </span>
          </div>

          {/* Select All */}
          <AllowedFeatureToggle
            label="Select All"
            checked={formData.allowedFeatures.length === AVAILABLE_FEATURES_FOR_TEACHERS.length}
            onChange={() => {
              const allSelected = formData.allowedFeatures.length === AVAILABLE_FEATURES_FOR_TEACHERS.length;
              setFormData((prev) => ({
                ...prev,
                allowedFeatures: allSelected
                  ? []
                  : AVAILABLE_FEATURES_FOR_TEACHERS.map((f) => f.key),
              }));
            }}
          />

          <div className="lg:col-span-1" />

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
            {AVAILABLE_FEATURES_FOR_TEACHERS.map((feature) => (
              <AllowedFeatureToggle
                key={feature.key}
                label={feature.label}
                checked={formData.allowedFeatures.includes(feature.key)}
                onChange={() => handleFeatureToggle(feature.key)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/20 border border-red-500/30"
        >
          <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-300">{error}</span>
        </motion.div>
      )}

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-lime-400/20 border border-lime-400/30"
        >
          <CheckCircle size={18} className="text-lime-400 flex-shrink-0" />
          <span className="text-sm text-lime-300">
            User {userId ? "updated" : "created"} successfully!
          </span>
        </motion.div>
      )}

      {/* Submit Buttons */}
      <div className="flex justify-end pt-4 gap-3">
        <motion.button
          type="submit"
          disabled={submitting}
          whileHover={{ x: 4 }}
          className="px-6 py-3 bg-lime-400 hover:bg-lime-500 text-black font-bold rounded-xl 
          shadow-lg shadow-lime-400/20 transition-all flex items-center gap-2"
        >
          {submitting ? (
            <>
              <Spinner />
              Saving...
            </>
          ) : (
            <><User className="lucide lucide-user-plus w-5 h-5" /> {userId ? "Update" : "Create"} User
            </>
          )}
        </motion.button>
        <motion.button
          type="button"
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("tab", "add-user");
            params.set("view", "all");
            router.push(`?${params.toString()}`);
          }}
          disabled={submitting}
          whileHover={{ x: -4 }}
          className="px-6 py-3 border border-white/10 text-gray-400
           font-medium rounded-xl hover:bg-white/5 transition-all"
        >
          Cancel
        </motion.button>
      </div>
    </form>
  );
}

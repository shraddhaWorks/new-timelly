"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Users, Plus, Mail, Phone, User as UserIcon, Shield } from "lucide-react";
import { FEATURES, FEATURE_IDS, getDefaultFeaturesForRole, type FeatureId } from "@/lib/features";

interface Teacher {
  id: string;
  name: string | null;
  email: string | null;
  mobile: string | null;
}

export default function TeacherSignupPage() {
  const { data: session, status } = useSession();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [allowedFeatures, setAllowedFeatures] = useState<FeatureId[]>(() =>
    getDefaultFeaturesForRole("TEACHER")
  );

  useEffect(() => {
    if (session) {
      fetchTeachers();
    }
  }, [session]);

  const fetchTeachers = async () => {
    try {
      setFetching(true);
      const res = await fetch("/api/teacher/list");
      const data = await res.json();
      if (res.ok && data.teachers) {
        setTeachers(data.teachers);
      } else {
        console.error("Error fetching teachers:", data.message);
      }
    } catch (err) {
      console.error("Error fetching teachers:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/teacher/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, allowedFeatures }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Failed to create teacher");
        return;
      }
      setMessage("Teacher created successfully");
      setForm({ name: "", email: "", password: "", mobile: "" });
      setAllowedFeatures(getDefaultFeaturesForRole("TEACHER"));
      setShowForm(false);
      fetchTeachers(); // Refresh the list
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = (id: FeatureId) => {
    setAllowedFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };
  const selectAllFeatures = () => {
    setAllowedFeatures((prev) => (prev.length === FEATURE_IDS.length ? [] : [...FEATURE_IDS]));
  };

  if (status === "loading" || fetching) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#808080] mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="p-6 text-red-400">Not authenticated</p>
    </div>
  );
  if (session.user.role !== "SCHOOLADMIN")
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="p-6 text-red-400">Forbidden: School Admins only</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2d2d2d] to-[#404040] rounded-xl flex items-center justify-center border border-[#333333] shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              Teachers Management
            </h1>
            <p className="text-[#808080] text-sm md:text-base">Manage school teachers</p>
          </div>
          <motion.button
            onClick={() => setShowForm(!showForm)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 border border-[#333333] hover:border-[#808080] shadow-lg"
          >
            <Plus size={20} />
            {showForm ? "Cancel" : "Add Teacher"}
          </motion.button>
        </motion.div>

      {/* Create Teacher Form with Access Control */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10" />
          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-8">
            {/* Left: User Information */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <Plus size={24} />
                Add New Teacher
              </h2>

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 mb-4 rounded-lg border flex items-center gap-2 ${
                    message.includes("success")
                      ? "bg-[#2d2d2d] text-white border-[#404040]"
                      : "bg-red-500/10 text-red-400 border-red-500/30"
                  }`}
                >
                  {message.includes("success") ? "✓" : "⚠"}
                  {message}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                    <UserIcon size={16} />
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                    <Mail size={16} />
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                    <UserIcon size={16} />
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-sm text-[#808080] hover:text-white transition"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                    <Phone size={16} />
                    Mobile (optional)
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 border border-emerald-500/30 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      <span>Create Teacher</span>
                    </>
                  )}
                </motion.button>
              </form>
            </div>

            {/* Right: Access Control */}
            <div className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-5 h-fit max-h-[calc(100vh-200px)] flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-semibold text-white">Access Control</h3>
                <span className="ml-auto text-sm text-[#808080]">
                  {allowedFeatures.length} Active
                </span>
              </div>
              <label className="flex items-center gap-2 mb-3 cursor-pointer text-[#808080] hover:text-white transition">
                <input
                  type="checkbox"
                  checked={allowedFeatures.length === FEATURE_IDS.length}
                  onChange={selectAllFeatures}
                  className="rounded border-[#404040] bg-[#2d2d2d] text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-sm font-medium">Select All</span>
              </label>
              <div className="overflow-y-auto space-y-3 pr-1 flex-1 min-h-0">
                {FEATURES.map((feature) => {
                  const isOn = allowedFeatures.includes(feature.id);
                  return (
                    <div
                      key={feature.id}
                      className="flex items-center justify-between gap-3 py-2 border-b border-[#333333] last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{feature.label}</p>
                        <p className="text-xs text-[#808080] truncate">{feature.description}</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isOn}
                        onClick={() => toggleFeature(feature.id)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#1a1a1a] ${
                          isOn ? "bg-emerald-500" : "bg-[#404040]"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                            isOn ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Teachers List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-lg overflow-hidden hover:border-[#404040] transition"
      >
        <div className="p-6 border-b border-[#333333] bg-[#2d2d2d]">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users size={24} />
            All Teachers ({teachers.length})
          </h2>
        </div>

        {teachers.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={48} className="mx-auto text-[#808080] mb-4 opacity-50" />
            <p className="text-[#808080] text-lg">No teachers found</p>
            <p className="text-[#6b6b6b] text-sm mt-2">Click "Add Teacher" to create your first teacher</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#2d2d2d] border-b border-[#333333]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white">
                    <div className="flex items-center gap-2">
                      <UserIcon size={16} />
                      Name
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white">
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      Email
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white">
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      Mobile
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333333]">
                {teachers.map((teacher, index) => (
                  <motion.tr
                    key={teacher.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-[#2d2d2d] transition"
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      {teacher.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-[#808080] flex items-center gap-2">
                      <Mail size={16} className="text-[#6b6b6b]" />
                      {teacher.email || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-[#808080] flex items-center gap-2">
                      <Phone size={16} className="text-[#6b6b6b]" />
                      {teacher.mobile || "N/A"}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
      </div>
    </div>
  );
}

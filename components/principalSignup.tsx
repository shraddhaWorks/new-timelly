"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
} from "lucide-react";

type Role = "PRINCIPAL";

export default function PrincipalPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [principal, setPrincipal] = useState<any>(null);
  const [loadingPrincipal, setLoadingPrincipal] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role] = useState<Role>("PRINCIPAL");
  const [showPassword, setShowPassword] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // 🔹 Fetch principal on page load
  useEffect(() => {
    const fetchPrincipal = async () => {
      try {
        const res = await fetch("/api/principal/list");
        const data = await res.json();

        if (res.ok && data.principal) {
          setPrincipal(data.principal);
          setName(data.principal.name);
          setEmail(data.principal.email);
        }
      } catch (err) {
        console.error("Failed to load principal");
      } finally {
        setLoadingPrincipal(false);
      }
    };

    fetchPrincipal();
  }, []);

  // 🔹 Create principal
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/principal/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.message || "Signup failed");
      return;
    }

    setSuccess(true);

    setTimeout(() => {
      router.refresh();
    }, 1500);
  };

  // 🔹 Update principal name
  const handleUpdateName = async () => {
    setLoading(true);
    setError("");

    const res = await fetch("/api/principal/list", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.message || "Update failed");
      return;
    }

    setPrincipal(data.principal);
    setEditMode(false);
  };

  if (status === "loading" || loadingPrincipal) {
    return <p className="text-white text-center mt-10">Loading...</p>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-8 w-full max-w-md"
      >
        {/* ================= PRINCIPAL EXISTS ================= */}
        {principal ? (
          <>
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              Principal Details
            </h2>

            {error && (
              <div className="bg-red-500/10 text-red-400 p-3 rounded mb-4 text-center">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="text-white text-sm">Name</label>
              <input
                value={name}
                disabled={!editMode}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#2d2d2d] text-white p-3 rounded-lg disabled:opacity-60"
              />
            </div>

            <div className="mb-6">
              <label className="text-white text-sm">Email</label>
              <input
                value={email}
                disabled
                className="w-full bg-[#2d2d2d] text-white p-3 rounded-lg opacity-60"
              />
            </div>

            {!editMode ? (
              <motion.button
                onClick={() => setEditMode(true)}
                className="w-full bg-[#404040] text-white py-3 rounded-lg"
              >
                Edit Name
              </motion.button>
            ) : (
              <motion.button
                onClick={handleUpdateName}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg"
              >
                {loading ? "Saving..." : "Save Changes"}
              </motion.button>
            )}
          </>
        ) : (
          /* ================= CREATE PRINCIPAL ================= */
          <>
            {success ? (
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-white font-semibold">
                  Principal Created Successfully
                </p>
              </div>
            ) : (
              <form onSubmit={handleSignup}>
                <h2 className="text-2xl font-bold text-white text-center mb-6">
                  Create Principal
                </h2>

                {error && (
                  <div className="bg-red-500/10 text-red-400 p-3 rounded mb-4 text-center">
                    {error}
                  </div>
                )}

                <input
                  placeholder="Full Name"
                  className="w-full bg-[#2d2d2d] text-white p-3 rounded mb-3"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <input
                  type="email"
                  placeholder="Email"
                  className="w-full bg-[#2d2d2d] text-white p-3 rounded mb-3"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <div className="relative mb-4">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full bg-[#2d2d2d] text-white p-3 rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#404040] text-white py-3 rounded-lg"
                >
                  {loading ? "Creating..." : "Create Principal"}
                </motion.button>
              </form>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}

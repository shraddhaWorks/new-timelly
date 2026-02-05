"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ROUTES } from "@/app/frontend/constants/routes";

export default function Home() {
  const router = useRouter();
  const { status, data: session } = useSession();

  useEffect(() => {
    // Only act when status is NOT loading
    if (status === "loading") return;

    // If authenticated, redirect to dashboard based on role
    if (status === "authenticated" && session?.user?.role) {
      const roleRoutes: Record<string, string> = {
        SUPERADMIN: ROUTES.SUPERADMIN,
        SCHOOLADMIN: ROUTES.SCHOOLADMIN,
        STUDENT: ROUTES.PARENT,
        TEACHER: ROUTES.TEACHER,
      };
      const destination = roleRoutes[session.user.role] || ROUTES.UNAUTHORIZED;
      // Use push instead of replace, then go back immediately if needed
      router.push(destination);
      return;
    }

    // If NOT authenticated - show login form (no redirect needed)
  }, [status, session?.user?.role, router]);

  // Show loading spinner while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Loading</h2>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If authenticated, don't show login - the effect above will redirect
  if (status === "authenticated") {
    return null;
  }

  // Show login form only when unauthenticated
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <LoginForm />
    </div>
  );
}

// Login form component
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result?.ok) {
        setError(result?.error || "Login failed");
      }
      // Don't redirect here - let parent component's useEffect handle it
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        {/* Header */}
        <div className="p-8 pb-6 border-b border-white/5 flex flex-col items-center text-center bg-white/[0.02]">
          <img
            src="/timelylogo.webp"
            alt="Timelly"
            className="h-12 w-40 mb-6 drop-shadow-[0_0_15px_rgba(163,230,53,0.3)]"
          />
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400 text-sm">Sign in to access your dashboard</p>
        </div>

        {/* Form */}
        <div className="p-8 pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-lime-400/50 disabled:opacity-50"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-lime-400/50 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white disabled:opacity-50"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3 bg-lime-400 hover:bg-lime-500 text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

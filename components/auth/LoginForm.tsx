"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useSubdomainSchool } from "@/context/SubdomainContext";

const LOGO_SRC = "/timelylogo.webp";

export default function LoginForm() {
  const school = useSubdomainSchool();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  return (
    <div className="relative z-10 w-full max-w-md">
      <div className="rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] backdrop-blur-xl bg-black/20">
        {/* Header - logo from public folder (root path) */}
        <div className="p-8 pb-6 border-b border-white/5 flex flex-col items-center text-center bg-white/[0.02]">
          {school?.logoUrl ? (
            <img
              src={school.logoUrl}
              alt={school.name}
              className="h-12 w-auto max-w-[10rem] mb-6 object-contain"
            />
          ) : (
            <img
              src={LOGO_SRC}
              alt="Timelly"
              className="h-12 w-40 mb-6 drop-shadow-[0_0_15px_rgba(163,230,53,0.3)] object-contain"
            />
          )}
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome Back{school ? ` to ${school.name}` : ""}
          </h1>
          <p className="text-gray-400 text-sm">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Form */}
        <div className="p-8 pt-6">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-lime-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your school email"
                  className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-lime-400/50 focus:bg-black/60 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between ml-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-lime-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-lime-400/50 focus:bg-black/60 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full py-3.5 bg-lime-400 hover:bg-lime-500 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-black/40 border-t border-white/5 text-center">
          <p className="text-gray-500 text-xs">
            Don&apos;t have an account?{" "}
            <a href="/admin/signup" className="text-lime-400 font-medium hover:underline">
              School Administrator
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

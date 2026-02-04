"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";

import BrandLogo from "@/app/frontend/components/common/TimellyLogo";
import SearchInput from "@/app/frontend/components/common/SearchInput";
import PrimaryButton from "@/app/frontend/components/common/PrimaryButton";
import { ROUTES } from "@/app/frontend/constants/routes";

export default function LoginPage() {
  const router = useRouter();

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

    // 🔥 Always go to SCREEN
    router.replace(ROUTES.SCREEN);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.form
        onSubmit={handleLogin}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="flex justify-center">
          <BrandLogo size="auth" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-white">
            Log In
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Enter your credentials to access your account
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <SearchInput
          placeholder="Enter your email"
          value={email}
          onChange={setEmail}
          type="email"
          icon={Mail}
        />

        <div className="relative">
          <SearchInput
            placeholder="Enter password"
            value={password}
            onChange={setPassword}
            type={showPassword ? "text" : "password"}
            icon={Lock}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <PrimaryButton title="Log In" loading={loading} />
      </motion.form>
    </div>
  );
}

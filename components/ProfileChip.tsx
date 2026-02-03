"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Me = {
  id: string;
  name: string | null;
  email: string | null;
  photoUrl: string | null;
  role: string;
};

export default function ProfileChip() {
  const [me, setMe] = useState<Me | null>(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/user/me");
        const data = await res.json();
        if (res.ok && data.user) {
          setMe(data.user);
        }
      } catch {
        // ignore
      }
    };
    load();
  }, []);

  const initial = (me?.name || me?.email || "U").charAt(0).toUpperCase();

  return (
    <button
      type="button"
      onClick={() => router.push("/settings")}
      className="flex items-center gap-2 rounded-full bg-[#1a1a1a] border border-[#333333] px-3 py-1.5 text-left hover:bg-[#2d2d2d] transition"
    >
      <div className="w-7 h-7 rounded-full overflow-hidden bg-[#333333] flex items-center justify-center text-xs text-white">
        {me?.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={me.photoUrl} alt={me.name ?? "User"} className="w-full h-full object-cover" />
        ) : (
          initial
        )}
      </div>
      <div className="hidden md:block">
        <p className="text-xs text-white truncate max-w-[120px]">
          {me?.name || me?.email || "Profile"}
        </p>
        <p className="text-[10px] text-[#808080] uppercase tracking-wide">
          {me?.role ?? ""}
        </p>
      </div>
    </button>
  );
}


"use client";

import { X, Mail, User, Settings, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { AVATAR_URL } from "../../constants/images";

type ProfileModalProfile = {
  name: string;
  email?: string;
  image?: string | null;
  role?: string;
};

export default function ProfileModal({
  onClose,
  onOpenSettings,
  profile: profileProp,
}: {
  onClose: () => void;
  onOpenSettings?: () => void;
  profile?: ProfileModalProfile;
}) {
  const { data: session } = useSession();
  const name = profileProp?.name ?? session?.user?.name ?? "User";
  const email = profileProp?.email ?? session?.user?.email ?? "";
  const role = profileProp?.role ?? session?.user?.role ?? "";
  const imageUrl = profileProp?.image ?? session?.user?.image ?? AVATAR_URL;

  const handleLogout = async () => {
    onClose();
    await signOut({ callbackUrl: "/admin/login" });
  };

  const handleSettings = () => {
    onClose();
    onOpenSettings?.();
  };

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-black/50 backdrop-blur-sm
        flex items-end md:items-center justify-center
      "
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-full max-w-md
          rounded-t-3xl md:rounded-3xl
          bg-neutral-900/90
          border border-white/10
          p-6
          relative
          animate-slideUp
        "
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10"
        >
          <X className="text-white" />
        </button>

        <div className="flex gap-4 items-center mb-6">
          <img
            src={imageUrl}
            alt=""
            className="h-16 w-16 rounded-xl border border-white/10 object-cover"
          />
          <div>
            <h2 className="text-white text-lg font-semibold">{name}</h2>
            <p className="text-lime-300 text-sm">{role}</p>
            <span className="inline-block mt-1 px-3 py-0.5 text-xs rounded-full bg-lime-500/20 text-lime-400">
              ACTIVE
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <Info icon={<Mail />} label="Email" value={email || "—"} />
          <Info icon={<User />} label="Role" value={role || "—"} />
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleSettings}
            className="w-full py-3 rounded-xl bg-lime-500/20 text-lime-400 font-medium flex items-center justify-center gap-2"
          >
            <Settings size={18} /> Settings
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3 rounded-xl bg-white/10 text-white font-medium flex items-center justify-center gap-2 hover:bg-white/15"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 items-center bg-white/5 p-3 rounded-xl">
      <div className="text-lime-400">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-white text-sm truncate">{value}</p>
      </div>
    </div>
  );
}

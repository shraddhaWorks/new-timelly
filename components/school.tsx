"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, MapPin, Save, Edit, CheckCircle, Mail, Hash, FileText } from "lucide-react";

export default function SchoolPage() {
    const { data: session, status } = useSession();

    const [showForm, setShowForm] = useState(false);
    const [school, setSchool] = useState<any>(null);
    const [settings, setSettings] = useState<{ admissionPrefix: string; rollNoPrefix: string; hyperpgSubMid?: string | null } | null>(null);
    const [settingsMsg, setSettingsMsg] = useState("");

    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [location, setLocation] = useState("");
    const [msg, setMsg] = useState("");
    const [admissionPrefix, setAdmissionPrefix] = useState("ADM");
    const [rollNoPrefix, setRollNoPrefix] = useState("");
    const [hyperpgSubMid, setHyperpgSubMid] = useState("");

    useEffect(() => {
        if (!session) return;

        async function fetchSchool() {
            const res = await fetch("/api/school/mine");
            const data = await res.json();
            console.log(data);
            if (data.school) {
                setSchool(data.school);
                setName(data.school.name);
                setAddress(data.school.address);
                setLocation(data.school.location);
            }
        }
        async function fetchSettings() {
            const res = await fetch("/api/school/settings");
            const data = await res.json();
            if (data.settings) {
                setSettings(data.settings);
                setAdmissionPrefix(data.settings.admissionPrefix ?? "ADM");
                setRollNoPrefix(data.settings.rollNoPrefix ?? "");
                setHyperpgSubMid(data.settings.hyperpgSubMid ?? "");
            }
        }

        fetchSchool();
        fetchSettings();
    }, [session]);

    if (status === "loading") return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#808080] mx-auto mb-4"></div>
                <p className="text-white">Loading session…</p>
            </div>
        </div>
    );
    if (!session) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <p className="p-6 text-red-400">Not authenticated</p>
        </div>
    );

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        const res = await fetch("/api/school/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, address, location }),
        });
        const data = await res.json();
        setMsg(data.message);
        if (data.school) setSchool(data.school);
        if (data.school) setShowForm(false);
    }

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault();
        const res = await fetch("/api/school/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, address, location }),
        });
        const data = await res.json();
        setMsg(data.message);
        if (data.updated) setSchool(data.updated);
        if (data.updated) setShowForm(false);
    }

    return (
        <div className="min-h-screen bg-black p-4 md:p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#2d2d2d] to-[#404040] rounded-xl flex items-center justify-center border border-[#333333] shadow-lg">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            School Details
                        </h1>
                        <p className="text-[#808080] text-sm md:text-base">Manage your school information</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowForm(!showForm)}
                        className="bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 border border-[#333333] hover:border-[#808080] shadow-lg"
                    >
                        <Mail size={18} />
                        {session.user?.email}
                    </motion.button>
                </motion.div>

                {/* Message */}
                {msg && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border flex items-center gap-3 ${
                            msg.includes("success") || msg.includes("updated") || msg.includes("created")
                                ? "bg-[#2d2d2d] text-white border-[#404040]"
                                : "bg-red-500/10 text-red-400 border-red-500/30"
                        }`}
                    >
                        <CheckCircle size={20} />
                        {msg}
                    </motion.div>
                )}

                {/* Show existing school */}
                <AnimatePresence>
                    {school && !showForm && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
                            <div className="relative">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center border border-green-500/30">
                                        <Building2 className="w-8 h-8 text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Your School</h3>
                                        <p className="text-[#808080] text-sm">School information</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-2">
                                    <div className="bg-[#2d2d2d]/50 border border-[#404040] rounded-lg p-4 hover:bg-[#404040]/50 transition">
                                        <p className="text-sm text-[#808080] mb-1 flex items-center gap-2">
                                            <Building2 size={14} />
                                            School ID
                                        </p>
                                        <p className="text-lg font-semibold text-white">{school.id}</p>
                                    </div>
                                    <div className="bg-[#2d2d2d]/50 border border-[#404040] rounded-lg p-4 hover:bg-[#404040]/50 transition">
                                        <p className="text-sm text-[#808080] mb-1 flex items-center gap-2">
                                            <Building2 size={14} />
                                            School Name
                                        </p>
                                        <p className="text-lg font-semibold text-white">{school.name}</p>
                                    </div>
                                    <div className="bg-[#2d2d2d]/50 border border-[#404040] rounded-lg p-4 hover:bg-[#404040]/50 transition">
                                        <p className="text-sm text-[#808080] mb-1 flex items-center gap-2">
                                            <MapPin size={14} />
                                            Address
                                        </p>
                                        <p className="text-lg font-medium text-white">{school.address}</p>
                                    </div>
                                    <div className="bg-[#2d2d2d]/50 border border-[#404040] rounded-lg p-4 hover:bg-[#404040]/50 transition">
                                        <p className="text-sm text-[#808080] mb-1 flex items-center gap-2">
                                            <MapPin size={14} />
                                            Location
                                        </p>
                                        <p className="text-lg font-medium text-white">{school.location}</p>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowForm(true)}
                                    className="mt-6 w-full md:w-auto bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 border border-[#333333] hover:border-[#808080] shadow-lg"
                                >
                                    <Edit size={18} />
                                    Edit School Details
                                </motion.button>

                                {/* Admission & Roll Number Prefixes */}
                                <div className="mt-8 pt-6 border-t border-[#404040]">
                                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                        <FileText size={18} />
                                        Admission & Roll Number Prefixes
                                    </h3>
                                    {settingsMsg && (
                                        <p className={`text-sm mb-3 ${settingsMsg.includes("success") ? "text-green-400" : "text-red-400"}`}>{settingsMsg}</p>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-[#2d2d2d]/50 border border-[#404040] rounded-lg p-4">
                                            <p className="text-sm text-[#808080] mb-2 flex items-center gap-2"><Hash size={14} /> Admission prefix</p>
                                            <input
                                                value={admissionPrefix}
                                                onChange={(e) => setAdmissionPrefix(e.target.value)}
                                                className="w-full bg-[#1a1a1a] border border-[#404040] text-white px-3 py-2 rounded-lg"
                                                placeholder="e.g. ADM"
                                            />
                                        </div>
                                        <div className="bg-[#2d2d2d]/50 border border-[#404040] rounded-lg p-4">
                                            <p className="text-sm text-[#808080] mb-2 flex items-center gap-2"><Hash size={14} /> Roll number prefix</p>
                                            <input
                                                value={rollNoPrefix}
                                                onChange={(e) => setRollNoPrefix(e.target.value)}
                                                className="w-full bg-[#1a1a1a] border border-[#404040] text-white px-3 py-2 rounded-lg"
                                                placeholder="e.g. R"
                                            />
                                        </div>
                                        <div className="bg-[#2d2d2d]/50 border border-[#404040] rounded-lg p-4 md:col-span-2">
                                            <p className="text-sm text-[#808080] mb-2 flex items-center gap-2"><FileText size={14} /> HyperPG Sub-Merchant ID (optional)</p>
                                            <input
                                                value={hyperpgSubMid}
                                                onChange={(e) => setHyperpgSubMid(e.target.value)}
                                                className="w-full bg-[#1a1a1a] border border-[#404040] text-white px-3 py-2 rounded-lg"
                                                placeholder="Sub Account Id from HyperPG dashboard"
                                            />
                                            <p className="text-xs text-[#6b6b6b] mt-1">If set, fee payments for this school are settled to this sub-merchant.</p>
                                        </div>
                                    </div>
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={async () => {
                                            const res = await fetch("/api/school/settings", {
                                                method: "PUT",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ admissionPrefix, rollNoPrefix, hyperpgSubMid: hyperpgSubMid || null }),
                                            });
                                            const data = await res.json();
                                            setSettingsMsg(res.ok ? "Settings saved successfully." : (data.message || "Failed to save"));
                                        }}
                                        className="mt-3 px-4 py-2 rounded-lg bg-[#404040] hover:bg-[#6b6b6b] text-white text-sm font-medium"
                                    >
                                        Save prefixes
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
                            <div className="relative">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#404040] to-[#2d2d2d] rounded-xl flex items-center justify-center border border-[#333333]">
                                        <Building2 className="w-6 h-6 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {school ? "Update School" : "Create School"}
                                    </h2>
                                </div>

                                <form
                                    onSubmit={school ? handleUpdate : handleCreate}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                                            <Building2 size={16} />
                                            School Name <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            className="w-full bg-[#2d2d2d] border border-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                                            placeholder="Enter school name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                                            <MapPin size={16} />
                                            Address <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            className="w-full bg-[#2d2d2d] border border-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                                            placeholder="Enter school address"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                                            <MapPin size={16} />
                                            Location <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            className="w-full bg-[#2d2d2d] border border-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                                            placeholder="Enter location"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-4 pt-2">
                                        <motion.button
                                            type="submit"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                                                school
                                                    ? "bg-gradient-to-r from-yellow-600/80 to-yellow-700/80 hover:from-yellow-700 hover:to-yellow-600 text-white border border-yellow-500/30 hover:border-yellow-400 shadow-lg"
                                                    : "bg-gradient-to-r from-green-500/80 to-green-600/80 hover:from-green-600 hover:to-green-500 text-white border border-green-500/30 hover:border-green-400 shadow-lg"
                                            }`}
                                        >
                                            <Save size={18} />
                                            {school ? "Update School" : "Create School"}
                                        </motion.button>
                                        <motion.button
                                            type="button"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                setShowForm(false);
                                                if (school) {
                                                    setName(school.name);
                                                    setAddress(school.address);
                                                    setLocation(school.location);
                                                }
                                            }}
                                            className="px-6 py-3 rounded-lg font-semibold bg-[#2d2d2d] hover:bg-[#404040] text-white border border-[#333333] hover:border-[#808080] transition-all duration-300"
                                        >
                                            Cancel
                                        </motion.button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

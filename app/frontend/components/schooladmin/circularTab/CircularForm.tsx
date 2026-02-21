"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    X,
    Clock,
    Check,
    Plus,
    CircleCheckBig,
    Save,
    GraduationCap,
} from "lucide-react";
import { useClasses } from "@/hooks/useClasses";

/* -------------------- constants -------------------- */

export const PUBLISH_STATUS = {
    DRAFT: "DRAFT",
    PUBLISHED: "PUBLISHED",
} as const;

type PublishStatus =
    typeof PUBLISH_STATUS[keyof typeof PUBLISH_STATUS];

const IMPORTANCE_LEVELS = [
    { label: "High", activeClass: "bg-red-500 text-white" },
    { label: "Medium", activeClass: "bg-orange-400 text-black" },
    { label: "Low", activeClass: "bg-blue-500 text-white" },
] as const;


const CIRCULAR_RECIPIENTS = [
    { value: "all", label: "All" },
    { value: "students", label: "Students" },
    { value: "teachers", label: "Teachers" },
    { value: "parents", label: "Parents" },
    { value: "staff", label: "Staff" }
];

const CIRCULAR_PRIMARY = "#7dd3fc";
const CIRCULAR_DRAFT_YELLOW = "#facc15";
const CIRCULAR_SELECTED_RECIPIENT = "#bae6fd";
const CIRCULAR_IMPORTANCE_HIGH = "#f87171";
const CIRCULAR_IMPORTANCE_MEDIUM = "#facc15";
const CIRCULAR_IMPORTANCE_LOW = "#4ade80";

/* -------------------- types -------------------- */

type CircularFormState = {
    referenceNumber: string;
    date: string;
    subject: string;
    content: string;
    importanceLevel: "Low" | "Medium" | "High";
    recipients: string[];
    issuedBy: string;
    classId: string;
    classIds: string[];
    classTeacherOnly: boolean;
    publishStatus: PublishStatus;
    attachments: string[];
};

type Props = {
    onClose: () => void;
    onSuccess: () => void;
};

/* -------------------- component -------------------- */

export default function CircularForm({ onClose, onSuccess }: Props) {
    const [submitting, setSubmitting] = useState(false);
    const [selected, setSelected] = useState<"High" | "Medium" | "Low">("Medium");
    const { classes } = useClasses();

    const [form, setForm] = useState<CircularFormState>({
        referenceNumber: "",
        date: new Date().toISOString().slice(0, 10),
        subject: "",
        issuedBy: "",
        content: "",
        importanceLevel: "Medium",
        recipients: [],
        classId: "",
        classIds: [],
        classTeacherOnly: false,
        publishStatus: PUBLISH_STATUS.PUBLISHED,
        attachments: [],
    });

    // const toggleRecipient = (value: string) => {
    //     setForm((prev) => ({
    //         ...prev,
    //         recipients: prev.recipients.includes(value)
    //             ? prev.recipients.filter((r) => r !== value)
    //             : [...prev.recipients, value],
    //     }));
    // };

    const toggleRecipient = (value: string) => {
        setForm((prev) => {
            // If "All" is clicked
            if (value === "all") {
                return {
                    ...prev,
                    recipients: prev.recipients.includes("all") ? [] : ["all"],
                };
            }

            // If some other recipient is clicked
            let updatedRecipients = prev.recipients.filter((r) => r !== "all");

            if (updatedRecipients.includes(value)) {
                updatedRecipients = updatedRecipients.filter((r) => r !== value);
            } else {
                updatedRecipients.push(value);
            }

            return {
                ...prev,
                recipients: updatedRecipients,
            };
        });
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch("/api/circular/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error("Failed to create circular");

            onSuccess();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-[#0F172A] border border-lime-400/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-fadeIn">
            <div className="absolute top-0 left-0 w-1 h-full bg-lime-400"></div>
            {/* header */}
            <div className="flex justify-between items-center mb-6 pl-2">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Plus size={20} className="inline mr-2" /> New Circular
                </h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white"
                >
                    <X size={20} />
                </button>
            </div>

            {/* form */}
            <form onSubmit={handleSubmit} className="space-y-6 pl-2">
                {/* reference + date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Reference Number</label>
                        <input
                            placeholder="Reference Number"
                            value={form.referenceNumber}
                            onChange={(e) =>
                                setForm({ ...form, referenceNumber: e.target.value })
                            }
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-lime-400/50"
                        />
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-xs font-medium text-gray-400 mb-1.5">Date</label>
                        <input
                            type="date"
                            value={form.date}
                            onChange={(e) =>
                                setForm({ ...form, date: e.target.value })
                            }
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-lime-400/50"
                        />
                    </div>
                    {/* subject */}
                    <div className="w-full md:col-span-2    ">
                        <label htmlFor="" className="block text-xs font-medium text-gray-400 mb-1.5">Subject / Title *</label>
                        <input
                            type="text"
                            value={form.subject}
                            onChange={(e) =>
                                setForm({ ...form, subject: e.target.value })
                            }
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-lime-400/50"
                        />
                    </div>
                </div>
                {/* content */}
                <div>
                    <label htmlFor="content" className="block text-xs font-medium text-gray-400 mb-1.5">Content *</label>
                    <textarea
                        required
                        rows={5}
                        placeholder="Circular content..."
                        value={form.content}
                        onChange={(e) =>
                            setForm({ ...form, content: e.target.value })
                        }
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-lime-400/50"
                    />
                </div>
                <div>
                    <label htmlFor="" className="block text-xs font-medium text-gray-400 mb-2">Attachments</label>
                    <div className="flex flex-wrap gap-3 mb-3">
                        <button className="px-3 py-2 bg-white/5 border border-dashed border-white/20 rounded-lg text-sm text-gray-400 hover:text-white hover:border-lime-400/50 hover:bg-lime-400/5 transition-all flex items-center gap-2"> Attach Document</button>

                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="" className="block text-xs font-medium text-gray-400 mb-1.5">Issued by</label>
                        <input type="text" value={form.issuedBy} onChange={(e) => setForm({ ...form, issuedBy: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-gray-200 focus:outline-none focus:border-lime-400/50" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Importance</label>
                        {/* importance */}
                        <div className="flex bg-black/20 rounded-xl p-1 border border-white/10">
                            {IMPORTANCE_LEVELS.map(({ label, activeClass }) => {
                                const isActive = selected === label;

                                return (
                                    <button
                                        key={label}
                                        type="button"
                                        onClick={() => {
                                            setSelected(label);
                                            setForm((f) => ({ ...f, importanceLevel: label }));
                                        }}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all
          ${isActive
                                                ? activeClass
                                                : "text-gray-400 hover:text-gray-200"
                                            }`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>


                    </div>
                </div>


                {/* target classes - class-wise circular */}
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5">
                        <GraduationCap size={14} /> Target Class(es) (optional)
                    </label>
                    <p className="text-xs text-white/50 mb-2">
                        Leave empty for school-wide. Select one or more classes to target students, parents, or class teachers of those classes only.
                    </p>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-black/10 rounded-xl border border-white/10">
                        {classes.map((c) => {
                            const isSelected = form.classIds.includes(c.id);
                            return (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => {
                                        const next = isSelected
                                            ? form.classIds.filter((id) => id !== c.id)
                                            : [...form.classIds, c.id];
                                        setForm({
                                            ...form,
                                            classIds: next,
                                            classId: next[0] ?? "",
                                        });
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                                        ${isSelected ? "bg-lime-400/20 text-lime-400 border-lime-400/50" : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"}
                                    `}
                                >
                                    {c.name}{c.section ? ` ${c.section}` : ""}
                                </button>
                            );
                        })}
                    </div>
                    {form.classIds.length > 0 && (
                        <p className="text-xs text-lime-400/80 mt-1">
                            {form.classIds.length} class(es) selected
                        </p>
                    )}
                </div>

                {/* recipients */}
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">
                        Recipients
                    </label>
                    <p className="text-xs text-white/50 mb-2">
                        Choose who receives this circular. If classes are selected above, students/parents/teachers apply to those classes only.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {CIRCULAR_RECIPIENTS.map((r) => {
                            const isSelected = form.recipients.includes(r.value);
                            return (
                                <button
                                    key={r.value}
                                    type="button"
                                    onClick={() => toggleRecipient(r.value)}
                                    className={`
                                        px-3 py-1.5 rounded-lg text-xs font-medium border
                                        transition-all flex items-center gap-1.5
                                        ${isSelected ? "bg-lime-400/20 text-lime-400 border-lime-400/50" : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"}
                                    `}
                                >
                                    {isSelected && (
                                        <span className="w-3.5 h-3.5 rounded-full bg-lime-400 flex items-center justify-center">
                                            <Check size={10} className="text-black" />
                                        </span>
                                    )}
                                    {r.label}
                                </button>
                            );
                        })}
                    </div>
                    {form.recipients.includes("teachers") && form.classIds.length > 0 && (
                        <label className="flex items-center gap-2 mt-3 cursor-pointer text-sm text-gray-300">
                            <input
                                type="checkbox"
                                checked={form.classTeacherOnly}
                                onChange={(e) =>
                                    setForm({ ...form, classTeacherOnly: e.target.checked })
                                }
                                className="accent-lime-400 w-4 h-4 rounded"
                            />
                            <span>Class teachers only</span>
                            <span className="text-xs text-white/50">— teachers of the selected class(es)</span>
                        </label>
                    )}
                </div>
                {/* publish status */}




                <div className="flex flex-wrap gap-6">
                    {/* Publish Now */}
                    <label className="flex items-center gap-3 cursor-pointer text-sm text-gray-300">
                        {form.publishStatus === PUBLISH_STATUS.PUBLISHED ? (
                            <CircleCheckBig className="w-5 h-5 text-green-500" />
                        ) : (
                            <input
                                type="radio"
                                name="publishStatus"
                                checked={false}
                                onChange={() =>
                                    setForm({
                                        ...form,
                                        publishStatus: PUBLISH_STATUS.PUBLISHED,
                                    })
                                }
                                className="accent-green-500 w-4 h-4"
                            />
                        )}

                        <span>Publish Immediately</span>
                    </label>

                    {/* Save as Draft */}
                    <label className="flex items-center gap-3 cursor-pointer text-sm text-gray-300">
                        {form.publishStatus === PUBLISH_STATUS.DRAFT ? (
                            <Clock className="w-5 h-5 text-yellow-400" />
                        ) : (
                            <input
                                type="radio"
                                name="publishStatus"
                                checked={false}
                                onChange={() =>
                                    setForm({
                                        ...form,
                                        publishStatus: PUBLISH_STATUS.DRAFT,
                                    })
                                }
                                className="accent-yellow-400 w-4 h-4 "
                            />
                        )}

                        <span>Save as Draft</span>
                    </label>
                </div>



                {/* actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-400 font-medium hover:bg-white/5 transition-all"
                    >
                        Cancel
                    </button>

                    <motion.button
                        type="submit"
                        disabled={false}
                        whileTap={{ scale: 0.97 }}
                        className="px-6 py-2.5 bg-lime-400 hover:bg-lime-500 text-black font-bold rounded-xl shadow-lg shadow-lime-400/20 transition-all flex items-center gap-2"
                       
                    >
                        <Save size={18} className="inline" />
                        Create Circular
                    </motion.button>
                </div>
            </form>
        </div>
    );
}

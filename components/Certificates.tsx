"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Award, Plus, X, FileText, User, Calendar, Save, CheckCircle2, AlertCircle, GraduationCap, ExternalLink, Image as ImageIcon, Loader2 } from "lucide-react";
import { uploadImage } from "@/app/frontend/utils/upload";

interface CertificateTemplate {
  id: string;
  name: string;
  description: string | null;
  template: string;
  imageUrl: string | null;
  createdAt: string;
  createdBy: { id: string; name: string | null; email: string | null };
  _count: { certificates: number };
}

interface Certificate {
  id: string;
  title: string;
  description: string | null;
  issuedDate: string;
  certificateUrl: string | null;
  student: {
    id: string;
    user: { id: string; name: string | null; email: string | null };
  };
  template: { id: string; name: string };
  issuedBy: { id: string; name: string | null; email: string | null };
}

interface Student {
  id: string;
  user: { id: string; name: string | null; email: string | null };
  class: { id: string; name: string; section: string | null } | null;
}

export default function CertificatesPage() {
  const { data: session, status } = useSession();
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    template: "",
    imageUrl: "",
  });
  const [imageUploading, setImageUploading] = useState(false);
  const templateImageInputRef = useRef<HTMLInputElement>(null);
  const [assignForm, setAssignForm] = useState({
    templateId: "",
    studentId: "",
    title: "",
    description: "",
    certificateUrl: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (session) {
      fetchTemplates();
      fetchCertificates();
      fetchStudents();
    }
  }, [session]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/certificates/template/list");
      const data = await res.json();
      if (res.ok && data.templates) {
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error("Error fetching templates:", err);
    }
  };

  const fetchCertificates = async () => {
    try {
      const res = await fetch("/api/certificates/list");
      const data = await res.json();
      if (res.ok && data.certificates) {
        setCertificates(data.certificates);
      }
    } catch (err) {
      console.error("Error fetching certificates:", err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/student/list");
      const data = await res.json();
      if (res.ok && data.students) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.name || !templateForm.template) {
      setMessage("Name and template are required");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/certificates/template/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateForm.name,
          description: templateForm.description || null,
          template: templateForm.template,
          imageUrl: templateForm.imageUrl || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to create template");
        return;
      }

      setMessage("Certificate template created successfully!");
      setTemplateForm({ name: "", description: "", template: "", imageUrl: "" });
      setShowTemplateForm(false);
      fetchTemplates();
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.templateId || !assignForm.studentId || !assignForm.title) {
      setMessage("Template, student, and title are required");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/certificates/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: assignForm.templateId,
          studentId: assignForm.studentId,
          title: assignForm.title,
          description: assignForm.description || null,
          certificateUrl: assignForm.certificateUrl || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to assign certificate");
        return;
      }

      setMessage("Certificate assigned successfully!");
      setAssignForm({
        templateId: "",
        studentId: "",
        title: "",
        description: "",
        certificateUrl: "",
      });
      setShowAssignForm(false);
      fetchCertificates();
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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
                <Award className="w-6 h-6 text-white" />
              </div>
              Certificates Management
            </h1>
            <p className="text-[#808080] text-sm md:text-base">Create templates and assign certificates to students</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowAssignForm(false);
                setShowTemplateForm(!showTemplateForm);
              }}
              className="bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 border border-[#333333] hover:border-[#808080] shadow-lg"
            >
              {showTemplateForm ? (
                <>
                  <X size={18} />
                  Cancel
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Create Template
                </>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowTemplateForm(false);
                setShowAssignForm(!showAssignForm);
              }}
              className="bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 border border-[#333333] hover:border-[#808080] shadow-lg"
            >
              {showAssignForm ? (
                <>
                  <X size={18} />
                  Cancel
                </>
              ) : (
                <>
                  <Award size={18} />
                  Assign Certificate
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border flex items-center gap-3 ${
              message.includes("successfully")
                ? "bg-[#2d2d2d] text-white border-[#404040]"
                : "bg-red-500/10 text-red-400 border-red-500/30"
            }`}
          >
            {message.includes("successfully") ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            {message}
          </motion.div>
        )}

        {/* Create Template Form */}
        {showTemplateForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
            <div className="relative">
              <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                <FileText size={24} />
                Create Certificate Template
              </h2>
              <form onSubmit={handleCreateTemplate} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                    <FileText size={16} />
                    Template Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) =>
                      setTemplateForm({ ...templateForm, name: e.target.value })
                    }
                    required
                    placeholder="e.g., Academic Excellence"
                    className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                    <FileText size={16} />
                    Description
                  </label>
                  <textarea
                    value={templateForm.description}
                    onChange={(e) =>
                      setTemplateForm({ ...templateForm, description: e.target.value })
                    }
                    rows={3}
                    className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                    <FileText size={16} />
                    Template Content (HTML/JSON) <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={templateForm.template}
                    onChange={(e) =>
                      setTemplateForm({ ...templateForm, template: e.target.value })
                    }
                    required
                    rows={8}
                    placeholder="Enter template HTML or JSON content..."
                    className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b] font-mono text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                    <ImageIcon size={16} />
                    Background image (upload to bucket or URL)
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      ref={templateImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file?.type.startsWith("image/")) return;
                        setImageUploading(true);
                        try {
                          const url = await uploadImage(file, "certificates");
                          setTemplateForm((f) => ({ ...f, imageUrl: url }));
                        } catch (err) {
                          setMessage(err instanceof Error ? err.message : "Upload failed");
                        } finally {
                          setImageUploading(false);
                        }
                        e.target.value = "";
                      }}
                    />
                    <button
                      type="button"
                      disabled={imageUploading}
                      onClick={() => templateImageInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#404040] text-white/80 hover:bg-[#2d2d2d] disabled:opacity-60"
                    >
                      {imageUploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                      {imageUploading ? "Uploading…" : "Upload image"}
                    </button>
                    <input
                      type="text"
                      value={templateForm.imageUrl}
                      onChange={(e) =>
                        setTemplateForm({ ...templateForm, imageUrl: e.target.value })
                      }
                      placeholder="Or paste image URL"
                      className="flex-1 min-w-[200px] bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent placeholder-[#6b6b6b]"
                    />
                  </div>
                  {templateForm.imageUrl && (
                    <div className="mt-2 relative inline-block">
                      <img src={templateForm.imageUrl} alt="Template" className="max-h-24 rounded-lg border border-[#404040] object-cover" />
                      <button type="button" onClick={() => setTemplateForm((f) => ({ ...f, imageUrl: "" }))} className="absolute top-1 right-1 p-1 rounded bg-black/60 text-white hover:bg-black/80"><X size={14} /></button>
                    </div>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white py-3.5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 border border-[#333333] hover:border-[#808080] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>Create Template</span>
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Assign Certificate Form */}
        {showAssignForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
            <div className="relative">
              <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                <Award size={24} />
                Assign Certificate to Student
              </h2>
              <form onSubmit={handleAssignCertificate} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                      <FileText size={16} />
                      Template <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={assignForm.templateId}
                      onChange={(e) =>
                        setAssignForm({ ...assignForm, templateId: e.target.value })
                      }
                      required
                      className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition"
                    >
                      <option value="" className="bg-[#2d2d2d]">Select Template</option>
                      {templates.map((t) => (
                        <option key={t.id} value={t.id} className="bg-[#2d2d2d]">
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                      <User size={16} />
                      Student <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={assignForm.studentId}
                      onChange={(e) =>
                        setAssignForm({ ...assignForm, studentId: e.target.value })
                      }
                      required
                      className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition"
                    >
                      <option value="" className="bg-[#2d2d2d]">Select Student</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id} className="bg-[#2d2d2d]">
                          {s.user.name} {s.class ? `(${s.class.name})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                    <Award size={16} />
                    Certificate Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={assignForm.title}
                    onChange={(e) =>
                      setAssignForm({ ...assignForm, title: e.target.value })
                    }
                    required
                    placeholder="e.g., Academic Excellence Award"
                    className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                    <FileText size={16} />
                    Description
                  </label>
                  <textarea
                    value={assignForm.description}
                    onChange={(e) =>
                      setAssignForm({ ...assignForm, description: e.target.value })
                    }
                    rows={3}
                    className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                    <ImageIcon size={16} />
                    Certificate URL (Generated PDF/Image)
                  </label>
                  <input
                    type="text"
                    value={assignForm.certificateUrl}
                    onChange={(e) =>
                      setAssignForm({ ...assignForm, certificateUrl: e.target.value })
                    }
                    placeholder="https://example.com/certificate.pdf"
                    className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white py-3.5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 border border-[#333333] hover:border-[#808080] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Assigning...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>Assign Certificate</span>
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Templates List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-lg p-6 hover:border-[#404040] transition"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FileText size={20} />
            Certificate Templates ({templates.length})
          </h2>
          {templates.length === 0 ? (
            <p className="text-[#808080] text-center py-4">No templates created yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] border border-[#404040] rounded-xl p-4 hover:border-[#808080] transition-all duration-300 shadow-lg"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#404040]/20 to-transparent rounded-bl-full"></div>
                  <div className="relative">
                    <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                      <Award size={18} className="text-[#808080]" />
                      {template.name}
                    </h3>
                    {template.description && (
                      <p className="text-sm text-[#808080] mb-3">{template.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-[#808080] pt-3 border-t border-[#333333]">
                      <Award size={14} />
                      <span>{template._count.certificates} certificate(s) issued</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Certificates List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-lg p-6 hover:border-[#404040] transition"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Award size={20} />
            Issued Certificates ({certificates.length})
          </h2>
          {certificates.length === 0 ? (
            <p className="text-[#808080] text-center py-4">No certificates issued yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#2d2d2d] border-b border-[#333333]">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                        <FileText size={16} />
                        Title
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        Student
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                        <FileText size={16} />
                        Template
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        Issued By
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        Date
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                        <ExternalLink size={16} />
                        Actions
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333333]">
                  {certificates.map((cert, index) => (
                    <motion.tr
                      key={cert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-[#2d2d2d] transition"
                    >
                      <td className="px-4 py-4 font-medium text-white">{cert.title}</td>
                      <td className="px-4 py-4 text-[#808080]">{cert.student.user.name}</td>
                      <td className="px-4 py-4 text-[#808080]">{cert.template.name}</td>
                      <td className="px-4 py-4 text-[#808080]">{cert.issuedBy.name}</td>
                      <td className="px-4 py-4 text-[#808080]">
                        {new Date(cert.issuedDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        {cert.certificateUrl && (
                          <motion.a
                            href={cert.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="inline-flex items-center gap-1 text-green-400 hover:text-green-300 text-sm font-medium transition"
                          >
                            <ExternalLink size={14} />
                            View
                          </motion.a>
                        )}
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

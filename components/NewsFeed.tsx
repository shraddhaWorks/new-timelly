"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper, Plus, Edit, Trash2, X, Image, Video, FileText, Save, AlertCircle, User, Calendar } from "lucide-react";

interface NewsFeed {
  id: string;
  title: string;
  description: string;
  mediaUrl: string | null;
  mediaType: string | null;
  createdAt: string;
  createdBy: { id: string; name: string | null; email: string | null };
}

export default function NewsFeedPage() {
  const { data: session, status } = useSession();
  const [newsFeeds, setNewsFeeds] = useState<NewsFeed[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingFeed, setEditingFeed] = useState<NewsFeed | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    mediaUrl: "",
    mediaType: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (session) {
      fetchNewsFeeds();
    }
  }, [session]);

  const fetchNewsFeeds = async () => {
    try {
      const res = await fetch("/api/newsfeed/list");
      const data = await res.json();
      if (res.ok && data.newsFeeds) {
        setNewsFeeds(data.newsFeeds);
      }
    } catch (err) {
      console.error("Error fetching news feeds:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      setMessage("Title and description are required");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const url = editingFeed
        ? `/api/newsfeed/${editingFeed.id}`
        : "/api/newsfeed/create";
      const method = editingFeed ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          mediaUrl: form.mediaUrl || null,
          mediaType: form.mediaType || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to save news feed");
        return;
      }

      setMessage(editingFeed ? "News feed updated successfully!" : "News feed created successfully!");
      setForm({ title: "", description: "", mediaUrl: "", mediaType: "" });
      setShowForm(false);
      setEditingFeed(null);
      fetchNewsFeeds();
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (feed: NewsFeed) => {
    setEditingFeed(feed);
    setForm({
      title: feed.title,
      description: feed.description,
      mediaUrl: feed.mediaUrl || "",
      mediaType: feed.mediaType || "",
    });
    setShowForm(true);
    setMessage("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this news feed?")) return;

    try {
      const res = await fetch(`/api/newsfeed/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to delete news feed");
        return;
      }

      alert("News feed deleted successfully!");
      fetchNewsFeeds();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingFeed(null);
    setForm({ title: "", description: "", mediaUrl: "", mediaType: "" });
    setMessage("");
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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2d2d2d] to-[#404040] rounded-xl flex items-center justify-center border border-[#333333] shadow-lg">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              News Feed Management
            </h1>
            <p className="text-[#808080] text-sm md:text-base">Create and manage news updates</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              handleCancel();
              setShowForm(!showForm);
            }}
            className="bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 border border-[#333333] hover:border-[#808080] shadow-lg"
          >
            {showForm ? (
              <>
                <X size={18} />
                Cancel
              </>
            ) : (
              <>
                <Plus size={18} />
                Create News Feed
              </>
            )}
          </motion.button>
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
            <AlertCircle size={20} />
            {message}
          </motion.div>
        )}

        {/* Create/Edit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
              <div className="relative">
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                  <FileText size={24} />
                  {editingFeed ? "Edit News Feed" : "Create News Feed"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                      <FileText size={16} />
                      Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                      className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                      placeholder="Enter news title..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                      <FileText size={16} />
                      Description <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      required
                      rows={5}
                      className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b] resize-none"
                      placeholder="Enter news description..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                      <Image size={16} />
                      Media URL (Photo/Video)
                    </label>
                    <input
                      type="text"
                      value={form.mediaUrl}
                      onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                      <Video size={16} />
                      Media Type
                    </label>
                    <select
                      value={form.mediaType}
                      onChange={(e) => setForm({ ...form, mediaType: e.target.value })}
                      className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition"
                    >
                      <option value="" className="bg-[#2d2d2d]">None</option>
                      <option value="PHOTO" className="bg-[#2d2d2d]">Photo</option>
                      <option value="VIDEO" className="bg-[#2d2d2d]">Video</option>
                    </select>
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
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        <span>{editingFeed ? "Update News Feed" : "Create News Feed"}</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* News Feeds List */}
        {newsFeeds.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-12 text-center"
          >
            <Newspaper className="w-16 h-16 mx-auto mb-4 text-[#808080] opacity-50" />
            <p className="text-[#808080] text-lg">No news feeds found</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {newsFeeds.map((feed, index) => (
              <motion.div
                key={feed.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-lg p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
                <div className="relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                        <Newspaper className="w-6 h-6 text-[#808080]" />
                        {feed.title}
                      </h3>
                      <p className="text-[#808080] whitespace-pre-wrap mb-6 leading-relaxed">
                        {feed.description}
                      </p>
                      {feed.mediaUrl && (
                        <div className="mt-6 mb-4 rounded-xl overflow-hidden border border-[#333333] hover:border-[#404040] transition">
                          {feed.mediaType === "VIDEO" ? (
                            <video
                              src={feed.mediaUrl}
                              controls
                              className="w-full rounded-lg max-h-96"
                            />
                          ) : (
                            <img
                              src={feed.mediaUrl}
                              alt={feed.title}
                              className="w-full rounded-lg max-h-96 object-cover"
                            />
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-[#808080] pt-4 border-t border-[#333333]">
                        <div className="flex items-center gap-2">
                          <User size={14} />
                          <span>Created by: <span className="text-white font-medium">{feed.createdBy.name}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>{new Date(feed.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    {session.user.role === "SCHOOLADMIN" && (
                      <div className="flex gap-2 ml-4">
                        <motion.button
                          onClick={() => handleEdit(feed)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                        >
                          <Edit size={16} />
                          Edit
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(feed.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          Delete
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

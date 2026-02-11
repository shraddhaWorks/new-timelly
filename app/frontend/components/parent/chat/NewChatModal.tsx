"use client";

import { X } from "lucide-react";
import { useState } from "react";

type Props = {
  onClose: () => void;
};

export default function NewChatModal({ onClose }: Props) {
  const [recipient, setRecipient] = useState("Mr. Rajesh Kumar - Mathematics");
  const [topic, setTopic] = useState("Academic Performance");
  const [message, setMessage] = useState("");

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-[#0f1b2d] rounded-2xl border border-white/10 shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            New Chat Request
          </h2>
          <button onClick={onClose}>
            <X className="text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">

          {/* Recipient */}
          <div>
            <label className="text-xs text-gray-400 block mb-2">
              SELECT RECIPIENT
            </label>
            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white"
            >
              <option>Mr. Rajesh Kumar - Mathematics</option>
              <option>Ms. Priya Sharma - English</option>
              <option>Mr. Arjun Patel - Science</option>
            </select>
          </div>

          {/* Topic */}
          <div>
            <label className="text-xs text-gray-400 block mb-2">
              TOPIC
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white"
            >
              <option>Academic Performance</option>
              <option>Attendance</option>
              <option>Behavior</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="text-xs text-gray-400 block mb-2">
              MESSAGE
            </label>
            <textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white h-32 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="bg-white/10 text-gray-300 px-6 py-2 rounded-xl"
          >
            Cancel
          </button>

          <button
            onClick={onClose}
            className="bg-lime-400 text-black font-semibold px-6 py-2 rounded-xl hover:bg-lime-300"
          >
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
}

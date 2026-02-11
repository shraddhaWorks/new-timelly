"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Check,
  X,
  Paperclip,
  Send,
  UserPlus,
  Phone,
  Video,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Chat } from "./ChatList";

type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
};

type Props = {
  chat: Chat;
  onBack: () => void;
  onApprove: () => void;
  onReject: () => void;
};

export default function ChatWindow({
  chat,
  onBack,
  onApprove,
  onReject,
}: Props) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (chat.status !== "approved") return;
    setLoadingMessages(true);
    try {
      const res = await fetch(
        `/api/communication/messages?appointmentId=${encodeURIComponent(
          chat.id
        )}`
      );
      if (!res.ok) return;
      const data = await res.json();
      setMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [chat.id, chat.status]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSend = async () => {
    const text = messageInput.trim();
    if (!text || sending || chat.status !== "approved") return;
    setSending(true);
    try {
      const res = await fetch("/api/communication/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: chat.id, content: text }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error(data?.message ?? "Failed to send");
        return;
      }
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setMessageInput("");
    } catch (e) {
      console.error("Send error:", e);
    } finally {
      setSending(false);
    }
  };

  const isPending = chat.status === "pending";
  const isRejected = chat.status === "rejected";
  const myId = session?.user?.id ?? "";

  return (
    <div className="flex flex-col h-full w-full">

      {/* ================= Header ================= */}
      <div className="p-3 md:p-4 border-b border-white/10">
        <div className="flex items-center justify-between gap-3">

          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="lg:hidden text-white shrink-0"
            >
              <ArrowLeft />
            </button>

            <img
              src={chat.avatar}
              alt={chat.parent}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover shrink-0"
            />

            <div className="min-w-0">
              <p className="font-semibold text-white truncate">
                {chat.parent}
              </p>
              <p className="text-xs md:text-sm text-lime-400 truncate">
                Parent of {chat.student}
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Voice & Video (Only if Approved) */}
            {!isPending && !isRejected && (
              <>
                <button
                  onClick={() => alert("Starting voice call...")}
                  className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition"
                >
                  <Phone size={18} />
                </button>

                <button
                  onClick={() => alert("Starting video call...")}
                  className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition"
                >
                  <Video size={18} />
                </button>
              </>
            )}

            {/* Approve / Reject (Only if Pending) */}
            {isPending && (
              <>
                <button
                  onClick={onApprove}
                  className="px-3 py-1.5 rounded-full bg-lime-400 text-black text-xs md:text-sm flex items-center gap-1"
                >
                  <Check size={14} />
                  <span className="hidden sm:inline">Approve</span>
                </button>

                <button
                  onClick={onReject}
                  className="px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 text-xs md:text-sm flex items-center gap-1"
                >
                  <X size={14} />
                  <span className="hidden sm:inline">Reject</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ================= Body ================= */}
      {isPending && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
            <UserPlus className="text-lime-400" size={28} />
          </div>

          <p className="text-lg text-white/80">
            {chat.parent} wants to connect with you
          </p>
          <p className="text-sm text-white/40 mt-2">
            Approve to start chatting
          </p>
        </div>
      )}

      {!isPending && !isRejected && (
        <div className="flex-1 p-3 md:p-4 space-y-3 overflow-y-auto">
          {loadingMessages ? (
            <div className="text-center text-gray-400 text-sm py-4">
              Loading...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-4">
              No messages yet. Start the conversation.
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.senderId === myId;
              return (
                <div
                  key={m.id}
                  className={`max-w-[75%] rounded-xl p-3 text-sm ${
                    isMe
                      ? "ml-auto bg-lime-500 text-black"
                      : "bg-white/10 text-white"
                  }`}
                >
                  {m.content}
                </div>
              );
            })
          )}
        </div>
      )}

      {isRejected && (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          This conversation has been closed.
        </div>
      )}

      {/* ================= Input ================= */}
      {!isRejected && (
        <div className="p-3 md:p-4 border-t border-white/10 flex items-center gap-3">
          <Paperclip className="text-gray-400 shrink-0" />

          <input
            disabled={isPending}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 bg-white/5 rounded-lg px-4 py-2 text-sm outline-none text-white disabled:opacity-40"
            placeholder={
              isPending
                ? "Approve request to start chatting…"
                : "Type a message…"
            }
          />

          <button
            disabled={isPending || sending}
            onClick={handleSend}
            className="text-lime-400 disabled:opacity-40"
          >
            <Send />
          </button>
        </div>
      )}
    </div>
  );
}

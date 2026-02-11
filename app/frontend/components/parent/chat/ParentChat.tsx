"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import SearchInput from "../../common/SearchInput";
import ChatWindow from "../../teacher/parentchat/ChatWindow";
import { Chat, Status } from "../../teacher/parentchat/ChatList";
import NewChatModal from "./NewChatModal";

/* ================= Dummy Chats ================= */

const DUMMY_CHATS: Chat[] = [
  {
    id: "1",
    parent: "Mrs. Meera Singh",
    student: "Aarav Singh",
    lastMessage: "Request for leave approval",
    status: "pending",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  },
  {
    id: "2",
    parent: "Mr. Vikram Reddy",
    student: "Rohan Reddy",
    lastMessage: "Meeting request regarding performance",
    status: "approved",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
  },
  {
    id: "3",
    parent: "Mrs. Anjali Sharma",
    student: "Diya Sharma",
    lastMessage: "Concern about math homework",
    status: "approved",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
  },
];

export default function TeacherParentChatTab() {
  const [activeTab, setActiveTab] = useState<"all" | Status>("all");
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);


  /* ================= Load Dummy Chats ================= */

  useEffect(() => {
    setChats(DUMMY_CHATS);
    setLoading(false);
  }, []);

  const activeChat =
    chats.find((c) => c.id === activeChatId) ?? null;

  const filteredChats =
    activeTab === "all"
      ? chats
      : chats.filter((c) => c.status === activeTab);

  /* ================= Approve Only ================= */

  const approveChat = (id: string) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "approved" } : c
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br p-4 lg:p-6">
      <div className="flex flex-1 gap-6 overflow-hidden h-[90vh]">

        {/* ================= Sidebar ================= */}
        <div
          className={`backdrop-blur-xl bg-white/5 border border-white/10 
          rounded-2xl flex-col overflow-hidden
          ${activeChat ? "hidden lg:flex" : "flex"}
          w-full lg:w-96`}
        >

          {/* Tabs */}
          <div className="p-3 flex gap-2 border-b border-white/10">
            {(["all", "approved", "pending"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs capitalize transition
                    ${
                      activeTab === tab
                        ? "bg-lime-400 text-black font-semibold"
                        : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          {/* Search */}
          <div className="p-4 border-b border-white/10">
            <SearchInput icon={Search} />
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {loading ? (
              <div className="text-center text-gray-400 text-sm">
                Loading...
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="text-center text-gray-400 text-sm">
                No conversations
              </div>
            ) : (
              filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className="w-full p-3 rounded-xl flex gap-3 
                  bg-white/5 hover:bg-white/15 
                  transition-all duration-200 text-left"
                >
                  <img
                    src={chat.avatar}
                    alt={chat.parent}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-sm text-white truncate">
                        {chat.parent}
                      </p>

                      {chat.status === "pending" && (
                        <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                          Pending
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-lime-400 truncate">
                      Parent of {chat.student}
                    </p>

                    <p className="text-xs text-gray-400 truncate">
                      {chat.lastMessage}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Bottom Button */}
          <div className="p-4 border-t border-white/10">
            <button  onClick={() => setShowModal(true)}  className="w-full bg-lime-400 text-black font-semibold py-2 rounded-xl hover:bg-lime-300 transition">
              New Chat Request
            </button>
            
          </div>
        
        </div>
  {showModal && <NewChatModal onClose={() => setShowModal(false)} />}
        {/* ================= Chat Window ================= */}
        <div
          className={`flex-1 backdrop-blur-xl bg-white/5 border border-white/10 
          rounded-2xl overflow-hidden
          ${activeChat ? "flex" : "hidden lg:flex"}`}
        >
          {activeChat ? (
            <ChatWindow
              chat={activeChat}
              onBack={() => setActiveChatId(null)}
              onApprove={() => approveChat(activeChat.id)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

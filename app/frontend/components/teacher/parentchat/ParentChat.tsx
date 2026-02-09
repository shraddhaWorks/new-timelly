"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import PageHeader from "../../common/PageHeader";
import SearchInput from "../../common/SearchInput";
import ChatWindow from "./ChatWindow";
import { Chat, Status } from "./ChatList";

const INITIAL_CHATS: Chat[] = [
    {
        id: 1,
        parent: "Dr. Vikram Singh",
        student: "Kabir Singh",
        lastMessage: "Request to connect",
        status: "pending",
        avatar:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    },
    {
        id: 2,
        parent: "Mrs. Sonia Verma",
        student: "Aditi Verma",
        lastMessage: "Regarding homework",
        status: "approved",
        avatar:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
    },
];


export default function TeacherParentChatTab() {
    const [activeTab, setActiveTab] = useState<"all" | Status>("all");
    const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
    const [activeChatId, setActiveChatId] = useState<number | null>(null);

    const activeChat = chats.find(c => c.id === activeChatId) || null;

    const filteredChats =
        activeTab === "all"
            ? chats
            : chats.filter(c => c.status === activeTab);

    const updateStatus = (id: number, status: Status) => {
        setChats(prev =>
            prev.map(c => (c.id === id ? { ...c, status } : c))
        );
    };

    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col gap-6">
            <PageHeader
                title="Parent Communication"
                subtitle="Manage chat requests and conversations"
            />

            <div className="flex flex-1 gap-6 overflow-hidden">
                {/* ================= Sidebar ================= */}
                <div
                    className={`glass-card rounded-2xl flex-col overflow-hidden
          ${activeChat ? "hidden lg:flex" : "flex"}
          w-full lg:w-96`}
                >
                    {/* Tabs */}
                    <div className="p-3 flex gap-2 border-b border-white/10">
                        {["all", "approved", "pending", "rejected"].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-3 py-1.5 rounded-lg text-xs capitalize
                  ${activeTab === tab
                                        ? "bg-lime-500 text-black"
                                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="p-4 border-b border-white/10">
                        <SearchInput icon={Search} />
                    </div>

                    {/* Chat List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {filteredChats.map(chat => (
                            <button
                                key={chat.id}
                                onClick={() => setActiveChatId(chat.id)}
                                className="w-full p-3 rounded-xl flex gap-3 bg-white/5 hover:bg-white/10 transition text-left"
                            >
                                {/* Avatar */}
                                <img
                                    src={chat.avatar}
                                    alt={chat.parent}
                                    className="w-12 h-12 rounded-full object-cover shrink-0"
                                />

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-white truncate">
                                        {chat.parent}
                                    </p>
                                    <p className="text-xs text-lime-400 truncate">
                                        Parent of {chat.student}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate">
                                        {chat.lastMessage}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>

                </div>

                {/* ================= Chat Window ================= */}
                <div
                    className={`flex-1 glass-card rounded-2xl overflow-hidden
          ${activeChat ? "flex" : "hidden lg:flex"}`}
                >
                    {activeChat ? (
                        <ChatWindow
                            chat={activeChat}
                            onBack={() => setActiveChatId(null)}
                            onApprove={() => updateStatus(activeChat.id, "approved")}
                            onReject={() => updateStatus(activeChat.id, "rejected")}
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

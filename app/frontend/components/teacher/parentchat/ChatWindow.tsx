
// "use client";

// import {
//   ArrowLeft,
//   Check,
//   X,
//   Paperclip,
//   Send,
//   UserPlus,
// } from "lucide-react";
// import { Chat } from "./ChatList";

// type Props = {
//   chat: Chat;
//   onBack: () => void;
//   onApprove: () => void;
//   onReject: () => void;
// };

// export default function ChatWindow({
//   chat,
//   onBack,
//   onApprove,
//   onReject,
// }: Props) {
//   const isPending = chat.status === "pending";
//   const isRejected = chat.status === "rejected";

//   return (
//     <div className="flex flex-col h-full w-full">
//       {/* ===== Header ===== */}
//       <div className="p-4 border-b border-white/10 flex justify-between items-center">
//         <div className="flex items-center gap-3">
//           <button onClick={onBack} className="lg:hidden">
//             <ArrowLeft />
//           </button>

//           <img
//             src={chat.avatar}
//             className="w-10 h-10 rounded-full object-cover"
//             alt={chat.parent}
//           />

//           <div>
//             <p className="font-semibold text-white">{chat.parent}</p>
//             <p className="text-sm text-lime-400">
//               Parent of {chat.student}
//             </p>
//           </div>
//         </div>

//         {isPending && (
//           <div className="flex gap-2">
//             <button
//               onClick={onApprove}
//               className="px-3 py-1.5 rounded-full bg-lime-400 text-black text-sm flex items-center gap-1"
//             >
//               <Check size={14} /> Approve
//             </button>
//             <button
//               onClick={onReject}
//               className="px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 text-sm flex items-center gap-1"
//             >
//               <X size={14} /> Reject
//             </button>
//           </div>
//         )}
//       </div>

//       {/* ===== Body ===== */}
//       {isPending && (
//         <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
//           <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
//             <UserPlus className="text-lime-400" size={28} />
//           </div>
//           <p className="text-lg text-white/80">
//             {chat.parent} wants to connect with you
//           </p>
//           <p className="text-sm text-white/40 mt-2">
//             Approve to start chatting
//           </p>
//         </div>
//       )}

//       {!isPending && !isRejected && (
//         <div className="flex-1 p-4 space-y-3 overflow-y-auto">
//           <div className="max-w-[70%] bg-white/10 rounded-xl p-3 text-sm">
//             Hello teacher 👋
//           </div>

//           <div className="max-w-[70%] ml-auto bg-lime-500 text-black rounded-xl p-3 text-sm">
//             Hi! How can I help?
//           </div>
//         </div>
//       )}

//       {isRejected && (
//         <div className="flex-1 flex items-center justify-center text-gray-400">
//           This conversation has been closed.
//         </div>
//       )}

//       {/* ===== Input ===== */}
//       {!isRejected && (
//         <div className="p-4 border-t border-white/10 flex items-center gap-3">
//           <Paperclip className="text-gray-400" />
//           <input
//             className="flex-1 bg-white/5 rounded-lg px-4 py-2 text-sm outline-none"
//             placeholder="Type a message…"
//           />
//           <Send className="text-lime-400" />
//         </div>
//       )}
//     </div>
//   );
// }



"use client";

import {
  ArrowLeft,
  Check,
  X,
  Paperclip,
  Send,
  UserPlus,
} from "lucide-react";
import { Chat } from "./ChatList";

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
  const isPending = chat.status === "pending";
  const isRejected = chat.status === "rejected";

  return (
    <div className="flex flex-col h-full w-full ">
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

          {/* Right (actions) */}
          {isPending && (
            <div className="flex gap-2 shrink-0">
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
            </div>
          )}
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
          <div className="max-w-[75%] bg-white/10 rounded-xl p-3 text-sm text-white">
            Hello teacher 👋
          </div>

          <div className="max-w-[75%] ml-auto bg-lime-500 text-black rounded-xl p-3 text-sm">
            Hi! How can I help?
          </div>
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
            className="flex-1 bg-white/5 rounded-lg px-4 py-2 text-sm outline-none text-white disabled:opacity-40"
            placeholder={
              isPending
                ? "Approve request to start chatting…"
                : "Type a message…"
            }
          />

          <button
            disabled={isPending}
            className="text-lime-400 disabled:opacity-40"
          >
            <Send />
          </button>
        </div>
      )}
    </div>
  );
}

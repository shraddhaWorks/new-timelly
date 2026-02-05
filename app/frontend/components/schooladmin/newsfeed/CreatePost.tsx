import { Image as ImageIcon, Paperclip, Send } from 'lucide-react';

export default function CreatePost() {
  return (
    <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl md:rounded-3xl p-5 md:p-6">
      <h3 className="text-base md:text-lg font-medium mb-4">Create New Post</h3>
      <div className="space-y-3 md:space-y-4">
        <input 
          type="text" 
          placeholder="Post title..." 
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 md:py-3 text-sm md:text-base focus:outline-none focus:ring-1 ring-purple-400"
        />
        <textarea 
          placeholder="What would you like to share..." 
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-1 ring-purple-400 resize-none"
        />
        <div className="flex flex-row justify-between items-center pt-2">
          <div className="flex gap-4 md:gap-6 text-gray-300">
            <button className="flex items-center gap-1.5 md:gap-2 hover:text-white transition text-xs md:text-sm">
              <ImageIcon className="w-4 h-4 md:w-5 md:h-5" /> <span>Photo</span>
            </button>
            <button className="flex items-center gap-1.5 md:gap-2 hover:text-white transition text-xs md:text-sm">
              <Paperclip className="w-4 h-4 md:w-5 md:h-5" /> <span>Attach</span>
            </button>
          </div>
          <button className="bg-[#b4f42c] text-black px-4 py-2 md:px-6 md:py-2 rounded-full font-bold text-xs md:text-sm flex items-center gap-2 hover:bg-[#a3e028] transition">
            <Send className="w-3.5 h-3.5 md:w-4 md:h-4" /> Publish
          </button>
        </div>
      </div>
    </section>
  );
}
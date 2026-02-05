import { Heart } from 'lucide-react';

interface PostCardProps {
  author: string;
  time: string;
  title: string;
  content: string;
  likes: number;
  image: string;
}

export default function PostCard({ author, time, title, content, likes, image }: PostCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden">
      {/* Author Header */}
      <div className="p-3 md:p-4 flex justify-between items-center">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-600 overflow-hidden">
            <img src="/api/placeholder/40/40" alt="Author" className="object-cover w-full h-full" />
          </div>
          <div>
            <p className="font-semibold text-xs md:text-sm leading-tight">{author}</p>
            <p className="text-[10px] md:text-xs text-gray-400">{time}</p>
          </div>
        </div>
        <span className="bg-[#82922c]/30 text-[#d4ff00] text-[10px] md:text-xs px-2 md:px-3 py-1 rounded-full border border-[#d4ff00]/20 font-medium">
          Published
        </span>
      </div>

      {/* Main Image - Responsive Height */}
      <div className="w-full h-56 sm:h-72 md:h-80 lg:h-96 overflow-hidden">
        <img 
          src={image} 
          alt="Post content" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Area - Matches your screenshot's darker purple tint */}
      <div className="p-5 md:p-6 bg-[#2d1b2d]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-gray-300 mb-3 md:mb-4 cursor-pointer">
          <Heart className="w-4 h-4 md:w-5 md:h-5 hover:fill-red-500 hover:text-red-500 transition" />
          <span className="text-xs md:text-sm font-medium">{likes}</span>
        </div>
        
        <h4 className="text-lg md:text-xl font-bold mb-2">{title}</h4>
        <p className="text-gray-200 text-xs md:text-sm leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  );
}
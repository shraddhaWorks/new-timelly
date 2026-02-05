import { Search, Bell, Settings } from 'lucide-react';
import CreatePost from './newsfeed/CreatePost';
import PostCard from './newsfeed/PostCard';

export default function NewsFeed() {
  return (
    // p-4 for mobile, p-8 for tablet/desktop
    <div className="min-h-screen text-white p-4 md:p-8 font-sans">
      <main className="max-w-3xl mx-auto space-y-4 md:space-y-6">
        {/* Intro Section - Smaller text/padding on mobile */}
        <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-semibold mb-1 md:mb-2">News Feed</h2>
          <p className="text-sm md:text-base text-gray-300">Create and manage school announcements</p>
        </section>

        <CreatePost />
        
        <PostCard 
          author="Principal"
          time="5 hours ago"
          title="Annual Sports Day 2026 🏆"
          content="We are excited to announce the Annual Sports Day on February 15th! All students are encouraged to participate. Registration is now open."
          likes={145}
          image="/sports-day.jpg" 
        />
      </main>
    </div>
  );
}
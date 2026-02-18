const glass =
  "bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)]";

interface Workshop {
  title: string;
  date: string;
  time: string;
  instructor: string;
  seats: number;
  mode: "Online" | "Offline";
  image: string;
}

interface UpcomingWorkshopsProps {
  workshops: Workshop[];
}

export default function UpcomingWorkshops({ workshops }: UpcomingWorkshopsProps) {
  return (
    // IMPORTANT: flex-1 + w-full removes right gap
    <section className="flex-1 w-full">
      {/* MAIN TALL CONTAINER — FULL RIGHT STRETCH */}
      <div
        className={`${glass} 
          rounded-3xl 
          px-20 py-5 
          min-h-[1800pyx] 
          w-full 
          max-w-full`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Upcoming Workshops
            </h2>
            <p className="text-sm text-white/50 mt-1">
              Enhance skills with expert-led sessions
            </p>
          </div>

          <button className="px-6 py-2 rounded-full border border-lime-400/60 text-lime-400 text-sm hover:bg-lime-400/10 transition">
            View All →
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex gap-10">
          {workshops.map((w) => (
            <div
              key={w.title}
              className="w-[380px] rounded-2xl bg-white/5 border border-white/10 flex flex-col overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-56">
                <img
                  src={w.image}
                  alt={w.title}
                  className="h-full w-full object-cover"
                />

                <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs px-4 py-1 rounded-full">
                  {w.mode}
                </span>
              </div>

              {/* Content */}
              <div className="px-6 py-6 flex-1 space-y-4">
                <h3 className="text-lg font-semibold text-lime-400">
                  {w.title}
                </h3>

                <div className="space-y-3 text-sm text-white/60">
                  <div>👤 {w.instructor}</div>
                  <div>📅 {w.date}</div>
                  <div>⏰ {w.time}</div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 pb-6">
                <span className="text-sm text-white/40">
                  {w.seats} seats available
                </span>

                <button className="px-6 py-2 rounded-full bg-lime-400 text-black text-sm font-medium hover:scale-105 transition">
                  Register
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-10">
          <span className="w-8 h-1.5 rounded-full bg-lime-400"></span>
          <span className="w-3 h-1.5 rounded-full bg-white/30"></span>
          <span className="w-3 h-1.5 rounded-full bg-white/30"></span>
        </div>
      </div>
    </section>
  );
}
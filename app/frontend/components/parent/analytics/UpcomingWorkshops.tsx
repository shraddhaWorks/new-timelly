const glass = "bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.4)]";

interface Workshop {
  title: string;
  date: string;
}

interface UpcomingWorkshopsProps {
  workshops: Workshop[];
}

export default function UpcomingWorkshops({ workshops }: UpcomingWorkshopsProps) {
  return (
    <div className={`${glass} rounded-3xl px-20 py-10`}>
      <h3 className="font-semibold mb-4">Upcoming Workshops</h3>
      {workshops.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-10">
          {workshops.map((w) => (
            <div key={w.title} className="bg-white/10 rounded-xl px-10 py-8 text-center">
              <h4 className="text-lime-400 font-semibold">{w.title}</h4>
              <p className="text-xs text-white/40">{w.date}</p>
              <button className="mt-3 px-3 py-1 bg-lime-400 text-black rounded">
                Register
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-white/40 text-sm text-center py-4">No upcoming workshops</div>
      )}
    </div>
  );
}

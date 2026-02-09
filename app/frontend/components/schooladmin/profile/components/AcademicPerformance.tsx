import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

type Props = {
  data?: Array<{ subject: string; score: number }>;
};

export const AcademicPerformance = ({ data = [] }: Props) => {
  const chartData = data.length > 0 ? data : [
    { subject: "Math", score: 0 },
    { subject: "Science", score: 0 },
    { subject: "English", score: 0 },
  ];

  return (
    <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 rounded-2xl p-4 sm:p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 sm:mb-8">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-lime-400" /> Academic Performance
        </h3>
        <select className="bg-white/5 text-xs border border-white/10 rounded-lg px-2 py-1 outline-none text-gray-300">
          <option>Midterm</option>
        </select>
      </div>
      <div className="h-48 sm:h-64 w-full min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <Bar dataKey="score" fill="#a3e635" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
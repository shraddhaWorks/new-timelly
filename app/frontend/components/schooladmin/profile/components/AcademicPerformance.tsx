import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, ChevronDown } from "lucide-react";

type Props = {
  data?: Array<{ subject: string; score: number }>;
};

export const AcademicPerformance = ({ data = [] }: Props) => {
  const chartData = data.length > 0 ? data : [];

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-4 sm:p-8 w-full max-w-3xl min-w-0 overflow-hidden">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-white text-2xl font-bold flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-[#b4f44d]" /> 
          Academic Performance
        </h3>
        
        <div className="relative">
          <select className="appearance-none bg-white/5 text-gray-200 text-sm border border-white/20 rounded-2xl pl-6 pr-10 py-3 outline-none min-w-[140px]">
            <option>Midterm</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="h-64 w-full min-h-[200px]">
        {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid 
              vertical={false} 
              strokeDasharray="3 3" 
              stroke="rgba(255,255,255,0.1)" 
            />
            <XAxis 
              dataKey="subject" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#9ca3af", fontSize: 14 }} 
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#9ca3af", fontSize: 14 }} 
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Bar 
              dataKey="score" 
              fill="#b4f44d" 
              radius={[6, 6, 0, 0]} 
              barSize={45} 
            />
          </BarChart>
        </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">No academic data</div>
        )}
      </div>
    </div>
  );
};
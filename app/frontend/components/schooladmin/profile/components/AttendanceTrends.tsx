import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Calendar } from "lucide-react";

type Props = {
  data?: Array<{ month: string; present: number; total: number; pct: number }>;
};

const MONTH_LABELS: Record<string, string> = {
  "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun",
  "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
};

export const AttendanceTrends = ({ data = [] }: Props) => {
  const chartData = data.map((d) => {
    const [, month] = d.month.split("-");
    return {
      ...d,
      monthLabel: MONTH_LABELS[month] ?? month,
    };
  });

  return (
    <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 rounded-2xl p-4 sm:p-6 overflow-hidden">
      <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 mb-4 sm:mb-6">
        <Calendar className="w-5 h-5 text-lime-400" /> Attendance Trends
      </h3>
      <div className="h-40 sm:h-48 w-full min-h-[140px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="monthLabel" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} domain={[0, "auto"]} />
              <Tooltip
                contentStyle={{ background: "rgba(26,26,26,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                labelStyle={{ color: "#9ca3af" }}
                formatter={(
                  value: number | undefined,
                  _name: string | undefined,
                  props?: { payload?: { present?: number; total?: number } }
                ) => [
                  `Present: ${props?.payload?.present ?? "-"} / ${props?.payload?.total ?? "-"}`,
                  "Attendance",
                ]}
              />
              <Line type="monotone" dataKey="present" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No attendance data
          </div>
        )}
      </div>
    </div>
  );
};

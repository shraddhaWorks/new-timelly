import { Award, Badge, Bell, BookOpen, MessageCircle, Target, TrendingUp, Trophy, Users } from "lucide-react";
import PageHeader from "../../common/PageHeader";
import StatCard from "../../common/statCard";


const formatNumber = (num: number | null | undefined): string => {
  if (!num) return "0";
  return num.toLocaleString();
};

export default function ParentMarksTab() {

  const data = {
    stats: {
      totalClasses: 8,
      totalStudents: 240,
      pendingChats: 3,
      unreadAlerts: 5,
    },
  };

  const stats = data?.stats ?? {
    totalClasses: 0,
    totalStudents: 0,
    pendingChats: 0,
    unreadAlerts: 0,
  };

  const statCards = [
    {
      title: "Total Classes",
      value: stats.totalClasses,
      subtitle: `${formatNumber(stats.totalStudents)} total students`,
      icon: <TrendingUp className="w-5 h-5 text-lime-400" />,
      badge: {
        label: "Excellent",
        className:
          "bg-lime-400/10 text-lime-400 border border-lime-400/20",
      },
    },
    {
      title: "Total Students",
      value: formatNumber(stats.totalStudents),
      subtitle: "Across all classes",
      icon: <Trophy className="w-5 h-5 text-lime-400" />,
      badge: {
        label: "Top 3",
        className:
          "bg-white/5 text-gray-400 border border-white/10",
      },
    },
    {
      title: "Pending Chats",
      value: stats.pendingChats,
      subtitle: "Parent messages",
      icon: <Award className="w-5 h-5 text-lime-400" />,
      badge: {
        label: "Pass",
        className:
          "bg-red-500/10 text-red-400 border border-red-500/20",
      },
    },
    {
      title: "Unread Alerts",
      value: stats.unreadAlerts,
      subtitle: "Important updates",
      icon: <Target className="w-5 h-5 text-lime-400" />,
      badge: {
        label: "Progress",
        className:
          "bg-red-500/10 text-red-400 border border-red-500/20",
      },
    },
  ];

  return (
    <div className="p-4 lg:p-8 relative min-h-[calc(100vh-80px)]">
      <PageHeader
        title="Academic Performance"
        subtitle="Track Aarav Kumar's marks and grades"
      />

      <div className="mt-6">
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <StatCard
              key={card.title}
              className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-lime-400/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-lime-400/20 transition-colors">
                  {card.icon}
                </div>

                <span
                  className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg ${card.badge.className}`}
                >
                  {card.badge.label}
                </span>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-400 mb-1">
                  {card.title}
                </h3>

                <p className="text-3xl font-bold text-white mb-1">
                  {card.value}
                </p>

                <p className="text-xs text-gray-500">
                  {card.subtitle}
                </p>
              </div>
            </StatCard>
          ))}
        </section>
      </div>
    </div>
  );
}

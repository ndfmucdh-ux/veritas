import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { Flame, BookOpen, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ReadingStatsOverview() {
  const [stats, setStats] = useState(null);
  const [streakDays, setStreakDays] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return;

        // Fetch reading progress data
        const progress = await base44.entities.ReadingProgress.filter(
          { created_by: user.email },
          '-created_date',
          50
        );

        // Calculate streak
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - i);
          const hasReading = progress.some(p => {
            const pDate = new Date(p.created_date);
            return pDate.toDateString() === checkDate.toDateString();
          });
          if (hasReading) streak++;
          else break;
        }
        setStreakDays(streak);

        // Group by month for chart
        const monthly = {};
        progress.forEach(p => {
          const date = new Date(p.created_date);
          const monthKey = `${date.getMonth() + 1}/${date.getDate()}`;
          monthly[monthKey] = (monthly[monthKey] || 0) + 1;
        });

        const monthlyArray = Object.entries(monthly)
          .map(([date, chapters]) => ({ date, chapters }))
          .slice(-30);

        setMonthlyData(monthlyArray);

        // Calculate stats
        const totalChapters = progress.reduce((sum, p) => sum + (p.chapters_read || 1), 0);
        const uniqueBooks = new Set(progress.map(p => p.book)).size;
        const avgChaptersPerDay = (totalChapters / Math.max(streak, 1)).toFixed(1);

        setStats({
          totalChapters,
          uniqueBooks,
          avgChaptersPerDay,
          currentStreak: streak,
        });
      } catch (error) {
        console.error("Failed to load reading stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gradient-to-br from-cyan/10 to-purple/10 rounded-2xl animate-pulse" />
        <div className="h-64 bg-gradient-to-br from-cyan/10 to-purple/10 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl"
          style={{ background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.15)" }}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ background: "rgba(0,245,255,0.2)" }}>
              <Flame className="w-5 h-5 text-cyan" />
            </div>
            <div>
              <p className="text-xs font-inter text-muted-foreground">Reading Streak</p>
              <p className="text-2xl font-cinzel font-bold text-white">{stats.currentStreak} days</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-2xl"
          style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.15)" }}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ background: "rgba(251,191,36,0.2)" }}>
              <BookOpen className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-xs font-inter text-muted-foreground">Chapters Read</p>
              <p className="text-2xl font-cinzel font-bold text-white">{stats.totalChapters}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-2xl"
          style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)" }}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ background: "rgba(167,139,250,0.2)" }}>
              <TrendingUp className="w-5 h-5 text-purple" />
            </div>
            <div>
              <p className="text-xs font-inter text-muted-foreground">Books Explored</p>
              <p className="text-2xl font-cinzel font-bold text-white">{stats.uniqueBooks}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Reading Trend Chart */}
      {monthlyData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-sm font-cinzel font-semibold text-white mb-4">Reading Trend (30 Days)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" style={{ fontSize: 12 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(0,245,255,0.3)",
                  borderRadius: 8,
                }}
                labelStyle={{ color: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="chapters"
                stroke="#00f5ff"
                dot={{ fill: "#fbbf24", r: 4 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      <p className="text-xs font-inter px-4 py-2 rounded-lg" style={{ background: "rgba(0,245,255,0.05)", color: "rgba(0,245,255,0.5)" }}>
        💡 Keep your reading streak alive! Complete a chapter daily to maintain your momentum.
      </p>
    </div>
  );
}
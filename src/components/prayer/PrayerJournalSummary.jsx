import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, CheckCircle2, Tag, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PrayerJournalSummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const prayers = await base44.entities.PrayerJournal.list("-created_date", 500).catch(() => []);
      
      if (!prayers || prayers.length === 0) {
        setSummary({ total: 0, answered: 0, topics: [] });
        setLoading(false);
        return;
      }

      const total = prayers.length;
      const answered = prayers.filter(p => p.answered).length;

      // Extract frequent topics
      const topicCounts = {};
      prayers.forEach(p => {
        if (p.tags && Array.isArray(p.tags)) {
          p.tags.forEach(tag => {
            topicCounts[tag] = (topicCounts[tag] || 0) + 1;
          });
        }
      });

      const topics = Object.entries(topicCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setSummary({ total, answered, topics });
    } catch (err) {
      console.error(err);
      setSummary({ total: 0, answered: 0, topics: [] });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl p-5 flex items-center justify-center" style={{ background: "rgba(167,139,250,0.03)", border: "1px solid rgba(167,139,250,0.15)", height: "150px" }}>
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#a78bfa" }} />
      </div>
    );
  }

  if (!summary) return null;

  const answeredPercentage = summary.total > 0 ? Math.round((summary.answered / summary.total) * 100) : 0;

  return (
    <div className="rounded-2xl p-5" style={{ background: "rgba(167,139,250,0.03)", border: "1px solid rgba(167,139,250,0.15)" }}>
      <p className="text-[10px] font-cinzel uppercase tracking-widest mb-4" style={{ color: "#a78bfa" }}>
        Journal Summary
      </p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-3" style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)" }}>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} />
            <p className="text-[9px] font-inter" style={{ color: "rgba(255,255,255,0.4)" }}>Total Prayers</p>
          </div>
          <p className="font-cinzel text-lg font-bold text-white">{summary.total}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-xl p-3" style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#34d399" }} />
            <p className="text-[9px] font-inter" style={{ color: "rgba(255,255,255,0.4)" }}>Answered</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="font-cinzel text-lg font-bold text-white">{summary.answered}</p>
            <span className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.3)" }}>({answeredPercentage}%)</span>
          </div>
        </motion.div>
      </div>

      {/* Answered progress bar */}
      {summary.total > 0 && (
        <div className="mb-4">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--fill-3)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${answeredPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: "#34d399" }}
            />
          </div>
        </div>
      )}

      {/* Most frequent topics */}
      {summary.topics.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />
            <p className="text-[9px] font-cinzel uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
              Top Topics
            </p>
          </div>
          <div className="space-y-1.5">
            {summary.topics.map((topic, idx) => (
              <motion.div key={topic.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg" style={{ background: "var(--fill-2)" }}>
                <span className="text-xs font-inter text-white/70">{topic.name}</span>
                <span className="text-[10px] font-cinzel px-2 py-0.5 rounded" style={{ background: "rgba(167,139,250,0.2)", color: "#a78bfa" }}>
                  {topic.count}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {summary.total === 0 && (
        <p className="text-xs font-inter text-center py-4" style={{ color: "rgba(255,255,255,0.3)" }}>
          Start recording prayers to see your summary
        </p>
      )}
    </div>
  );
}
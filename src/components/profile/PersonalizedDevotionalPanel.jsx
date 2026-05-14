import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PersonalizedDevotionalPanel() {
  const [devotional, setDevotional] = useState(null);
  const [booksAnalyzed, setBooksAnalyzed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadDevotional = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = await base44.auth.me();
      if (!user) return;

      // Get user's recent reading history
      const progress = await base44.entities.ReadingProgress.filter(
        { created_by: user.email },
        '-created_date',
        30
      );

      // Extract unique books from last 30 days
      const booksSet = new Set();
      progress.slice(0, 20).forEach(p => {
        if (p.book) booksSet.add(p.book);
      });

      const recentBooks = Array.from(booksSet).slice(0, 5);

      if (recentBooks.length === 0) {
        setError("Start reading to get personalized devotionals");
        setLoading(false);
        return;
      }

      setBooksAnalyzed(recentBooks);

      // Generate personalized devotional
      const response = await base44.functions.invoke("generatePersonalizedDevotional", {
        recentlyReadBooks: recentBooks,
        lastNDays: 7,
      });

      if (response.data?.devotional) {
        setDevotional(response.data.devotional);
      }
    } catch (err) {
      setError("Failed to generate devotional. Try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevotional();
  }, []);

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-purple" />
            <h3 className="font-cinzel font-semibold text-white">Daily Devotional</h3>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={loadDevotional}
            disabled={loading}
            className="p-2 rounded-lg transition-all"
            style={{ background: "rgba(167,139,250,0.1)" }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 text-purple animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 text-purple" />
            )}
          </motion.button>
        </div>

        {error && (
          <p className="text-xs font-inter text-amber-600 bg-amber-500/10 px-3 py-2 rounded-lg">{error}</p>
        )}

        {loading ? (
          <div className="space-y-3">
            <div className="h-6 bg-gradient-to-r from-purple/20 to-transparent rounded-lg animate-pulse" />
            <div className="h-20 bg-gradient-to-r from-purple/10 to-transparent rounded-lg animate-pulse" />
          </div>
        ) : devotional ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div>
              <p className="text-xs font-inter text-muted-foreground mb-1">Based on: {booksAnalyzed.join(", ")}</p>
              <h4 className="text-sm font-cinzel font-bold text-white">{devotional.title}</h4>
              <p className="text-xs font-inter text-cyan mt-1">{devotional.mainVerseRef}</p>
            </div>

            <div className="p-3 rounded-xl" style={{ background: "rgba(167,139,250,0.05)" }}>
              <p className="text-xs font-inter leading-relaxed text-muted-foreground">
                {devotional.reflection}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-cinzel font-semibold text-white">Today's Application</p>
              <p className="text-xs font-inter text-muted-foreground">{devotional.application}</p>
            </div>

            <div className="p-3 rounded-xl bg-purple/5 border border-purple/20">
              <p className="text-xs font-cinzel text-purple font-semibold mb-1">Prayer</p>
              <p className="text-xs font-inter italic text-muted-foreground">{devotional.prayer}</p>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
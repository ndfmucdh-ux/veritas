import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Plus, Trash2, Calendar, Tag, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PrayerModal from "@/components/prayer/PrayerModal";

export default function PrayerJournal() {
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState("Psalm 23");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadPrayers();
  }, []);

  const loadPrayers = async () => {
    try {
      const data = await base44.entities.PrayerJournal.list("-created_date", 20);
      setPrayers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await base44.entities.PrayerJournal.delete(id);
    setPrayers(p => p.filter(pr => pr.id !== id));
  };

  const filteredPrayers = prayers.filter(p => filter === "all" || p.mood === filter);

  const moods = [
    { id: "all", label: "All", icon: "📚", color: "#a78bfa" },
    { id: "grateful", label: "Grateful", icon: "🙏", color: "#fbbf24" },
    { id: "confessing", label: "Confessing", icon: "🤲", color: "#f87171" },
    { id: "interceding", label: "Interceding", icon: "💗", color: "#f472b6" },
    { id: "celebrating", label: "Celebrating", icon: "🎉", color: "#34d399" }
  ];

  return (
    <div className="md:ml-16 min-h-screen pb-28 px-4 md:px-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto pt-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-cinzel text-2xl font-bold text-white mb-1">Prayer Journal</h1>
            <p className="text-sm text-white/50">Record your conversations with God</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg, #00f5ff, #006bb3)" }}
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Mood filter */}
        <div className="flex overflow-x-auto gap-2 pb-2">
          {moods.map(m => (
            <motion.button
              key={m.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(m.id)}
              className="flex-shrink-0 py-2 px-4 rounded-full text-xs font-cinzel whitespace-nowrap transition-all"
              style={{
                background: filter === m.id ? `${m.color}22` : "rgba(255,255,255,0.05)",
                color: filter === m.id ? m.color : "rgba(255,255,255,0.4)",
                border: filter === m.id ? `1px solid ${m.color}44` : "1px solid transparent"
              }}
            >
              {m.icon} {m.label}
            </motion.button>
          ))}
        </div>

        {/* Prayers list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-cyan" />
          </div>
        ) : filteredPrayers.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-8 h-8 mx-auto text-white/20 mb-2" />
            <p className="text-white/40">No prayers yet. Start journaling...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredPrayers.map((prayer, idx) => {
                const mood = moods.find(m => m.id === prayer.mood);
                return (
                  <motion.div
                    key={prayer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="rounded-2xl p-4 group"
                    style={{
                      background: `${mood?.color}08`,
                      border: `1px solid ${mood?.color}22`
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-cinzel text-sm text-white">{prayer.verse_ref}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs">{mood?.icon}</span>
                          <span className="text-[10px] text-white/40">{mood?.label}</span>
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(prayer.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-red-500/60" />
                      </motion.button>
                    </div>
                    <p className="text-xs leading-relaxed text-white/60 line-clamp-3">{prayer.prayer_text}</p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <PrayerModal
            verse_ref={selectedVerse}
            onClose={() => setShowModal(false)}
            onSuccess={() => {
              setShowModal(false);
              loadPrayers();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
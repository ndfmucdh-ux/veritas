import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Plus, Trash2, Calendar, Tag, Loader2, CheckCircle2, Clock, History } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PrayerModal from "@/components/prayer/PrayerModal";
import PrayerStreakTracker from "@/components/prayer/PrayerStreakTracker";
import PrayerFocusTimer from "@/components/prayer/PrayerFocusTimer";
import PrayerJournalSummary from "@/components/prayer/PrayerJournalSummary";
import PrayerStatsChart from "@/components/prayer/PrayerStatsChart";
import { getPrayerIdFromUrl } from "@/components/prayer/PrayerNotificationDeepLink";
import TestimoniesArchive from "@/components/prayer/TestimoniesArchive";

export default function PrayerJournal() {
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState("Psalm 23");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("active"); // "active" | "answered" | "testimonies"
  const [answeringId, setAnsweringId] = useState(null);
  const [answerNote, setAnswerNote] = useState("");

  useEffect(() => {
    loadPrayers();
    // Auto-scroll to deep-linked prayer entry
    const entryId = getPrayerIdFromUrl();
    if (entryId) {
      setTimeout(() => {
        const element = document.getElementById(`prayer-${entryId}`);
        if (element) element.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
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

  const markAnswered = async (prayer) => {
    const note = answerNote.trim() || "Prayer answered! 🙏";
    await base44.entities.PrayerJournal.update(prayer.id, {
      answered: true,
      answered_note: note,
      answered_date: new Date().toISOString(),
    });
    setPrayers(p => p.map(pr => pr.id === prayer.id ? { ...pr, answered: true, answered_note: note, answered_date: new Date().toISOString() } : pr));
    setAnsweringId(null);
    setAnswerNote("");
  };

  const activePrayers = prayers.filter(p => !p.answered);
  const answeredPrayers = prayers.filter(p => p.answered);
  const filteredPrayers = (view === "testimonies" ? answeredPrayers : view === "answered" ? answeredPrayers : activePrayers).filter(p => filter === "all" || p.mood === filter);

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
        {/* Summary Dashboard */}
        {!loading && <PrayerJournalSummary />}

        {/* Stats Chart */}
        {!loading && <PrayerStatsChart />}

        {/* Streak Tracker */}
        {!loading && <PrayerStreakTracker prayers={prayers} />}

        {/* View toggle */}
        <div className="flex gap-2">
          <button onClick={() => setView("active")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-cinzel transition-all"
            style={{ background: view === "active" ? "rgba(0,245,255,0.12)" : "rgba(255,255,255,0.05)", color: view === "active" ? "#00f5ff" : "rgba(255,255,255,0.4)", border: view === "active" ? "1px solid rgba(0,245,255,0.25)" : "1px solid transparent" }}>
            <Clock className="w-3.5 h-3.5" /> Active ({activePrayers.length})
          </button>
          <button onClick={() => setView("answered")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-cinzel transition-all"
            style={{ background: view === "answered" ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.05)", color: view === "answered" ? "#34d399" : "rgba(255,255,255,0.4)", border: view === "answered" ? "1px solid rgba(52,211,153,0.25)" : "1px solid transparent" }}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Answered ({answeredPrayers.length})
          </button>
          <button onClick={() => setView("testimonies")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-cinzel transition-all"
            style={{ background: view === "testimonies" ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.05)", color: view === "testimonies" ? "#fbbf24" : "rgba(255,255,255,0.4)", border: view === "testimonies" ? "1px solid rgba(251,191,36,0.25)" : "1px solid transparent" }}>
            <History className="w-3.5 h-3.5" /> Testimonies
          </button>
        </div>

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

        {/* Testimonies Archive View */}
        {view === "testimonies" && !loading && (
          <TestimoniesArchive prayers={answeredPrayers} />
        )}

        {view !== "testimonies" && loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-cyan" />
          </div>
        )}
        {view !== "testimonies" && !loading && filteredPrayers.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-8 h-8 mx-auto text-white/20 mb-2" />
            <p className="text-white/40">No prayers yet. Start journaling...</p>
          </div>
        )}
        {view !== "testimonies" && !loading && filteredPrayers.length > 0 && (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredPrayers.map((prayer, idx) => {
                const mood = moods.find(m => m.id === prayer.mood);
                return (
                  <motion.div
                    key={prayer.id}
                    id={`prayer-${prayer.id}`}
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
                          {prayer.answered && (
                            <span className="text-[10px] font-cinzel px-2 py-0.5 rounded-full flex items-center gap-1"
                              style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}>
                              <CheckCircle2 className="w-3 h-3" /> Answered
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!prayer.answered && view === "active" && (
                          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setAnsweringId(prayer.id === answeringId ? null : prayer.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-cinzel transition-colors"
                            style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}
                            title="Mark as answered">
                            <CheckCircle2 className="w-3 h-3" /> Answered
                          </motion.button>
                        )}
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(prayer.id)}
                          className="p-1.5 rounded-lg opacity-40 hover:opacity-80 transition-opacity">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </motion.button>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed text-white/60 line-clamp-3">{prayer.prayer_text}</p>

                    {/* Answered note */}
                    {prayer.answered && prayer.answered_note && (
                      <div className="mt-2 rounded-xl px-3 py-2 flex items-start gap-2"
                        style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
                        <History className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: "#34d399" }} />
                        <div>
                          <p className="text-[10px] font-inter leading-relaxed" style={{ color: "rgba(52,211,153,0.9)" }}>{prayer.answered_note}</p>
                          {prayer.answered_date && (
                            <p className="text-[9px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                              {new Date(prayer.answered_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Answer input */}
                    {answeringId === prayer.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 space-y-2">
                        <textarea
                          value={answerNote}
                          onChange={e => setAnswerNote(e.target.value)}
                          placeholder="How was this prayer answered? (optional)"
                          rows={2}
                          className="w-full rounded-xl px-3 py-2 text-xs font-inter resize-none focus:outline-none"
                          style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.25)", color: "rgba(255,255,255,0.8)" }}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => setAnsweringId(null)}
                            className="flex-1 py-1.5 rounded-xl text-xs font-cinzel"
                            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>Cancel</button>
                          <button onClick={() => markAnswered(prayer)}
                            className="flex-1 py-1.5 rounded-xl text-xs font-cinzel flex items-center justify-center gap-1.5"
                            style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" }}>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Answered
                          </button>
                        </div>
                      </motion.div>
                    )}
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

      {/* Focus Timer */}
      <PrayerFocusTimer />
    </div>
  );
}
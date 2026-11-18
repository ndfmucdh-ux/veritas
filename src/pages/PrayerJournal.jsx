import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Plus, CheckCircle2, Clock, History } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { LoadingState, EmptyState } from "@/components/ui/states";
import PrayerModal from "@/components/prayer/PrayerModal";
import PrayerStreakTracker from "@/components/prayer/PrayerStreakTracker";
import PrayerFocusTimer from "@/components/prayer/PrayerFocusTimer";
import PrayerJournalSummary from "@/components/prayer/PrayerJournalSummary";
import PrayerStatsChart from "@/components/prayer/PrayerStatsChart";
import { getPrayerIdFromUrl } from "@/components/prayer/PrayerNotificationDeepLink";
import TestimoniesArchive from "@/components/prayer/TestimoniesArchive";
import PrayerCard from "@/components/prayer/PrayerCard";

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
    // Optimistic remove — feels instant
    setPrayers(p => p.filter(pr => pr.id !== id));
    await base44.entities.PrayerJournal.delete(id);
  };

  const markAnswered = async (prayer) => {
    const note = answerNote.trim() || "Prayer answered! 🙏";
    const answeredDate = new Date().toISOString();
    // Optimistic update first
    setPrayers(p => p.map(pr => pr.id === prayer.id
      ? { ...pr, answered: true, answered_note: note, answered_date: answeredDate }
      : pr
    ));
    setAnsweringId(null);
    setAnswerNote("");
    await base44.entities.PrayerJournal.update(prayer.id, {
      answered: true,
      answered_note: note,
      answered_date: answeredDate,
    });
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
            style={{ background: view === "active" ? "rgba(0,245,255,0.12)" : "rgb(var(--ink) / 0.05)", color: view === "active" ? "#00f5ff" : "rgb(var(--ink) / 0.4)", border: view === "active" ? "1px solid rgba(0,245,255,0.25)" : "1px solid transparent" }}>
            <Clock className="w-3.5 h-3.5" /> Active ({activePrayers.length})
          </button>
          <button onClick={() => setView("answered")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-cinzel transition-all"
            style={{ background: view === "answered" ? "rgba(52,211,153,0.12)" : "rgb(var(--ink) / 0.05)", color: view === "answered" ? "#34d399" : "rgb(var(--ink) / 0.4)", border: view === "answered" ? "1px solid rgba(52,211,153,0.25)" : "1px solid transparent" }}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Answered ({answeredPrayers.length})
          </button>
          <button onClick={() => setView("testimonies")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-cinzel transition-all"
            style={{ background: view === "testimonies" ? "rgba(251,191,36,0.12)" : "rgb(var(--ink) / 0.05)", color: view === "testimonies" ? "#fbbf24" : "rgb(var(--ink) / 0.4)", border: view === "testimonies" ? "1px solid rgba(251,191,36,0.25)" : "1px solid transparent" }}>
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
                background: filter === m.id ? `${m.color}22` : "rgb(var(--ink) / 0.05)",
                color: filter === m.id ? m.color : "rgb(var(--ink) / 0.4)",
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

        {view !== "testimonies" && loading && <LoadingState label="Loading your prayers…" size="lg" />}
        {view !== "testimonies" && !loading && filteredPrayers.length === 0 && (
          <EmptyState icon={Heart} title="No prayers yet" description="Tap the + button to start journaling your conversations with God" />
        )}
        {view !== "testimonies" && !loading && filteredPrayers.length > 0 && (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredPrayers.map((prayer) => (
                <PrayerCard
                  key={prayer.id}
                  prayer={prayer}
                  mood={moods.find(m => m.id === prayer.mood)}
                  view={view}
                  answeringId={answeringId}
                  answerNote={answerNote}
                  onSetAnswering={setAnsweringId}
                  onAnswerNoteChange={setAnswerNote}
                  onMarkAnswered={markAnswered}
                  onDelete={handleDelete}
                />
              ))}
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
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Heart, Plus, CheckCircle2, Clock, History } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { LoadingState, EmptyState } from "@/components/ui/states";
import { useLang } from "@/lib/LanguageContext";
import PrayerModal from "@/components/prayer/PrayerModal";
import PrayerStreakTracker from "@/components/prayer/PrayerStreakTracker";
import PrayerFocusTimer from "@/components/prayer/PrayerFocusTimer";
import PrayerJournalSummary from "@/components/prayer/PrayerJournalSummary";
import PrayerStatsChart from "@/components/prayer/PrayerStatsChart";
import { getPrayerIdFromUrl } from "@/components/prayer/PrayerNotificationDeepLink";
import TestimoniesArchive from "@/components/prayer/TestimoniesArchive";
import PrayerCard from "@/components/prayer/PrayerCard";
import { MOODS } from "@/components/prayer/moods";

const VIEWS = [
  { id: "active", key: "pjActive", Icon: Clock },
  { id: "answered", key: "pjAnswered", Icon: CheckCircle2 },
  { id: "testimonies", key: "pjTestimonies", Icon: History },
];

export default function PrayerJournal() {
  const { t } = useLang();
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("active");
  const [answeringId, setAnsweringId] = useState(null);
  const [answerNote, setAnswerNote] = useState("");

  useEffect(() => {
    loadPrayers();
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
    setPrayers(p => p.filter(pr => pr.id !== id));
    await base44.entities.PrayerJournal.delete(id);
  };

  const markAnswered = async (prayer) => {
    const note = answerNote.trim() || t.pjDefaultAnswer;
    const answeredDate = new Date().toISOString();
    setPrayers(p => p.map(pr => pr.id === prayer.id
      ? { ...pr, answered: true, answered_note: note, answered_date: answeredDate }
      : pr
    ));
    setAnsweringId(null);
    setAnswerNote("");
    await base44.entities.PrayerJournal.update(prayer.id, { answered: true, answered_note: note, answered_date: answeredDate });
  };

  const activePrayers = prayers.filter(p => !p.answered);
  const answeredPrayers = prayers.filter(p => p.answered);
  const counts = { active: activePrayers.length, answered: answeredPrayers.length };
  const filteredPrayers = (view === "active" ? activePrayers : answeredPrayers).filter(p => filter === "all" || p.mood === filter);

  return (
    <div className="min-h-screen pb-28 px-4 md:px-8">
      <div className="max-w-4xl mx-auto pt-8 mb-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-cinzel text-4xl font-semibold text-foreground">{t.prayerJournal}</h1>
            <p className="text-sm mt-1 text-muted-foreground">{t.pjSub}</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium bg-primary text-primary-foreground shadow-sm hover:opacity-90 transition-opacity flex-shrink-0">
            <Plus className="w-4 h-4" /> {t.pjNew}
          </button>
        </div>
        <div className="mt-4 h-px w-full bg-primary/40" />
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {!loading && (
          <div className="grid md:grid-cols-2 gap-4">
            <PrayerJournalSummary />
            <PrayerStreakTracker prayers={prayers} />
          </div>
        )}
        {!loading && <PrayerStatsChart />}

        <div className="flex gap-2 border-b border-border overflow-x-auto scrollbar-hide">
          {VIEWS.map(({ id, key, Icon }) => (
            <button key={id} onClick={() => setView(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm -mb-px border-b-2 whitespace-nowrap transition-colors ${view === id ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <Icon className="w-4 h-4" /> {t[key]}{counts[id] !== undefined ? ` (${counts[id]})` : ""}
            </button>
          ))}
        </div>

        {view !== "testimonies" && (
          <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
            {MOODS.map(({ id, labelKey, Icon }) => (
              <button key={id} onClick={() => setFilter(id)}
                className={`flex-shrink-0 flex items-center gap-1.5 py-2 px-4 rounded-full text-sm whitespace-nowrap border transition-colors ${filter === id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground/80 border-border hover:border-primary/50"}`}>
                <Icon className="w-3.5 h-3.5" /> {t[labelKey]}
              </button>
            ))}
          </div>
        )}

        {view === "testimonies" && !loading && <TestimoniesArchive prayers={answeredPrayers} />}
        {view !== "testimonies" && loading && <LoadingState label={t.pjLoading} size="lg" />}
        {view !== "testimonies" && !loading && filteredPrayers.length === 0 && (
          <EmptyState icon={Heart} title={t.pjEmptyTitle} description={t.pjEmptyDesc} />
        )}
        {view !== "testimonies" && !loading && filteredPrayers.length > 0 && (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredPrayers.map((prayer) => (
                <PrayerCard key={prayer.id} prayer={prayer} mood={MOODS.find(m => m.id === prayer.mood)} view={view}
                  answeringId={answeringId} answerNote={answerNote}
                  onSetAnswering={setAnsweringId} onAnswerNoteChange={setAnswerNote}
                  onMarkAnswered={markAnswered} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <PrayerModal verse_ref="Psalm 23" onClose={() => setShowModal(false)}
            onSuccess={() => { setShowModal(false); loadPrayers(); }} />
        )}
      </AnimatePresence>

      <PrayerFocusTimer />
    </div>
  );
}
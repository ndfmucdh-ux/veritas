import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Heart, Plus, CheckCircle2, Clock, History, Leaf } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { LoadingState, EmptyState } from "@/components/ui/states";
import { useLang } from "@/lib/LanguageContext";
import PrayerModal from "@/components/prayer/PrayerModal";
import PrayerFocusTimer from "@/components/prayer/PrayerFocusTimer";
import PrayerOverview from "@/components/prayer/PrayerOverview";
import PrayerFrequencyCard from "@/components/prayer/PrayerFrequencyCard";
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
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalRef, setModalRef] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("active");
  const [answeringId, setAnsweringId] = useState(null);
  const [answerNote, setAnswerNote] = useState("");

  // One load feeds the overview, the chart and the list so they always agree.
  const loadPrayers = useCallback(async () => {
    try {
      const data = await base44.entities.PrayerJournal.list("-created_date", 500);
      setPrayers(data?.items || data || []);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrayers();
    const params = new URLSearchParams(window.location.search);
    if (params.has("new")) { setModalRef(params.get("new") || ""); setShowModal(true); }
    const entryId = getPrayerIdFromUrl();
    if (entryId) setTimeout(() => document.getElementById(`prayer-${entryId}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 400);
  }, [loadPrayers]);

  const handleDelete = async (id) => {
    setPrayers((p) => p.filter((pr) => pr.id !== id));
    await base44.entities.PrayerJournal.delete(id).catch(loadPrayers);
  };

  const markAnswered = async (prayer) => {
    const note = answerNote.trim() || t.pjDefaultAnswer;
    const answered_date = new Date().toISOString();
    setPrayers((p) => p.map((pr) => (pr.id === prayer.id ? { ...pr, answered: true, answered_note: note, answered_date } : pr)));
    setAnsweringId(null);
    setAnswerNote("");
    await base44.entities.PrayerJournal.update(prayer.id, { answered: true, answered_note: note, answered_date }).catch(loadPrayers);
  };

  const active = prayers.filter((p) => !p.answered);
  const answered = prayers.filter((p) => p.answered);
  const counts = { active: active.length, answered: answered.length };
  const list = (view === "active" ? active : answered).filter((p) => filter === "all" || p.mood === filter);
  const openNew = () => { setModalRef(""); setShowModal(true); };

  return (
    <div className="min-h-screen pb-28 px-4 md:px-8">
      <div className="max-w-3xl mx-auto pt-6 space-y-3">
        <div className="relative flex items-end justify-between gap-3 pb-3 border-b border-border">
          <Leaf aria-hidden="true" className="absolute right-14 -top-1 w-10 h-10 text-primary opacity-30" strokeWidth={1} />
          <div className="min-w-0">
            <h1 className="font-cinzel text-3xl font-semibold text-foreground leading-tight">{t.prayerJournal}</h1>
            <p className="text-sm text-muted-foreground">{t.pjSub}</p>
          </div>
          <button type="button" onClick={openNew} aria-label={t.pjNew}
            className="flex items-center gap-1.5 px-4 min-h-11 rounded-full text-sm font-cinzel font-semibold bg-primary text-primary-foreground flex-shrink-0">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t.pjNew}</span>
          </button>
        </div>

        {loading && <LoadingState label={t.pjLoading} size="lg" />}
        {error && !loading && (
          <div className="rounded-2xl p-4 bg-card border border-border text-center space-y-2">
            <p className="text-sm text-muted-foreground">{t.pjError}</p>
            <button type="button" onClick={() => { setLoading(true); loadPrayers(); }} className="px-4 min-h-10 rounded-full bg-secondary text-foreground text-sm font-cinzel">{t.retry || "Retry"}</button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid md:grid-cols-2 gap-3 items-start">
              <PrayerOverview prayers={prayers} />
              <PrayerFrequencyCard prayers={prayers} />
            </div>

            <div className="flex p-0.5 rounded-full bg-secondary">
              {VIEWS.map(({ id, key, Icon }) => (
                <button key={id} type="button" onClick={() => setView(id)} aria-pressed={view === id}
                  className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 px-2 min-h-10 rounded-full text-xs font-cinzel ${view === id ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{t[key]}{counts[id] !== undefined ? ` (${counts[id]})` : ""}</span>
                </button>
              ))}
            </div>

            {view !== "testimonies" && (
              <div className="flex overflow-x-auto gap-1.5 pb-0.5 scrollbar-hide">
                {MOODS.map(({ id, labelKey, Icon }) => (
                  <button key={id} type="button" onClick={() => setFilter(id)} aria-pressed={filter === id}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 min-h-9 rounded-full text-xs whitespace-nowrap border ${filter === id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground/80 border-border"}`}>
                    <Icon className="w-3.5 h-3.5" /> {t[labelKey]}
                  </button>
                ))}
              </div>
            )}

            {view === "testimonies" && <TestimoniesArchive prayers={answered} />}
            {view !== "testimonies" && list.length === 0 && (
              <EmptyState icon={Heart} title={t.pjEmptyTitle} description={t.pjEmptyDesc}
                action={<button type="button" onClick={openNew} className="px-5 min-h-10 rounded-full bg-primary text-primary-foreground text-sm font-cinzel font-semibold">{t.pjNew}</button>} />
            )}
            {view !== "testimonies" && list.length > 0 && (
              <div className="space-y-2">
                <AnimatePresence>
                  {list.map((prayer) => (
                    <PrayerCard key={prayer.id} prayer={prayer} mood={MOODS.find((m) => m.id === prayer.mood)} view={view}
                      answeringId={answeringId} answerNote={answerNote}
                      onSetAnswering={setAnsweringId} onAnswerNoteChange={setAnswerNote}
                      onMarkAnswered={markAnswered} onDelete={handleDelete} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && <PrayerModal initialRef={modalRef} onClose={() => setShowModal(false)} onSaved={loadPrayers} />}
      <PrayerFocusTimer />
    </div>
  );
}
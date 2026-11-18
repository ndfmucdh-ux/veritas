import { useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, X, Sparkles, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/LanguageContext";
import { MOODS, tone } from "@/components/prayer/moods";

const field = "w-full px-3 min-h-11 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
const lbl = "block text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-1";

// Bottom sheet: write your own prayer or let AI write a guided one. Both are saved to the journal.
export default function PrayerModal({ initialRef = "", onClose, onSaved }) {
  const { t } = useLang();
  const [mode, setMode] = useState("write");
  const [ref, setRef] = useState(initialRef);
  const [mood, setMood] = useState("grateful");
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [guided, setGuided] = useState(null);

  const save = async () => {
    setError("");
    if (mode === "write" && !text.trim()) return setError(t.pjNeedText);
    if (mode === "ai" && !ref.trim()) return setError(t.pjNeedRef);
    setBusy(true);
    try {
      if (mode === "write") {
        await base44.entities.PrayerJournal.create({
          verse_ref: ref.trim() || t.pjPersonal, prayer_text: text.trim(), mood,
          tags: tags.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean),
        });
        await onSaved();
        onClose();
      } else {
        const res = await base44.functions.invoke("createPrayerSession", { verse_ref: ref.trim(), mood });
        setGuided(res.data?.prayer || "");
        await onSaved();
      }
    } catch {
      setError(t.pjError);
    } finally {
      setBusy(false);
    }
  };

  const moods = MOODS.filter((m) => m.id !== "all");

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl md:rounded-3xl bg-card border border-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-cinzel text-2xl font-semibold text-foreground">{t.pjNew}</h2>
          <button type="button" onClick={onClose} aria-label={t.cancel} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground"><X className="w-4 h-4" /></button>
        </div>

        {guided !== null ? (
          <>
            <div className="rounded-xl p-4 bg-secondary"><p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{guided}</p></div>
            <button type="button" onClick={onClose} className="w-full min-h-12 rounded-full bg-primary text-primary-foreground font-cinzel font-semibold flex items-center justify-center gap-2"><Check className="w-4 h-4" /> {t.pjAmen}</button>
          </>
        ) : (
          <>
            <div className="flex p-0.5 rounded-full bg-secondary">
              {[["write", t.pjWrite], ["ai", t.pjGuided]].map(([id, label]) => (
                <button key={id} type="button" onClick={() => { setMode(id); setError(""); }} aria-pressed={mode === id}
                  className={`flex-1 min-h-10 rounded-full text-sm font-cinzel flex items-center justify-center gap-1.5 ${mode === id ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                  {id === "ai" && <Sparkles className="w-3.5 h-3.5" />}{label}
                </button>
              ))}
            </div>

            <label className="block"><span className={lbl}>{t.pjRefLbl}</span>
              <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder={t.pjRefPh} className={field} style={{ fontSize: 16 }} /></label>

            <div>
              <span className={lbl}>{t.pjMoodLbl}</span>
              <div className="grid grid-cols-2 gap-2">
                {moods.map(({ id, labelKey, Icon, v }) => (
                  <button key={id} type="button" onClick={() => setMood(id)} aria-pressed={mood === id}
                    className={`flex items-center gap-2 px-3 min-h-11 rounded-xl border text-sm ${mood === id ? "border-primary bg-primary/10 text-foreground" : "border-border bg-secondary text-foreground/80"}`}>
                    <Icon className="w-4 h-4" style={{ color: tone(v) }} />{t[labelKey]}
                  </button>
                ))}
              </div>
            </div>

            {mode === "write" ? (
              <>
                <label className="block"><span className={lbl}>{t.pjPrayerLbl}</span>
                  <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder={t.pjPrayerPh} className={`${field} py-2 resize-none`} style={{ fontSize: 16 }} /></label>
                <label className="block"><span className={lbl}>{t.pjTagsLbl}</span>
                  <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder={t.pjTagsPh} className={field} style={{ fontSize: 16 }} /></label>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">{t.pjAiNote}</p>
            )}

            {error && <p className="text-xs text-destructive">{error}</p>}
            <button type="button" onClick={save} disabled={busy}
              className="w-full min-h-12 rounded-full bg-primary text-primary-foreground font-cinzel font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "write" ? t.pjSave : busy ? t.pjCreating : t.pjCreate}
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
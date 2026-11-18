import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, Copy, Check, NotebookPen, Loader2 } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import { createNote } from "@/lib/services/notesService";
import { parseRef, localRef, readHref } from "@/components/foryou/forYouUtils";

// Featured verse with read, copy and "save to notes" actions.
export default function ForYouKeyVerse({ verseRef, text }) {
  const { t, lang } = useLang();
  const [copied, setCopied] = useState(false);
  const [saveState, setSaveState] = useState("idle");
  const label = localRef(verseRef, lang);
  const btn = "flex items-center justify-center gap-1.5 min-h-10 px-3 rounded-full text-xs font-cinzel font-semibold bg-secondary text-foreground";

  const copy = () => {
    navigator.clipboard?.writeText(`"${text}" ${label}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const save = async () => {
    const { book, chapter, verse } = parseRef(verseRef);
    setSaveState("saving");
    try {
      await createNote({ title: label, book, chapter, verse: verse || 1, text: `"${text}"`, tags: [] });
      setSaveState("saved");
    } catch {
      setSaveState("idle");
    }
  };

  return (
    <motion.section initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
      className="rounded-2xl bg-card border border-border p-4" style={{ borderLeft: "3px solid var(--t-gold)" }}>
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{t.fyKeyVerse}</p>
      <p className="font-playfair italic text-lg leading-relaxed text-foreground mt-2">"{text}"</p>
      <p className="font-cinzel text-sm font-semibold mt-2" style={{ color: "var(--t-gold)" }}>{label}</p>
      <div className="grid grid-cols-3 gap-2 mt-3">
        <Link to={readHref(verseRef)} className={btn}><BookOpen className="w-3.5 h-3.5" /> {t.fyRead}</Link>
        <button type="button" onClick={copy} className={btn}>{copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{copied ? t.fyCopied : t.fyCopy}</button>
        <button type="button" onClick={save} disabled={saveState !== "idle"} className={`${btn} disabled:opacity-80`}>
          {saveState === "saving" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saveState === "saved" ? <Check className="w-3.5 h-3.5" /> : <NotebookPen className="w-3.5 h-3.5" />}
          {saveState === "saved" ? t.fySaved : t.fySaveNote}
        </button>
      </div>
    </motion.section>
  );
}
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Flower2, Sprout, Calendar, Bookmark, ChevronRight, Tag, Share2, BookOpen, Trash2, Pencil } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import { DATE_LOCALE } from "@/lib/i18nCommunity";

const ICONS = [Leaf, Flower2, Sprout];

// One note: botanical tile, reference, title, excerpt, date and topic. Tap to open the full note.
export default function NoteCard({ note, index, onTag, onShare, onDelete, onEdit }) {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const Icon = ICONS[index % ICONS.length];
  const date = note.created_date ? new Date(note.created_date).toLocaleDateString(DATE_LOCALE[lang] || "en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
  const ref = (note.verse_ref || "").replace(/\s[A-Z0-9]{2,8}$/, "");
  const action = "w-10 h-10 rounded-full flex items-center justify-center bg-secondary text-foreground";

  return (
    <motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index, 8) * 0.04 }}
      className="rounded-2xl bg-card border border-border overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(40,30,15,0.08)" }}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="w-full flex items-center gap-3 p-3 text-left">
        <span className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
          <Icon className="w-9 h-9 text-primary" strokeWidth={1} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-cinzel font-semibold text-primary truncate">{ref || t.noteFallback}</span>
          <span className="block font-cinzel text-lg font-semibold text-foreground leading-tight truncate">{note.note_title || t.s6Untitled}</span>
          <span className={`block text-sm text-muted-foreground leading-snug mt-0.5 ${open ? "" : "line-clamp-2"}`}>{open ? "" : note.note_text}</span>
          <span className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground min-w-0">
            {date && <span className="flex items-center gap-1 flex-shrink-0"><Calendar className="w-3.5 h-3.5" />{date}</span>}
            {note.tags?.[0] && <><span className="h-3 w-px bg-border" /><span className="flex items-center gap-1 min-w-0"><Bookmark className="w-3.5 h-3.5 text-primary flex-shrink-0" fill="currentColor" /><span className="truncate">{note.tags[0]}</span></span></>}
          </span>
        </span>
        <ChevronRight className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-3 pt-2 border-t border-border">
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap select-text">{note.note_text}</p>
              {note.tags?.length > 1 && (
                <div className="flex flex-wrap gap-1.5 mt-2">{note.tags.slice(1).map((tag) => <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{tag}</span>)}</div>
              )}
              <div className="flex items-center gap-2 mt-3">
                <button type="button" aria-label={t.s9Edit} onClick={onEdit} className="flex items-center gap-1.5 px-4 h-10 rounded-full bg-primary text-primary-foreground text-xs font-cinzel font-semibold"><Pencil className="w-4 h-4" />{t.s9Edit}</button>
                <button type="button" aria-label={t.s6Tag} onClick={onTag} className={action}><Tag className="w-4 h-4" /></button>
                <button type="button" aria-label={t.s6Share} onClick={onShare} className={action}><Share2 className="w-4 h-4" /></button>
                {note.book && <Link to={`/read?book=${encodeURIComponent(note.book)}&chapter=${note.chapter}`} aria-label={t.s6Open} className={action}><BookOpen className="w-4 h-4" /></Link>}
                <button type="button" aria-label={t.s6Delete} onClick={onDelete} className={`${action} ml-auto text-destructive`}><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
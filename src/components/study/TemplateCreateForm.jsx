import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X, Check } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";

const ICONS = ["📝", "📖", "🙏", "✝️", "💡", "🔍", "🎓", "📌", "🗺️", "⚡", "💎", "🌟"];
const field = "w-full rounded-xl px-3 min-h-11 text-sm bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

// Form to build a personal study template (name, icon, sections).
export default function TemplateCreateForm({ onSave, onCancel }) {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📝");
  const [sections, setSections] = useState([{ title: t.tpDefaultSection, placeholder: t.tpNotesPh }]);

  const setTitle = (i, title) => setSections((p) => p.map((s, idx) => (idx === i ? { ...s, title } : s)));

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
      <div className="rounded-2xl p-4 space-y-3 bg-card border border-border">
        <p className="font-cinzel text-base font-semibold text-foreground">{t.tpCreate}</p>
        <div className="flex gap-1.5 flex-wrap">
          {ICONS.map((em) => (
            <button key={em} type="button" onClick={() => setIcon(em)} aria-pressed={icon === em}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border ${icon === em ? "bg-primary/15 border-primary" : "bg-secondary border-border"}`}>{em}</button>
          ))}
        </div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.tpNamePh} className={field} style={{ fontSize: 16 }} />
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{t.tpSectionsLbl}</p>
          {sections.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input value={s.title} onChange={(e) => setTitle(i, e.target.value)} placeholder={t.tpSectionPh.replace("{n}", i + 1)} className={field} style={{ fontSize: 16 }} />
              {sections.length > 1 && (
                <button type="button" aria-label={t.tpDelete} onClick={() => setSections((p) => p.filter((_, idx) => idx !== i))}
                  className="w-11 min-h-11 rounded-xl bg-secondary text-destructive flex items-center justify-center flex-shrink-0"><X className="w-4 h-4" /></button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setSections((p) => [...p, { title: "", placeholder: t.tpNotesPh }])}
            className="flex items-center gap-1.5 text-xs font-cinzel px-3 min-h-9 rounded-lg bg-secondary text-foreground border border-dashed border-border">
            <Plus className="w-3.5 h-3.5" /> {t.tpAddSection}
          </button>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="flex-1 min-h-11 rounded-full bg-secondary text-foreground text-sm font-cinzel">{t.tpCancel}</button>
          <button type="button" disabled={!name.trim()} onClick={() => onSave({ name: name.trim(), icon, sections: sections.filter((s) => s.title.trim()) })}
            className="flex-1 min-h-11 rounded-full bg-primary text-primary-foreground text-sm font-cinzel font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50">
            <Check className="w-4 h-4" /> {t.tpSave}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
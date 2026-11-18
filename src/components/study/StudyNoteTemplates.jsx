import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check, Copy } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import { TEMPLATE_TEXT, PRESET_META } from "@/lib/i18nTemplates";
import TemplateCreateForm from "@/components/study/TemplateCreateForm";

const STORAGE_KEY = "veritas_study_templates";
const PRESET_ICONS = { cts: "📖", soap: "✨", ind: "🎓", top: "🗺️" };

const load = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } };

export default function StudyNoteTemplates({ book, chapter }) {
  const { t, lang } = useLang();
  const [custom, setCustom] = useState(load);
  const [activeId, setActiveId] = useState(null);
  const [notes, setNotes] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [copied, setCopied] = useState(false);

  // Preset names and sections follow the app language; personal templates keep the user's own text.
  const presets = useMemo(() => {
    const text = TEMPLATE_TEXT[lang] || TEMPLATE_TEXT.en;
    return PRESET_META.map((m) => ({
      id: `preset_${m.id}`, icon: PRESET_ICONS[m.id], color: m.color, name: text[m.id].name,
      sections: text[m.id].s.map(([title, placeholder]) => ({ title, placeholder })),
    }));
  }, [lang]);

  const all = [...presets, ...custom.map((c) => ({ ...c, color: "#C9A66B" }))];
  const active = all.find((x) => x.id === activeId);
  const notesKey = `veritas_study_notes_${book}_${chapter}`;

  useEffect(() => {
    try { setNotes(JSON.parse(sessionStorage.getItem(notesKey)) || {}); } catch { setNotes({}); }
  }, [notesKey]);

  const updateNote = (tid, i, value) => {
    const next = { ...notes, [`${tid}_${i}`]: value };
    setNotes(next);
    sessionStorage.setItem(notesKey, JSON.stringify(next));
  };

  const persist = (list) => { setCustom(list); localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); };

  const saveTemplate = (data) => {
    const tmpl = { id: `custom_${Date.now()}`, ...data };
    persist([...custom, tmpl]);
    setShowCreate(false);
    setActiveId(tmpl.id);
  };

  const removeTemplate = (id) => { persist(custom.filter((x) => x.id !== id)); if (activeId === id) setActiveId(null); };

  const copyNotes = () => {
    if (!active) return;
    const lines = [`# ${active.name} - ${book} ${chapter}\n`];
    active.sections.forEach((s, i) => lines.push(`## ${s.title}`, notes[`${active.id}_${i}`] || `_${t.tpNoNotes}_`, ""));
    navigator.clipboard?.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-3">{t.tpStudy}</p>
        <div className="grid grid-cols-2 gap-2">
          {all.map((x) => (
            <div key={x.id} className="relative">
              <button type="button" onClick={() => setActiveId(activeId === x.id ? null : x.id)} aria-pressed={activeId === x.id}
                className={`w-full h-full flex items-center gap-2 px-3 py-3 rounded-xl text-left border bg-card ${activeId === x.id ? "border-primary" : "border-border"}`}>
                <span className="text-lg flex-shrink-0">{x.icon}</span>
                <span className="flex-1 min-w-0">
                  <span className="block font-cinzel text-xs font-semibold text-foreground leading-tight break-words">{x.name}</span>
                  <span className="block text-[11px] text-muted-foreground mt-0.5">{t.tpSections.replace("{n}", x.sections.length)}</span>
                </span>
              </button>
              {x.id.startsWith("custom_") && (
                <button type="button" aria-label={t.tpDelete} onClick={() => removeTemplate(x.id)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-secondary text-destructive flex items-center justify-center"><X className="w-3 h-3" /></button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setShowCreate((v) => !v)}
            className={`flex items-center gap-2 px-3 py-3 rounded-xl border border-dashed min-h-14 ${showCreate ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>
            <Plus className="w-4 h-4 flex-shrink-0" /><span className="font-cinzel text-xs">{t.tpNew}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>{showCreate && <TemplateCreateForm onSave={saveTemplate} onCancel={() => setShowCreate(false)} />}</AnimatePresence>

      <AnimatePresence mode="wait">
        {active && (
          <motion.div key={active.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-2xl overflow-hidden bg-card border border-border">
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg">{active.icon}</span>
                <div className="min-w-0">
                  <p className="font-cinzel text-sm font-semibold text-foreground truncate">{active.name}</p>
                  <p className="text-xs text-muted-foreground">{book} {chapter}</p>
                </div>
              </div>
              <button type="button" onClick={copyNotes}
                className="flex items-center gap-1.5 px-3 min-h-9 rounded-full text-xs font-cinzel bg-secondary text-foreground flex-shrink-0">
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}{copied ? t.tpCopied : t.tpCopy}
              </button>
            </div>
            <div className="p-4 space-y-4">
              {active.sections.map((s, i) => (
                <div key={i}>
                  <p className="font-cinzel text-xs font-semibold mb-1.5" style={{ color: active.color }}>{s.title}</p>
                  <textarea value={notes[`${active.id}_${i}`] || ""} onChange={(e) => updateNote(active.id, i, e.target.value)}
                    placeholder={s.placeholder} rows={3} style={{ fontSize: 16 }}
                    className="w-full rounded-xl px-3 py-2.5 resize-none leading-relaxed bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
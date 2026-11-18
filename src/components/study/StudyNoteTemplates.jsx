import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit3, Check, X, Copy, ChevronDown, ChevronUp, FileText, Loader2 } from "lucide-react";

const STORAGE_KEY = "veritas_study_templates";

const PRESET_TEMPLATES = [
  {
    id: "preset_cts",
    name: "Context · Theme · Application",
    icon: "📖",
    color: "#00f5ff",
    sections: [
      { title: "📍 Context", placeholder: "Historical and cultural background of this passage..." },
      { title: "💡 Main Theme", placeholder: "What is the central message or theme?" },
      { title: "🔑 Key Verse", placeholder: "Which verse stands out most and why?" },
      { title: "🙏 Personal Application", placeholder: "How does this apply to my life today?" },
    ]
  },
  {
    id: "preset_soap",
    name: "S.O.A.P. Method",
    icon: "✨",
    color: "#a78bfa",
    sections: [
      { title: "📜 Scripture", placeholder: "Write out the verse(s) you are studying..." },
      { title: "👁️ Observation", placeholder: "What do you observe in this passage? (who, what, when, where, why)" },
      { title: "🔎 Application", placeholder: "How can you apply this truth to your life?" },
      { title: "🙏 Prayer", placeholder: "Write a prayer in response to what you've read..." },
    ]
  },
  {
    id: "preset_inductive",
    name: "Inductive Study",
    icon: "🎓",
    color: "#fbbf24",
    sections: [
      { title: "📌 Observation", placeholder: "What does the text say? (facts only)" },
      { title: "🔍 Interpretation", placeholder: "What does the text mean?" },
      { title: "⚡ Correlation", placeholder: "How does this connect to other scriptures?" },
      { title: "✅ Application", placeholder: "What must I do or believe differently?" },
    ]
  },
  {
    id: "preset_topical",
    name: "Topical Study",
    icon: "🗺️",
    color: "#34d399",
    sections: [
      { title: "📚 Topic / Keyword", placeholder: "What topic or word are you studying?" },
      { title: "📖 Related Passages", placeholder: "List all relevant scripture references..." },
      { title: "🔗 Connections & Patterns", placeholder: "What patterns emerge across passages?" },
      { title: "💬 Summary & Conclusion", placeholder: "What has God revealed about this topic?" },
    ]
  },
];

function loadTemplates() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

function saveTemplates(templates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export default function StudyNoteTemplates({ book, chapter }) {
  const [templates, setTemplates] = useState(loadTemplates);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [sessionNotes, setSessionNotes] = useState({});
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateIcon, setNewTemplateIcon] = useState("📝");
  const [newTemplateSections, setNewTemplateSections] = useState([
    { title: "Section 1", placeholder: "Notes..." }
  ]);
  const [saved, setSaved] = useState(false);

  const allTemplates = [...PRESET_TEMPLATES, ...templates];
  const active = allTemplates.find(t => t.id === activeTemplate);

  // Save notes to session storage per book/chapter
  const notesKey = `${book}_${chapter}`;
  useEffect(() => {
    const stored = sessionStorage.getItem(`veritas_study_notes_${notesKey}`);
    if (stored) try { setSessionNotes(JSON.parse(stored)); } catch {}
  }, [notesKey]);

  const updateNote = (templateId, sectionIdx, value) => {
    const key = `${templateId}_${sectionIdx}`;
    const updated = { ...sessionNotes, [key]: value };
    setSessionNotes(updated);
    sessionStorage.setItem(`veritas_study_notes_${notesKey}`, JSON.stringify(updated));
  };

  const getNoteValue = (templateId, sectionIdx) => {
    return sessionNotes[`${templateId}_${sectionIdx}`] || "";
  };

  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) return;
    const tmpl = {
      id: `custom_${Date.now()}`,
      name: newTemplateName.trim(),
      icon: newTemplateIcon,
      color: "#00f5ff",
      sections: newTemplateSections.filter(s => s.title.trim()),
    };
    const updated = [...templates, tmpl];
    setTemplates(updated);
    saveTemplates(updated);
    setShowCreate(false);
    setNewTemplateName("");
    setNewTemplateSections([{ title: "Section 1", placeholder: "Notes..." }]);
    setActiveTemplate(tmpl.id);
  };

  const deleteCustomTemplate = (id) => {
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    saveTemplates(updated);
    if (activeTemplate === id) setActiveTemplate(null);
  };

  const exportNotes = () => {
    if (!active) return;
    const lines = [`# ${active.name} — ${book} ${chapter}\n`];
    active.sections.forEach((s, i) => {
      const val = getNoteValue(active.id, i);
      lines.push(`## ${s.title}`);
      lines.push(val || "_No notes yet_");
      lines.push("");
    });
    const text = lines.join("\n");
    navigator.clipboard?.writeText(text);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Template picker */}
      <div>
        <p className="text-[10px] font-cinzel uppercase tracking-widest mb-3" style={{ color: "rgb(var(--ink) / 0.3)" }}>
          Study Templates
        </p>
        <div className="grid grid-cols-2 gap-2">
          {allTemplates.map(t => (
            <motion.button
              key={t.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTemplate(activeTemplate === t.id ? null : t.id)}
              className="relative flex items-center gap-2 px-3 py-3 rounded-xl text-left transition-all"
              style={{
                background: activeTemplate === t.id ? `${t.color}18` : "rgb(var(--ink) / 0.04)",
                border: activeTemplate === t.id ? `1px solid ${t.color}44` : "1px solid rgb(var(--ink) / 0.07)",
              }}
            >
              <span className="text-lg flex-shrink-0">{t.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-cinzel text-xs font-semibold text-white truncate">{t.name}</p>
                <p className="text-[9px] font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.3)" }}>
                  {t.sections.length} sections
                </p>
              </div>
              {t.id.startsWith("custom_") && (
                <button
                  onClick={(e) => { e.stopPropagation(); deleteCustomTemplate(t.id); }}
                  className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(248,113,113,0.15)", color: "#f87171" }}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </motion.button>
          ))}

          {/* Create new */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreate(v => !v)}
            className="flex items-center gap-2 px-3 py-3 rounded-xl transition-all"
            style={{
              background: showCreate ? "rgba(251,191,36,0.08)" : "rgb(var(--ink) / 0.03)",
              border: showCreate ? "1px solid rgba(251,191,36,0.25)" : "1px dashed rgb(var(--ink) / 0.12)",
              color: showCreate ? "#fbbf24" : "rgb(var(--ink) / 0.3)",
            }}
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span className="font-cinzel text-xs">New Template</span>
          </motion.button>
        </div>
      </div>

      {/* Create template form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl p-4 space-y-3" style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.15)" }}>
              <p className="font-cinzel text-sm font-semibold" style={{ color: "#fbbf24" }}>Create Custom Template</p>

              {/* Icon picker */}
              <div className="flex gap-2 flex-wrap">
                {["📝","📖","🙏","✝️","💡","🔍","🎓","📌","🗺️","⚡","💎","🌟"].map(em => (
                  <button key={em} onClick={() => setNewTemplateIcon(em)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all"
                    style={{
                      background: newTemplateIcon === em ? "rgba(251,191,36,0.2)" : "rgb(var(--ink) / 0.05)",
                      border: newTemplateIcon === em ? "1px solid rgba(251,191,36,0.4)" : "1px solid transparent",
                    }}>
                    {em}
                  </button>
                ))}
              </div>

              <input
                value={newTemplateName}
                onChange={e => setNewTemplateName(e.target.value)}
                placeholder="Template name (e.g. Prayer Focus)"
                className="w-full rounded-xl px-3 py-2.5 text-sm font-inter focus:outline-none"
                style={{ background: "var(--fill-3)", border: "1px solid rgb(var(--ink) / 0.1)", color: "rgb(var(--ink) / 0.85)" }}
              />

              {/* Sections */}
              <div className="space-y-2">
                <p className="text-[10px] font-cinzel uppercase tracking-widest" style={{ color: "rgb(var(--ink) / 0.3)" }}>Sections</p>
                {newTemplateSections.map((sec, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={sec.title}
                      onChange={e => {
                        const updated = [...newTemplateSections];
                        updated[i] = { ...updated[i], title: e.target.value };
                        setNewTemplateSections(updated);
                      }}
                      placeholder={`Section ${i + 1} name`}
                      className="flex-1 rounded-xl px-3 py-2 text-xs font-inter focus:outline-none"
                      style={{ background: "var(--fill-2)", border: "1px solid rgb(var(--ink) / 0.08)", color: "rgb(var(--ink) / 0.8)" }}
                    />
                    {newTemplateSections.length > 1 && (
                      <button
                        onClick={() => setNewTemplateSections(prev => prev.filter((_, idx) => idx !== i))}
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(248,113,113,0.1)", color: "#f87171" }}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setNewTemplateSections(prev => [...prev, { title: "", placeholder: "Notes..." }])}
                  className="flex items-center gap-1.5 text-xs font-cinzel px-3 py-1.5 rounded-lg"
                  style={{ color: "rgb(var(--ink) / 0.4)", background: "var(--fill-2)", border: "1px dashed rgb(var(--ink) / 0.1)" }}>
                  <Plus className="w-3 h-3" /> Add Section
                </button>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowCreate(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-cinzel"
                  style={{ background: "var(--fill-2)", color: "rgb(var(--ink) / 0.4)" }}>
                  Cancel
                </button>
                <button onClick={handleSaveTemplate} disabled={!newTemplateName.trim()}
                  className="flex-1 py-2 rounded-xl text-xs font-cinzel flex items-center justify-center gap-1.5 disabled:opacity-50"
                  style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}>
                  <Check className="w-3.5 h-3.5" /> Save Template
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active template note-taking area */}
      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${active.color}33`, background: `${active.color}06` }}
          >
            {/* Template header */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgb(var(--ink) / 0.07)" }}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{active.icon}</span>
                <div>
                  <p className="font-cinzel text-sm font-semibold text-white">{active.name}</p>
                  <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.3)" }}>
                    {book} {chapter}
                  </p>
                </div>
              </div>
              <button
                onClick={exportNotes}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-cinzel transition-all"
                style={{
                  background: saved ? "rgba(52,211,153,0.15)" : "rgb(var(--ink) / 0.06)",
                  color: saved ? "#34d399" : "rgb(var(--ink) / 0.4)",
                  border: saved ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgb(var(--ink) / 0.08)",
                }}
              >
                {saved ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {saved ? "Copied!" : "Copy Notes"}
              </button>
            </div>

            {/* Sections */}
            <div className="p-4 space-y-4">
              {active.sections.map((section, i) => (
                <div key={i}>
                  <p className="font-cinzel text-xs font-semibold mb-2" style={{ color: active.color }}>
                    {section.title}
                  </p>
                  <textarea
                    value={getNoteValue(active.id, i)}
                    onChange={e => updateNote(active.id, i, e.target.value)}
                    placeholder={section.placeholder}
                    rows={3}
                    className="w-full rounded-xl px-3 py-2.5 text-sm font-inter resize-none focus:outline-none leading-relaxed transition-all"
                    style={{
                      background: "var(--fill-2)",
                      border: "1px solid rgb(var(--ink) / 0.08)",
                      color: "rgb(var(--ink) / 0.82)",
                      outline: "none",
                    }}
                    onFocus={e => { e.target.style.border = `1px solid ${active.color}55`; }}
                    onBlur={e => { e.target.style.border = "1px solid rgb(var(--ink) / 0.08)"; }}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
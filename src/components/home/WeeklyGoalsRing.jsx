import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, BookOpen, StickyNote, X, Check, ChevronDown } from "lucide-react";
import { listReadingActivity, listInteractions } from "@/lib/dataAccess";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/LanguageContext";

const GOAL_KEY = "veritas_weekly_goals";

function loadGoals() {
  try { return JSON.parse(localStorage.getItem(GOAL_KEY) || "null"); } catch { return null; }
}

function saveGoals(g) { localStorage.setItem(GOAL_KEY, JSON.stringify(g)); }

const DEFAULT_GOALS = { chapters: 5, notes: 3 };

// Gold SVG ring
function GoldRing({ pct, size = 80, stroke = 7, children }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute" style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="url(#goldRingGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
        <defs>
          <linearGradient id="goldRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
      </svg>
      <div className="relative z-10 text-center">{children}</div>
    </div>
  );
}

export default function WeeklyGoalsRing() {
  const { lang } = useLang();
  const [goals, setGoals] = useState(() => loadGoals() || DEFAULT_GOALS);
  const [chaptersRead, setChaptersRead] = useState(0);
  const [notesWritten, setNotesWritten] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [editGoals, setEditGoals] = useState(goals);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Count chapters read this week and notes created this week — from REAL sessions
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoISO = weekAgo.toISOString();
    Promise.all([
      listReadingActivity({ limit: 200 }),       // consolidated reading sessions
      listInteractions({ limit: 200 }),          // consolidated verse interactions
    ]).then(([reading, interactions]) => {
      // Unique chapters read this week
      const chSet = new Set(
        (reading || [])
          .filter(r => (r.created_date || "") >= weekAgoISO)
          .map(r => `${r.book}:${r.chapter}`)
      );
      // Notes created this week (interaction has note + recent)
      const nWeek = (interactions || []).filter(i =>
        (i.has_note || i.note_text) && (i.last_interacted_at || i.created_date || "") >= weekAgoISO
      ).length;
      setChaptersRead(chSet.size);
      setNotesWritten(nWeek);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const chPct = Math.min(100, Math.round((chaptersRead / (goals.chapters || 1)) * 100));
  const notePct = Math.min(100, Math.round((notesWritten / (goals.notes || 1)) * 100));
  const overallPct = Math.round((chPct + notePct) / 2);

  const saveEdit = () => {
    setGoals(editGoals);
    saveGoals(editGoals);
    setShowEdit(false);
  };

  const label = (n) => lang === "es" ? `${n}%` : `${n}%`;

  return (
    <div className="rounded-2xl p-4"
      style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.07), rgba(0,0,0,0.3))", border: "1px solid rgba(251,191,36,0.2)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-3.5 h-3.5" style={{ color: "#fbbf24" }} />
          <p className="text-[10px] font-cinzel uppercase tracking-[0.2em]" style={{ color: "#fbbf24" }}>
            {lang === "es" ? "Metas Semanales" : "Weekly Goals"}
          </p>
        </div>
        <button onClick={() => { setShowEdit(v => !v); setEditGoals(goals); }}
          className="flex items-center gap-1 text-[10px] font-cinzel px-2.5 py-1 rounded-full"
          style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
          {showEdit ? <X className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {showEdit ? (lang === "es" ? "Cerrar" : "Close") : (lang === "es" ? "Editar" : "Edit")}
        </button>
      </div>

      {/* Edit Goals form */}
      <AnimatePresence>
        {showEdit && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
            className="overflow-hidden mb-3">
            <div className="rounded-xl p-3 space-y-3"
              style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(251,191,36,0.15)" }}>
              <p className="text-[9px] font-cinzel uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
                {lang === "es" ? "Establece tus metas semanales" : "Set your weekly targets"}
              </p>
              {[
                { key: "chapters", label: lang === "es" ? "Capítulos" : "Chapters", icon: BookOpen, color: "#00f5ff", max: 20 },
                { key: "notes", label: lang === "es" ? "Notas" : "Notes", icon: StickyNote, color: "#a78bfa", max: 10 },
              ].map(({ key, label: lbl, icon: Icon, color, max }) => (
                <div key={key} className="flex items-center gap-3">
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
                  <p className="font-inter text-xs flex-1" style={{ color: "rgba(255,255,255,0.65)" }}>{lbl}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditGoals(g => ({ ...g, [key]: Math.max(1, (g[key] || 1) - 1) }))}
                      className="w-6 h-6 rounded-lg font-bold text-sm flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}>−</button>
                    <span className="font-cinzel text-sm font-bold w-5 text-center" style={{ color }}>{editGoals[key]}</span>
                    <button onClick={() => setEditGoals(g => ({ ...g, [key]: Math.min(max, (g[key] || 1) + 1) }))}
                      className="w-6 h-6 rounded-lg font-bold text-sm flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}>+</button>
                  </div>
                </div>
              ))}
              <button onClick={saveEdit}
                className="w-full py-2 rounded-xl font-cinzel text-xs flex items-center justify-center gap-1.5"
                style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}>
                <Check className="w-3 h-3" /> {lang === "es" ? "Guardar metas" : "Save Goals"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rings */}
      <div className="flex items-center justify-around">
        {/* Overall */}
        <GoldRing pct={overallPct} size={76} stroke={7}>
          <p className="font-cinzel text-base font-bold" style={{ color: "#fbbf24" }}>{overallPct}%</p>
          <p className="text-[8px] font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>
            {lang === "es" ? "Total" : "Overall"}
          </p>
        </GoldRing>

        <div className="space-y-3">
          {/* Chapters */}
          <div className="flex items-center gap-2.5">
            <GoldRing pct={chPct} size={48} stroke={5}>
              <p className="font-cinzel text-[10px] font-bold" style={{ color: "#00f5ff" }}>{chPct}%</p>
            </GoldRing>
            <div>
              <p className="font-cinzel text-xs font-semibold text-white">{chaptersRead}<span className="text-[9px] font-inter" style={{ color: "rgba(255,255,255,0.3)" }}>/{goals.chapters}</span></p>
              <p className="text-[9px] font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>
                {lang === "es" ? "Capítulos" : "Chapters"}
              </p>
            </div>
          </div>
          {/* Notes */}
          <div className="flex items-center gap-2.5">
            <GoldRing pct={notePct} size={48} stroke={5}>
              <p className="font-cinzel text-[10px] font-bold" style={{ color: "#a78bfa" }}>{notePct}%</p>
            </GoldRing>
            <div>
              <p className="font-cinzel text-xs font-semibold text-white">{notesWritten}<span className="text-[9px] font-inter" style={{ color: "rgba(255,255,255,0.3)" }}>/{goals.notes}</span></p>
              <p className="text-[9px] font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>
                {lang === "es" ? "Notas" : "Notes"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {overallPct >= 100 && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="mt-3 py-2 text-center rounded-xl"
          style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)" }}>
          <p className="font-cinzel text-xs" style={{ color: "#fbbf24" }}>
            🏆 {lang === "es" ? "¡Meta semanal alcanzada!" : "Weekly goal achieved!"}
          </p>
        </motion.div>
      )}
    </div>
  );
}
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Cell, PieChart, Pie
} from "recharts";
import { TrendingUp, Highlighter, BookOpen, Tag } from "lucide-react";

const GOLD = "#fbbf24";
const GOLD_DIM = "#92400e";
const DARK_CARD = "rgba(255,255,255,0.03)";
const BORDER = "rgba(251,191,36,0.15)";

// Derive books from highlights / bookmarks / notes
function topBooks(items, limit = 7) {
  const counts = {};
  items.forEach(item => {
    const book = item.book;
    if (book) counts[book] = (counts[book] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([book, count]) => ({ book: book.length > 10 ? book.slice(0, 10) + "…" : book, count }));
}

// Derive topics from note tags + highlight colors mapped to themes
function topTopics(notes, highlights) {
  const counts = {};
  notes.forEach(n => {
    (n.tags || []).forEach(tag => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });
  // Map highlight colors to themes
  const colorThemes = { yellow: "Faith", cyan: "Hope", purple: "Wisdom", green: "Life", red: "Salvation" };
  highlights.forEach(h => {
    const theme = colorThemes[h.color] || h.color || "General";
    counts[theme] = (counts[theme] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([topic, count]) => ({ topic, count }));
}

// Reading frequency over last 30 days (weekly buckets)
function weeklyFrequency(readingProgress) {
  // Build 4 weeks of data from updated_date
  const now = new Date();
  const weeks = ["Wk 4", "Wk 3", "Wk 2", "This Wk"];
  const buckets = [0, 0, 0, 0];
  readingProgress.forEach(rp => {
    const date = new Date(rp.updated_date || rp.created_date);
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) buckets[3]++;
    else if (diffDays < 14) buckets[2]++;
    else if (diffDays < 21) buckets[1]++;
    else if (diffDays < 28) buckets[0]++;
  });
  return weeks.map((week, i) => ({ week, sessions: buckets[i] }));
}

const PIE_COLORS = ["#fbbf24", "#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f"];

export default function ProfileInsights({ highlights = [], notes = [], bookmarks = [], readingProgress = [] }) {
  const allAnnotations = useMemo(() => [...highlights, ...bookmarks, ...notes], [highlights, bookmarks, notes]);
  const booksData = useMemo(() => topBooks(allAnnotations), [allAnnotations]);
  const topicsData = useMemo(() => topTopics(notes, highlights), [notes, highlights]);
  const freqData = useMemo(() => weeklyFrequency(readingProgress), [readingProgress]);

  const totalAnnotations = highlights.length + bookmarks.length + notes.length;
  const topBook = booksData[0]?.book || "—";
  const topTopic = topicsData[0]?.topic || "—";

  return (
    <div className="space-y-5">

      {/* Summary Pills */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: BookOpen, label: "Top Book", value: topBook, color: GOLD },
          { icon: Tag, label: "Top Topic", value: topTopic, color: "#c084fc" },
          { icon: Highlighter, label: "Annotations", value: totalAnnotations, color: "#34d399" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-2xl p-3 text-center"
            style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
            <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color }} />
            <p className="font-cinzel text-sm font-bold truncate" style={{ color }}>{value}</p>
            <p className="text-[9px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Reading Frequency */}
      <div className="rounded-2xl p-4" style={{ background: DARK_CARD, border: BORDER }}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-3.5 h-3.5" style={{ color: GOLD }} />
          <p className="text-[10px] font-cinzel uppercase tracking-[0.2em]" style={{ color: GOLD }}>Reading Frequency (Last 4 Weeks)</p>
        </div>
        {freqData.every(d => d.sessions === 0) ? (
          <p className="text-xs font-inter text-center py-6" style={{ color: "rgba(255,255,255,0.25)" }}>
            Start reading to see your frequency chart
          </p>
        ) : (
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={freqData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={GOLD} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={GOLD_DIM} stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)", fontFamily: "Inter" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "var(--popover-surface)", border: `1px solid ${GOLD}30`, borderRadius: 12, fontSize: 12, fontFamily: "Cinzel" }}
                  labelStyle={{ color: GOLD }}
                  itemStyle={{ color: "rgba(255,255,255,0.7)" }}
                  cursor={{ fill: "rgba(251,191,36,0.06)" }}
                />
                <Bar dataKey="sessions" fill="url(#goldGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Most Highlighted Books */}
      <div className="rounded-2xl p-4" style={{ background: DARK_CARD, border: BORDER }}>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-3.5 h-3.5" style={{ color: GOLD }} />
          <p className="text-[10px] font-cinzel uppercase tracking-[0.2em]" style={{ color: GOLD }}>Most Interacted Books</p>
        </div>
        {booksData.length === 0 ? (
          <p className="text-xs font-inter text-center py-6" style={{ color: "rgba(255,255,255,0.25)" }}>
            Bookmark or highlight verses to see your top books
          </p>
        ) : (
          <div className="space-y-2.5">
            {booksData.map((item, i) => {
              const pct = Math.round((item.count / booksData[0].count) * 100);
              return (
                <motion.div key={item.book} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-cinzel text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>{item.book}</span>
                    <span className="font-cinzel text-xs" style={{ color: GOLD }}>{item.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--fill-3)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, delay: i * 0.05 }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${GOLD}, #f59e0b)` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Topics / Themes */}
      <div className="rounded-2xl p-4" style={{ background: DARK_CARD, border: BORDER }}>
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-3.5 h-3.5" style={{ color: GOLD }} />
          <p className="text-[10px] font-cinzel uppercase tracking-[0.2em]" style={{ color: GOLD }}>Topics You Engage With Most</p>
        </div>
        {topicsData.length === 0 ? (
          <p className="text-xs font-inter text-center py-6" style={{ color: "rgba(255,255,255,0.25)" }}>
            Tag your notes or add highlights to reveal your spiritual themes
          </p>
        ) : (
          <div className="flex gap-3 flex-wrap">
            {topicsData.map((item, i) => (
              <motion.div key={item.topic}
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
                className="flex items-center gap-2 px-3 py-2 rounded-full"
                style={{ background: `${PIE_COLORS[i % PIE_COLORS.length]}15`, border: `1px solid ${PIE_COLORS[i % PIE_COLORS.length]}35` }}>
                <span className="font-cinzel text-xs font-semibold" style={{ color: PIE_COLORS[i % PIE_COLORS.length] }}>{item.topic}</span>
                <span className="font-inter text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${PIE_COLORS[i % PIE_COLORS.length]}25`, color: PIE_COLORS[i % PIE_COLORS.length] }}>{item.count}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Annotation breakdown donut */}
      {totalAnnotations > 0 && (
        <div className="rounded-2xl p-4" style={{ background: DARK_CARD, border: BORDER }}>
          <div className="flex items-center gap-2 mb-4">
            <Highlighter className="w-3.5 h-3.5" style={{ color: GOLD }} />
            <p className="text-[10px] font-cinzel uppercase tracking-[0.2em]" style={{ color: GOLD }}>Annotation Breakdown</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-28 h-28 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Highlights", value: highlights.length || 0.01 },
                      { name: "Bookmarks", value: bookmarks.length || 0.01 },
                      { name: "Notes", value: notes.length || 0.01 },
                    ]}
                    cx="50%" cy="50%"
                    innerRadius={30} outerRadius={50}
                    paddingAngle={3} dataKey="value"
                  >
                    <Cell fill="#fbbf24" />
                    <Cell fill="#f97316" />
                    <Cell fill="#a78bfa" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2.5 flex-1">
              {[
                { label: "Highlights", value: highlights.length, color: "#fbbf24" },
                { label: "Bookmarks", value: bookmarks.length, color: "#f97316" },
                { label: "Notes", value: notes.length, color: "#a78bfa" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{label}</span>
                  </div>
                  <span className="font-cinzel text-sm font-bold" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
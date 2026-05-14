import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Plus, Send, Loader2, X, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const CATEGORIES = [
  { id: "all",       label: "All",       emoji: "🙏" },
  { id: "healing",   label: "Healing",   emoji: "💚" },
  { id: "family",    label: "Family",    emoji: "👨‍👩‍👧" },
  { id: "guidance",  label: "Guidance",  emoji: "🌟" },
  { id: "gratitude", label: "Gratitude", emoji: "🙌" },
  { id: "strength",  label: "Strength",  emoji: "💪" },
  { id: "peace",     label: "Peace",     emoji: "🕊️" },
  { id: "other",     label: "Other",     emoji: "✨" },
];

const CATEGORY_COLORS = {
  healing:   "#34d399",
  family:    "#60a5fa",
  guidance:  "#fbbf24",
  gratitude: "#f472b6",
  strength:  "#f97316",
  peace:     "#a78bfa",
  other:     "#00f5ff",
};

export default function PrayerWall() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [newRequest, setNewRequest] = useState("");
  const [newCategory, setNewCategory] = useState("other");
  const [submitting, setSubmitting] = useState(false);
  const [prayedPosts, setPrayedPosts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("veritas_prayed_posts") || "[]"); } catch { return []; }
  });
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setUserEmail(u?.email || null)).catch(() => {});
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const data = await base44.entities.PrayerWallPost.list("-created_date", 50);
    setPosts(data || []);
    setLoading(false);
  };

  const submitRequest = async () => {
    if (!newRequest.trim()) return;
    setSubmitting(true);
    await base44.entities.PrayerWallPost.create({
      request: newRequest.trim(),
      category: newCategory,
      prayer_count: 0,
      prayed_by: [],
    });
    setNewRequest("");
    setNewCategory("other");
    setShowForm(false);
    await loadPosts();
    setSubmitting(false);
  };

  const handlePray = async (post) => {
    const alreadyPrayed = prayedPosts.includes(post.id);
    if (alreadyPrayed) return;

    // Optimistic update
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, prayer_count: (p.prayer_count || 0) + 1 } : p));
    const updated = [...prayedPosts, post.id];
    setPrayedPosts(updated);
    localStorage.setItem("veritas_prayed_posts", JSON.stringify(updated));

    const prayedBy = Array.isArray(post.prayed_by) ? post.prayed_by : [];
    await base44.entities.PrayerWallPost.update(post.id, {
      prayer_count: (post.prayer_count || 0) + 1,
      prayed_by: userEmail ? [...prayedBy, userEmail] : prayedBy,
    });
  };

  const filtered = activeCategory === "all" ? posts : posts.filter(p => p.category === activeCategory);

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-cinzel text-base font-bold text-white">Prayer Wall</h2>
          <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Anonymous requests from the community</p>
        </div>
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-cinzel text-xs"
          style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa" }}>
          <Plus className="w-3.5 h-3.5" /> Add Request
        </motion.button>
      </div>

      {/* Submit form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-2xl p-4 space-y-3"
              style={{ background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.2)" }}>
              <p className="text-[10px] font-cinzel uppercase tracking-widest" style={{ color: "rgba(167,139,250,0.7)" }}>
                Your request is posted anonymously
              </p>
              <textarea value={newRequest} onChange={e => setNewRequest(e.target.value)}
                placeholder="Share your prayer request with the community…"
                rows={3}
                className="w-full rounded-xl px-3 py-2.5 text-sm font-inter resize-none focus:outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.85)", fontSize: "16px" }} />
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.filter(c => c.id !== "all").map(cat => (
                  <button key={cat.id} onClick={() => setNewCategory(cat.id)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-cinzel transition-all"
                    style={{
                      background: newCategory === cat.id ? `${CATEGORY_COLORS[cat.id]}20` : "rgba(255,255,255,0.04)",
                      color: newCategory === cat.id ? CATEGORY_COLORS[cat.id] : "rgba(255,255,255,0.4)",
                      border: newCategory === cat.id ? `1px solid ${CATEGORY_COLORS[cat.id]}50` : "1px solid rgba(255,255,255,0.07)"
                    }}>
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl font-cinzel text-xs"
                  style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  Cancel
                </button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={submitRequest} disabled={submitting || !newRequest.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-cinzel text-xs"
                  style={{ background: "rgba(167,139,250,0.2)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.35)", opacity: !newRequest.trim() ? 0.5 : 1 }}>
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Submit
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-cinzel whitespace-nowrap transition-all"
            style={{
              background: activeCategory === cat.id ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.04)",
              color: activeCategory === cat.id ? "#a78bfa" : "rgba(255,255,255,0.4)",
              border: activeCategory === cat.id ? "1px solid rgba(167,139,250,0.3)" : "1px solid rgba(255,255,255,0.07)"
            }}>
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#a78bfa" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 flex flex-col items-center gap-3">
          <span className="text-4xl">🙏</span>
          <p className="font-cinzel text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>No requests yet — be the first</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((post, i) => {
              const hasPrayed = prayedPosts.includes(post.id);
              const color = CATEGORY_COLORS[post.category] || "#a78bfa";
              const catInfo = CATEGORIES.find(c => c.id === post.category);
              return (
                <motion.div key={post.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-2xl p-4"
                  style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${color}22` }}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                      style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                      {catInfo?.emoji || "🙏"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
                        {post.request}
                      </p>
                      <p className="text-[9px] font-cinzel uppercase tracking-wider mt-1.5"
                        style={{ color: `${color}99` }}>
                        {catInfo?.label || "Other"} · {new Date(post.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <span className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.25)" }}>
                      {post.prayer_count || 0} {(post.prayer_count || 0) === 1 ? "person" : "people"} praying
                    </span>
                    <motion.button
                      whileTap={{ scale: hasPrayed ? 1 : 0.88 }}
                      onClick={() => handlePray(post)}
                      disabled={hasPrayed}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-cinzel text-[10px] transition-all"
                      style={{
                        background: hasPrayed ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.05)",
                        color: hasPrayed ? "#a78bfa" : "rgba(255,255,255,0.5)",
                        border: hasPrayed ? "1px solid rgba(167,139,250,0.3)" : "1px solid rgba(255,255,255,0.08)",
                      }}>
                      {hasPrayed
                        ? <><CheckCircle2 className="w-3 h-3" /> Praying</>
                        : <><Heart className="w-3 h-3" /> I'm Praying</>}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
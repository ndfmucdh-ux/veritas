import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Plus, Send, Loader2, X, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { LoadingState, EmptyState } from "@/components/ui/states";

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
  const [amenPosts, setAmenPosts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("veritas_amen_posts") || "[]"); } catch { return []; }
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

  const handleAmen = async (post) => {
    const alreadyAmened = amenPosts.includes(post.id);
    if (alreadyAmened) return;
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, amen_count: (p.amen_count || 0) + 1 } : p));
    const updated = [...amenPosts, post.id];
    setAmenPosts(updated);
    localStorage.setItem("veritas_amen_posts", JSON.stringify(updated));
    await base44.entities.PrayerWallPost.update(post.id, { amen_count: (post.amen_count || 0) + 1 });
  };

  const filtered = activeCategory === "all" ? posts : posts.filter(p => p.category === activeCategory);

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-cinzel text-base font-bold text-white">Prayer Wall</h2>
          <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.35)" }}>
            {posts.reduce((sum, p) => sum + (p.prayer_count || 0), 0).toLocaleString()} prayers sent · {posts.length} requests
          </p>
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
                style={{ background: "var(--fill-2)", border: "1px solid rgb(var(--ink) / 0.09)", color: "rgb(var(--ink) / 0.85)", fontSize: "16px" }} />
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.filter(c => c.id !== "all").map(cat => (
                  <button key={cat.id} onClick={() => setNewCategory(cat.id)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-cinzel transition-all"
                    style={{
                      background: newCategory === cat.id ? `${CATEGORY_COLORS[cat.id]}20` : "rgb(var(--ink) / 0.04)",
                      color: newCategory === cat.id ? CATEGORY_COLORS[cat.id] : "rgb(var(--ink) / 0.4)",
                      border: newCategory === cat.id ? `1px solid ${CATEGORY_COLORS[cat.id]}50` : "1px solid rgb(var(--ink) / 0.07)"
                    }}>
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl font-cinzel text-xs"
                  style={{ background: "var(--fill-2)", color: "rgb(var(--ink) / 0.4)", border: "1px solid rgb(var(--ink) / 0.08)" }}>
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
              background: activeCategory === cat.id ? "rgba(167,139,250,0.15)" : "rgb(var(--ink) / 0.04)",
              color: activeCategory === cat.id ? "#a78bfa" : "rgb(var(--ink) / 0.4)",
              border: activeCategory === cat.id ? "1px solid rgba(167,139,250,0.3)" : "1px solid rgb(var(--ink) / 0.07)"
            }}>
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <LoadingState label="Loading prayer requests…" size="md" minHeight={120} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🙏" title="No requests yet — be the first" minHeight={140} />
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
                  style={{ background: "var(--fill-1)", border: `1px solid ${color}22` }}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                      style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                      {catInfo?.emoji || "🙏"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-inter leading-relaxed" style={{ color: "rgb(var(--ink) / 0.8)" }}>
                        {post.request}
                      </p>
                      <p className="text-[9px] font-cinzel uppercase tracking-wider mt-1.5"
                        style={{ color: `${color}99` }}>
                        {catInfo?.label || "Other"} · {new Date(post.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3"
                    style={{ borderTop: "1px solid rgb(var(--ink) / 0.05)" }}>
                    <span className="text-[10px] font-inter" style={{ color: "rgb(var(--ink) / 0.25)" }}>
                      {post.prayer_count || 0} 🙏 · {post.amen_count || 0} 🕊️
                    </span>
                    <div className="flex items-center gap-1.5">
                      {/* Amen button */}
                      <motion.button
                        whileTap={{ scale: amenPosts.includes(post.id) ? 1 : 0.88 }}
                        onClick={() => handleAmen(post)}
                        disabled={amenPosts.includes(post.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-cinzel text-[10px] transition-all"
                        style={{
                          background: amenPosts.includes(post.id) ? "rgba(251,191,36,0.15)" : "rgb(var(--ink) / 0.04)",
                          color: amenPosts.includes(post.id) ? "#fbbf24" : "rgb(var(--ink) / 0.45)",
                          border: amenPosts.includes(post.id) ? "1px solid rgba(251,191,36,0.3)" : "1px solid rgb(var(--ink) / 0.07)",
                        }}>
                        🕊️ Amen
                      </motion.button>
                      {/* Praying button */}
                      <motion.button
                        whileTap={{ scale: hasPrayed ? 1 : 0.88 }}
                        onClick={() => handlePray(post)}
                        disabled={hasPrayed}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-cinzel text-[10px] transition-all"
                        style={{
                          background: hasPrayed ? "rgba(167,139,250,0.15)" : "rgb(var(--ink) / 0.05)",
                          color: hasPrayed ? "#a78bfa" : "rgb(var(--ink) / 0.5)",
                          border: hasPrayed ? "1px solid rgba(167,139,250,0.3)" : "1px solid rgb(var(--ink) / 0.08)",
                        }}>
                        {hasPrayed
                          ? <><CheckCircle2 className="w-3 h-3" /> Praying</>
                          : <><Heart className="w-3 h-3" /> Pray</>}
                      </motion.button>
                    </div>
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
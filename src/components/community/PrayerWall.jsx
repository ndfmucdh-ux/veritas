import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Plus, Send, Loader2, CheckCircle2, HandHeart } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { LoadingState, EmptyState } from "@/components/ui/states";
import { useLang } from "@/lib/LanguageContext";
import { DATE_LOCALE } from "@/lib/i18nCommunity";

const CATEGORIES = [
  { id: "all", key: "moodAll" },
  { id: "healing", key: "catHealing" },
  { id: "family", key: "catFamily" },
  { id: "guidance", key: "catGuidance" },
  { id: "gratitude", key: "catGratitude" },
  { id: "strength", key: "catStrength" },
  { id: "peace", key: "catPeace" },
  { id: "other", key: "catOther" },
];

export default function PrayerWall() {
  const { t, lang } = useLang();
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
    const draft = { request: newRequest.trim(), category: newCategory, prayer_count: 0 };
    const tempId = `tmp-${Date.now()}`;
    setPosts(prev => [{ ...draft, id: tempId, amen_count: 0, created_date: new Date().toISOString() }, ...prev]);
    setNewRequest("");
    setNewCategory("other");
    setShowForm(false);
    try {
      await base44.entities.PrayerWallPost.create(draft);
      const data = await base44.entities.PrayerWallPost.list("-created_date", 50);
      setPosts(data || []);
    } catch (e) {
      setPosts(prev => prev.filter(p => p.id !== tempId));
      setNewRequest(draft.request);
      setShowForm(true);
    }
    setSubmitting(false);
  };

  const handlePray = async (post) => {
    if (prayedPosts.includes(post.id)) return;
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, prayer_count: (p.prayer_count || 0) + 1 } : p));
    const updated = [...prayedPosts, post.id];
    setPrayedPosts(updated);
    localStorage.setItem("veritas_prayed_posts", JSON.stringify(updated));

    // Once-per-person is tracked on this device; the private email list is no longer written.
    await base44.entities.PrayerWallPost.update(post.id, {
      prayer_count: (post.prayer_count || 0) + 1,
    });
  };

  const handleAmen = async (post) => {
    if (amenPosts.includes(post.id)) return;
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, amen_count: (p.amen_count || 0) + 1 } : p));
    const updated = [...amenPosts, post.id];
    setAmenPosts(updated);
    localStorage.setItem("veritas_amen_posts", JSON.stringify(updated));
    await base44.entities.PrayerWallPost.update(post.id, { amen_count: (post.amen_count || 0) + 1 });
  };

  const filtered = activeCategory === "all" ? posts : posts.filter(p => p.category === activeCategory);
  const catLabel = (id) => t[(CATEGORIES.find(c => c.id === id) || CATEGORIES[7]).key];
  const totalPrayers = posts.reduce((sum, p) => sum + (p.prayer_count || 0), 0).toLocaleString(DATE_LOCALE[lang]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-cinzel text-2xl font-semibold text-foreground">{t.cmWall}</h2>
          <p className="text-xs mt-0.5 text-muted-foreground">
            {t.cmPrayersSent.replace("{n}", totalPrayers).replace("{m}", posts.length)}
          </p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex-shrink-0">
          <Plus className="w-4 h-4" /> {t.cmAddRequest}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-2xl p-5 space-y-3 bg-card border border-border shadow-sm">
              <p className="text-xs uppercase tracking-widest text-accent">{t.cmAnon}</p>
              <textarea value={newRequest} onChange={e => setNewRequest(e.target.value)}
                placeholder={t.cmSharePh} rows={3}
                className="w-full rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-primary bg-background border border-border text-foreground"
                style={{ fontSize: "16px" }} />
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.filter(c => c.id !== "all").map(cat => (
                  <button key={cat.id} onClick={() => setNewCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${newCategory === cat.id ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground/80 border-border"}`}>
                    {t[cat.key]}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm text-muted-foreground border border-border">{t.cancel}</button>
                <button onClick={submitRequest} disabled={submitting || !newRequest.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm bg-primary text-primary-foreground disabled:opacity-50">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {t.cmSubmit}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-colors ${activeCategory === cat.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground/80 border-border hover:border-primary/50"}`}>
            {t[cat.key]}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState label={t.cmLoadingReq} size="md" minHeight={120} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={HandHeart} title={t.cmBeFirst} minHeight={140} />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((post, i) => {
              const hasPrayed = prayedPosts.includes(post.id);
              const hasAmen = amenPosts.includes(post.id);
              return (
                <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="rounded-2xl p-5 bg-card border border-border shadow-sm">
                  <p className="text-xs uppercase tracking-wider text-accent mb-2">
                    {catLabel(post.category)} · {new Date(post.created_date).toLocaleDateString(DATE_LOCALE[lang], { month: "short", day: "numeric" })}
                  </p>
                  <p className="font-cinzel text-lg leading-relaxed text-foreground">{post.request}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground flex items-center gap-3">
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {post.prayer_count || 0}</span>
                      <span className="flex items-center gap-1"><HandHeart className="w-3.5 h-3.5" /> {post.amen_count || 0}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleAmen(post)} disabled={hasAmen}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${hasAmen ? "bg-accent/15 text-accent border-accent/40" : "text-foreground/80 border-border hover:border-accent/50"}`}>
                        {t.cmAmen}
                      </button>
                      <button onClick={() => handlePray(post)} disabled={hasPrayed}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border transition-colors ${hasPrayed ? "bg-primary/15 text-primary border-primary/40" : "text-foreground/80 border-border hover:border-primary/50"}`}>
                        {hasPrayed ? <><CheckCircle2 className="w-3.5 h-3.5" /> {t.cmPraying}</> : <><Heart className="w-3.5 h-3.5" /> {t.cmPray}</>}
                      </button>
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
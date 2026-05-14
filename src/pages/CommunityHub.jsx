import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MessageCircle, Heart, Shield, Loader2, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PrayerWall from "@/components/community/PrayerWall";

export default function CommunityHub() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("study_group");
  const [activeTab, setActiveTab] = useState("groups");

  useEffect(() => {
    loadGroups();
  }, [selectedCategory]);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("findStudyGroups", {
        category: selectedCategory,
        limit: 20
      });
      setGroups(res.data.groups || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "study_group", label: "Study Groups", icon: "📖" },
    { id: "prayer_circle", label: "Prayer Circles", icon: "🙏" },
    { id: "accountability", label: "Accountability", icon: "💪" },
    { id: "mens_group", label: "Men's Groups", icon: "👨" },
    { id: "womens_group", label: "Women's Groups", icon: "👩" }
  ];

  const categoryData = categories.find(c => c.id === selectedCategory);

  return (
    <div className="md:ml-16 min-h-screen pb-28 px-4 md:px-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto pt-6 mb-8">
        <h1 className="font-cinzel text-2xl font-bold text-white mb-2">Community</h1>
        <p className="text-sm text-white/50">Connect with believers worldwide</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Main tabs */}
        <div className="flex gap-2">
          {[["groups", "👥 Groups"], ["prayer_wall", "🙏 Prayer Wall"]].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className="flex-1 py-2.5 rounded-xl font-cinzel text-xs transition-all"
              style={{
                background: activeTab === id ? "rgba(0,245,255,0.12)" : "rgba(255,255,255,0.04)",
                color: activeTab === id ? "#00f5ff" : "rgba(255,255,255,0.4)",
                border: activeTab === id ? "1px solid rgba(0,245,255,0.3)" : "1px solid rgba(255,255,255,0.07)"
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Prayer Wall tab */}
        {activeTab === "prayer_wall" && <PrayerWall />}

        {/* Groups tab */}
        {activeTab === "groups" && <>
        {/* Category tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2">
          {categories.map(cat => (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat.id)}
              className="flex-shrink-0 py-2 px-4 rounded-full text-xs font-cinzel whitespace-nowrap transition-all"
              style={{
                background: selectedCategory === cat.id ? "rgba(0,245,255,0.15)" : "rgba(255,255,255,0.05)",
                color: selectedCategory === cat.id ? "#00f5ff" : "rgba(255,255,255,0.4)",
                border: selectedCategory === cat.id ? "1px solid rgba(0,245,255,0.25)" : "1px solid transparent"
              }}
            >
              {cat.icon} {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Groups list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-cyan" />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-8 h-8 mx-auto text-white/20 mb-2" />
            <p className="text-white/40">No groups in this category yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {groups.map((group) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-2xl p-4 group cursor-pointer hover:shadow-lg transition-all"
                  style={{
                    background: "rgba(0,245,255,0.05)",
                    border: "1px solid rgba(0,245,255,0.15)"
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-cinzel text-sm text-white">{group.name}</p>
                      {group.verified && (
                        <div className="flex items-center gap-1 mt-1">
                          <Shield className="w-3 h-3 text-green-500" />
                          <span className="text-[10px] text-green-500">Verified</span>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40" />
                  </div>
                  <p className="text-xs text-white/50 mb-3 line-clamp-2">{group.description}</p>
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-3">
                      <span style={{ color: "rgba(255,255,255,0.3)" }}>
                        👥 {group.members_label}
                      </span>
                      <span style={{ color: "rgba(255,255,255,0.3)" }}>
                        📧 {group.category.replace(/_/g, " ")}
                      </span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className="px-3 py-1 rounded-lg text-white font-inter"
                      style={{
                        background: "linear-gradient(135deg, #00f5ff, #006bb3)"
                      }}
                    >
                      Join
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        </>}
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Shield, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PrayerWall from "@/components/community/PrayerWall";
import { LoadingState, EmptyState } from "@/components/ui/states";
import { useLang } from "@/lib/LanguageContext";

const CATEGORIES = [
  { id: "study_group", key: "cmStudy" },
  { id: "prayer_circle", key: "cmPrayerCircles" },
  { id: "accountability", key: "cmAccountability" },
  { id: "mens_group", key: "cmMens" },
  { id: "womens_group", key: "cmWomens" },
];

export default function CommunityHub() {
  const { t } = useLang();
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
      const res = await base44.functions.invoke("findStudyGroups", { category: selectedCategory, limit: 20 });
      setGroups(res.data.groups || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const catLabel = (id) => t[(CATEGORIES.find(c => c.id === id) || CATEGORIES[0]).key];

  return (
    <div className="min-h-screen pb-28 px-4 md:px-8">
      <div className="max-w-4xl mx-auto pt-8 mb-6">
        <h1 className="font-cinzel text-4xl font-semibold text-foreground">{t.community}</h1>
        <p className="text-sm mt-1 text-muted-foreground">{t.cmSub}</p>
        <div className="mt-4 h-px w-full bg-primary/40" />
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex gap-2 border-b border-border">
          {[["groups", t.cmGroups], ["prayer_wall", t.cmWall]].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`px-4 py-2.5 text-sm -mb-px border-b-2 transition-colors ${activeTab === id ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === "prayer_wall" && <PrayerWall />}

        {activeTab === "groups" && (
          <>
            <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                  className={`flex-shrink-0 py-2 px-4 rounded-full text-sm whitespace-nowrap border transition-colors ${selectedCategory === cat.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground/80 border-border hover:border-primary/50"}`}>
                  {t[cat.key]}
                </button>
              ))}
            </div>

            {loading ? (
              <LoadingState label={t.cmFinding} size="lg" />
            ) : groups.length === 0 ? (
              <EmptyState icon={Users} title={t.cmNoGroups} />
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                <AnimatePresence>
                  {groups.map((group) => (
                    <motion.div key={group.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                      className="rounded-2xl p-5 flex flex-col bg-card border border-border shadow-sm">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="font-cinzel text-lg font-semibold text-foreground">{group.name}</p>
                          {group.verified && (
                            <span className="flex items-center gap-1 mt-1 text-xs text-primary">
                              <Shield className="w-3 h-3" /> {t.cmVerified}
                            </span>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </div>
                      <p className="text-sm text-foreground/75 mb-4 line-clamp-2 flex-1">{group.description}</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-3 text-xs text-muted-foreground min-w-0">
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {group.members_label}</span>
                          <span className="truncate">{catLabel(group.category)}</span>
                        </span>
                        <button className="px-4 py-1.5 rounded-full text-sm bg-accent text-accent-foreground hover:opacity-90 transition-opacity flex-shrink-0">
                          {t.cmJoin}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
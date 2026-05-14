import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, Loader2, LayoutGrid, Shield, Heart, Zap, Star, Gem, Sprout } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/LanguageContext";

// CATEGORIES built inside component using t/lang — see component body

const CATEGORY_VERSES = {
  men: [
    { ref: "Joshua 1:9", text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.", theme: "courage" },
    { ref: "1 Corinthians 16:13", text: "Be on your guard; stand firm in the faith; be courageous; be strong.", theme: "strength" },
    { ref: "Proverbs 27:17", text: "As iron sharpens iron, so one person sharpens another.", theme: "brotherhood" },
    { ref: "Psalm 112:1-2", text: "Blessed are those who fear the LORD, who find great delight in his commands. Their children will be mighty in the land.", theme: "fatherhood" },
  ],
  women: [
    { ref: "Proverbs 31:25", text: "She is clothed with strength and dignity; she can laugh at the days to come.", theme: "strength" },
    { ref: "1 Peter 3:4", text: "Rather, it should be that of your inner self, the unfading beauty of a gentle and quiet spirit, which is of great worth in God's sight.", theme: "beauty" },
    { ref: "Psalm 139:14", text: "I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well.", theme: "identity" },
  ],
  youth: [
    { ref: "1 Timothy 4:12", text: "Don't let anyone look down on you because you are young, but set an example for the believers in speech, in conduct, in love, in faith and in purity.", theme: "identity" },
    { ref: "Psalm 119:9", text: "How can a young person stay on the path of purity? By living according to your word.", theme: "purity" },
    { ref: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.", theme: "purpose" },
  ],
  kids: [
    { ref: "Philippians 4:13", text: "I can do all this through him who gives me strength.", theme: "strength" },
    { ref: "Proverbs 3:5", text: "Trust in the LORD with all your heart and lean not on your own understanding.", theme: "trust" },
    { ref: "John 3:16", text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", theme: "love" },
  ],
  marriage: [
    { ref: "1 Corinthians 13:4-5", text: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking.", theme: "love" },
    { ref: "Ephesians 5:25", text: "Husbands, love your wives, just as Christ loved the church and gave himself up for her.", theme: "husband" },
    { ref: "Proverbs 18:22", text: "He who finds a wife finds what is good and receives favor from the LORD.", theme: "marriage" },
  ],
  general: [
    { ref: "Romans 8:28", text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.", theme: "hope" },
    { ref: "Isaiah 40:31", text: "But those who hope in the LORD will renew their strength. They will soar on wings like eagles.", theme: "strength" },
    { ref: "John 3:16", text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", theme: "salvation" },
  ],
};

export default function Discover() {
  const { t, lang } = useLang();
  const CATEGORIES = [
    { id: "general", label: lang === "es" ? "Todo" : "All", Icon: LayoutGrid },
    { id: "men", label: t.men, Icon: Shield },
    { id: "women", label: t.women, Icon: Heart },
    { id: "youth", label: t.youth, Icon: Zap },
    { id: "kids", label: t.kids, Icon: Star },
    { id: "marriage", label: t.marriage, Icon: Gem },
    { id: "new_believer", label: t.newBeliever, Icon: Sprout },
  ];
  const params = new URLSearchParams(window.location.search);
  const [category, setCategory] = useState(params.get("category") || "general");
  const [devotional, setDevotional] = useState(null);
  const [loadingDevo, setLoadingDevo] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState(null);

  const verses = CATEGORY_VERSES[category] || CATEGORY_VERSES.general;

  const generateDevotional = async (verseRef) => {
    setLoadingDevo(true);
    setSelectedVerse(verseRef);
    setDevotional(null);
    try {
      const res = await base44.functions.invoke("generateDevotional", {
        verse_ref: verseRef, category
      });
      setDevotional(res.data.devotional);
    } catch (e) {
      setDevotional({
        title: "Daily Reflection",
        key_verse: verseRef,
        reflection: "Take a moment to meditate on this powerful scripture. Let its truth penetrate your heart and transform your thinking.",
        insights: ["This verse speaks to the heart of our faith", "God's word never returns void"],
        application: "Apply this truth today by sharing it with someone who needs encouragement.",
        prayer: "Lord, let your word take root in my heart and bear fruit in my life. Amen."
      });
    } finally {
      setLoadingDevo(false);
    }
  };

  return (
    <div className="md:ml-16 min-h-screen px-4 pt-6">
      <div className="mb-6">
        <h1 className="font-cinzel text-2xl font-bold mb-1">{t.discover}</h1>
        <p className="text-muted-foreground text-sm">{t.curatedVerses}</p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
        {CATEGORIES.map(cat => {
          const CatIcon = cat.Icon;
          return (
            <button
              key={cat.id}
              onClick={() => { setCategory(cat.id); setDevotional(null); }}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
                category === cat.id
                  ? "bg-cyan/20 text-cyan border border-cyan/40 font-medium"
                  : "glass border border-border/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              <CatIcon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Verses Grid */}
      <div className="space-y-3 mb-8">
        <h3 className="text-xs font-cinzel tracking-widest text-muted-foreground uppercase">
          {CATEGORIES.find(c => c.id === category)?.label} {lang === "es" ? "Versículos" : "Verses"}
        </h3>
        {verses.map((v, i) => (
          <motion.div
            key={v.ref}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-xl p-5 border border-border/50"
          >
            <p className="font-playfair text-base text-foreground leading-relaxed italic mb-3">
              "{v.text}"
            </p>
            <div className="flex items-center justify-between">
              <span className="font-cinzel text-sm text-gold">{v.ref}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{v.theme}</span>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => generateDevotional(v.ref)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-purple/20 text-purple hover:bg-purple/30 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                {t.devotional || "Devotional"}
              </button>
              <a
                href={`/read?book=${v.ref.split(' ').slice(0,-1).join(' ')}&chapter=${v.ref.split(' ').pop()?.split(':')[0]}`}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-cyan/10 text-cyan hover:bg-cyan/20 transition-colors"
              >
                <BookOpen className="w-3 h-3" />
                {t.readBtn}
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Devotional Panel */}
      <AnimatePresence>
        {(loadingDevo || devotional) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-20 z-40 glass-strong rounded-2xl p-5 border border-purple/30 max-h-[70vh] overflow-y-auto scrollbar-hide shadow-2xl"
          >
            {loadingDevo ? (
              <div className="flex items-center gap-3 py-4">
                <Loader2 className="w-5 h-5 text-purple animate-spin" />
                <div>
                  <p className="text-sm font-cinzel text-foreground">Generating devotional for {selectedVerse}...</p>
                  <p className="text-xs text-muted-foreground mt-0.5">AI is crafting a personalized reflection</p>
                </div>
              </div>
            ) : devotional && (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-cinzel text-lg font-bold text-foreground">{devotional.title}</h3>
                    <p className="text-xs text-purple mt-0.5">{devotional.key_verse}</p>
                  </div>
                  <button onClick={() => setDevotional(null)} className="text-muted-foreground hover:text-foreground text-lg">×</button>
                </div>
                <p className="text-sm text-foreground/90 font-inter leading-relaxed">{devotional.reflection}</p>
                {devotional.insights?.length > 0 && (
                  <div>
                    <p className="text-xs font-cinzel text-gold uppercase tracking-widest mb-2">Key Insights</p>
                    <ul className="space-y-1">
                      {devotional.insights.map((ins, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-gold">·</span>{ins}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {devotional.application && (
                  <div className="glass rounded-xl p-3 border border-cyan/20">
                    <p className="text-xs font-cinzel text-cyan uppercase tracking-widest mb-1">Apply Today</p>
                    <p className="text-sm text-foreground/80">{devotional.application}</p>
                  </div>
                )}
                {devotional.prayer && (
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-cinzel text-purple uppercase tracking-widest mb-2">Prayer</p>
                    <p className="text-sm text-foreground/80 font-playfair italic leading-relaxed">{devotional.prayer}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
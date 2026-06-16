import { useState } from "react";
import { LayoutGrid, Shield, Heart, Zap, Star, Gem, Sprout } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/LanguageContext";
import DiscoverCategoryFilter from "@/components/discover/DiscoverCategoryFilter.jsx";
import DiscoverVerseCard from "@/components/discover/DiscoverVerseCard.jsx";
import DiscoverDevotionalPanel from "@/components/discover/DiscoverDevotionalPanel.jsx";

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

      <DiscoverCategoryFilter
        categories={CATEGORIES}
        activeCategory={category}
        onSelect={(id) => { setCategory(id); setDevotional(null); }}
      />

      {/* Verses Grid */}
      <div className="space-y-3 mb-8">
        <h3 className="text-xs font-cinzel tracking-widest text-muted-foreground uppercase">
          {CATEGORIES.find(c => c.id === category)?.label} {lang === "es" ? "Versículos" : "Verses"}
        </h3>
        {verses.map((v, i) => (
          <DiscoverVerseCard
            key={v.ref}
            verse={v}
            index={i}
            onGenerateDevotional={generateDevotional}
            devotionalLabel={t.devotional || "Devotional"}
            readLabel={t.readBtn}
          />
        ))}
      </div>

      <DiscoverDevotionalPanel
        loading={loadingDevo}
        devotional={devotional}
        selectedVerse={selectedVerse}
        onClose={() => setDevotional(null)}
      />
    </div>
  );
}
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/LanguageContext";
import { toEnglishBookName, DEFAULT_TRANSLATION_BY_LANG } from "@/lib/bibleData";

// Hoisted to module scope — these were previously rebuilt inside useEffect on
// every language change. They're pure constants, so allocate them once.
const THEME_PHOTOS = {
  hope:     "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1200&q=80",
  faith:    "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80",
  love:     "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1200&q=80",
  peace:    "https://images.unsplash.com/photo-1439405328-88d5d2a8f36d?w=1200&q=80",
  strength: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
  wisdom:   "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&q=80",
  grace:    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
  joy:      "https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=1200&q=80",
  courage:  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80",
  purpose:  "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=1200&q=80",
  default:  "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1200&q=80",
};
const FALLBACK_PHOTO_POOL = [
  "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1200&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
  "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=1200&q=80",
];
const BOOK_MAP = { "Psalm": "Psalms", "Song of Solomon": "Song of Solomon" };

const FALLBACK_VERSES = {
  en: [
    {
      verse_ref: "John 3:16", text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
      reflection: "God's love is not passive — it is sacrificial. Today, rest in the truth that you are loved completely.",
      theme: "love", photo: "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=1200&q=80",
    },
    {
      verse_ref: "Isaiah 40:31", text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary.",
      reflection: "Waiting on God is not passive resignation — it is active trust. He replenishes what life depletes.",
      theme: "strength", photo: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&q=80",
    },
    {
      verse_ref: "Jeremiah 29:11", text: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.",
      reflection: "God's plans for you are not afterthoughts. Before your crisis, He had already written your redemption.",
      theme: "hope", photo: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1200&q=80",
    },
  ],
  es: [
    {
      verse_ref: "Juan 3:16", text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
      reflection: "El amor de Dios no es pasivo — es sacrificial. Hoy, descansa en la verdad de que eres completamente amado.",
      theme: "amor", photo: "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=1200&q=80",
    },
    {
      verse_ref: "Isaías 40:31", text: "Pero los que esperan en el Señor renovarán sus fuerzas; levantarán alas como las águilas; correrán, y no se cansarán.",
      reflection: "Esperar en Dios no es resignación pasiva — es confianza activa. Él repone lo que la vida agota.",
      theme: "fortaleza", photo: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&q=80",
    },
    {
      verse_ref: "Jeremías 29:11", text: "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.",
      reflection: "Los planes de Dios para ti no son improvisados. Antes de tu crisis, Él ya había escrito tu redención.",
      theme: "esperanza", photo: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1200&q=80",
    },
  ],
};

export default function HeroVerseSlider() {
  const { t, lang } = useLang();
  const [slides, setSlides] = useState(FALLBACK_VERSES[lang] || FALLBACK_VERSES.en);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showReflection, setShowReflection] = useState(false);
  const autoRef = useRef(null);

  // Update slides when language changes
  useEffect(() => {
    const next = FALLBACK_VERSES[lang] || FALLBACK_VERSES.en;
    setSlides(next);
    setCurrent(0);
  }, [lang]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const cacheKey = `veritas_votd3_${today}_${lang}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      try {
        const slides = JSON.parse(cached);
        if (Array.isArray(slides) && slides.length > 0) {
          setSlides(slides);
          setLoading(false);
          return;
        }
      } catch {}
    }

    // Generate 3 unique daily verses from AI using the date as seed.
    // THEME_PHOTOS / FALLBACK_PHOTO_POOL are module constants (see top of file).
    const langLabel = lang === "es" ? "Spanish" : "English";
    base44.integrations.Core.InvokeLLM({
      prompt: `Today is ${today}. Generate exactly 3 different, meaningful Bible verses for a daily slider in ${langLabel}. 
IMPORTANT: Each verse MUST have a DIFFERENT theme — choose 3 DISTINCT themes from this list: hope, faith, love, peace, strength, wisdom, grace, joy, courage, purpose. Never repeat a theme.
Return JSON with array "verses" containing exactly 3 items, each with: ref, text (full verse text in ${langLabel}), reflection (1-2 sentences in ${langLabel}), theme (one of the listed words).
Use the date ${today} as a randomization seed for variety day-to-day.`,
      response_json_schema: {
        type: "object",
        properties: {
          verses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                ref: { type: "string" },
                text: { type: "string" },
                reflection: { type: "string" },
                theme: { type: "string" }
              }
            }
          }
        }
      }
    })
      .then(res => {
        const verses = res?.verses;
        if (Array.isArray(verses) && verses.length >= 3) {
          const usedPhotos = new Set();
          const built = verses.slice(0, 3).map((v, idx) => {
            let photo = THEME_PHOTOS[v.theme?.toLowerCase()];
            // Guarantee each slide has a unique photo
            if (!photo || usedPhotos.has(photo)) {
              photo = FALLBACK_PHOTO_POOL.find(p => !usedPhotos.has(p)) || FALLBACK_PHOTO_POOL[idx % FALLBACK_PHOTO_POOL.length];
            }
            usedPhotos.add(photo);
            return { verse_ref: v.ref, text: v.text, reflection: v.reflection, theme: v.theme, photo };
          });
          sessionStorage.setItem(cacheKey, JSON.stringify(built));
          setSlides(built);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lang]);

  useEffect(() => {
    autoRef.current = setInterval(() => setCurrent(c => (c + 1) % slides.length), 7000);
    return () => clearInterval(autoRef.current);
  }, [slides.length]);

  const go = (dir) => {
    clearInterval(autoRef.current);
    setCurrent(c => (c + dir + slides.length) % slides.length);
  };

  const verse = slides[current] || slides[0] || FALLBACK_VERSES.en[0];
  const readUrl = useMemo(() => {
    const ref = verse.verse_ref || "";
    const lastSpace = ref.lastIndexOf(" ");
    const rawBook = ref.substring(0, lastSpace);
    const chapterVerse = ref.substring(lastSpace + 1) || "1:1";
    const chapterNum = chapterVerse.split(":")[0];
    const verseNum = chapterVerse.split(":")[1];
    const bookName = toEnglishBookName(BOOK_MAP[rawBook] || rawBook);
    const translation = DEFAULT_TRANSLATION_BY_LANG[lang];
    return `/read?book=${encodeURIComponent(bookName)}&chapter=${chapterNum}${verseNum ? `&verse=${verseNum}` : ""}${translation ? `&translation=${translation}` : ""}`;
  }, [verse.verse_ref, lang]);

  return (
    <div className="relative rounded-3xl overflow-hidden" style={{ minHeight: 260 }}>
      {/* Background photo */}
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={verse.photo}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>
      {/* Gradient overlay */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(6,10,20,0.3) 0%, rgba(10,14,26,0.78) 60%, rgba(10,14,26,0.97) 100%)" }} />

      {/* Shimmer on load */}
      {loading && <div className="absolute inset-0 shimmer" />}

      {/* Content */}
      <div className="relative z-10 px-5 pt-5 pb-4">
        <p className="text-[10px] font-inter uppercase tracking-[0.22em] mb-4" style={{ color: "rgb(var(--ink) / 0.45)" }}>
          ✦ {t.verseOfTheDay}
        </p>

        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
            <p className="font-playfair italic leading-relaxed mb-3" style={{ fontSize: "clamp(15px, 3.8vw, 19px)", color: "rgb(var(--ink) / 0.92)" }}>
              "{verse.text}"
            </p>
            <p className="font-cinzel text-sm font-bold" style={{ color: "#fbbf24" }}>— {verse.verse_ref}</p>
          </motion.div>
        </AnimatePresence>

        {/* Reflection */}
        <AnimatePresence>
          {showReflection && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-3">
              <div className="rounded-xl p-3" style={{ background: "rgb(var(--ink) / 0.07)", border: "1px solid rgb(var(--ink) / 0.1)" }}>
                <p className="text-sm font-inter leading-relaxed" style={{ color: "rgb(var(--ink) / 0.75)" }}>{verse.reflection}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <button onClick={() => setShowReflection(v => !v)}
            className="text-xs px-3 py-1.5 rounded-xl font-inter transition-colors"
            style={{ background: "rgb(var(--ink) / 0.09)", color: "rgb(var(--ink) / 0.6)" }}>
            {showReflection ? t.hide : t.reflect}
          </button>
          <a href={readUrl}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-inter"
            style={{ background: "rgba(0,245,255,0.1)", color: "#00f5ff" }}>
            <BookOpen className="w-3 h-3" /> {t.read}
          </a>
          <button onClick={() => navigator.share?.({ text: `"${verse.text}" — ${verse.verse_ref}` }) || navigator.clipboard?.writeText(`"${verse.text}" — ${verse.verse_ref}`)}
            className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-inter"
            style={{ background: "rgb(var(--ink) / 0.06)", color: "rgb(var(--ink) / 0.4)" }}>
            <Share2 className="w-3 h-3" /> {t.share}
          </button>
        </div>
      </div>

      {/* Slider controls */}
      <button onClick={() => go(-1)} aria-label={t.previousVerse}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}>
        <ChevronLeft className="w-4 h-4 text-onimage/80" />
      </button>
      <button onClick={() => go(1)} aria-label={t.nextVerse}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}>
        <ChevronRight className="w-4 h-4 text-onimage/80" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {slides.map((_, i) => (
          <button key={i} onClick={() => { clearInterval(autoRef.current); setCurrent(i); }}
            className="rounded-full transition-all"
            style={{ width: i === current ? 16 : 6, height: 6, background: i === current ? "#fbbf24" : "rgb(var(--ink) / 0.3)" }} />
        ))}
      </div>
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/LanguageContext";

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
    const cacheKey = `veritas_votd_${today}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      try {
        const d = JSON.parse(cached);
        if (d?.text && lang === "en") {
          setSlides([
            { verse_ref: d.verse_ref || d.ref, text: d.text, reflection: d.reflection, theme: d.theme, photo: FALLBACK_VERSES.en[0].photo },
            ...FALLBACK_VERSES.en.slice(1),
          ]);
        }
      } catch {}
      setLoading(false);
      return;
    }

    base44.functions.invoke("getVerseOfTheDay", {})
      .then(res => {
        const d = res.data?.dailyVerse || res.data;
        if (d?.text && lang === "en") {
          sessionStorage.setItem(cacheKey, JSON.stringify(d));
          setSlides([
            { verse_ref: d.verse_ref || d.ref, text: d.text, reflection: d.reflection, theme: d.theme, photo: FALLBACK_VERSES.en[0].photo },
            ...FALLBACK_VERSES.en.slice(1),
          ]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    autoRef.current = setInterval(() => setCurrent(c => (c + 1) % slides.length), 7000);
    return () => clearInterval(autoRef.current);
  }, [slides.length]);

  const go = (dir) => {
    clearInterval(autoRef.current);
    setCurrent(c => (c + dir + slides.length) % slides.length);
  };

  const verse = slides[current] || slides[0] || FALLBACK_VERSES.en[0];
  const ref = verse.verse_ref || "";
  const lastSpace = ref.lastIndexOf(" ");
  const rawBook = ref.substring(0, lastSpace);
  const chapterVerse = ref.substring(lastSpace + 1) || "1:1";
  const chapterNum = chapterVerse.split(":")[0];
  const verseNum = chapterVerse.split(":")[1];
  const BOOK_MAP = { "Psalm": "Psalms", "Song of Solomon": "Song of Solomon" };
  const bookName = BOOK_MAP[rawBook] || rawBook;
  const readUrl = `/read?book=${encodeURIComponent(bookName)}&chapter=${chapterNum}${verseNum ? `&verse=${verseNum}` : ""}`;

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
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(6,10,20,0.3) 0%, rgba(6,10,20,0.82) 60%, rgba(6,10,20,0.97) 100%)" }} />

      {/* Shimmer on load */}
      {loading && <div className="absolute inset-0 shimmer" />}

      {/* Content */}
      <div className="relative z-10 px-5 pt-5 pb-4">
        <p className="text-[10px] font-inter uppercase tracking-[0.22em] mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>
          ✦ {t.verseOfTheDay}
        </p>

        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
            <p className="font-playfair italic leading-relaxed mb-3" style={{ fontSize: "clamp(15px, 3.8vw, 19px)", color: "rgba(255,255,255,0.92)" }}>
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
              <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <p className="text-sm font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>{verse.reflection}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <button onClick={() => setShowReflection(v => !v)}
            className="text-xs px-3 py-1.5 rounded-xl font-inter transition-colors"
            style={{ background: "rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.6)" }}>
            {showReflection ? t.hide : t.reflect}
          </button>
          <a href={readUrl}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-inter"
            style={{ background: "rgba(0,245,255,0.1)", color: "#00f5ff" }}>
            <BookOpen className="w-3 h-3" /> {t.read}
          </a>
          <button onClick={() => navigator.share?.({ text: `"${verse.text}" — ${verse.verse_ref}` }) || navigator.clipboard?.writeText(`"${verse.text}" — ${verse.verse_ref}`)}
            className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-inter"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
            <Share2 className="w-3 h-3" /> {t.share}
          </button>
        </div>
      </div>

      {/* Slider controls */}
      <button onClick={() => go(-1)} aria-label="Previous verse"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}>
        <ChevronLeft className="w-4 h-4 text-white/60" />
      </button>
      <button onClick={() => go(1)} aria-label="Next verse"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}>
        <ChevronRight className="w-4 h-4 text-white/60" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {slides.map((_, i) => (
          <button key={i} onClick={() => { clearInterval(autoRef.current); setCurrent(i); }}
            className="rounded-full transition-all"
            style={{ width: i === current ? 16 : 6, height: 6, background: i === current ? "#fbbf24" : "rgba(255,255,255,0.3)" }} />
        ))}
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, Loader2, X } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import { getTranslationLang, translateVerseRef } from "@/lib/bibleData";
import { generateMoodDevotional } from "@/lib/reflectionGenerator";

const MOOD_CONTEXT = {
  seeking: "seeking direction and clarity from God",
  struggling: "struggling and in need of strength and comfort",
  grateful: "full of gratitude and wanting to worship",
  questioning: "wrestling with honest questions about faith",
};

const FALLBACK = {
  en: {
    seeking: { title: "Daily Reflection", reflection: "This verse invites you to slow down and listen for the Father's steady guidance. Even when the next step is not fully visible, Scripture teaches us to walk by trust rather than pressure.", insights: ["God meets sincere seeking with wisdom.", "A single verse can become a doorway into prayerful clarity."], application: "Choose one quiet act of obedience today, even if it feels small.", prayer: "Father, guide my heart toward Your truth and give me courage to follow the light You provide today. Amen." },
    struggling: { title: "Strength for Today", reflection: "This verse can hold you when your own strength feels thin. God does not ask you to pretend; He invites you to bring your weariness into His presence and receive mercy for this moment.", insights: ["Struggle is not failure; it can become a place of deeper dependence.", "God's nearness is not measured by your feelings."], application: "Name one burden honestly before God, then take the next faithful step.", prayer: "Father, meet me in weakness and steady me with Your peace. Amen." },
    grateful: { title: "A Grateful Heart", reflection: "This verse gives language to worship. Gratitude trains the heart to notice God's faithfulness, not only in dramatic answers but also in daily mercies that quietly sustain us.", insights: ["Thankfulness keeps the soul attentive.", "Remembering grace strengthens future trust."], application: "Write down one specific mercy and share encouragement with someone today.", prayer: "Father, receive my thanks and make my gratitude generous. Amen." },
    questioning: { title: "Faithful Questions", reflection: "This verse welcomes honest attention. Questions do not have to move you away from faith; brought humbly, they can draw you closer to God's wisdom and the depth of Scripture.", insights: ["Faith can bring questions into prayer instead of hiding them.", "Understanding often grows through patient attention."], application: "Turn your biggest question into a prayer, then reread the verse slowly.", prayer: "Father, give me humility, patience, and understanding as I seek Your truth. Amen." },
  },
  es: {
    seeking: { title: "Reflexión Diaria", reflection: "Este versículo te invita a detenerte y recibir la guía constante del Padre. Aun cuando el siguiente paso no sea visible, las Escrituras nos enseñan a caminar con confianza y no con presión.", insights: ["Dios responde al corazón que le busca con sinceridad.", "Un solo versículo puede abrir una conversación profunda en oración."], application: "Elige hoy un pequeño acto de obediencia, aunque parezca pequeño.", prayer: "Padre, guía mi corazón hacia Tu verdad y dame valor para seguir la luz que me das hoy. Amén." },
    struggling: { title: "Fortaleza para Hoy", reflection: "Este versículo puede sostenerte cuando tus fuerzas se agotan. Dios no te pide aparentar; te invita a traer tu cansancio a Su presencia y recibir misericordia para este momento.", insights: ["La lucha no es fracaso; puede volverse un lugar de mayor dependencia.", "La cercanía de Dios no se mide por tus sentimientos."], application: "Nombra con honestidad una carga delante de Dios y da el siguiente paso de fe.", prayer: "Padre, encuéntrame en mi debilidad y sostenme con Tu paz. Amén." },
    grateful: { title: "Un Corazón Agradecido", reflection: "Este versículo da lenguaje a la adoración. La gratitud entrena el corazón para notar la fidelidad de Dios, no solo en respuestas grandes sino en las misericordias diarias que nos sostienen.", insights: ["La gratitud mantiene el alma atenta.", "Recordar la gracia fortalece la confianza futura."], application: "Escribe una misericordia específica y comparte ánimo con alguien hoy.", prayer: "Padre, recibe mi gratitud y hazla generosa. Amén." },
    questioning: { title: "Preguntas de Fe", reflection: "Este versículo recibe tu atención honesta. Las preguntas no tienen que alejarte de la fe; presentadas con humildad, pueden acercarte a la sabiduría de Dios y a la profundidad de las Escrituras.", insights: ["La fe puede llevar las preguntas a la oración en vez de esconderlas.", "El entendimiento crece con la atención paciente."], application: "Convierte tu mayor pregunta en una oración y vuelve a leer el versículo despacio.", prayer: "Padre, dame humildad, paciencia y entendimiento mientras busco Tu verdad. Amén." },
  },
};

export default function DevotionalPanel({ book, chapter, verseRef, verseText, translation, onClose }) {
  const { lang } = useLang();
  const reduceMotion = useReducedMotion();
  const [devotional, setDevotional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userMood, setUserMood] = useState("seeking");
  const [debugError, setDebugError] = useState(null); // TEMP: surfaces the real failure on screen

  const isEs = lang === "es";
  // The verse reference follows the CONTENT translation language, not the UI language.
  const contentLang = getTranslationLang(translation);
  const displayRef = translateVerseRef(verseRef, contentLang);

  const moods = isEs ? [
    { id: "seeking", label: "Buscando", emoji: "🔍" },
    { id: "struggling", label: "Luchando", emoji: "💔" },
    { id: "grateful", label: "Agradecido", emoji: "🙏" },
    { id: "questioning", label: "Cuestionando", emoji: "❓" },
  ] : [
    { id: "seeking", label: "Seeking", emoji: "🔍" },
    { id: "struggling", label: "Struggling", emoji: "💔" },
    { id: "grateful", label: "Grateful", emoji: "🙏" },
    { id: "questioning", label: "Questioning", emoji: "❓" },
  ];

  useEffect(() => {
    generateDevotional();
  }, [verseRef, verseText, userMood, lang]);

  const generateDevotional = async () => {
    setLoading(true);
    setDebugError(null);
    try {
      // SAME shared generator Guided Reflection uses (src/lib/reflectionGenerator.js).
      // Only difference: the selected mood is woven into the prompt.
      const result = await generateMoodDevotional({
        verseRef: displayRef,
        verseText,
        translation,
        moodContext: MOOD_CONTEXT[userMood] || userMood,
        isEs,
      });
      setDevotional(result);
    } catch (err) {
      console.error("DevotionalPanel generation failed:", err);
      // Graceful static templated fallback — never a bare error string.
      setDevotional(FALLBACK[isEs ? "es" : "en"][userMood]);
      // TEMP debug: show the true error so the next live test reveals the real cause.
      setDebugError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={reduceMotion ? false : { x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { x: 400, opacity: 0 }}
      transition={reduceMotion ? { duration: 0.01 } : { type: "spring", stiffness: 300, damping: 28 }}
      className="fixed right-0 top-0 bottom-0 z-40 w-full md:w-96"
      style={{ background: "rgba(6,10,20,0.98)", backdropFilter: "blur(20px)", borderLeft: "1px solid rgba(0,245,255,0.15)" }}
      role="dialog"
      aria-label={isEs ? "Devocional Diario" : "Daily Devotional"}
    >
      {/* Header */}
      <div className="sticky top-0 px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: "#a78bfa" }} />
          <h2 className="font-cinzel text-sm font-semibold text-white">{isEs ? "Devocional Diario" : "Daily Devotional"}</h2>
        </div>
        <button onClick={onClose} aria-label={isEs ? "Cerrar" : "Close"}
          className="min-w-11 min-h-11 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center">
          <X className="w-4 h-4 text-white/40" />
        </button>
      </div>

      {/* Mood selector */}
      <div className="px-5 py-4 space-y-2 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="text-[10px] font-cinzel uppercase tracking-widest text-white/35">{isEs ? "¿Cómo te sientes?" : "How are you feeling?"}</p>
        <div className="flex gap-1.5 flex-wrap">
          {moods.map(m => (
            <button
              key={m.id}
              onClick={() => setUserMood(m.id)}
              aria-pressed={userMood === m.id}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-inter transition-all min-h-11"
              style={{
                background: userMood === m.id ? "rgba(167,139,250,0.12)" : "rgba(255,255,255,0.04)",
                border: userMood === m.id ? "1px solid rgba(167,139,250,0.25)" : "1px solid transparent",
                color: userMood === m.id ? "#a78bfa" : "rgba(255,255,255,0.4)",
              }}
            >
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Devotional content */}
      <div className="px-5 py-6 space-y-4 overflow-y-auto scrollbar-hide" style={{ height: "calc(100vh - 180px)" }} aria-live="polite">
        {/* Verse reference — follows the content translation language */}
        <div className="rounded-xl p-3" style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)" }}>
          <p className="font-cinzel text-xs font-semibold mb-2" style={{ color: "#a78bfa" }}>
            {displayRef}
          </p>
          <p className="text-sm font-playfair italic leading-relaxed text-white/75">
            "{verseText}"
          </p>
        </div>

        {loading ? (
          <div className="py-10 space-y-3" style={{ minHeight: "180px" }}>
            <div className="flex items-center justify-center gap-2 text-xs font-cinzel" style={{ color: "#a78bfa" }}>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isEs ? "Generando tu reflexión…" : "Generating your reflection…"}
            </div>
            <div className="h-3 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.07)", width: "95%" }} />
            <div className="h-3 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.05)", width: "80%" }} />
            <div className="h-3 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.05)", width: "65%" }} />
          </div>
        ) : devotional && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.3 }}
            className="space-y-4"
            style={{ minHeight: "180px" }}
          >
            {devotional.title && <h3 className="font-cinzel text-sm font-semibold text-white">{devotional.title}</h3>}
            <p className="text-sm font-inter leading-relaxed text-white/70">{devotional.reflection}</p>

            {Array.isArray(devotional.insights) && devotional.insights.length > 0 && (
              <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {isEs ? "Ideas Clave" : "Key Insights"}
                </p>
                <ul className="space-y-1.5">
                  {devotional.insights.map((item, idx) => (
                    <li key={idx} className="text-xs font-inter leading-relaxed text-white/60">• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {devotional.application && (
              <p className="text-sm font-inter leading-relaxed text-white/70">
                <span className="font-cinzel text-xs" style={{ color: "#00f5ff" }}>{isEs ? "Aplicar Hoy:" : "Apply Today:"}</span> {devotional.application}
              </p>
            )}
            {devotional.prayer && (
              <p className="text-sm font-playfair italic leading-relaxed text-white/70">
                <span className="font-cinzel text-xs not-italic" style={{ color: "#fbbf24" }}>{isEs ? "Oración:" : "Prayer:"}</span> {devotional.prayer}
              </p>
            )}

            {/* TEMP debug line — remove after the mood panel is confirmed working live */}
            {debugError && (
              <p className="text-[10px] font-mono break-words" style={{ color: "rgba(255,255,255,0.25)" }}>
                debug: {debugError}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
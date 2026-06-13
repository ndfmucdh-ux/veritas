import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, ChevronLeft, Sparkles, Loader2, BookOpen, Heart, Globe, CalendarDays, List, Plus, Trash2, Target, Check, LayoutGrid, Shield, Flower2, Zap, Star, Gem, Sprout } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import PlanTimeline from "@/components/plans/PlanTimeline";
import ReadingCalendar from "@/components/plans/ReadingCalendar";
import CustomPlanBuilder from "@/components/plans/CustomPlanBuilder";
import ReadingStatsChart from "@/components/plans/ReadingStatsChart";
import { base44 } from "@/api/base44Client";
import PlanInvitePanel from "@/components/plans/PlanInvitePanel";

// Real-life Unsplash photo headers per plan
const PRESET_PLANS = [
  {
    title: "New Believer Foundation",
    titleEs: null,
    description: "A 30-day journey through the essentials of Christian faith",
    duration_days: 30,
    category: "new_believer",
    lang: "en",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    accent: "#00f5ff",
    days: [
      { day: 1, title: "Who Is God?", verses: ["John 1:1-14"], devotional: "In the beginning was the Word, and the Word was with God, and the Word was God. From eternity past, God has existed — not as a concept or distant force, but as a living, loving Person. Today, sit with the mystery of God's eternal nature. He is the uncreated Creator, the unmoved Mover. Everything that exists flows from Him. Take time to simply acknowledge: there is a God, and He is unlike anything else.", prayer: "Father, open my eyes to who You truly are. I come to You with curiosity and humility. Teach me Your nature. Amen." },
      { day: 2, title: "God's Love for You", verses: ["John 3:16-17", "Romans 5:8"], devotional: "Before you did a single thing to deserve it, God loved you. While you were still in your sin, still running, still broken — Christ died for you. This is not performance-based love. This is not love that waits for you to clean yourself up. God's love is radical, costly, and completely unconditional. You don't earn it. You simply receive it.", prayer: "Lord, help me receive Your love today. Not earn it — just receive it. Let it change how I see myself. Amen." },
      { day: 3, title: "The Gift of Salvation", verses: ["Ephesians 2:8-9", "Romans 10:9-10"], devotional: "Salvation cannot be earned through good deeds, religious rituals, or personal effort. It is a gift — offered freely, received by faith. The Greek word for grace is 'charis' — unmerited favor. God gives what we could never buy. Today, if you've never done so, simply say yes to the greatest gift ever offered.", prayer: "Jesus, I believe You died for me and rose again. I receive You as Lord and Savior of my life. Thank You. Amen." },
    ]
  },
  {
    title: "Psalms of David",
    description: "Journey through the heart of worship in 30 days",
    duration_days: 30,
    category: "general",
    lang: "en",
    photo: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80",
    accent: "#FFD700",
    days: [
      { day: 1, title: "The Blessed Life", verses: ["Psalm 1"], devotional: "The first Psalm sets the tone for the entire Psalter — and for your life. Blessing is not found in the applause of crowds or the accumulation of wealth. It is found in delight. When you delight in God's Word, meditating on it day and night, you become like a tree planted by streams of water. You don't strive for fruit — you simply stay connected to the source.", prayer: "Lord, let Your Word be my delight, not my duty. Plant me deep beside Your living water. Amen." },
      { day: 2, title: "The Lord My Shepherd", verses: ["Psalm 23"], devotional: "David, who was himself a shepherd, describes God as his own shepherd. Every image is intimate: green pastures, still waters, the valley of the shadow of death — and the shepherd right there. Notice the shift from 'He' to 'You' in verse 4. In the dark valley, the relationship becomes personal. You are never alone.", prayer: "Good Shepherd, walk with me through every valley. I trust You. You are enough. Amen." },
      { day: 3, title: "Crying Out to God", verses: ["Psalm 22:1-11"], devotional: "This Psalm opens with the very words Jesus cried from the cross: 'My God, my God, why have you forsaken me?' David — and ultimately Jesus — shows us that it's okay to bring our desperate questions to God. Authentic faith doesn't pretend. It cries. And even in the cry, there is trust: 'Yet you are holy.' Bring God your honest pain today.", prayer: "God, I bring You what I've been hiding. Hear my cry. I trust You even when I don't understand. Amen." },
    ]
  },
  {
    title: "Warrior Men",
    description: "30 days of strength, integrity, and godly manhood",
    duration_days: 30,
    category: "men",
    lang: "en",
    photo: "https://images.unsplash.com/photo-1445307806294-bff7f67ff225?w=800&q=80",
    accent: "#60a5fa",
    days: [
      { day: 1, title: "Be Strong & Courageous", verses: ["Joshua 1:1-9"], devotional: "Four times God tells Joshua: be strong and courageous. Why repeat it? Because courage doesn't come naturally — especially when you're following a giant like Moses. But notice the source of Joshua's strength: 'The LORD your God will be with you wherever you go.' True godly courage is not self-generated bravado. It is a settled trust in the presence of God. You are not fearless — you are fear-filled but God-accompanied.", prayer: "Lord, give me the kind of courage that comes from knowing You are with me. I step forward today. Amen." },
      { day: 2, title: "The Heart of a Leader", verses: ["1 Samuel 16:1-13"], devotional: "When Samuel came to anoint a new king, he nearly chose Eliab — tall, impressive, exactly what a king looks like. But God said no: 'Man looks at the outward appearance, but the LORD looks at the heart.' David was overlooked by everyone — including his own father. Yet his heart was the qualification. What does your hidden heart look like when no one is watching?", prayer: "Father, purify my heart. Help me care more about who I am in secret than who I appear to be in public. Amen." },
    ]
  },
  {
    title: "Proverbs 31 Woman",
    description: "A 31-day devotional journey through noble womanhood",
    duration_days: 31,
    category: "women",
    lang: "en",
    photo: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    accent: "#f472b6",
    days: [
      { day: 1, title: "A Noble Character", verses: ["Proverbs 31:10-12"], devotional: "The Hebrew word translated 'noble' or 'virtuous' is 'chayil' — a word used to describe mighty warriors. The Proverbs 31 woman is not a fragile, domestic caricature. She is a force. She is clothed with strength. Her value is not found in her appearance, her achievements, or her social standing — it is found in her character, which her husband trusts completely. Today, ask God what 'chayil' looks like in your own life.", prayer: "Lord, build noble character in me. Let my strength come from You, not from striving. Amen." },
    ]
  },
  {
    title: "Youth Identity",
    description: "Who am I? 21 days discovering your identity in Christ",
    duration_days: 21,
    category: "youth",
    lang: "en",
    photo: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
    accent: "#f97316",
    days: [
      { day: 1, title: "Made in His Image", verses: ["Genesis 1:26-27", "Psalm 139:13-14"], devotional: "You are not an accident. You are not a random collection of atoms. You were deliberately crafted by the God who spoke galaxies into existence — and He made you in His image. That means you reflect something of God that no one else in history has ever reflected. There has never been — and will never be — another you. That's not pride. That's theology.", prayer: "God, I receive the truth that I am fearfully and wonderfully made. Help me live from that truth today. Amen." },
    ]
  },

  // ── Spanish Plans ─────────────────────────────────────────────
  {
    title: "Fundamentos de la Fe",
    description: "30 días descubriendo los pilares de la vida cristiana",
    duration_days: 30,
    category: "new_believer",
    lang: "es",
    photo: "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=800&q=80",
    accent: "#34d399",
    days: [
      { day: 1, title: "¿Quién Es Dios?", verses: ["Juan 1:1-14"], devotional: "En el principio era el Verbo, y el Verbo era con Dios, y el Verbo era Dios. Desde la eternidad, Dios ha existido — no como un concepto lejano, sino como una Persona viva y amorosa. Hoy, dedica tiempo a contemplar la naturaleza eterna de Dios. Él es el Creador increado, todo fluye de Él. Tómate un momento para simplemente reconocer: hay un Dios, y Él es incomparable.", prayer: "Padre, abre mis ojos para conocerte como realmente eres. Vengo a ti con humildad y curiosidad. Enséñame Tu naturaleza. Amén." },
      { day: 2, title: "El Amor de Dios por Ti", verses: ["Juan 3:16", "Romanos 5:8"], devotional: "Antes de que hicieras una sola cosa para merecerlo, Dios ya te amaba. Mientras aún estabas en tu pecado, mientras aún huías, mientras aún estabas roto — Cristo murió por ti. Este no es un amor basado en el rendimiento. Dios no espera que te limpies antes de amarte. Su amor es radical, costoso y completamente incondicional. No te lo ganas. Simplemente lo recibes.", prayer: "Señor, ayúdame a recibir Tu amor hoy. No a ganarlo — solo a recibirlo. Que cambie la forma en que me veo. Amén." },
      { day: 3, title: "La Gracia Salvadora", verses: ["Efesios 2:8-9", "Romanos 10:9-10"], devotional: "La salvación no se gana mediante buenas obras, rituales religiosos ni esfuerzo personal. Es un regalo — ofrecido libremente, recibido por fe. La palabra griega para gracia es 'charis' — favor inmerecido. Dios da lo que nunca podríamos comprar. Hoy, si nunca lo has hecho, simplemente di sí al regalo más grande jamás ofrecido.", prayer: "Jesús, creo que moriste por mí y resucitaste. Te recibo como Señor y Salvador de mi vida. Gracias. Amén." },
    ]
  },
  {
    title: "Varón de Dios",
    description: "30 días de fortaleza, integridad y hombría piadosa",
    duration_days: 30,
    category: "men",
    lang: "es",
    photo: "https://images.unsplash.com/photo-1509909756405-be0199881695?w=800&q=80",
    accent: "#818cf8",
    days: [
      { day: 1, title: "Sé Fuerte y Valiente", verses: ["Josué 1:1-9"], devotional: "Cuatro veces Dios le dice a Josué: sé fuerte y valiente. ¿Por qué repetirlo? Porque el coraje no surge naturalmente — especialmente cuando sigues los pasos de un gigante como Moisés. Pero nota la fuente de la fortaleza de Josué: 'El SEÑOR tu Dios estará contigo dondequiera que vayas.' El verdadero valor piadoso no es valentía autogenerada. Es una confianza firme en la presencia de Dios.", prayer: "Señor, dame el tipo de valentía que viene de saber que estás conmigo. Doy el paso hoy. Amén." },
    ]
  },
  {
    title: "Mujer de Virtud",
    description: "31 días descubriendo la belleza y fuerza de la mujer piadosa",
    duration_days: 31,
    category: "women",
    lang: "es",
    photo: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=800&q=80",
    accent: "#f472b6",
    days: [
      { day: 1, title: "Una Mujer Noble", verses: ["Proverbios 31:10-12"], devotional: "La palabra hebrea traducida como 'noble' o 'virtuosa' es 'chayil' — una palabra usada para describir a guerreros poderosos. La mujer de Proverbios 31 no es una caricatura frágil y doméstica. Ella es una fuerza. Está vestida de fortaleza. Su valor no se encuentra en su apariencia ni sus logros — está en su carácter, en el que su esposo confía completamente.", prayer: "Señor, construye en mí un carácter noble. Que mi fortaleza venga de Ti, no del esfuerzo propio. Amén." },
    ]
  },
  {
    title: "Jóvenes en Cristo",
    description: "21 días descubriendo tu identidad en Cristo",
    duration_days: 21,
    category: "youth",
    lang: "es",
    photo: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
    accent: "#fb923c",
    days: [
      { day: 1, title: "Creado a Su Imagen", verses: ["Génesis 1:26-27", "Salmo 139:13-14"], devotional: "No eres un accidente. No eres una colección aleatoria de átomos. Fuiste deliberadamente creado por el Dios que habló galaxias a la existencia — y te hizo a Su imagen. Eso significa que reflejas algo de Dios que nadie más en la historia ha reflejado jamás. Nunca ha habido — y nunca habrá — otro tú. Eso no es orgullo. Es teología.", prayer: "Dios, recibo la verdad de que fui hecho de manera maravillosa. Ayúdame a vivir desde esa verdad hoy. Amén." },
    ]
  },
  {
    title: "Matrimonio Sagrado",
    description: "30 días fortaleciendo tu matrimonio con la Palabra de Dios",
    duration_days: 30,
    category: "marriage",
    lang: "es",
    photo: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=80",
    accent: "#f43f5e",
    days: [
      { day: 1, title: "El Diseño Original", verses: ["Génesis 2:18-25"], devotional: "Antes de que existiera el pecado, Dios instituyó el matrimonio. Lo llamó 'muy bueno.' El diseño original no era de control o subordinación, sino de unidad profunda — 'una sola carne.' Dos personas distintas que, juntas, reflejan algo del carácter de Dios que ninguno puede reflejar solo. Hoy, recuerda por qué empezaste. Vuelve al diseño original.", prayer: "Señor, restaura en nuestro matrimonio el diseño que Tú tuviste desde el principio. Que seamos uno. Amén." },
    ]
  },
];

const LANG_FILTER = ["all", "en", "es"];

export default function Plans() {
  const { t, lang } = useLang();
  const urlParams = new URLSearchParams(window.location.search);
  const urlCat = urlParams.get("cat") || "all";

  const [activePlan, setActivePlan] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [progress, setProgress] = useState([]);
  const [langFilter, setLangFilter] = useState("all");
  const [catFilter, setCatFilter] = useState(urlCat);
  const [genLoading, setGenLoading] = useState(false);
  const [genDevo, setGenDevo] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [customPlans, setCustomPlans] = useState([]);
  const [activeCustomPlan, setActiveCustomPlan] = useState(null);

  useEffect(() => {
    // Load all reading progress (plans + regular chapters) for the calendar
    Promise.all([
      base44.entities.ReadingProgress.list("-created_date", 500).catch(() => []),
      base44.entities.CustomPlan.list("-created_date", 20).catch(() => []),
    ]).then(([p, cp]) => {
      setProgress(p || []);
      setCustomPlans(cp || []);
    });
  }, []);

  const getCompletedDays = (planTitle) => progress.filter(p => p.plan_id === planTitle).length;
  const isDayComplete = (planTitle, day) => progress.some(p => p.plan_id === planTitle && p.chapter === day);

  const completeDay = async (planTitle, day) => {
    if (isDayComplete(planTitle, day)) return;
    await base44.entities.ReadingProgress.create({
      plan_id: planTitle, book: "Plan", chapter: day, translation: "KJV", completed_at: new Date().toISOString()
    }).catch(() => {});
    base44.functions.invoke("updateXP", { action: "COMPLETE_PLAN_DAY", xp_amount: 25 }).catch(() => {});
    setProgress(prev => [...prev, { plan_id: planTitle, chapter: day }]);
  };

  const generateAIDevo = async (day) => {
    if (!day.verses?.[0]) return;
    setGenLoading(true);
    setGenDevo(null);
    try {
      const res = await base44.functions.invoke("generateDevotional", {
        verse_ref: day.verses[0], category: activePlan.category
      });
      setGenDevo(res.data?.devotional || null);
    } finally {
      setGenLoading(false);
    }
  };

  const filtered = PRESET_PLANS.filter(p =>
    (langFilter === "all" || p.lang === langFilter) &&
    (catFilter === "all" || p.category === catFilter)
  );

  const toggleCustomChapter = async (plan, bookName, ch) => {
    const key = `${bookName}:${ch}`;
    const completed = new Set(plan.completed_chapters || []);
    if (completed.has(key)) completed.delete(key);
    else completed.add(key);
    const updatedArr = [...completed];
    await base44.entities.CustomPlan.update(plan.id, { completed_chapters: updatedArr });
    const updated = { ...plan, completed_chapters: updatedArr };
    setCustomPlans(prev => prev.map(p => p.id === plan.id ? updated : p));
    setActiveCustomPlan(updated);
  };

  const deleteCustomPlan = async (id) => {
    await base44.entities.CustomPlan.delete(id);
    setCustomPlans(prev => prev.filter(p => p.id !== id));
  };

  // ── Custom Plan Detail View ────────────────────────────────────
  if (activeCustomPlan) {
    const plan = activeCustomPlan;
    const totalCh = plan.total_chapters || 0;
    const doneCh = (plan.completed_chapters || []).length;
    const pct = totalCh > 0 ? Math.round((doneCh / totalCh) * 100) : 0;
    const daysLeft = plan.target_date
      ? Math.ceil((new Date(plan.target_date) - new Date()) / (1000 * 60 * 60 * 24))
      : null;
    const accent = plan.accent_color || "#00f5ff";
    const dailyGoal = parseInt(localStorage.getItem(`veritas_plan_daily_${plan.id}`) || localStorage.getItem(`veritas_plan_daily_${plan.title}`) || "1");
    const remainingCh = totalCh - doneCh;
    const daysToFinish = dailyGoal > 0 ? Math.ceil(remainingCh / dailyGoal) : null;

    return (
      <div className="md:ml-16 min-h-screen pb-28">
        <div className="px-4 pt-4 pb-3 flex items-center gap-3"
          style={{ background: "rgba(6,10,20,0.9)", position: "sticky", top: "57px", zIndex: 20, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={() => setActiveCustomPlan(null)}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xl">{plan.icon || "📖"}</span>
            <span className="font-cinzel text-sm font-semibold text-white truncate">{plan.title}</span>
          </div>
        </div>

        <div className="px-4 pt-5">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            {[
              { label: "Chapters", value: `${doneCh}/${totalCh}` },
              { label: "Progress", value: `${pct}%` },
              { label: "Daily Goal", value: `${dailyGoal}ch` },
              { label: daysLeft !== null ? (daysLeft > 0 ? "Deadline" : "Overdue") : "Est. Done", value: daysLeft !== null ? `${Math.abs(daysLeft)}d` : daysToFinish ? `${daysToFinish}d` : "—" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-3 text-center"
                style={{ background: `${accent}08`, border: `1px solid ${accent}20` }}>
                <p className="font-cinzel text-base font-bold" style={{ color: accent }}>{s.value}</p>
                <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full overflow-hidden mb-6" style={{ background: "rgba(255,255,255,0.07)" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }}
              className="h-full rounded-full" style={{ background: accent }} />
          </div>

          {/* Book + chapters */}
          <div className="space-y-3">
            {(plan.selections || []).map(sel => {
              const completedInBook = (plan.completed_chapters || []).filter(k => k.startsWith(`${sel.book}:`)).length;
              const allDone = completedInBook === sel.chapters.length;
              return (
                <div key={sel.book} className="rounded-2xl overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${allDone ? "rgba(52,211,153,0.25)" : "rgba(255,255,255,0.07)"}` }}>
                  <div className="flex items-center justify-between px-4 py-3">
                    <p className="font-cinzel text-sm font-semibold text-white">{sel.book}</p>
                    <span className="text-xs font-cinzel" style={{ color: allDone ? "#34d399" : accent }}>
                      {completedInBook}/{sel.chapters.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-4 pb-4">
                    {sel.chapters.map(ch => {
                      const done = (plan.completed_chapters || []).includes(`${sel.book}:${ch}`);
                      return (
                        <button key={ch} onClick={() => toggleCustomChapter(plan, sel.book, ch)}
                          className="w-9 h-9 rounded-xl font-cinzel text-xs font-semibold flex items-center justify-center transition-all"
                          style={{
                            background: done ? "rgba(52,211,153,0.15)" : `${accent}10`,
                            color: done ? "#34d399" : accent,
                            border: done ? "1px solid rgba(52,211,153,0.35)" : `1px solid ${accent}30`,
                          }}>
                          {done ? <Check className="w-3 h-3" /> : ch}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Plan Detail View ───────────────────────────────────────────
  if (activePlan) {
    const completed = getCompletedDays(activePlan.title);
    const pct = Math.round((completed / activePlan.duration_days) * 100);

    return (
      <div className="md:ml-16 min-h-screen pb-28">
        {/* Photo hero header */}
        <div className="relative h-56 md:h-72 overflow-hidden">
          <img src={activePlan.photo} alt={activePlan.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(8,12,24,0.85) 70%, rgb(8,12,24) 100%)" }} />
          <button
            onClick={() => { setActivePlan(null); setSelectedDay(null); setGenDevo(null); }}
            className="absolute top-4 left-4 flex items-center gap-1.5 text-white/80 hover:text-white text-sm px-3 py-1.5 rounded-xl transition-colors"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-inter uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ background: `${activePlan.accent}22`, color: activePlan.accent, border: `1px solid ${activePlan.accent}44` }}>
                {activePlan.lang === "es" ? "Español" : "English"} · {activePlan.duration_days} days
              </span>
            </div>
            <h1 className="font-cinzel text-2xl font-bold text-white leading-tight">{activePlan.title}</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>{activePlan.description}</p>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex gap-2 px-5 pt-4">
          <button onClick={() => setShowCalendar(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-cinzel"
            style={{ background: !showCalendar ? `${activePlan.accent}22` : "rgba(255,255,255,0.04)", color: !showCalendar ? activePlan.accent : "rgba(255,255,255,0.35)", border: !showCalendar ? `1px solid ${activePlan.accent}44` : "1px solid rgba(255,255,255,0.07)" }}>
            <List className="w-3.5 h-3.5" /> Timeline
          </button>
          <button onClick={() => setShowCalendar(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-cinzel"
            style={{ background: showCalendar ? `${activePlan.accent}22` : "rgba(255,255,255,0.04)", color: showCalendar ? activePlan.accent : "rgba(255,255,255,0.35)", border: showCalendar ? `1px solid ${activePlan.accent}44` : "1px solid rgba(255,255,255,0.07)" }}>
            <CalendarDays className="w-3.5 h-3.5" /> Calendar
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-5 pt-5 mb-6">
          <div className="flex justify-between text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
            <span>{completed} of {activePlan.duration_days} days complete</span>
            <span style={{ color: activePlan.accent }}>{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${activePlan.accent}, ${activePlan.accent}88)` }}
            />
          </div>
        </div>

        {/* Calendar or Timeline */}
        {showCalendar ? (
          <div className="px-5 mb-6">
            <ReadingCalendar progress={progress} accent={activePlan.accent} />
          </div>
        ) : (
          <PlanTimeline
            plan={activePlan}
            completedDays={completed}
            onSelectDay={setSelectedDay}
            selectedDay={selectedDay}
          />
        )}

        {/* Days expanded content */}
        <div className="px-4 space-y-3">
          {activePlan.days.map((day, i) => {
            const done = isDayComplete(activePlan.title, day.day);
            const open = selectedDay?.day === day.day;
            return (
              <motion.div key={day.day}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-2xl overflow-hidden transition-all"
                style={{
                  background: open ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
                  border: done ? `1px solid rgba(52,211,153,0.25)` : open ? `1px solid ${activePlan.accent}33` : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => setSelectedDay(open ? null : day)}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: done ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.06)" }}>
                    {done
                      ? <CheckCircle2 className="w-4 h-4" style={{ color: "#34d399" }} />
                      : <span className="text-xs font-cinzel font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>{day.day}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>Day {day.day}</p>
                    <p className="font-cinzel text-sm font-semibold text-white truncate">{day.title}</p>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {day.verses.map(v => (
                        <span key={v} className="text-[10px] px-2 py-0.5 rounded-full font-inter"
                          style={{ background: `${activePlan.accent}15`, color: activePlan.accent }}>
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 flex-shrink-0 transition-transform"
                    style={{ color: "rgba(255,255,255,0.25)", transform: open ? "rotate(90deg)" : "none" }} />
                </button>

                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-5 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                        {/* Devotional text */}
                        <div className="pt-4">
                          <p className="text-[10px] font-inter uppercase tracking-widest mb-3" style={{ color: activePlan.accent }}>
                            ✦ Devotional
                          </p>
                          <p className="text-sm font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                            {(genDevo && selectedDay?.day === day.day) ? genDevo.reflection : day.devotional}
                          </p>

                          {/* AI-generated expanded devo */}
                          {genDevo && selectedDay?.day === day.day && (
                            <div className="mt-4 space-y-3">
                              {genDevo.insights?.length > 0 && (
                                <div>
                                  <p className="text-[10px] font-inter uppercase tracking-widest mb-2" style={{ color: "#FFD700" }}>Key Insights</p>
                                  <ul className="space-y-1.5">
                                    {genDevo.insights.map((ins, i) => (
                                      <li key={i} className="text-sm flex gap-2" style={{ color: "rgba(255,255,255,0.6)" }}>
                                        <span style={{ color: "#FFD700" }}>·</span>{ins}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {genDevo.application && (
                                <div className="rounded-xl p-3" style={{ background: "rgba(0,245,255,0.06)", border: "1px solid rgba(0,245,255,0.15)" }}>
                                  <p className="text-[10px] font-inter uppercase tracking-widest mb-1" style={{ color: "#00f5ff" }}>Apply Today</p>
                                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{genDevo.application}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Prayer */}
                          {day.prayer && (
                            <div className="mt-4 rounded-xl p-4"
                              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                              <p className="text-[10px] font-inter uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>
                                🙏 Prayer
                              </p>
                              <p className="text-sm font-playfair italic leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                                {day.prayer}
                              </p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2 mt-4">
                            {!done && (
                              <motion.button whileTap={{ scale: 0.95 }}
                                onClick={(e) => { e.stopPropagation(); completeDay(activePlan.title, day.day); }}
                                className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl font-cinzel transition-colors"
                                style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}
                              >
                                <CheckCircle2 className="w-4 h-4" /> Mark Complete
                              </motion.button>
                            )}
                            <motion.button whileTap={{ scale: 0.95 }}
                              onClick={(e) => { e.stopPropagation(); generateAIDevo(day); }}
                              disabled={genLoading}
                              className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl font-cinzel transition-colors"
                              style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}
                            >
                              {genLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                              AI Devotional
                            </motion.button>
                            <a href={`/read?book=${encodeURIComponent(day.verses[0]?.split(' ').slice(0,-1).join(' ') || 'John')}&chapter=${day.verses[0]?.split(':')[0]?.split(' ').slice(-1)[0] || 1}`}
                              onClick={e => e.stopPropagation()}
                              className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl font-cinzel transition-colors"
                              style={{ background: "rgba(0,245,255,0.08)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.18)" }}>
                              <BookOpen className="w-4 h-4" /> Read
                            </a>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {activePlan.days.length < activePlan.duration_days && (
            <div className="rounded-2xl p-8 text-center" style={{ border: "1px dashed rgba(255,255,255,0.1)" }}>
              <Heart className="w-8 h-8 mx-auto mb-3" style={{ color: "rgba(255,255,255,0.2)" }} />
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                {activePlan.duration_days - activePlan.days.length} more days of scripture & devotions
              </p>
            </div>
          )}

          {/* Invite friends & progress comments */}
          <PlanInvitePanel
            planTitle={activePlan.title}
            planCategory={activePlan.category}
            accentColor={activePlan.accent}
          />
        </div>
      </div>
    );
  }

  // ── Plans List View ────────────────────────────────────────────
  return (
    <div className="md:ml-16 min-h-screen pb-28">
      {/* Header */}
      <div className="relative h-44 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80" alt="Reading Plans" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(8,12,24,0.95))" }} />
        <div className="absolute bottom-0 px-5 pb-5">
          <h1 className="font-cinzel text-2xl font-bold text-white">{t.readingPlansTitle}</h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{t.structuredJourneys}</p>
        </div>
      </div>

      {/* Language filter */}
      <div className="flex gap-2 px-4 pt-4 pb-2 overflow-x-auto scrollbar-hide">
        {[["all", "All", "🌍"], ["en", "English", "🇺🇸"], ["es", "Español", "🇲🇽"]].map(([v, l, flag]) => (
          <button key={v} onClick={() => setLangFilter(v)}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-inter transition-all"
            style={{
              background: langFilter === v ? "rgba(0,245,255,0.12)" : "rgba(255,255,255,0.04)",
              border: langFilter === v ? "1px solid rgba(0,245,255,0.3)" : "1px solid rgba(255,255,255,0.07)",
              color: langFilter === v ? "#00f5ff" : "rgba(255,255,255,0.45)",
            }}>
            <span>{flag}</span><span>{l}</span>
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
        {[
          ["all", "All", LayoutGrid],
          ["men", "Men", Shield],
          ["women", "Women", Flower2],
          ["youth", "Youth", Zap],
          ["kids", "Kids", Star],
          ["marriage", "Marriage", Gem],
          ["new_believer", "New Believer", Sprout],
          ["general", "General", BookOpen],
        ].map(([v, l, CatIcon]) => (
          <button key={v} onClick={() => setCatFilter(v)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-inter transition-all"
            style={{
              background: catFilter === v ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.04)",
              border: catFilter === v ? "1px solid rgba(251,191,36,0.3)" : "1px solid rgba(255,255,255,0.07)",
              color: catFilter === v ? "#fbbf24" : "rgba(255,255,255,0.4)",
            }}>
            <CatIcon className="w-3.5 h-3.5" /><span>{l}</span>
          </button>
        ))}
      </div>

      {/* Custom Plans */}
      <div className="px-4 pt-2 pb-1">
        <div className="flex items-center justify-between mb-3">
          <p className="font-cinzel text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{t.customPlans}</p>
          <button onClick={() => setShowBuilder(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-cinzel text-xs transition-all"
            style={{ background: "rgba(0,245,255,0.1)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.25)" }}>
            <Plus className="w-3.5 h-3.5" /> {t.buildPlan}
          </button>
        </div>

        {customPlans.length === 0 ? (
          <button onClick={() => setShowBuilder(true)}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-left transition-all mb-4"
            style={{ background: "rgba(0,245,255,0.04)", border: "1px dashed rgba(0,245,255,0.2)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.2)" }}>
              <Target className="w-5 h-5" style={{ color: "#00f5ff" }} />
            </div>
            <div>
              <p className="font-cinzel text-sm font-semibold text-white">Build Your Own Plan</p>
              <p className="text-xs font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Select books, chapters & a target date</p>
            </div>
          </button>
        ) : (
          <div className="space-y-2 mb-4">
            {customPlans.map((plan, i) => {
              const total = plan.total_chapters || 0;
              const done = (plan.completed_chapters || []).length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const accent = plan.accent_color || "#00f5ff";
              return (
                <motion.div key={plan.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer"
                  style={{ background: `${accent}08`, border: `1px solid ${accent}20` }}
                  onClick={() => setActiveCustomPlan(plan)}>
                  <span className="text-xl flex-shrink-0">{plan.icon || "📖"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-cinzel text-sm font-semibold text-white truncate">{plan.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: accent }} />
                      </div>
                      <span className="text-[10px] font-cinzel flex-shrink-0" style={{ color: accent }}>{pct}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={e => { e.stopPropagation(); deleteCustomPlan(plan.id); }}
                      className="p-1.5 rounded-lg" style={{ color: "rgba(255,255,255,0.25)" }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4" style={{ color: "rgba(255,255,255,0.25)" }} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reading Stats */}
      <div className="px-4 mb-6">
        <ReadingStatsChart />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 px-4 mb-3">
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
        <p className="text-[10px] font-cinzel uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>{t.curatedPlans}</p>
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
      </div>

      <AnimatePresence>
        {showBuilder && (
          <CustomPlanBuilder
            onClose={() => setShowBuilder(false)}
            onSaved={() => {
              base44.entities.CustomPlan.list("-created_date", 20).then(p => setCustomPlans(p || [])).catch(() => {});
            }}
          />
        )}
      </AnimatePresence>

      {/* Plan cards */}
      <div className="px-4 space-y-4 pt-2">
        {filtered.map((plan, i) => {
          const completed = getCompletedDays(plan.title);
          const pct = Math.round((completed / plan.duration_days) * 100);
          const started = completed > 0;

          return (
            <motion.div key={plan.title}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              onClick={() => setActivePlan(plan)}
              className="rounded-2xl overflow-hidden cursor-pointer"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {/* Photo */}
              <div className="relative h-36 overflow-hidden">
                <img src={plan.photo} alt={plan.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(8,12,24,0.95))" }} />
                <div className="absolute top-3 right-3 flex gap-2">
                  {plan.lang === "es" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-inter flex items-center gap-1"
                      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <Globe className="w-2.5 h-2.5" /> Español
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
                  <h3 className="font-cinzel text-base font-bold text-white leading-tight">{plan.title}</h3>
                </div>
              </div>

              {/* Meta */}
              <div className="px-4 py-3" style={{ background: "rgba(8,12,24,0.98)" }}>
                <p className="text-xs mb-3 leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{plan.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-inter capitalize"
                      style={{ background: `${plan.accent}15`, color: plan.accent, border: `1px solid ${plan.accent}30` }}>
                      {plan.category.replace("_", " ")}
                    </span>
                    <span className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.3)" }}>{plan.duration_days} days</span>
                    {started && <span className="text-[10px] font-inter" style={{ color: plan.accent }}>{pct}%</span>}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-cinzel" style={{ color: plan.accent }}>
                    Start <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
                {started && (
                  <div className="mt-2.5 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: plan.accent }} />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, ChevronLeft, Sparkles, Loader2, BookOpen, Heart, Globe, CalendarDays, List, Plus, Trash2, Target, Check, LayoutGrid, Shield, Flower2, Zap, Star, Gem, Sprout } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import PlansListView from "@/components/plans/PlansListView";
import PresetPlanDetail from "@/components/plans/PresetPlanDetail";
import CustomPlanDetail from "@/components/plans/CustomPlanDetail";
import ReadingCalendar from "@/components/plans/ReadingCalendar";
import CustomPlanBuilder from "@/components/plans/CustomPlanBuilder";
import ReadingStatsChart from "@/components/plans/ReadingStatsChart";
import { base44 } from "@/api/base44Client";
import PlanInvitePanel from "@/components/plans/PlanInvitePanel";
import PlanDownloadButton from "@/components/plans/PlanDownloadButton";
import usePlansData from "@/hooks/usePlansData";
import { useAccentTint } from "@/lib/accent";
import { useParams } from "react-router-dom";
import useSmoothNavigate from "@/hooks/useSmoothNavigate";
import useGoBack from "@/hooks/useGoBack";
import { usePullToRefresh } from "@/lib/pullRefresh";
import { LoadingState } from "@/components/ui/states";

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
  const tint = useAccentTint();
  const urlParams = new URLSearchParams(window.location.search);
  const urlCat = urlParams.get("cat") || "all";

  // The open plan lives in the URL (/plans/preset/:title, /plans/custom/:id) so back pops it.
  const { kind, planId } = useParams();
  const navigate = useSmoothNavigate();
  const goBack = useGoBack("/plans");
  const activePlan = kind === "preset" ? PRESET_PLANS.find((p) => p.title === planId) : null;
  const [selectedDay, setSelectedDay] = useState(null);
  const [langFilter, setLangFilter] = useState("all");
  const [catFilter, setCatFilter] = useState(urlCat);
  const [genLoading, setGenLoading] = useState(false);
  const [genDevo, setGenDevo] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const {
    progress,
    customPlans,
    loaded,
    loadPlansData,
    getCompletedDays,
    isDayComplete,
    completeDay,
    toggleCustomChapter,
    deleteCustomPlan,
  } = usePlansData();
  const activeCustomPlan = kind === "custom" ? customPlans.find((p) => p.id === planId) : null;
  usePullToRefresh(loadPlansData);


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

  const handleToggleCustomChapter = async (plan, bookName, ch) => {
    await toggleCustomChapter(plan, bookName, ch);
  };

  // ── Custom Plan Detail View ────────────────────────────────────
  if (activeCustomPlan) {
    return <CustomPlanDetail plan={activeCustomPlan} onBack={goBack} onToggleChapter={handleToggleCustomChapter} />;
  }
  if (kind === "custom" && !loaded) return <LoadingState size="lg" />;

  // ── Plan Detail View ───────────────────────────────────────────
  if (activePlan) {
    return (
      <PresetPlanDetail
        plan={activePlan}
        progress={progress}
        completed={getCompletedDays(activePlan.title)}
        isDayComplete={isDayComplete}
        completeDay={completeDay}
        onBack={goBack}
      />
    );
  }

  // ── Plans List View ────────────────────────────────────────────
  return (
    <>
      <PlansListView
        presets={PRESET_PLANS}
        customPlans={customPlans}
        getCompletedDays={getCompletedDays}
        onOpenPreset={(p) => navigate(`/plans/preset/${encodeURIComponent(p.title)}`)}
        onOpenCustom={(p) => navigate(`/plans/custom/${p.id}`)}
        onDeleteCustom={deleteCustomPlan}
        onBuild={() => setShowBuilder(true)}
      />
      <AnimatePresence>
        {showBuilder && <CustomPlanBuilder onClose={() => setShowBuilder(false)} onSaved={loadPlansData} />}
      </AnimatePresence>
    </>
  );
}
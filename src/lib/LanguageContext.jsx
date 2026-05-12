import { createContext, useContext, useState } from "react";

const T = {
  en: {
    home: "Home", read: "Read", readBtn: "Read", search: "Search", library: "Library",
    plans: "Plans", discover: "Discover", profile: "Profile", study: "Study",
    verseOfTheDay: "Verse of the Day", continueReading: "Continue Reading",
    goodMorning: "Good morning", goodAfternoon: "Good afternoon", goodEvening: "Good evening",
    reflect: "Reflect", share: "Share", startReading: "Start Reading",
    yourProgress: "Your Progress", quickAccess: "Quick Access",
    belovedVerses: "Beloved Verses", readingPlans: "Reading Plans",
    studyCenter: "Study Center", commentary: "Commentary", crossRefs: "Cross References",
    parallel: "Parallel", generate: "Generate Image", hide: "Hide",
    dayStreak: "Day Streak", totalXP: "Total XP", chapters: "Chapters",
    men: "For Men", women: "For Women", youth: "For Youth", kids: "For Kids",
    marriage: "Marriage", newBeliever: "New Believer",
    searchPlaceholder: "Search by topic, keyword, or verse…",
    languageLabel: "EN",
    slogan: "Know the Truth. Live the Truth.",
    forYou: "For You",
    allBooks: "All books",
    pickUp: "Pick up where you left off",
    verseArt: "Verse Art",
    // Featured verses in Spanish (used when lang=es)
    featuredVerses: null, // null = use default English ones
  },
  es: {
    home: "Inicio", read: "Leer", readBtn: "Leer", search: "Buscar", library: "Biblioteca",
    plans: "Planes", discover: "Descubrir", profile: "Perfil", study: "Estudio",
    verseOfTheDay: "Versículo del Día", continueReading: "Continuar Leyendo",
    goodMorning: "Buenos días", goodAfternoon: "Buenas tardes", goodEvening: "Buenas noches",
    reflect: "Reflexionar", share: "Compartir", startReading: "Comenzar a Leer",
    yourProgress: "Tu Progreso", quickAccess: "Acceso Rápido",
    belovedVerses: "Versículos Amados", readingPlans: "Planes de Lectura",
    studyCenter: "Centro de Estudio", commentary: "Comentario", crossRefs: "Referencias Cruzadas",
    parallel: "Paralelo", generate: "Generar Imagen", hide: "Ocultar",
    dayStreak: "Racha de Días", totalXP: "XP Total", chapters: "Capítulos",
    men: "Para Hombres", women: "Para Mujeres", youth: "Para Jóvenes", kids: "Para Niños",
    marriage: "Matrimonio", newBeliever: "Nuevo Creyente",
    searchPlaceholder: "Busca por tema, palabra clave o versículo…",
    languageLabel: "ES",
    slogan: "Conoce la Verdad. Vive la Verdad.",
    forYou: "Para Ti",
    allBooks: "Todos los libros",
    pickUp: "Continúa donde lo dejaste",
    verseArt: "Arte de Versículos",
    featuredVerses: [
      { ref: "Juan 3:16", text: "Porque de tal manera amó el Padre al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.", theme: "amor" },
      { ref: "Salmo 23:1", text: "El Señor es mi pastor; nada me faltará.", theme: "confianza" },
      { ref: "Filipenses 4:13", text: "Todo lo puedo en Cristo que me fortalece.", theme: "fortaleza" },
      { ref: "Proverbios 3:5-6", text: "Confía en el Señor con todo tu corazón, y no te apoyes en tu propia prudencia.", theme: "sabiduría" },
      { ref: "Romanos 8:28", text: "Y sabemos que a los que aman al Padre, todas las cosas les ayudan a bien.", theme: "esperanza" },
    ],
  },
};

const LangCtx = createContext({ lang: "en", t: T.en, setLang: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("veritas_lang") || "en");
  const changeLang = (l) => { setLang(l); localStorage.setItem("veritas_lang", l); };
  return <LangCtx.Provider value={{ lang, t: T[lang] || T.en, setLang: changeLang }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
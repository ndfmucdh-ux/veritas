import { createContext, useContext, useState } from "react";

const T = {
  en: {
    // Nav
    home: "Home", read: "Read", readBtn: "Read", search: "Search", library: "Library",
    plans: "Plans", discover: "Discover", profile: "Profile", study: "Study",
    prayer: "Prayer", community: "Community", studyCenter: "Study Center",
    // Home
    verseOfTheDay: "Verse of the Day", continueReading: "Continue Reading",
    goodMorning: "Good morning", goodAfternoon: "Good afternoon", goodEvening: "Good evening",
    reflect: "Reflect", share: "Share", startReading: "Start Reading",
    yourProgress: "Your Progress", quickAccess: "Quick Access",
    belovedVerses: "Beloved Verses", readingPlans: "Reading Plans",
    commentary: "Commentary", crossRefs: "Cross References",
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
    // Read page
    jumpToVerse: "Jump to Verse",
    selectChapter: "Select Chapter",
    selectTranslation: "Select Translation",
    // Plans
    readingGoal: "Reading Goal", dailyGoal: "Daily Goal",
    weeklyGoal: "Weekly Goal", completed: "Completed",
    // Library
    bookmarks: "Bookmarks", highlights: "Highlights", notes: "Notes",
    // Prayer
    prayerJournal: "Prayer Journal", newPrayer: "New Prayer",
    answered: "Answered", unanswered: "Unanswered",
    // Settings
    settings: "Settings", language: "Language", notifications: "Notifications",
    darkMode: "Dark Mode", fontSize: "Font Size",
    // General
    save: "Save", cancel: "Cancel", close: "Close", open: "Open", loading: "Loading…",
    noResults: "No results found",
    featuredVerses: null,
  },
  es: {
    // Nav
    home: "Inicio", read: "Leer", readBtn: "Leer", search: "Buscar", library: "Biblioteca",
    plans: "Planes", discover: "Descubrir", profile: "Perfil", study: "Estudio",
    prayer: "Oración", community: "Comunidad", studyCenter: "Centro de Estudio",
    // Home
    verseOfTheDay: "Versículo del Día", continueReading: "Continuar Leyendo",
    goodMorning: "Buenos días", goodAfternoon: "Buenas tardes", goodEvening: "Buenas noches",
    reflect: "Reflexionar", share: "Compartir", startReading: "Comenzar a Leer",
    yourProgress: "Tu Progreso", quickAccess: "Acceso Rápido",
    belovedVerses: "Versículos Amados", readingPlans: "Planes de Lectura",
    commentary: "Comentario", crossRefs: "Referencias Cruzadas",
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
    // Read page
    jumpToVerse: "Ir al Versículo",
    selectChapter: "Seleccionar Capítulo",
    selectTranslation: "Seleccionar Traducción",
    // Plans
    readingGoal: "Meta de Lectura", dailyGoal: "Meta Diaria",
    weeklyGoal: "Meta Semanal", completed: "Completado",
    // Library
    bookmarks: "Marcadores", highlights: "Destacados", notes: "Notas",
    // Prayer
    prayerJournal: "Diario de Oración", newPrayer: "Nueva Oración",
    answered: "Respondida", unanswered: "Sin Responder",
    // Settings
    settings: "Ajustes", language: "Idioma", notifications: "Notificaciones",
    darkMode: "Modo Oscuro", fontSize: "Tamaño de Letra",
    // General
    save: "Guardar", cancel: "Cancelar", close: "Cerrar", open: "Abrir", loading: "Cargando…",
    noResults: "No se encontraron resultados",
    featuredVerses: [
      { ref: "Juan 3:16", text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.", theme: "amor" },
      { ref: "Salmo 23:1", text: "El Señor es mi pastor; nada me faltará.", theme: "confianza" },
      { ref: "Filipenses 4:13", text: "Todo lo puedo en Cristo que me fortalece.", theme: "fortaleza" },
      { ref: "Proverbios 3:5-6", text: "Confía en el Señor con todo tu corazón, y no te apoyes en tu propia prudencia.", theme: "sabiduría" },
      { ref: "Romanos 8:28", text: "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien.", theme: "esperanza" },
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
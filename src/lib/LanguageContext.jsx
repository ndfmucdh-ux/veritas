import { createContext, useContext, useState } from "react";

const T = {
  en: {
    home: "Home", read: "Read", search: "Search", library: "Library",
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
  },
  es: {
    home: "Inicio", read: "Leer", search: "Buscar", library: "Biblioteca",
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
  },
};

const LangCtx = createContext({ lang: "en", t: T.en, setLang: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("veritas_lang") || "en");
  const changeLang = (l) => { setLang(l); localStorage.setItem("veritas_lang", l); };
  return <LangCtx.Provider value={{ lang, t: T[lang] || T.en, setLang: changeLang }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
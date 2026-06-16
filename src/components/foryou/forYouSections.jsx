import { BookOpen, Shield, Heart, Zap, Star, Anchor, Users, Sprout } from "lucide-react";

export const SECTIONS = {
  men: {
    title: "Para Hombres", subtitle: "Fortaleza, propósito y fe inquebrantable", color: "#60a5fa", icon: Shield,
    bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.2)",
    themes: [
      { label: "Liderazgo y Carácter", icon: Shield, verses: ["Josué 1:9", "1 Corintios 16:13", "Proverbios 27:17"], desc: "El llamado al hombre de integridad" },
      { label: "Fortaleza en la Prueba", icon: Anchor, verses: ["Romanos 5:3-4", "Santiago 1:2-4", "Salmos 46:1"], desc: "Fe firme en medio de la adversidad" },
      { label: "Familia y Paternidad", icon: Users, verses: ["Efesios 6:4", "Proverbios 22:6", "Salmos 128:3"], desc: "El padre conforme al corazón de Dios" },
      { label: "Propósito Divino", icon: Zap, verses: ["Jeremías 29:11", "Efesios 2:10", "Romanos 8:28"], desc: "Caminando en el llamado único" },
    ],
    intro: "Las Sagradas Escrituras llaman al hombre a ser piedra angular de familia, comunidad y fe. Estos pasajes te equiparán con la sabiduría y fortaleza del Padre.",
    planCat: "men",
  },
  women: {
    title: "Para Mujeres", subtitle: "Gracia, fortaleza y belleza interior", color: "#f472b6", icon: Heart,
    bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.2)",
    themes: [
      { label: "Identidad en el Padre", icon: Star, verses: ["Génesis 1:27", "Salmos 139:14", "1 Pedro 3:4"], desc: "Tu valor no viene del mundo" },
      { label: "Mujer Valiente", icon: Shield, verses: ["Proverbios 31:25", "Jueces 4:4-9", "Rut 1:16-17"], desc: "Mujeres que cambiaron la historia" },
      { label: "Paz Interior", icon: Anchor, verses: ["Filipenses 4:7", "Isaías 26:3", "Juan 14:27"], desc: "La paz que sobrepasa todo entendimiento" },
      { label: "Fe y Oración", icon: Heart, verses: ["Lucas 1:38", "1 Samuel 1:10-11", "Mateo 15:22-28"], desc: "Mujeres de oración poderosa" },
    ],
    intro: "El Padre te ha diseñado con una belleza y fuerza únicos. Estos pasajes de Las Sagradas Escrituras te recordarán quién eres en Sus ojos.",
    planCat: "women",
  },
  youth: {
    title: "Para Jóvenes", subtitle: "Identidad, propósito y fe audaz", color: "#fb923c", icon: Zap,
    bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.2)",
    themes: [
      { label: "Tu Identidad en Cristo", icon: Star, verses: ["1 Timoteo 4:12", "Jeremías 1:5", "Efesios 1:4-5"], desc: "No eres lo que el mundo dice" },
      { label: "Decisiones Sabias", icon: Shield, verses: ["Proverbios 3:5-6", "Santiago 1:5", "Salmos 25:4-5"], desc: "Cómo tomar decisiones con fe" },
      { label: "Amistades y Relaciones", icon: Users, verses: ["1 Corintios 15:33", "Proverbios 17:17", "Eclesiastés 4:9-10"], desc: "Las relaciones que te edifican" },
      { label: "Fe Audaz", icon: Zap, verses: ["Mateo 17:20", "Marcos 11:23-24", "Hebreos 11:1"], desc: "Una fe que mueve montañas" },
    ],
    intro: "La juventud es tiempo de fundamento. Las Sagradas Escrituras te hablan directamente sobre tu identidad, propósito y el llamado del Padre para tu vida.",
    planCat: "youth",
  },
  kids: {
    title: "Para Niños", subtitle: "Historias de fe, amor y valor", color: "#facc15", icon: Star,
    bg: "rgba(250,204,21,0.08)", border: "rgba(250,204,21,0.2)",
    themes: [
      { label: "El Padre nos Ama", icon: Heart, verses: ["Juan 3:16", "1 Juan 4:19", "Salmos 100:5"], desc: "El amor de Dios es para siempre" },
      { label: "Grandes Historias", icon: BookOpen, verses: ["Daniel 6", "1 Samuel 17", "Jonás 1-4"], desc: "Héroes de Las Sagradas Escrituras" },
      { label: "Ser Bondadoso", icon: Users, verses: ["Efesios 4:32", "Mateo 7:12", "Gálatas 6:10"], desc: "Cómo tratar a los demás" },
      { label: "No Tengas Miedo", icon: Anchor, verses: ["Isaías 41:10", "Josué 1:9", "Salmos 23:4"], desc: "El Padre siempre está contigo" },
    ],
    intro: "El Padre ama a los niños profundamente. Estas historias y versículos de Las Sagradas Escrituras son perfectos para aprender sobre Su amor y gracia.",
    planCat: "kids",
  },
  marriage: {
    title: "Matrimonio", subtitle: "Un pacto sagrado de amor y servicio", color: "#f43f5e", icon: Heart,
    bg: "rgba(244,63,94,0.08)", border: "rgba(244,63,94,0.2)",
    themes: [
      { label: "El Diseño del Matrimonio", icon: Heart, verses: ["Génesis 2:24", "Marcos 10:9", "Efesios 5:31"], desc: "El Padre instituyó el pacto del matrimonio" },
      { label: "Amor que Sirve", icon: Users, verses: ["1 Corintios 13:4-7", "Efesios 5:25", "Filipenses 2:3-4"], desc: "El amor que edifica al otro" },
      { label: "Comunicación y Perdón", icon: Anchor, verses: ["Efesios 4:26", "Colosenses 3:13", "Proverbios 15:1"], desc: "Sanar y crecer juntos" },
      { label: "Orar Juntos", icon: Star, verses: ["Mateo 18:19-20", "1 Pedro 3:7", "Eclesiastés 4:12"], desc: "La pareja que ora, permanece" },
    ],
    intro: "El matrimonio es imagen del amor del Padre por Su pueblo. Estos pasajes de Las Sagradas Escrituras edificarán y fortalecerán su pacto sagrado.",
    planCat: "marriage",
  },
  newBeliever: {
    title: "Nuevo Creyente", subtitle: "Los primeros pasos en la fe", color: "#34d399", icon: Sprout,
    bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)",
    themes: [
      { label: "¿Quién es el Padre?", icon: Star, verses: ["Juan 1:1", "1 Juan 4:8", "Éxodo 3:14-15"], desc: "Conociendo al Padre de Las Sagradas Escrituras" },
      { label: "La Salvación", icon: Heart, verses: ["Juan 3:16", "Romanos 10:9-10", "Efesios 2:8-9"], desc: "El regalo más grande" },
      { label: "Comenzar a Orar", icon: Anchor, verses: ["Mateo 6:9-13", "Filipenses 4:6-7", "1 Tesalonicenses 5:17"], desc: "Cómo hablar con el Padre" },
      { label: "Crecer en Fe", icon: Sprout, verses: ["Hebreos 11:6", "Romanos 10:17", "2 Pedro 3:18"], desc: "Tu fe crecerá cada día" },
    ],
    intro: "Bienvenido a la familia del Padre. Esta sección te guiará por los fundamentos de la fe con pasajes clave de Las Sagradas Escrituras para nuevos creyentes.",
    planCat: "new_believer",
  },
};

export const ES_TO_EN_BOOK = {
  "Génesis": "Genesis", "Josué": "Joshua", "Jueces": "Judges", "Rut": "Ruth", "Salmos": "Psalms", "Salmo": "Psalms",
  "Proverbios": "Proverbs", "Isaías": "Isaiah", "Jeremías": "Jeremiah", "Daniel": "Daniel", "Jonás": "Jonah",
  "Mateo": "Matthew", "Marcos": "Mark", "Lucas": "Luke", "Juan": "John", "Hechos": "Acts", "Romanos": "Romans",
  "1 Corintios": "1 Corinthians", "2 Corintios": "2 Corinthians", "Gálatas": "Galatians", "Efesios": "Ephesians",
  "Filipenses": "Philippians", "Colosenses": "Colossians", "1 Tesalonicenses": "1 Thessalonians", "Santiago": "James",
  "Hebreos": "Hebrews", "1 Pedro": "1 Peter", "2 Pedro": "2 Peter", "1 Juan": "1 John", "1 Timoteo": "1 Timothy",
  "Eclesiastés": "Ecclesiastes", "Éxodo": "Exodus",
};
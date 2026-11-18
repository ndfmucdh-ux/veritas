import { Shield, Heart, Anchor, Flame, Lock, Compass, Star, BookOpen } from "lucide-react";

// Marriage: 8 more themes (with the 2 added in stage 1 this makes 10 new). 15 passages and 5 cross references each.
export const MARRIAGE_NEW_META = [
  { icon: Shield, photo: "chapel", verses: ["Ephesians 5:21", "1 Peter 3:1-2", "1 Peter 3:7", "Ephesians 5:33", "Romans 12:10", "Philippians 2:3", "Proverbs 31:11-12", "Colossians 3:18-19", "Proverbs 12:4", "1 Corinthians 11:11-12", "Galatians 3:28", "Proverbs 18:13", "James 1:19", "1 Thessalonians 5:12-13", "Proverbs 25:11"], cross: ["Genesis 1:27", "Mark 10:42-45", "Romans 13:7", "Titus 2:4-5", "1 Corinthians 7:4"] },
  { icon: Heart, photo: "wheat", verses: ["Galatians 5:13", "John 13:14-15", "Mark 10:45", "Philippians 2:4", "1 Peter 4:10", "Proverbs 31:12", "Ephesians 5:25", "Romans 15:1-2", "Matthew 20:26-28", "1 John 3:16-18", "Colossians 3:23", "Proverbs 31:27", "1 Corinthians 10:24", "Luke 22:26-27", "Hebrews 6:10"], cross: ["John 15:13", "Acts 20:35", "Matthew 25:40", "2 Corinthians 8:9", "Ephesians 6:7"] },
  { icon: Anchor, photo: "ocean", verses: ["Matthew 18:15", "Proverbs 15:1", "Proverbs 17:14", "Proverbs 20:3", "James 4:1-2", "Ephesians 4:15", "Proverbs 16:21", "Proverbs 15:18", "Romans 12:18", "Matthew 5:9", "Proverbs 18:13", "Ephesians 4:2-3", "Philippians 2:14-15", "2 Timothy 2:23-24", "Proverbs 26:20"], cross: ["Proverbs 13:10", "James 3:17-18", "Colossians 3:15", "Romans 14:19", "Proverbs 12:18"] },
  { icon: Flame, photo: "sunrise", verses: ["Song of Solomon 1:2", "Song of Solomon 2:10-13", "Song of Solomon 4:9-10", "Song of Solomon 6:3", "Song of Solomon 7:6-7", "Song of Solomon 8:6-7", "Proverbs 5:18-19", "Ecclesiastes 9:9", "Revelation 2:4-5", "Genesis 29:20", "Hosea 2:14", "Proverbs 31:28-29", "Jeremiah 2:2", "Song of Solomon 3:4", "Deuteronomy 24:5"], cross: ["1 Corinthians 7:3-5", "Hebrews 13:4", "Isaiah 62:5", "Zephaniah 3:17", "Psalm 45:11"] },
  { icon: Lock, photo: "dove", verses: ["Psalm 34:18", "Joel 2:25", "Isaiah 61:3", "Proverbs 3:5-6", "Psalm 147:3", "Ephesians 4:32", "Hosea 3:1", "Jeremiah 30:17", "Colossians 3:13", "Romans 12:21", "1 Corinthians 13:7", "Micah 7:8", "Psalm 51:10", "Isaiah 43:18-19", "Psalm 126:5-6"], cross: ["Hosea 14:4", "Galatians 6:1", "2 Corinthians 5:17", "Lamentations 3:22-23", "Psalm 30:5"] },
  { icon: Compass, photo: "desert", verses: ["Romans 5:3-5", "James 1:2-4", "Ecclesiastes 4:12", "Isaiah 43:2", "Psalm 46:1", "2 Corinthians 4:8-9", "Galatians 6:9", "Hebrews 12:1-2", "Philippians 4:13", "Psalm 30:5", "Nahum 1:7", "Deuteronomy 31:6", "Romans 8:28", "1 Peter 5:10", "Psalm 121:1-2"], cross: ["Job 2:10", "Ruth 1:16-17", "2 Timothy 4:7", "Isaiah 40:31", "Matthew 11:28"] },
  { icon: Star, photo: "lily", verses: ["Philippians 1:3", "Proverbs 16:24", "1 Thessalonians 5:11", "Colossians 3:15-17", "Ephesians 4:29", "Proverbs 31:28-29", "Proverbs 12:25", "Hebrews 10:24", "1 Thessalonians 5:18", "Psalm 136:1", "Proverbs 15:30", "Romans 1:8", "2 Timothy 1:3-4", "Proverbs 25:11", "Psalm 107:1"], cross: ["Psalm 100:4", "Philippians 4:8", "1 Corinthians 1:4", "Proverbs 18:21", "Luke 17:16"] },
  { icon: BookOpen, photo: "forest", verses: ["Joshua 24:15", "Deuteronomy 6:4-7", "Psalm 127:1", "Matthew 6:33", "Acts 18:26", "Ephesians 5:25-26", "1 Peter 3:7", "Colossians 3:16", "Psalm 34:3", "2 Timothy 1:5", "Proverbs 24:3-4", "Hebrews 10:24-25", "Psalm 1:2-3", "John 15:5", "Romans 12:1-2"], cross: ["Genesis 18:19", "Psalm 128:1-4", "Matthew 18:20", "Acts 2:42", "Isaiah 38:19"] },
];

// [label, description, reflection, practice]
export const MARRIAGE_NEW_TEXT = {
  en: [
    ["Mutual Respect and Honor", "Valuing each other as God does", "Respect is love shown in words and choices. Honor your spouse in private and in public.", "Thank your spouse today for something specific you respect in them."],
    ["Serving Each Other", "Love that picks up the towel", "Marriage thrives when each tries to out-serve the other. Small acts carry great weight.", "Do a task your spouse dislikes without being asked."],
    ["Handling Conflict", "Truth spoken in love", "Disagreement is not the enemy. How you fight matters more than whether you fight.", "Next time you disagree, listen for one minute before you speak."],
    ["Rekindling Romance", "Keep the first love alive", "Romance is built, not found. Time, tenderness and surprise keep a marriage warm.", "Plan a simple date this week and put phones away."],
    ["Trust after Hurt", "Rebuilding what was broken", "Trust returns through honesty, patience and consistent change. God restores what is brought to Him.", "Pray together for healing and name one small act that rebuilds trust."],
    ["Enduring Hard Seasons", "A cord of three strands", "Every marriage passes through valleys. Perseverance together deepens love and faith.", "Remind your spouse of a hard time God carried you through."],
    ["Gratitude and Encouragement", "Words that build up", "Kind words are honey to the soul. Gratitude noticed becomes love felt.", "Write a short note of thanks and leave it where your spouse will find it."],
    ["Spiritual Leadership Together", "Growing as one in Christ", "A home centered on God stands firm. Pray, read and serve together.", "Choose a short Bible passage to read together each night this week."],
  ],
  es: [
    ["Respeto y Honra Mutuos", "Valorarse como Dios los valora", "El respeto es amor mostrado en palabras y decisiones. Honra a tu cónyuge en privado y en público.", "Agradece hoy a tu cónyuge algo específico que respetas en él o ella."],
    ["Servirse el Uno al Otro", "Amor que toma la toalla", "El matrimonio florece cuando cada uno intenta servir más. Los actos pequeños pesan mucho.", "Haz una tarea que tu cónyuge no disfruta sin que te la pida."],
    ["Manejar los Conflictos", "La verdad dicha con amor", "El desacuerdo no es el enemigo. Cómo discuten importa más que si discuten.", "La próxima vez que discrepen, escucha un minuto antes de hablar."],
    ["Reavivar el Romance", "Mantener vivo el primer amor", "El romance se construye, no se encuentra. Tiempo, ternura y sorpresas mantienen cálido el matrimonio.", "Planea esta semana una cita sencilla y aparten los teléfonos."],
    ["Confianza tras la Herida", "Reconstruir lo que se rompió", "La confianza vuelve con honestidad, paciencia y cambio constante. Dios restaura lo que se le entrega.", "Oren juntos por sanidad y nombren un pequeño acto que reconstruya la confianza."],
    ["Superar Temporadas Difíciles", "Cordón de tres dobleces", "Todo matrimonio pasa por valles. Perseverar juntos profundiza el amor y la fe.", "Recuerda a tu cónyuge un momento difícil del que Dios los sacó."],
    ["Gratitud y Aliento", "Palabras que edifican", "Las palabras amables son miel para el alma. La gratitud expresada se convierte en amor sentido.", "Escribe una nota breve de agradecimiento y déjala donde la encuentre."],
    ["Liderazgo Espiritual Juntos", "Crecer como uno en Cristo", "Un hogar centrado en Dios permanece firme. Oren, lean y sirvan juntos.", "Elijan un pasaje corto para leer juntos cada noche esta semana."],
  ],
  pt: [
    ["Respeito e Honra Mútuos", "Valorizar-se como Deus valoriza", "Respeito é amor demonstrado em palavras e escolhas. Honre seu cônjuge em particular e em público.", "Agradeça hoje ao seu cônjuge algo específico que você respeita nele ou nela."],
    ["Servir um ao Outro", "Amor que pega a toalha", "O casamento floresce quando cada um tenta servir mais. Pequenos atos têm grande peso.", "Faça uma tarefa que seu cônjuge não gosta sem que peça."],
    ["Lidar com Conflitos", "A verdade dita com amor", "A discordância não é a inimiga. Como vocês discutem importa mais que se discutem.", "Na próxima discordância, ouça por um minuto antes de falar."],
    ["Reacender o Romance", "Manter vivo o primeiro amor", "O romance é construído, não encontrado. Tempo, ternura e surpresas mantêm o casamento aquecido.", "Planeje um encontro simples esta semana e deixem os celulares de lado."],
    ["Confiança após a Mágoa", "Reconstruir o que foi quebrado", "A confiança volta com honestidade, paciência e mudança constante. Deus restaura o que é entregue a Ele.", "Orem juntos por cura e nomeiem um pequeno ato que reconstrua a confiança."],
    ["Superar Fases Difíceis", "Cordão de três dobras", "Todo casamento passa por vales. Perseverar juntos aprofunda o amor e a fé.", "Lembre seu cônjuge de uma fase difícil da qual Deus os tirou."],
    ["Gratidão e Encorajamento", "Palavras que edificam", "Palavras gentis são mel para a alma. Gratidão expressa vira amor sentido.", "Escreva um bilhete de agradecimento e deixe onde ele ou ela encontre."],
    ["Liderança Espiritual Juntos", "Crescer como um em Cristo", "Um lar centrado em Deus permanece firme. Orem, leiam e sirvam juntos.", "Escolham uma passagem curta para ler juntos toda noite esta semana."],
  ],
};
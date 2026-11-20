// Wording for the four daily reminders, in every app language.
// Kinds: streak (keep your reading streak), scripture (read today), prayer (take time to pray),
// followup (pick up the message, listening or study you started).

export type Kind = "streak" | "scripture" | "prayer" | "followup";
export const KINDS: Kind[] = ["streak", "scripture", "prayer", "followup"];

// streak is on for everyone at 8:00 AM local time; the others are opt-in. Users change all of it in Notifications.
export const REMINDER_DEFAULTS: Record<Kind, { enabled: boolean; time: string }> = {
  streak: { enabled: true, time: "08:00" },
  scripture: { enabled: false, time: "07:00" },
  prayer: { enabled: false, time: "12:00" },
  followup: { enabled: false, time: "19:00" },
};

// A well-known verse for each reminder, shown in the reader's own Bible.
export const REMINDER_VERSE: Record<Kind, { book: string; chapter: number; from: number; to?: number }> = {
  streak: { book: "Galatians", chapter: 6, from: 9 },
  scripture: { book: "Psalms", chapter: 119, from: 105 },
  prayer: { book: "Philippians", chapter: 4, from: 6, to: 7 },
  followup: { book: "2 Timothy", chapter: 2, from: 15 },
};

type Text = { chip: string; push: string; hello: string; line: string; cta: string; foot: string };
export const TEXT: Record<string, Record<Kind, Text>> = {
  en: {
    streak: { chip: "🔥 KEEP YOUR STREAK", push: "Keep your reading streak alive", hello: "Keep your streak going", line: "You haven't read today yet. A single chapter keeps your streak alive.", cta: "Read today's chapter", foot: "Reading Streak" },
    scripture: { chip: "📖 TIME IN THE WORD", push: "Take time to read the Scriptures today", hello: "Your Scriptures are waiting", line: "Take a few quiet minutes in the Word today.", cta: "Open the Bible", foot: "Daily Reading" },
    prayer: { chip: "🙏 TIME TO PRAY", push: "Take a moment to pray", hello: "Take time to pray", line: "Pause and bring everything to the Father.", cta: "Open Prayer Journal", foot: "Prayer Reminder" },
    followup: { chip: "🎧 PICK UP WHERE YOU LEFT OFF", push: "Continue what you started", hello: "Continue what you started", line: "You have something in progress. Pick it up today:", cta: "Continue now", foot: "Follow-up" },
  },
  es: {
    streak: { chip: "🔥 MANTÉN TU RACHA", push: "Mantén viva tu racha de lectura", hello: "Mantén tu racha", line: "Hoy aún no has leído. Un solo capítulo mantiene viva tu racha.", cta: "Leer el capítulo de hoy", foot: "Racha de Lectura" },
    scripture: { chip: "📖 TIEMPO EN LA PALABRA", push: "Dedica tiempo a leer las Escrituras hoy", hello: "Tus Escrituras te esperan", line: "Dedica unos minutos de calma a la Palabra hoy.", cta: "Abrir la Biblia", foot: "Lectura Diaria" },
    prayer: { chip: "🙏 HORA DE ORAR", push: "Tómate un momento para orar", hello: "Toma tiempo para orar", line: "Haz una pausa y presenta todo al Padre.", cta: "Abrir Diario de Oración", foot: "Recordatorio de Oración" },
    followup: { chip: "🎧 CONTINÚA DONDE QUEDASTE", push: "Continúa lo que empezaste", hello: "Continúa lo que empezaste", line: "Tienes algo en progreso. Retómalo hoy:", cta: "Continuar ahora", foot: "Seguimiento" },
  },
  fr: {
    streak: { chip: "🔥 GARDEZ VOTRE SÉRIE", push: "Gardez votre série de lecture", hello: "Gardez votre série", line: "Vous n'avez pas encore lu aujourd'hui. Un seul chapitre garde votre série.", cta: "Lire le chapitre du jour", foot: "Série de lecture" },
    scripture: { chip: "📖 TEMPS DANS LA PAROLE", push: "Prenez le temps de lire les Écritures", hello: "Vos Écritures vous attendent", line: "Prenez quelques minutes de calme dans la Parole.", cta: "Ouvrir la Bible", foot: "Lecture quotidienne" },
    prayer: { chip: "🙏 TEMPS DE PRIÈRE", push: "Prenez un moment pour prier", hello: "Prenez du temps pour prier", line: "Faites une pause et confiez tout au Père.", cta: "Ouvrir le journal de prière", foot: "Rappel de prière" },
    followup: { chip: "🎧 REPRENEZ OÙ VOUS EN ÉTIEZ", push: "Continuez ce que vous avez commencé", hello: "Continuez ce que vous avez commencé", line: "Vous avez quelque chose en cours. Reprenez-le aujourd'hui :", cta: "Continuer", foot: "Suivi" },
  },
  pt: {
    streak: { chip: "🔥 MANTENHA SUA SEQUÊNCIA", push: "Mantenha viva sua sequência de leitura", hello: "Mantenha sua sequência", line: "Você ainda não leu hoje. Um capítulo mantém sua sequência.", cta: "Ler o capítulo de hoje", foot: "Sequência de Leitura" },
    scripture: { chip: "📖 TEMPO NA PALAVRA", push: "Reserve um tempo para ler as Escrituras", hello: "Suas Escrituras esperam por você", line: "Reserve alguns minutos de calma na Palavra hoje.", cta: "Abrir a Bíblia", foot: "Leitura Diária" },
    prayer: { chip: "🙏 HORA DE ORAR", push: "Reserve um momento para orar", hello: "Tome tempo para orar", line: "Faça uma pausa e entregue tudo ao Pai.", cta: "Abrir Diário de Oração", foot: "Lembrete de Oração" },
    followup: { chip: "🎧 CONTINUE DE ONDE PAROU", push: "Continue o que você começou", hello: "Continue o que você começou", line: "Você tem algo em andamento. Retome hoje:", cta: "Continuar agora", foot: "Acompanhamento" },
  },
  de: {
    streak: { chip: "🔥 HALTE DEINE SERIE", push: "Halte deine Lese-Serie am Leben", hello: "Halte deine Serie", line: "Du hast heute noch nicht gelesen. Ein Kapitel hält deine Serie am Leben.", cta: "Heutiges Kapitel lesen", foot: "Lese-Serie" },
    scripture: { chip: "📖 ZEIT IM WORT", push: "Nimm dir Zeit für die Schrift", hello: "Deine Schrift wartet", line: "Nimm dir heute ein paar stille Minuten im Wort.", cta: "Bibel öffnen", foot: "Tägliches Lesen" },
    prayer: { chip: "🙏 ZEIT ZUM BETEN", push: "Nimm dir einen Moment zum Beten", hello: "Nimm dir Zeit zum Beten", line: "Halte inne und bring alles vor den Vater.", cta: "Gebetstagebuch öffnen", foot: "Gebets-Erinnerung" },
    followup: { chip: "🎧 MACH DA WEITER, WO DU WARST", push: "Mach weiter mit dem, was du begonnen hast", hello: "Mach weiter, wo du warst", line: "Du hast etwas in Arbeit. Nimm es heute wieder auf:", cta: "Jetzt fortsetzen", foot: "Fortsetzung" },
  },
};
// Reminder settings: defaults (same as the server) and wording in every app language.
export const REMINDER_KINDS = ["streak", "scripture", "prayer", "followup"];

export const REMINDER_DEFAULTS = {
  streak: { enabled: true, time: "08:00" },
  scripture: { enabled: false, time: "07:00" },
  prayer: { enabled: false, time: "12:00" },
  followup: { enabled: false, time: "19:00" },
};

export const REMINDER_COPY = {
  en: {
    title: "My reminders", sub: "Pick what you want to be reminded about and when. Times use your own time zone.",
    tz: "Your time zone", push: "Push notifications", pushSub: "Alerts on the Veritas mobile app", email: "Email", emailSub: "Branded reminders to your inbox",
    saved: "Saved", time: "Time",
    streak: ["Keep my reading streak", "A nudge if you haven't read yet today. Not sent once you have."],
    scripture: ["Read the Scriptures today", "A quiet moment in the Word, from where you left off."],
    prayer: ["Take time to pray", "A reminder to pray if you haven't journaled a prayer today."],
    followup: ["Follow up on what I started", "Messages you were listening to or reading, plans and studies in progress."],
  },
  es: {
    title: "Mis recordatorios", sub: "Elige qué quieres que te recordemos y a qué hora. Las horas usan tu zona horaria.",
    tz: "Tu zona horaria", push: "Notificaciones push", pushSub: "Avisos en la app móvil de Veritas", email: "Correo", emailSub: "Recordatorios con diseño en tu bandeja",
    saved: "Guardado", time: "Hora",
    streak: ["Mantener mi racha de lectura", "Un aviso si hoy aún no has leído. No se envía si ya leíste."],
    scripture: ["Leer las Escrituras hoy", "Un momento de calma en la Palabra, donde te quedaste."],
    prayer: ["Tomar tiempo para orar", "Un recordatorio para orar si hoy no has anotado una oración."],
    followup: ["Dar seguimiento a lo que empecé", "Mensajes que escuchabas o leías, planes y estudios en progreso."],
  },
  fr: {
    title: "Mes rappels", sub: "Choisissez ce dont vous voulez être rappelé et quand. Les heures suivent votre fuseau horaire.",
    tz: "Votre fuseau horaire", push: "Notifications push", pushSub: "Alertes sur l'app mobile Veritas", email: "E-mail", emailSub: "Rappels élégants dans votre boîte",
    saved: "Enregistré", time: "Heure",
    streak: ["Garder ma série de lecture", "Un rappel si vous n'avez pas encore lu aujourd'hui."],
    scripture: ["Lire les Écritures aujourd'hui", "Un moment dans la Parole, là où vous vous étiez arrêté."],
    prayer: ["Prendre du temps pour prier", "Un rappel pour prier si vous n'avez pas noté de prière aujourd'hui."],
    followup: ["Reprendre ce que j'ai commencé", "Messages écoutés ou lus, plans et études en cours."],
  },
  pt: {
    title: "Meus lembretes", sub: "Escolha o que quer lembrar e quando. Os horários usam seu fuso horário.",
    tz: "Seu fuso horário", push: "Notificações push", pushSub: "Alertas no app móvel Veritas", email: "E-mail", emailSub: "Lembretes elegantes na sua caixa de entrada",
    saved: "Salvo", time: "Hora",
    streak: ["Manter minha sequência de leitura", "Um aviso se você ainda não leu hoje."],
    scripture: ["Ler as Escrituras hoje", "Um momento na Palavra, de onde você parou."],
    prayer: ["Reservar tempo para orar", "Um lembrete para orar se você não registrou uma oração hoje."],
    followup: ["Dar continuidade ao que comecei", "Mensagens que ouvia ou lia, planos e estudos em andamento."],
  },
  de: {
    title: "Meine Erinnerungen", sub: "Wähle, woran du erinnert werden möchtest und wann. Die Zeiten gelten in deiner Zeitzone.",
    tz: "Deine Zeitzone", push: "Push-Benachrichtigungen", pushSub: "Hinweise in der Veritas-App", email: "E-Mail", emailSub: "Schöne Erinnerungen in dein Postfach",
    saved: "Gespeichert", time: "Zeit",
    streak: ["Meine Lese-Serie halten", "Ein Hinweis, wenn du heute noch nicht gelesen hast."],
    scripture: ["Heute in der Schrift lesen", "Ein stiller Moment im Wort, dort wo du aufgehört hast."],
    prayer: ["Zeit zum Beten nehmen", "Eine Erinnerung zum Beten, wenn du heute kein Gebet notiert hast."],
    followup: ["Fortsetzen, was ich begonnen habe", "Gehörte oder gelesene Botschaften, Pläne und Studien in Arbeit."],
  },
};
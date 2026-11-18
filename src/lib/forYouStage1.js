import { Shield, Wallet, Heart, Compass, Smile, Users, Sprout, Sun, Feather, Flame } from "lucide-react";

// For You, stage 1: 10 new study themes (English, Spanish, Portuguese).
// Each category lists its new themes in the same order in META and TEXT.
// Theme text is [label, description, reflection, practice].
export const STAGE1_META = {
  men: [
    { icon: Flame, photo: "mountains", verses: ["Proverbs 25:28", "2 Timothy 1:7", "1 Corinthians 9:25"] },
    { icon: Wallet, photo: "wheat", verses: ["Proverbs 3:9-10", "Luke 16:10", "Matthew 6:19-21"] },
  ],
  women: [
    { icon: Compass, photo: "candle", verses: ["Proverbs 31:26", "James 1:5", "Proverbs 14:1"] },
    { icon: Heart, photo: "dove", verses: ["Psalm 147:3", "Ephesians 4:32", "Isaiah 61:3"] },
  ],
  youth: [
    { icon: Shield, photo: "starfield", verses: ["Galatians 1:10", "Romans 12:2", "2 Corinthians 10:12"] },
    { icon: Compass, photo: "sunrise", verses: ["Proverbs 16:3", "Psalm 37:4-5", "Ecclesiastes 12:1"] },
  ],
  marriage: [
    { icon: Users, photo: "ocean", verses: ["Genesis 2:18", "Proverbs 18:22", "Song of Solomon 2:16"] },
    { icon: Smile, photo: "lily", verses: ["Deuteronomy 6:6-7", "Psalm 127:3", "Colossians 3:21"] },
  ],
  kids: [
    { icon: Sun, photo: "ocean", verses: ["Genesis 1:1", "Psalm 19:1", "Psalm 104:24"] },
  ],
  newBeliever: [
    { icon: Feather, photo: "waterfall", verses: ["1 John 1:9", "Psalm 103:12", "Lamentations 3:22-23"] },
  ],
};

export const STAGE1_TEXT = {
  en: {
    men: [
      ["Discipline and Self-Control", "Mastering yourself before the world", "A man who rules his own spirit is stronger than one who takes a city. Discipline is small, daily obedience.", "Pick one habit to drop or start this week and tell a friend."],
      ["Money and Stewardship", "Everything you hold is entrusted", "What you own is a trust, not a trophy. Faithful with little means faithful with much.", "Review your last month of spending and set aside a first portion to give."],
    ],
    women: [
      ["Wisdom and Discernment", "Speaking and choosing with understanding", "Wisdom is asked for and given. A wise woman builds her home with kind words and clear choices.", "Before one decision today, pause and ask God for wisdom."],
      ["Healing and Forgiveness", "He binds up the brokenhearted", "Healing is slow and holy. Forgiveness frees you, even when the other person never apologizes.", "Write down one hurt and place it in God's hands in prayer."],
    ],
    youth: [
      ["Approval and Social Media", "Whose opinion are you living for?", "Likes fade, but your worth was settled by God. Comparison steals joy you were meant to enjoy.", "Take one day off a platform and note how you feel."],
      ["Calling and Future", "Commit your plans to Him", "You do not need the whole map. Commit the next step to God and walk in it faithfully.", "Write one dream and pray over it for five minutes."],
    ],
    marriage: [
      ["Friendship and Intimacy", "Two made to be companions", "A strong marriage is built on friendship. Be curious about your spouse, not only busy beside them.", "Plan an hour together with no phones this week."],
      ["Parenting Together", "Raising children as one team", "Children learn faith by watching parents who love God and each other.", "Agree on one value you both want your children to see daily."],
    ],
    kids: [
      ["God Made Everything", "The world shows how great God is", "God made the sky, the sea and every animal. Everything you see says, God is good and strong.", "Go outside and name five things God made. Say thank you for each."],
    ],
    newBeliever: [
      ["Forgiveness and a New Start", "Every morning is new", "When you confess, He forgives and cleans. Your past does not define you; His mercy does.", "Confess one thing honestly in prayer and receive His forgiveness."],
    ],
  },
  es: {
    men: [
      ["Disciplina y Dominio Propio", "Gobernarte antes de gobernar", "El que domina su espíritu es más fuerte que quien toma una ciudad. La disciplina es obediencia diaria y pequeña.", "Elige un hábito para dejar o comenzar esta semana y cuéntaselo a un amigo."],
      ["Dinero y Mayordomía", "Todo lo que tienes se te confió", "Lo que posees es un encargo, no un trofeo. Fiel en lo poco es fiel en lo mucho.", "Revisa tus gastos del último mes y aparta una primera parte para dar."],
    ],
    women: [
      ["Sabiduría y Discernimiento", "Hablar y elegir con entendimiento", "La sabiduría se pide y se da. La mujer sabia edifica su hogar con palabras amables y decisiones claras.", "Antes de una decisión hoy, haz una pausa y pide sabiduría a Dios."],
      ["Sanidad y Perdón", "Él sana a los quebrantados de corazón", "La sanidad es lenta y santa. El perdón te libera, aunque la otra persona nunca se disculpe.", "Escribe una herida y entrégala a Dios en oración."],
    ],
    youth: [
      ["Aprobación y Redes Sociales", "¿Para la opinión de quién vives?", "Los likes se desvanecen, pero tu valor lo fijó Dios. La comparación te roba el gozo.", "Descansa un día de una red social y anota cómo te sientes."],
      ["Llamado y Futuro", "Encomienda tus planes al Señor", "No necesitas todo el mapa. Entrega el siguiente paso a Dios y camina con fidelidad.", "Escribe un sueño y ora por él durante cinco minutos."],
    ],
    marriage: [
      ["Amistad e Intimidad", "Dos hechos para acompañarse", "Un matrimonio fuerte se construye sobre la amistad. Interésate por tu cónyuge, no solo estés a su lado.", "Planea una hora juntos sin teléfonos esta semana."],
      ["Criar Juntos", "Formar a los hijos como un equipo", "Los hijos aprenden la fe viendo a padres que aman a Dios y se aman entre sí.", "Acuerden un valor que quieren que sus hijos vean cada día."],
    ],
    kids: [
      ["Dios Hizo Todo", "El mundo muestra lo grande que es Dios", "Dios hizo el cielo, el mar y cada animal. Todo lo que ves dice: Dios es bueno y fuerte.", "Sal afuera y nombra cinco cosas que Dios hizo. Da gracias por cada una."],
    ],
    newBeliever: [
      ["Perdón y Nuevo Comienzo", "Cada mañana es nueva", "Cuando confiesas, Él perdona y limpia. Tu pasado no te define; Su misericordia sí.", "Confiesa con sinceridad una cosa en oración y recibe Su perdón."],
    ],
  },
  pt: {
    men: [
      ["Disciplina e Domínio Próprio", "Governar a si mesmo antes de governar o mundo", "Quem domina o próprio espírito é mais forte que quem conquista uma cidade. Disciplina é obediência diária e pequena.", "Escolha um hábito para largar ou começar esta semana e conte a um amigo."],
      ["Dinheiro e Mordomia", "Tudo o que você tem foi confiado a você", "O que você possui é uma responsabilidade, não um troféu. Fiel no pouco é fiel no muito.", "Revise os gastos do último mês e separe uma primeira parte para doar."],
    ],
    women: [
      ["Sabedoria e Discernimento", "Falar e escolher com entendimento", "A sabedoria se pede e se recebe. A mulher sábia constrói seu lar com palavras gentis e escolhas claras.", "Antes de uma decisão hoje, pare e peça sabedoria a Deus."],
      ["Cura e Perdão", "Ele sara os quebrantados de coração", "A cura é lenta e santa. O perdão liberta você, mesmo quando a outra pessoa nunca pede desculpas.", "Escreva uma mágoa e entregue-a a Deus em oração."],
    ],
    youth: [
      ["Aprovação e Redes Sociais", "Para a opinião de quem você vive?", "Curtidas passam, mas seu valor foi definido por Deus. A comparação rouba a alegria.", "Fique um dia sem uma rede social e anote como se sente."],
      ["Chamado e Futuro", "Entregue seus planos ao Senhor", "Você não precisa do mapa inteiro. Entregue o próximo passo a Deus e caminhe com fidelidade.", "Escreva um sonho e ore por ele durante cinco minutos."],
    ],
    marriage: [
      ["Amizade e Intimidade", "Dois feitos para caminhar juntos", "Um casamento forte é construído sobre amizade. Interesse-se pelo seu cônjuge, não apenas esteja ao lado dele.", "Planeje uma hora juntos, sem celulares, esta semana."],
      ["Educar Juntos", "Criar os filhos como uma equipe", "Os filhos aprendem a fé vendo pais que amam a Deus e amam um ao outro.", "Combinem um valor que querem que os filhos vejam todos os dias."],
    ],
    kids: [
      ["Deus Fez Tudo", "O mundo mostra como Deus é grande", "Deus fez o céu, o mar e cada animal. Tudo o que você vê diz: Deus é bom e forte.", "Vá lá fora e diga cinco coisas que Deus fez. Agradeça por cada uma."],
    ],
    newBeliever: [
      ["Perdão e Recomeço", "Cada manhã é nova", "Quando você confessa, Ele perdoa e purifica. Seu passado não define você; a misericórdia Dele define.", "Confesse com sinceridade uma coisa em oração e receba o perdão Dele."],
    ],
  },
};
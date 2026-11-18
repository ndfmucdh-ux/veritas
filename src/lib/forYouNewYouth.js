import { Heart, Shield, BookOpen, Flame, Compass, Feather, Zap, Sprout } from "lucide-react";

// Youth: 8 more themes (with the 2 added in stage 1 this makes 10 new). 15 passages and 5 cross references each.
export const YOUTH_NEW_META = [
  { icon: Heart, photo: "candle", verses: ["Proverbs 4:23", "2 Corinthians 6:14", "Song of Solomon 2:7", "1 Timothy 5:2", "Proverbs 31:30", "Psalm 119:9", "1 Thessalonians 4:3-4", "Ecclesiastes 4:12", "Genesis 2:18", "Matthew 6:33", "Proverbs 18:22", "Ephesians 5:3", "1 Corinthians 13:4-7", "Proverbs 3:5-6", "Colossians 3:12-14"], cross: ["1 Corinthians 6:18-20", "Song of Solomon 8:4", "Philippians 4:8", "Psalm 37:4", "Romans 12:2"] },
  { icon: Shield, photo: "mountains", verses: ["Proverbs 1:10", "Exodus 23:2", "Romans 12:2", "Daniel 1:8", "Psalm 1:1-3", "Proverbs 13:20", "Galatians 1:10", "1 Peter 4:4", "Proverbs 4:14-15", "Matthew 7:13-14", "2 Timothy 2:22", "Joshua 24:15", "Acts 5:29", "Proverbs 29:25", "Ephesians 5:11"], cross: ["Daniel 3:16-18", "1 Corinthians 15:33", "Psalm 119:63", "1 John 2:15", "Matthew 10:32"] },
  { icon: BookOpen, photo: "chapel", verses: ["Proverbs 1:7", "Proverbs 2:1-6", "Proverbs 4:7", "Colossians 3:23", "Daniel 1:17", "2 Timothy 2:15", "Proverbs 18:15", "Proverbs 9:9", "Philippians 4:13", "James 1:5", "Proverbs 12:1", "Luke 2:52", "Proverbs 16:16", "Psalm 119:99-100", "Proverbs 22:17-19"], cross: ["Proverbs 3:13", "Romans 12:2", "1 Corinthians 1:25", "Ephesians 1:17", "Proverbs 10:14"] },
  { icon: Flame, photo: "ocean", verses: ["Ephesians 4:31-32", "Matthew 6:14-15", "Colossians 3:13", "Proverbs 15:1", "James 1:19-20", "Proverbs 29:11", "Matthew 18:21-22", "Psalm 37:8", "Romans 12:17-19", "Luke 6:27-28", "Proverbs 19:11", "Hebrews 12:15", "Mark 11:25", "Proverbs 14:29", "Luke 23:34"], cross: ["Genesis 50:20", "Matthew 5:44", "Ephesians 4:26", "1 Peter 3:9", "Psalm 103:8"] },
  { icon: Compass, photo: "starfield", verses: ["Mark 9:24", "John 20:27-29", "James 1:5-6", "Jude 1:22", "Matthew 14:31", "Proverbs 3:5-6", "Isaiah 1:18", "Psalm 119:105", "Luke 7:19-23", "1 Peter 3:15", "Jeremiah 29:13", "Acts 17:11", "Hebrews 11:6", "Psalm 94:19", "Matthew 28:17"], cross: ["Judges 6:36-40", "Psalm 77:11-12", "2 Corinthians 5:7", "Romans 10:17", "Luke 17:5"] },
  { icon: Feather, photo: "waterfall", verses: ["Psalm 95:1-6", "Psalm 96:1-3", "Colossians 3:16", "Ephesians 5:19", "Psalm 150:1-6", "John 4:23-24", "Romans 12:1", "Psalm 33:1-3", "Psalm 100:1-2", "Psalm 34:1", "Psalm 27:4", "Hebrews 13:15", "Psalm 40:3", "2 Samuel 6:14", "Psalm 63:1-3"], cross: ["Acts 16:25", "Isaiah 6:1-3", "Psalm 29:2", "Revelation 5:11-13", "Psalm 149:3"] },
  { icon: Zap, photo: "desert", verses: ["Romans 1:16", "2 Timothy 1:8", "Matthew 5:14-16", "Acts 4:19-20", "1 Peter 3:15", "Daniel 6:10", "Matthew 10:32-33", "Psalm 119:46", "Ephesians 6:13-14", "Mark 8:38", "Joshua 1:9", "Acts 4:13", "1 Corinthians 16:13", "2 Timothy 4:2", "Philippians 1:27"], cross: ["Acts 5:29", "Daniel 3:17-18", "Esther 4:16", "John 15:18-19", "Isaiah 50:7"] },
  { icon: Sprout, photo: "wheat", verses: ["Proverbs 24:16", "Micah 7:8", "Psalm 37:23-24", "Lamentations 3:22-23", "Philippians 3:13-14", "1 John 1:9", "Isaiah 43:18-19", "Romans 8:1", "Psalm 145:14", "John 21:15-17", "Jonah 3:1-2", "2 Corinthians 12:9", "Psalm 51:10-12", "Joel 2:25", "Romans 8:28"], cross: ["Luke 22:31-32", "Acts 15:37-39", "2 Timothy 4:11", "Psalm 40:2", "Isaiah 40:29-31"] },
];

// [label, description, reflection, practice]
export const YOUTH_NEW_TEXT = {
  en: [
    ["Dating and Relationships", "Guarding your heart with wisdom", "Love is worth waiting for and doing God's way. Respect, purity and shared faith protect a relationship.", "Write three values you want in a future relationship and pray over them."],
    ["Peer Pressure", "Standing firm when everyone moves", "You do not have to follow the crowd to belong. Real friends respect a person who stays true.", "Decide today one line you will not cross, and tell a trusted friend."],
    ["School and Learning", "Wisdom begins with God", "Study is a way to honor God with your mind. Diligence and curiosity honor Him in class too.", "Begin your next study session with a short prayer for focus."],
    ["Anger and Forgiveness", "Letting go of what weighs you down", "Forgiveness does not say it was fine. It says you will not be chained to it any longer.", "Name one person you need to forgive and pray for them by name."],
    ["Doubt and Questions", "God is not afraid of your questions", "Honest questions can lead to deeper faith. Thomas doubted, and Jesus met him with patience.", "Write down one question and bring it to a pastor or mentor this week."],
    ["Worship and Music", "A life that sings to God", "Worship is more than a song. It is giving God your attention, your gifts and your day.", "Play one worship song today and sing it back to God."],
    ["Standing Up for Faith", "Bold, kind and clear", "Being a light does not require being loud. Live honestly and be ready to explain your hope.", "Share one thing God has done for you with a friend this week."],
    ["Failure and Second Chances", "Falling is not the end", "The righteous fall and rise again. Peter failed and was restored. Grace has the last word.", "Name one failure, receive God's forgiveness and take the next small step."],
  ],
  es: [
    ["Noviazgo y Relaciones", "Guardar tu corazón con sabiduría", "El amor vale la pena esperarlo y vivirlo a la manera de Dios. El respeto, la pureza y la fe compartida protegen una relación.", "Escribe tres valores que quieres en una relación futura y ora por ellos."],
    ["Presión de Grupo", "Mantenerte firme cuando todos se mueven", "No necesitas seguir a la multitud para pertenecer. Los verdaderos amigos respetan a quien se mantiene fiel.", "Decide hoy una línea que no cruzarás y cuéntaselo a un amigo de confianza."],
    ["Escuela y Aprendizaje", "La sabiduría comienza con Dios", "Estudiar es una forma de honrar a Dios con tu mente. La diligencia y la curiosidad también lo honran en clase.", "Comienza tu próxima sesión de estudio con una breve oración por enfoque."],
    ["Enojo y Perdón", "Soltar lo que te pesa", "Perdonar no dice que estuvo bien. Dice que ya no estarás atado a ello.", "Nombra a una persona que necesitas perdonar y ora por ella por nombre."],
    ["Dudas y Preguntas", "Dios no teme a tus preguntas", "Las preguntas sinceras pueden llevar a una fe más profunda. Tomás dudó y Jesús lo recibió con paciencia.", "Escribe una pregunta y llévala esta semana a un pastor o mentor."],
    ["Adoración y Música", "Una vida que canta a Dios", "La adoración es más que una canción. Es darle a Dios tu atención, tus dones y tu día.", "Escucha hoy una canción de adoración y cántala a Dios."],
    ["Defender tu Fe", "Valiente, amable y claro", "Ser luz no requiere gritar. Vive con honestidad y está listo para explicar tu esperanza.", "Comparte esta semana con un amigo algo que Dios hizo por ti."],
    ["Fracaso y Segundas Oportunidades", "Caer no es el final", "El justo cae y vuelve a levantarse. Pedro falló y fue restaurado. La gracia tiene la última palabra.", "Nombra un fracaso, recibe el perdón de Dios y da el siguiente paso pequeño."],
  ],
  pt: [
    ["Namoro e Relacionamentos", "Guardar o coração com sabedoria", "O amor vale a espera e o jeito de Deus. Respeito, pureza e fé compartilhada protegem um relacionamento.", "Escreva três valores que você quer num relacionamento futuro e ore por eles."],
    ["Pressão dos Amigos", "Firme quando todos se movem", "Você não precisa seguir a multidão para pertencer. Amigos de verdade respeitam quem permanece fiel.", "Decida hoje uma linha que não vai cruzar e conte a um amigo de confiança."],
    ["Escola e Aprendizado", "A sabedoria começa em Deus", "Estudar é uma forma de honrar a Deus com a mente. Dedicação e curiosidade também o honram na aula.", "Comece sua próxima sessão de estudo com uma breve oração por foco."],
    ["Raiva e Perdão", "Soltar o que pesa em você", "Perdoar não diz que estava tudo bem. Diz que você não ficará mais preso a isso.", "Nomeie uma pessoa que precisa perdoar e ore por ela pelo nome."],
    ["Dúvidas e Perguntas", "Deus não teme suas perguntas", "Perguntas sinceras podem levar a uma fé mais profunda. Tomé duvidou e Jesus o recebeu com paciência.", "Escreva uma pergunta e leve a um pastor ou mentor esta semana."],
    ["Adoração e Música", "Uma vida que canta a Deus", "Adoração é mais que uma música. É entregar a Deus sua atenção, seus dons e seu dia.", "Ouça hoje uma música de adoração e cante-a a Deus."],
    ["Defender a Fé", "Corajoso, gentil e claro", "Ser luz não exige falar alto. Viva com honestidade e esteja pronto para explicar sua esperança.", "Compartilhe com um amigo, esta semana, algo que Deus fez por você."],
    ["Fracasso e Segundas Chances", "Cair não é o fim", "O justo cai e se levanta de novo. Pedro falhou e foi restaurado. A graça tem a última palavra.", "Nomeie um fracasso, receba o perdão de Deus e dê o próximo passo pequeno."],
  ],
};
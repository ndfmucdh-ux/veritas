import { Droplets, Flame, Users, Shield, Lock, Compass, Heart, Star, Sun } from "lucide-react";

// New Believer: 9 more themes (with the 1 added in stage 1 this makes 10 new). 15 passages and 5 cross references each.
export const NEWBELIEVER_NEW_META = [
  { icon: Droplets, photo: "ocean", verses: ["Matthew 28:19-20", "Acts 2:38", "Romans 6:3-4", "Mark 16:16", "Acts 8:36-38", "Galatians 3:27", "Colossians 2:12", "Matthew 3:13-17", "1 Peter 3:21", "Acts 10:47-48", "Acts 22:16", "Ephesians 4:4-6", "Acts 16:30-33", "John 3:5", "Titus 3:5"], cross: ["Acts 19:4-5", "1 Corinthians 12:13", "Romans 6:11", "2 Corinthians 5:17", "Mark 1:9-11"] },
  { icon: Flame, photo: "candle", verses: ["John 14:16-17", "John 14:26", "Acts 1:8", "Romans 8:14-16", "Galatians 5:22-25", "1 Corinthians 2:10-12", "Ephesians 1:13-14", "John 16:13", "Acts 2:1-4", "Romans 8:26", "1 Corinthians 6:19", "Ephesians 5:18", "2 Corinthians 3:17", "Luke 11:13", "1 John 4:13"], cross: ["Joel 2:28", "John 15:26", "Titus 3:5-6", "Ezekiel 36:26-27", "Romans 15:13"] },
  { icon: Users, photo: "sunrise", verses: ["Matthew 28:19-20", "Acts 1:8", "1 Peter 3:15", "Romans 1:16", "Mark 5:19", "John 4:28-30", "Matthew 5:14-16", "2 Corinthians 5:20", "Colossians 4:5-6", "Psalm 107:2", "Romans 10:14-15", "Acts 4:20", "Proverbs 11:30", "1 Corinthians 9:22", "2 Timothy 4:2"], cross: ["Isaiah 52:7", "Luke 24:47-48", "John 1:40-42", "Acts 8:35", "Mark 16:15"] },
  { icon: Shield, photo: "mountains", verses: ["Ephesians 6:10-18", "1 Peter 5:8-9", "James 4:7", "2 Corinthians 10:3-5", "Matthew 4:1-11", "Luke 4:13", "Hebrews 4:15-16", "Psalm 119:11", "1 John 4:4", "Romans 13:12", "1 Thessalonians 5:8", "Galatians 5:16-17", "2 Thessalonians 3:3", "Revelation 12:11", "Psalm 91:1-4"], cross: ["1 Corinthians 10:13", "Matthew 26:41", "Psalm 18:2", "Proverbs 18:10", "Colossians 2:15"] },
  { icon: Lock, photo: "dove", verses: ["John 10:27-29", "Romans 8:38-39", "1 John 5:13", "Philippians 1:6", "John 6:37", "Ephesians 1:13-14", "2 Timothy 1:12", "Romans 8:16", "Hebrews 7:25", "Jude 1:24", "John 5:24", "1 Peter 1:3-5", "Psalm 138:8", "Isaiah 41:10", "2 Corinthians 1:21-22"], cross: ["Hebrews 10:23", "Romans 5:1", "Titus 1:2", "John 14:2-3", "1 Thessalonians 5:23-24"] },
  { icon: Compass, photo: "forest", verses: ["Matthew 6:16-18", "Mark 1:35", "Psalm 1:2-3", "Joshua 1:8", "1 Timothy 4:7-8", "Matthew 6:6", "Isaiah 58:6", "Acts 13:2-3", "Psalm 63:1", "Hebrews 12:1", "Psalm 46:10", "1 Corinthians 9:25-27", "Colossians 3:16", "Luke 5:16", "Psalm 119:15"], cross: ["Daniel 9:3", "Ezra 8:23", "Psalm 27:4", "2 Timothy 2:15", "Matthew 4:2"] },
  { icon: Heart, photo: "wheat", verses: ["Galatians 5:13", "1 Peter 4:10-11", "Romans 12:6-8", "Mark 10:45", "2 Corinthians 9:6-8", "Matthew 25:35-40", "Acts 20:35", "Hebrews 13:16", "Colossians 3:23-24", "1 Corinthians 12:4-7", "Luke 6:38", "Proverbs 3:9-10", "John 13:14-15", "Ephesians 2:10", "James 2:15-17"], cross: ["Matthew 20:28", "Malachi 3:10", "Philippians 2:3-4", "1 John 3:17-18", "Acts 6:1-4"] },
  { icon: Star, photo: "lily", verses: ["2 Corinthians 5:17", "Galatians 2:20", "John 1:12", "Ephesians 2:10", "1 Peter 2:9", "Romans 8:15-17", "Colossians 3:3", "1 John 3:1-2", "Ephesians 1:3-7", "Galatians 3:26-29", "Philippians 3:20", "Romans 6:6-7", "Colossians 2:9-10", "John 15:15", "Psalm 139:13-14"], cross: ["Isaiah 43:1", "Romans 8:1", "Ephesians 2:6", "Titus 3:5-7", "1 Corinthians 6:11"] },
  { icon: Sun, photo: "waterfall", verses: ["Psalm 95:1-7", "John 4:23-24", "Romans 12:1", "Psalm 100:1-5", "Hebrews 13:15", "Colossians 3:16-17", "Psalm 29:2", "Psalm 34:1-3", "Revelation 4:11", "Psalm 96:1-9", "Ephesians 5:19-20", "1 Chronicles 16:29", "Psalm 145:1-3", "Isaiah 12:4-5", "1 Thessalonians 5:16-18"], cross: ["Exodus 15:2", "Psalm 150:6", "Acts 16:25", "Nehemiah 8:6", "Psalm 63:3-4"] },
];

// [label, description, reflection, practice]
export const NEWBELIEVER_NEW_TEXT = {
  en: [
    ["Baptism", "A public step of new life", "Baptism is a picture of dying with Christ and rising to new life. It is your public yes to Jesus.", "Talk to your pastor or a mature believer about being baptized."],
    ["The Holy Spirit", "God with you and in you", "The Spirit comforts, teaches and empowers you. You are never alone in your walk of faith.", "Pray, Holy Spirit, guide me today, and listen quietly for a minute."],
    ["Sharing Your Faith", "Telling your story with love", "You do not need to be an expert. Share what Jesus has done in your life, simply and kindly.", "Write three sentences about how God changed you and share them with one person."],
    ["Spiritual Armor", "Standing firm against temptation", "Temptation is real, but so is God's power. Truth, faith and prayer are your armor.", "Memorize one verse to speak when you feel tempted."],
    ["Assurance of Salvation", "Held securely in His hand", "Your salvation depends on Christ's finished work, not your performance. You can rest.", "Read John 10:27-29 slowly and thank God that He holds you."],
    ["Spiritual Habits", "Prayer, fasting and quiet time", "Habits do not earn God's love. They make room for it. Start small and stay faithful.", "Set a daily ten-minute time with God and keep it for a week."],
    ["Serving and Giving", "Using what you have for others", "Every believer has gifts. Serving is where faith becomes visible and joyful.", "Offer your help to one need in your church or neighborhood."],
    ["Your New Identity", "Who you are in Christ", "You are chosen, forgiven and loved. Your new identity is a gift, not an achievement.", "Write: I am a child of God, and post it where you will see it daily."],
    ["Worship and Thanksgiving", "A heart that honors Him", "Worship is a way of life, not just a song. Thanksgiving opens your eyes to His goodness.", "Thank God out loud for five specific things today."],
  ],
  es: [
    ["El Bautismo", "Un paso público de vida nueva", "El bautismo es una imagen de morir con Cristo y resucitar a vida nueva. Es tu sí público a Jesús.", "Habla con tu pastor o con un creyente maduro sobre bautizarte."],
    ["El Espíritu Santo", "Dios contigo y en ti", "El Espíritu consuela, enseña y fortalece. Nunca estás solo en tu camino de fe.", "Ora: Espíritu Santo, guíame hoy, y escucha en silencio un minuto."],
    ["Compartir tu Fe", "Contar tu historia con amor", "No necesitas ser experto. Comparte lo que Jesús ha hecho en tu vida, con sencillez y amabilidad.", "Escribe tres frases sobre cómo Dios te cambió y compártelas con una persona."],
    ["La Armadura Espiritual", "Resistir firme la tentación", "La tentación es real, pero también el poder de Dios. La verdad, la fe y la oración son tu armadura.", "Memoriza un versículo para decir cuando te sientas tentado."],
    ["Seguridad de Salvación", "Sostenido con firmeza en Su mano", "Tu salvación depende de la obra terminada de Cristo, no de tu desempeño. Puedes descansar.", "Lee Juan 10:27-29 despacio y agradece a Dios que te sostiene."],
    ["Hábitos Espirituales", "Oración, ayuno y tiempo a solas", "Los hábitos no ganan el amor de Dios. Le hacen espacio. Empieza poco a poco y sé constante.", "Fija diez minutos diarios con Dios y mantenlos por una semana."],
    ["Servir y Dar", "Usar lo que tienes por otros", "Todo creyente tiene dones. Servir es donde la fe se hace visible y alegre.", "Ofrece tu ayuda a una necesidad en tu iglesia o vecindario."],
    ["Tu Nueva Identidad", "Quién eres en Cristo", "Eres elegido, perdonado y amado. Tu nueva identidad es un regalo, no un logro.", "Escribe: Soy hijo de Dios, y ponlo donde lo veas cada día."],
    ["Adoración y Gratitud", "Un corazón que lo honra", "La adoración es un estilo de vida, no solo una canción. La gratitud abre tus ojos a Su bondad.", "Da gracias a Dios en voz alta por cinco cosas concretas hoy."],
  ],
  pt: [
    ["O Batismo", "Um passo público de vida nova", "O batismo é uma imagem de morrer com Cristo e ressurgir para uma vida nova. É o seu sim público a Jesus.", "Converse com seu pastor ou com um irmão maduro sobre ser batizado."],
    ["O Espírito Santo", "Deus com você e em você", "O Espírito consola, ensina e fortalece. Você nunca está só na sua caminhada de fé.", "Ore: Espírito Santo, guia-me hoje, e escute em silêncio por um minuto."],
    ["Compartilhar sua Fé", "Contar sua história com amor", "Você não precisa ser especialista. Compartilhe o que Jesus fez na sua vida, com simplicidade e gentileza.", "Escreva três frases sobre como Deus mudou você e compartilhe com uma pessoa."],
    ["A Armadura Espiritual", "Resistir firme à tentação", "A tentação é real, mas o poder de Deus também. Verdade, fé e oração são sua armadura.", "Memorize um versículo para dizer quando se sentir tentado."],
    ["Segurança da Salvação", "Seguro na mão Dele", "Sua salvação depende da obra completa de Cristo, não do seu desempenho. Você pode descansar.", "Leia João 10:27-29 devagar e agradeça a Deus por segurar você."],
    ["Hábitos Espirituais", "Oração, jejum e tempo a sós", "Hábitos não ganham o amor de Deus. Eles abrem espaço para ele. Comece pequeno e seja fiel.", "Defina dez minutos diários com Deus e mantenha por uma semana."],
    ["Servir e Doar", "Usar o que você tem pelos outros", "Todo cristão tem dons. Servir é onde a fé se torna visível e alegre.", "Ofereça sua ajuda a uma necessidade na sua igreja ou vizinhança."],
    ["Sua Nova Identidade", "Quem você é em Cristo", "Você é escolhido, perdoado e amado. Sua nova identidade é um presente, não uma conquista.", "Escreva: Sou filho de Deus, e coloque onde você veja todo dia."],
    ["Adoração e Gratidão", "Um coração que o honra", "Adoração é um estilo de vida, não só uma música. A gratidão abre seus olhos para a bondade Dele.", "Agradeça a Deus em voz alta por cinco coisas específicas hoje."],
  ],
};
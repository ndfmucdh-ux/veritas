import { Feather, Smile, Users, Star, Heart, Sun, BookOpen, Compass, Flame } from "lucide-react";

// Kids: 9 more themes (with the 1 added in stage 1 this makes 10 new). 15 passages and 5 cross references each.
export const KIDS_NEW_META = [
  { icon: Feather, photo: "candle", verses: ["Matthew 6:9-13", "Philippians 4:6", "Psalm 145:18", "Jeremiah 33:3", "1 Thessalonians 5:17", "Luke 11:9-10", "Psalm 5:3", "Mark 10:14-16", "Psalm 55:17", "1 Samuel 12:23", "James 5:16", "Psalm 17:6", "Psalm 34:15", "Matthew 7:7-8", "Psalm 62:8"], cross: ["Matthew 6:6", "Psalm 66:19-20", "Luke 18:1", "Hebrews 4:16", "1 John 5:14"] },
  { icon: Smile, photo: "lily", verses: ["Mark 10:13-16", "Matthew 18:2-5", "Matthew 19:14", "Luke 18:15-17", "John 6:9-11", "Psalm 8:2", "Matthew 21:15-16", "Luke 2:46-47", "Luke 2:40", "Psalm 127:3", "Isaiah 11:6", "Matthew 18:10", "1 John 3:1", "Psalm 34:11", "Jeremiah 1:7"], cross: ["Matthew 11:25", "1 Samuel 3:4-10", "2 Kings 5:2-3", "Psalm 22:9-10", "Mark 9:36-37"] },
  { icon: Users, photo: "forest", verses: ["Proverbs 17:17", "Proverbs 18:24", "Ecclesiastes 4:9-10", "John 15:12-14", "Proverbs 27:17", "1 Samuel 18:1-3", "Proverbs 12:26", "Romans 12:10", "Proverbs 13:20", "1 Thessalonians 5:11", "Ruth 1:16", "Proverbs 27:9", "Psalm 133:1", "Hebrews 10:24", "Colossians 3:13"], cross: ["Luke 6:31", "John 15:15", "Galatians 6:2", "1 Corinthians 15:33", "Matthew 5:9"] },
  { icon: Star, photo: "mountains", verses: ["Proverbs 12:22", "Ephesians 4:25", "Proverbs 11:3", "Exodus 20:16", "Psalm 15:1-2", "Proverbs 10:9", "Colossians 3:9", "Proverbs 19:1", "Zechariah 8:16", "Proverbs 24:26", "Matthew 5:37", "Proverbs 16:11", "Psalm 51:6", "John 8:32", "3 John 1:4"], cross: ["Proverbs 6:16-17", "Luke 16:10", "Psalm 24:3-4", "Proverbs 20:7", "John 14:6"] },
  { icon: Heart, photo: "wheat", verses: ["Acts 20:35", "2 Corinthians 9:7", "Proverbs 11:25", "Luke 6:38", "Proverbs 22:9", "Luke 3:11", "Hebrews 13:16", "Proverbs 19:17", "1 Timothy 6:18", "John 6:9-13", "Mark 12:41-44", "Proverbs 3:27", "Matthew 10:8", "1 John 3:17", "Proverbs 21:26"], cross: ["Malachi 3:10", "Luke 21:1-4", "Psalm 112:9", "1 Chronicles 29:14", "Matthew 6:3-4"] },
  { icon: Sun, photo: "sunrise", verses: ["Matthew 6:26", "Matthew 10:29-31", "Psalm 23:1-3", "Psalm 121:3-4", "Luke 12:6-7", "1 Peter 5:7", "Psalm 139:1-4", "Psalm 91:11-12", "Isaiah 49:15-16", "Psalm 34:7", "Psalm 3:5", "Matthew 6:28-30", "Philippians 4:19", "Psalm 147:3-4", "Isaiah 46:4"], cross: ["Psalm 56:8", "Zephaniah 3:17", "Psalm 145:15-16", "Matthew 7:11", "John 10:11"] },
  { icon: BookOpen, photo: "chapel", verses: ["1 Samuel 17:45", "Daniel 6:22", "Esther 4:16", "Genesis 50:20", "Exodus 3:10-12", "Joshua 6:2", "Judges 7:7", "Ruth 1:16", "Luke 1:38", "Acts 16:25-26", "Hebrews 11:32-34", "Genesis 22:12", "2 Kings 22:1-2", "Jeremiah 1:7-8", "Psalm 78:4"], cross: ["Hebrews 11:1-2", "Romans 15:4", "1 Corinthians 10:11", "Psalm 77:11-12", "James 5:10-11"] },
  { icon: Compass, photo: "starfield", verses: ["Proverbs 3:5-6", "Proverbs 1:7", "Proverbs 4:7", "James 1:5", "Psalm 119:105", "Proverbs 2:6", "Proverbs 16:3", "Proverbs 14:12", "Psalm 32:8", "Proverbs 13:20", "Proverbs 19:20", "Proverbs 22:6", "Psalm 37:23", "Ecclesiastes 12:13", "Psalm 25:4-5"], cross: ["Joshua 1:8", "Proverbs 9:10", "Isaiah 30:21", "Matthew 7:24-25", "Luke 2:52"] },
  { icon: Flame, photo: "waterfall", verses: ["Psalm 100:1-2", "Psalm 98:1", "Psalm 95:1", "Psalm 47:1", "Psalm 149:3", "Psalm 150:1-6", "Psalm 9:1-2", "Psalm 33:3", "Psalm 66:1-2", "Psalm 96:1-2", "Psalm 108:1", "Psalm 59:16", "Psalm 92:1-2", "Psalm 135:3", "Psalm 21:13"], cross: ["Exodus 15:1", "Colossians 3:16", "Acts 16:25", "Ephesians 5:19", "Psalm 40:3"] },
];

// [label, description, reflection, practice]
export const KIDS_NEW_TEXT = {
  en: [
    ["Talking to God", "Prayer is like talking to a friend", "You can talk to God anytime, anywhere. He always listens and loves to hear from you.", "Say a short prayer of thanks before you eat and before you sleep today."],
    ["Jesus Loves Children", "You are special to Jesus", "Jesus hugged children and blessed them. You are important to Him just as you are.", "Draw a picture of Jesus with children and tell someone what it means."],
    ["Good Friends", "Being a friend and finding one", "A good friend is kind, loyal and tells the truth. Jesus is the best friend of all.", "Do one kind thing for a friend or classmate today."],
    ["Telling the Truth", "Honest words make God happy", "Telling the truth takes courage, but it keeps you free and trusted.", "If you made a mistake, tell a grown-up the truth and say sorry."],
    ["Sharing and Giving", "Giving makes hearts happy", "God gives us so much, and we can share with others. A small gift given with love is big to God.", "Choose a toy or snack to share with someone today."],
    ["God Takes Care of Me", "He knows you and watches over you", "God feeds the birds and He cares even more for you. You never have to be afraid.", "Name three things God gave you today and say thank you."],
    ["Heroes of the Bible", "Ordinary people, a great God", "David, Esther and Daniel were brave because God was with them. He is with you too.", "Pick a Bible hero and act out their story with your family."],
    ["Making Good Choices", "God's Word lights my way", "Every day we choose what to do. The Bible helps us choose well.", "Before you decide something today, stop and ask God to help you."],
    ["Singing to God", "Joyful songs for a great God", "Singing is a way to say thank you. God loves it when we praise Him with joy.", "Sing your favorite song to God with your family."],
  ],
  es: [
    ["Hablar con Dios", "Orar es como hablar con un amigo", "Puedes hablar con Dios en cualquier momento y lugar. Él siempre escucha y le encanta oírte.", "Haz hoy una oración corta de gracias antes de comer y antes de dormir."],
    ["Jesús Ama a los Niños", "Eres especial para Jesús", "Jesús abrazó a los niños y los bendijo. Eres importante para Él tal como eres.", "Dibuja a Jesús con los niños y cuéntale a alguien lo que significa."],
    ["Buenos Amigos", "Ser amigo y encontrar uno", "Un buen amigo es amable, leal y dice la verdad. Jesús es el mejor amigo de todos.", "Haz hoy algo amable por un amigo o compañero."],
    ["Decir la Verdad", "Las palabras honestas alegran a Dios", "Decir la verdad requiere valentía, pero te mantiene libre y confiable.", "Si cometiste un error, dile la verdad a un adulto y pide perdón."],
    ["Compartir y Dar", "Dar alegra el corazón", "Dios nos da tanto, y podemos compartir con otros. Un regalo pequeño dado con amor es grande para Dios.", "Elige hoy un juguete o merienda para compartir con alguien."],
    ["Dios Cuida de Mí", "Él te conoce y te cuida", "Dios alimenta a las aves y se preocupa aún más por ti. Nunca tienes que tener miedo.", "Nombra tres cosas que Dios te dio hoy y da las gracias."],
    ["Héroes de la Biblia", "Gente común, un Dios grande", "David, Ester y Daniel fueron valientes porque Dios estaba con ellos. También está contigo.", "Elige un héroe de la Biblia y representen su historia en familia."],
    ["Tomar Buenas Decisiones", "La Palabra de Dios alumbra mi camino", "Cada día elegimos qué hacer. La Biblia nos ayuda a elegir bien.", "Antes de decidir algo hoy, detente y pide ayuda a Dios."],
    ["Cantar a Dios", "Canciones alegres para un gran Dios", "Cantar es una forma de dar gracias. A Dios le encanta que lo alabemos con alegría.", "Canta tu canción favorita a Dios con tu familia."],
  ],
  pt: [
    ["Falar com Deus", "Orar é como conversar com um amigo", "Você pode falar com Deus a qualquer hora e em qualquer lugar. Ele sempre escuta e adora ouvir você.", "Faça hoje uma oração curta de gratidão antes de comer e antes de dormir."],
    ["Jesus Ama as Crianças", "Você é especial para Jesus", "Jesus abraçou as crianças e as abençoou. Você é importante para Ele do jeito que é.", "Desenhe Jesus com as crianças e conte a alguém o que isso significa."],
    ["Bons Amigos", "Ser amigo e encontrar um", "Um bom amigo é gentil, leal e fala a verdade. Jesus é o melhor amigo de todos.", "Faça hoje uma coisa gentil por um amigo ou colega."],
    ["Dizer a Verdade", "Palavras honestas alegram a Deus", "Dizer a verdade exige coragem, mas mantém você livre e confiável.", "Se você errou, conte a verdade a um adulto e peça desculpas."],
    ["Compartilhar e Dar", "Dar alegra o coração", "Deus nos dá tanto e podemos compartilhar com os outros. Um presente pequeno dado com amor é grande para Deus.", "Escolha hoje um brinquedo ou lanche para compartilhar com alguém."],
    ["Deus Cuida de Mim", "Ele conhece você e cuida de você", "Deus alimenta os pássaros e cuida ainda mais de você. Você nunca precisa ter medo.", "Diga três coisas que Deus lhe deu hoje e agradeça."],
    ["Heróis da Bíblia", "Pessoas comuns, um Deus grande", "Davi, Ester e Daniel foram corajosos porque Deus estava com eles. Ele também está com você.", "Escolha um herói da Bíblia e encenem a história em família."],
    ["Fazer Boas Escolhas", "A Palavra de Deus ilumina meu caminho", "Todo dia escolhemos o que fazer. A Bíblia nos ajuda a escolher bem.", "Antes de decidir algo hoje, pare e peça ajuda a Deus."],
    ["Cantar para Deus", "Canções alegres para um grande Deus", "Cantar é um jeito de agradecer. Deus ama quando o louvamos com alegria.", "Cante sua música favorita para Deus com a sua família."],
  ],
};
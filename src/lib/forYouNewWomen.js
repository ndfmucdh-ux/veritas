import { Users, Moon, Home, Star, Compass, Heart, Sun, Sprout } from "lucide-react";

// Women: 8 more themes (with the 2 added in stage 1 this makes 10 new). 15 passages and 5 cross references each.
export const WOMEN_NEW_META = [
  { icon: Users, photo: "lily", verses: ["Ruth 1:16-17", "Proverbs 17:17", "Proverbs 27:9", "Ecclesiastes 4:9-10", "Luke 1:39-45", "Proverbs 18:24", "John 15:13-15", "Romans 12:15", "Hebrews 10:24-25", "1 Thessalonians 5:11", "Galatians 6:2", "Proverbs 27:17", "Titus 2:3-4", "Philippians 2:1-2", "Colossians 3:13"], cross: ["1 Samuel 18:1", "Acts 16:40", "Romans 16:3-4", "Psalm 133:1", "1 Peter 4:9"] },
  { icon: Moon, photo: "sunrise", verses: ["1 Corinthians 7:34", "Psalm 27:14", "Isaiah 40:31", "Lamentations 3:25-26", "Psalm 37:7", "Psalm 84:11", "Isaiah 54:5", "Psalm 16:11", "Philippians 4:11-13", "Proverbs 3:5-6", "Psalm 34:10", "Habakkuk 2:3", "Psalm 62:5", "Romans 8:25", "Isaiah 30:18"], cross: ["Genesis 2:18", "Matthew 6:33", "Psalm 145:19", "Jeremiah 29:11", "Ecclesiastes 3:11"] },
  { icon: Home, photo: "wheat", verses: ["Romans 12:13", "Hebrews 13:2", "1 Peter 4:9-10", "Genesis 18:1-8", "Luke 10:38-42", "2 Kings 4:8-10", "Proverbs 31:20", "Acts 16:15", "Matthew 25:35", "Proverbs 11:25", "2 Corinthians 9:7", "Luke 14:12-14", "Titus 1:8", "3 John 1:5-8", "Proverbs 22:9"], cross: ["Leviticus 19:34", "Isaiah 58:10", "1 Timothy 5:10", "Matthew 10:42", "Acts 2:46"] },
  { icon: Star, photo: "candle", verses: ["Galatians 6:4", "2 Corinthians 10:12", "Psalm 139:13-14", "Proverbs 14:30", "1 Samuel 16:7", "Psalm 34:5", "Isaiah 43:4", "Romans 8:1", "Ephesians 1:6", "Psalm 17:8", "Proverbs 31:30", "Song of Solomon 4:7", "1 Peter 3:3-4", "Galatians 1:10", "Psalm 27:10"], cross: ["John 10:10", "James 3:16", "Hebrews 12:1-2", "Psalm 18:19", "1 Corinthians 15:10"] },
  { icon: Compass, photo: "mountains", verses: ["Proverbs 31:16-18", "Colossians 3:23-24", "Exodus 35:25-26", "Acts 18:2-3", "Judges 4:4-5", "Proverbs 14:23", "Ecclesiastes 9:10", "Psalm 90:17", "Romans 12:6-8", "1 Corinthians 12:4-7", "Proverbs 31:24", "Galatians 6:9", "2 Thessalonians 1:11", "Ephesians 2:10", "Proverbs 16:3"], cross: ["1 Peter 4:10", "Matthew 25:21", "Luke 8:2-3", "Philippians 4:13", "Proverbs 22:29"] },
  { icon: Heart, photo: "ocean", verses: ["Psalm 34:18", "Matthew 5:4", "2 Corinthians 1:3-4", "Psalm 30:5", "Isaiah 61:1-3", "Revelation 21:4", "Psalm 56:8", "John 11:35", "Psalm 147:3", "John 14:18", "Romans 12:15", "Psalm 23:4", "Isaiah 43:2", "1 Thessalonians 4:13-14", "Psalm 73:26"], cross: ["John 16:20-22", "Psalm 126:5", "Lamentations 3:31-33", "Isaiah 66:13", "Psalm 119:50"] },
  { icon: Sun, photo: "waterfall", verses: ["Psalm 34:1-3", "Psalm 150:6", "1 Samuel 2:1-2", "Luke 1:46-47", "Psalm 103:1-5", "Psalm 100:1-5", "Exodus 15:20-21", "Psalm 63:3-4", "Philippians 4:4", "1 Thessalonians 5:18", "Psalm 118:24", "Habakkuk 3:17-18", "Psalm 145:1-3", "Colossians 3:16", "Isaiah 12:2-5"], cross: ["Psalm 40:3", "Hebrews 13:15", "Ephesians 5:19-20", "Psalm 9:1-2", "Nehemiah 8:10"] },
  { icon: Sprout, photo: "forest", verses: ["Titus 2:3-5", "2 Timothy 1:5", "Proverbs 31:26", "Psalm 71:17-18", "Ruth 4:14-15", "Proverbs 1:8-9", "Acts 18:26", "Psalm 145:4", "Deuteronomy 6:6-7", "2 Timothy 3:14-15", "Psalm 78:4", "Proverbs 31:28", "3 John 1:4", "1 Corinthians 4:15-16", "Philippians 3:17"], cross: ["Exodus 2:9", "Joel 1:3", "Isaiah 54:13", "Proverbs 22:6", "Luke 1:41-45"] },
];

// [label, description, reflection, practice]
export const WOMEN_NEW_TEXT = {
  en: [
    ["Friendship and Sisterhood", "Walking together in faith", "Good friends sharpen, comfort and pray. God often shows His love through the women He places beside you.", "Send an encouraging message to a friend and ask how you can pray."],
    ["Singleness and Waiting", "Trusting His timing", "Waiting is not wasted. God is writing your story and He is near in every season, married or single.", "Thank God for one good thing in your current season."],
    ["Hospitality and Generosity", "An open home and an open heart", "Hospitality is love made practical. A simple meal and a warm welcome can show someone Christ.", "Invite someone for coffee or a meal this week."],
    ["Beyond Comparison", "Free from measuring yourself", "Comparison steals joy and hides your calling. You are known, chosen and enough in Christ.", "Replace one comparing thought today with a verse about who you are."],
    ["Work and Calling", "Your gifts for His glory", "Whether at home, at work or in ministry, your work matters to God. Do it with skill and thanks.", "Offer today's main task to God before you begin it."],
    ["Grief and Comfort", "God draws near to the brokenhearted", "Jesus wept. He does not rush your grief. He sits with you and comforts you in it.", "Tell God honestly what you miss, and let yourself rest in His comfort."],
    ["Praise and Gratitude", "A heart that sings", "Praise changes the atmosphere. Gratitude turns attention from what is missing to what God has given.", "Write down five gifts from God today and thank Him aloud."],
    ["Mentoring and Legacy", "Passing faith to the next generation", "Older women teaching younger women builds the church. Share your story, your mistakes and God's faithfulness.", "Reach out to a younger woman and offer to pray with her."],
  ],
  es: [
    ["Amistad y Hermandad", "Caminar juntas en la fe", "Las buenas amigas afinan, consuelan y oran. Dios muestra Su amor a través de las mujeres que pone a tu lado.", "Envía un mensaje de ánimo a una amiga y pregúntale cómo orar por ella."],
    ["Soltería y Espera", "Confiar en Su tiempo", "La espera no es tiempo perdido. Dios escribe tu historia y está cerca en cada etapa, casada o soltera.", "Da gracias a Dios por algo bueno de tu etapa actual."],
    ["Hospitalidad y Generosidad", "Un hogar y un corazón abiertos", "La hospitalidad es amor hecho práctico. Una comida sencilla y una bienvenida cálida pueden mostrar a Cristo.", "Invita a alguien a un café o a comer esta semana."],
    ["Más Allá de la Comparación", "Libre de medirte con otras", "La comparación roba el gozo y esconde tu llamado. En Cristo eres conocida, elegida y suficiente.", "Reemplaza hoy un pensamiento de comparación con un versículo sobre quién eres."],
    ["Trabajo y Llamado", "Tus dones para Su gloria", "En casa, en el trabajo o en el ministerio, tu labor importa a Dios. Hazla con excelencia y gratitud.", "Ofrece a Dios la tarea principal de hoy antes de empezarla."],
    ["Duelo y Consuelo", "Dios se acerca a los quebrantados", "Jesús lloró. Él no apresura tu duelo. Se sienta contigo y te consuela en él.", "Dile a Dios con sinceridad lo que extrañas y descansa en Su consuelo."],
    ["Alabanza y Gratitud", "Un corazón que canta", "La alabanza cambia el ambiente. La gratitud pasa la mirada de lo que falta a lo que Dios ha dado.", "Escribe cinco regalos de Dios hoy y dale gracias en voz alta."],
    ["Mentoría y Legado", "Transmitir la fe a la próxima generación", "Las mujeres mayores que enseñan a las más jóvenes edifican la iglesia. Comparte tu historia, tus errores y la fidelidad de Dios.", "Escribe a una mujer más joven y ofrécele orar con ella."],
  ],
  pt: [
    ["Amizade e Irmandade", "Caminhar juntas na fé", "Boas amigas aperfeiçoam, consolam e oram. Deus mostra Seu amor pelas mulheres que coloca ao seu lado.", "Envie uma mensagem de ânimo a uma amiga e pergunte como orar por ela."],
    ["Solteirice e Espera", "Confiar no tempo Dele", "A espera não é tempo perdido. Deus escreve sua história e está perto em cada fase, casada ou solteira.", "Agradeça a Deus por algo bom da sua fase atual."],
    ["Hospitalidade e Generosidade", "Um lar e um coração abertos", "Hospitalidade é amor posto em prática. Uma refeição simples e uma recepção calorosa podem mostrar Cristo.", "Convide alguém para um café ou uma refeição esta semana."],
    ["Além da Comparação", "Livre de se medir com os outros", "A comparação rouba a alegria e esconde seu chamado. Em Cristo você é conhecida, escolhida e suficiente.", "Troque hoje um pensamento de comparação por um versículo sobre quem você é."],
    ["Trabalho e Chamado", "Seus dons para a glória Dele", "Em casa, no trabalho ou no ministério, seu trabalho importa para Deus. Faça com excelência e gratidão.", "Ofereça a Deus a tarefa principal de hoje antes de começar."],
    ["Luto e Consolo", "Deus se aproxima dos quebrantados", "Jesus chorou. Ele não apressa o seu luto. Ele se senta com você e consola.", "Diga a Deus com sinceridade o que você sente falta e descanse no consolo Dele."],
    ["Louvor e Gratidão", "Um coração que canta", "O louvor muda o ambiente. A gratidão tira o olhar do que falta e o leva ao que Deus deu.", "Escreva cinco presentes de Deus hoje e agradeça em voz alta."],
    ["Mentoria e Legado", "Passar a fé à próxima geração", "Mulheres mais velhas ensinando as mais jovens edificam a igreja. Compartilhe sua história, seus erros e a fidelidade de Deus.", "Procure uma mulher mais jovem e ofereça-se para orar com ela."],
  ],
};
import { STAGE1_TEXT } from "@/lib/forYouStage1";

// For You text. English and Spanish are complete; other languages show the English text
// (titles, buttons and book names are translated everywhere).
// Each theme is [label, description, reflection, practice].
export const FOR_YOU_TEXT = {
  en: {
    men: {
      sub: "Strength, purpose and unshakable faith",
      intro: "Scripture calls men to stand firm for their family, community and faith. These passages equip you with wisdom and strength.",
      keyText: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.",
      qs: ["Where do I need courage today?", "Who is walking beside me in faith?", "What one habit would make me a better leader at home?"],
      themes: [
        ["Leadership and Character", "The calling of a man of integrity", "Real leadership starts with who you are when no one is watching. Strength is measured by faithfulness, not volume.", "Choose one decision today where you will quietly do the right thing."],
        ["Strength in Trials", "Firm faith in the middle of adversity", "Pressure is not a sign God has left. It is where endurance and character are built.", "Name the hardest thing this week and pray over it for five minutes."],
        ["Family and Fatherhood", "A father after God's own heart", "A father shapes a home by presence, patience and prayer far more than by rules.", "Give each person in your home ten undivided minutes today."],
        ["Divine Purpose", "Walking in your unique calling", "You were made on purpose for good works prepared ahead of time. Purpose is lived daily.", "Write one sentence about what you believe God asks of you this season."],
        ["Integrity at Work", "Honest work done for the Lord", "Your work is worship when it is done honestly and with excellence, even unseen.", "Do one task today with extra care, as if the Lord were your only manager."],
        ["Brotherhood", "Iron sharpens iron", "Faith grows in company. A trusted friend tells you the truth and carries you when you are tired.", "Message one man today and ask how you can pray for him."],
      ],
    },
    women: {
      sub: "Grace, strength and inner beauty",
      intro: "You are designed with unique beauty and strength. These passages remind you who you are in God's eyes.",
      keyText: "Strength and honour are her clothing; and she shall rejoice in time to come.",
      qs: ["What does God say about me that I forget?", "Where do I need His peace today?", "Who can I encourage this week?"],
      themes: [
        ["Identity in the Father", "Your worth does not come from the world", "You are made in God's image and known completely. Your value was settled before anyone's opinion.", "Say aloud one truth about yourself from Psalm 139."],
        ["Courageous Woman", "Women who changed history", "Deborah, Ruth and the woman of Proverbs 31 show that courage often looks like faithfulness in ordinary moments.", "Take one small brave step you have been postponing."],
        ["Inner Peace", "The peace that surpasses understanding", "Peace is not the absence of problems. It is trusting that He holds them with you.", "Breathe slowly and pray Philippians 4:6-7 over one worry."],
        ["Faith and Prayer", "Women of powerful prayer", "Hannah and Mary teach us that honest, persistent prayer is never wasted.", "Pray for someone by name before you check your phone."],
        ["Nurture and Motherhood", "Love that shapes the next generation", "Faith is often passed on quietly, through the daily example of a mother or grandmother.", "Tell someone younger what God has done in your life."],
        ["Rest and Renewal", "Come to Him and be refreshed", "You were never meant to carry everything. Rest is an act of trust, not laziness.", "Schedule thirty minutes of real rest and keep it."],
      ],
    },
    youth: {
      sub: "Identity, purpose and bold faith",
      intro: "Youth is a time of foundations. Scripture speaks directly about your identity, purpose and calling.",
      keyText: "Let no man despise thy youth; but be thou an example of the believers, in word, in conversation, in charity, in spirit, in faith, in purity.",
      qs: ["Who am I when no one is watching?", "Which friendships pull me closer to God?", "What am I afraid to ask Him for?"],
      themes: [
        ["Your Identity in Christ", "You are not what the world says", "Before any label, you were known and chosen. Your age does not limit what God can do through you.", "Write three lies you believe and a verse that answers each."],
        ["Wise Decisions", "How to choose with faith", "Wisdom is asked for, not guessed. God gives it generously to anyone who asks.", "Before your next big decision, pray James 1:5 and wait a day."],
        ["Friendships and Relationships", "Relationships that build you up", "Your closest friends shape your direction. Choose, and be, the kind of friend Proverbs describes.", "Encourage one friend with a real message today."],
        ["Bold Faith", "A faith that moves mountains", "Faith does not need to be big, only real. Start with the mountain in front of you.", "Ask God for one specific thing and write it down."],
        ["Purity and Temptation", "Walk clean in a loud world", "God always provides a way out. Guarding your heart is about freedom, not restriction.", "Remove one thing from your phone that drags you down."],
        ["Anxiety and Peace of Mind", "Hand your worries to Him", "You are allowed to feel overwhelmed and bring it to God. He cares, and so do the people around you.", "Pray 1 Peter 5:7 and talk to a trusted adult about what weighs on you."],
      ],
    },
    kids: {
      sub: "Stories of faith, love and courage",
      intro: "God loves children deeply. These stories and verses are perfect for learning about His love and care.",
      keyText: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
      qs: ["Who loves me very much?", "What is one kind thing I can do today?", "What can I say to God when I feel scared?"],
      themes: [
        ["God Loves Us", "God's love lasts forever", "Nothing you do can make God stop loving you. He loved you before you were born.", "Tell someone at home today: God loves you!"],
        ["Great Stories", "Heroes of the Bible", "Daniel, David and Jonah were brave because God was with them, not because they were strong.", "Act out your favorite Bible story with a family member."],
        ["Being Kind", "How to treat others", "Kindness is love you can see. Small kind acts make God's love easy to notice.", "Do one secret kind thing for someone today."],
        ["Do Not Be Afraid", "God is always with you", "When you are scared you can talk to God. He is closer than the dark and stronger than any fear.", "Learn Isaiah 41:10 and say it at bedtime."],
        ["Listen and Obey", "Learning to hear God and parents", "Young Samuel listened and said, Speak, Lord. Listening is how friendship with God grows.", "Say, Speak, Lord, I am listening, before bed tonight."],
        ["Thankful Hearts", "Saying thank you to God", "A thankful heart sees blessings everywhere. Every day is a gift from God.", "Name three things you are thankful for at dinner."],
      ],
    },
    marriage: {
      sub: "A sacred covenant of love and service",
      intro: "Marriage is a picture of God's love for His people. These passages will build and strengthen your covenant.",
      keyText: "Beareth all things, believeth all things, hopeth all things, endureth all things.",
      qs: ["How did I serve my spouse this week?", "What do I need to forgive or ask forgiveness for?", "When did we last pray together?"],
      themes: [
        ["God's Design for Marriage", "God established the covenant", "Marriage is more than a contract. It is two lives joined by God to become one.", "Tell your spouse one reason you would choose them again."],
        ["Love that Serves", "Love that builds up the other", "Love in marriage is the daily choice to put the other first, in small things.", "Do one chore today without being asked."],
        ["Communication and Forgiveness", "Heal and grow together", "Gentle words turn away anger. Forgiveness is how love renews itself.", "Resolve one small tension before sunset."],
        ["Praying Together", "The couple that prays stays", "A cord of three strands is not quickly broken. God at the center holds you together.", "Pray out loud together for three minutes tonight."],
        ["Faithfulness and Trust", "Guarding the covenant", "Trust is built in tiny choices of honesty and kept in daily faithfulness.", "Share something honest you have been holding back."],
        ["Home and Finances", "Building a home with wisdom", "A home is built by wisdom and kept by understanding. Plan together and give thanks together.", "Set a date to review your budget and goals together."],
      ],
    },
    newBeliever: {
      sub: "First steps in faith",
      intro: "Welcome to God's family. This section guides you through the foundations of faith with key passages for new believers.",
      keyText: "Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.",
      qs: ["What does it mean to me that I am a new creation?", "When will I set aside a daily time with God?", "Who can I ask my questions?"],
      themes: [
        ["Who Is God?", "Getting to know the Father", "God is love and has always been. Scripture is how He introduces Himself to you.", "Read John 1:1-5 slowly and write what you learn about Him."],
        ["Salvation", "The greatest gift", "Salvation is a gift received by faith, not earned by effort. Your past is forgiven.", "Thank God in your own words for forgiving you."],
        ["Learning to Pray", "How to talk with the Father", "Prayer is simply talking with God. Start honest and simple; the heart matters more than the words.", "Pray the Lord's Prayer slowly, one line at a time."],
        ["Growing in Faith", "Your faith will grow every day", "Faith grows by hearing His word and trusting Him in small steps.", "Choose one daily time and place to meet with God."],
        ["Reading the Bible", "A lamp for your path", "You do not need to start at Genesis. Begin with the Gospel of John and read a little each day.", "Read one chapter of John today and note one verse."],
        ["Church and Community", "You were not made to walk alone", "Faith grows in fellowship. The first believers shared teaching, meals and prayer.", "Find one group or friend to share your faith journey with."],
      ],
    },
  },
  es: {
    men: {
      sub: "Fortaleza, propósito y fe inquebrantable",
      intro: "Las Sagradas Escrituras llaman al hombre a ser piedra angular de familia, comunidad y fe. Estos pasajes te equiparán con la sabiduría y fortaleza del Padre.",
      keyText: "Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios será contigo en donde quiera que fueres.",
      qs: ["¿Dónde necesito valentía hoy?", "¿Quién camina a mi lado en la fe?", "¿Qué hábito me haría un mejor líder en casa?"],
      themes: [
        ["Liderazgo y Carácter", "El llamado al hombre de integridad", "El verdadero liderazgo nace de quién eres cuando nadie te ve. La fortaleza se mide en fidelidad, no en volumen.", "Elige hoy una decisión donde harás lo correcto en silencio."],
        ["Fortaleza en la Prueba", "Fe firme en medio de la adversidad", "La presión no es señal de que Dios se fue. Es el lugar donde se forjan la paciencia y el carácter.", "Nombra lo más difícil de esta semana y ora por ello cinco minutos."],
        ["Familia y Paternidad", "El padre conforme al corazón de Dios", "Un padre forma su hogar con presencia, paciencia y oración mucho más que con reglas.", "Dedica hoy diez minutos sin distracciones a cada persona de tu casa."],
        ["Propósito Divino", "Caminando en el llamado único", "Fuiste creado a propósito para buenas obras preparadas de antemano. El propósito se vive cada día.", "Escribe una frase sobre lo que crees que Dios te pide en esta etapa."],
        ["Integridad en el Trabajo", "Trabajo honesto para el Señor", "Tu trabajo es adoración cuando lo haces con honestidad y excelencia, aunque nadie lo vea.", "Haz hoy una tarea con más cuidado, como si el Señor fuera tu único jefe."],
        ["Hermandad", "El hierro con hierro se afila", "La fe crece en compañía. Un amigo fiel te dice la verdad y te sostiene cuando estás cansado.", "Escríbele hoy a un hermano y pregúntale cómo puedes orar por él."],
      ],
    },
    women: {
      sub: "Gracia, fortaleza y belleza interior",
      intro: "El Padre te ha diseñado con una belleza y fuerza únicos. Estos pasajes de Las Sagradas Escrituras te recordarán quién eres en Sus ojos.",
      keyText: "Fortaleza y honor son su vestidura; y se ríe de lo por venir.",
      qs: ["¿Qué dice Dios de mí que suelo olvidar?", "¿Dónde necesito Su paz hoy?", "¿A quién puedo animar esta semana?"],
      themes: [
        ["Identidad en el Padre", "Tu valor no viene del mundo", "Fuiste hecha a imagen de Dios y Él te conoce por completo. Tu valor quedó establecido antes de cualquier opinión.", "Di en voz alta hoy una verdad sobre ti del Salmo 139."],
        ["Mujer Valiente", "Mujeres que cambiaron la historia", "Débora, Rut y la mujer de Proverbios 31 muestran que la valentía suele verse como fidelidad en lo cotidiano.", "Da hoy un pequeño paso valiente que has pospuesto."],
        ["Paz Interior", "La paz que sobrepasa todo entendimiento", "La paz no es ausencia de problemas. Es confiar en que Él los sostiene contigo.", "Respira lento y ora Filipenses 4:6-7 sobre una preocupación."],
        ["Fe y Oración", "Mujeres de oración poderosa", "Ana y María enseñan que la oración sincera y constante nunca es en vano.", "Ora por alguien por su nombre antes de mirar el teléfono."],
        ["Cuidado y Maternidad", "Amor que forma a la próxima generación", "La fe suele transmitirse en silencio, con el ejemplo diario de una madre o abuela.", "Cuéntale a alguien más joven lo que Dios ha hecho en tu vida."],
        ["Descanso y Renovación", "Ven a Él y serás renovada", "Nunca fuiste hecha para cargarlo todo. Descansar es un acto de confianza, no de pereza.", "Reserva treinta minutos de descanso real y respétalos."],
      ],
    },
    youth: {
      sub: "Identidad, propósito y fe audaz",
      intro: "La juventud es tiempo de fundamento. Las Sagradas Escrituras te hablan directamente sobre tu identidad, propósito y el llamado del Padre para tu vida.",
      keyText: "Ninguno tenga en poco tu juventud; sino sé ejemplo de los fieles en palabra, en conversación, en caridad, en espíritu, en fe, en limpieza.",
      qs: ["¿Quién soy cuando nadie me ve?", "¿Qué amistades me acercan a Dios?", "¿Qué me da miedo pedirle?"],
      themes: [
        ["Tu Identidad en Cristo", "No eres lo que el mundo dice", "Antes de cualquier etiqueta, fuiste conocido y escogido. Tu edad no limita lo que Dios puede hacer contigo.", "Escribe tres mentiras que crees y un versículo que responda a cada una."],
        ["Decisiones Sabias", "Cómo decidir con fe", "La sabiduría se pide, no se adivina. Dios la da generosamente a quien se la pide.", "Antes de tu próxima gran decisión, ora Santiago 1:5 y espera un día."],
        ["Amistades y Relaciones", "Las relaciones que te edifican", "Tus amigos más cercanos moldean tu rumbo. Elige y sé la clase de amigo que describe Proverbios.", "Anima hoy a un amigo con un mensaje sincero."],
        ["Fe Audaz", "Una fe que mueve montañas", "La fe no tiene que ser grande, solo real. Empieza con la montaña que tienes enfrente.", "Pídele a Dios algo específico y escríbelo."],
        ["Pureza y Tentación", "Camina limpio en un mundo ruidoso", "Dios siempre provee una salida. Cuidar tu corazón es libertad, no restricción.", "Elimina hoy de tu teléfono algo que te arrastra hacia abajo."],
        ["Ansiedad y Paz Mental", "Entrégale tus preocupaciones", "Puedes sentirte abrumado y llevarlo a Dios. Él cuida de ti, y también las personas a tu alrededor.", "Ora 1 Pedro 5:7 y habla con un adulto de confianza sobre lo que te pesa."],
      ],
    },
    kids: {
      sub: "Historias de fe, amor y valor",
      intro: "El Padre ama a los niños profundamente. Estas historias y versículos de Las Sagradas Escrituras son perfectos para aprender sobre Su amor y gracia.",
      keyText: "Porque de tal manera amó Dios al mundo, que ha dado á su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
      qs: ["¿Quién me ama muchísimo?", "¿Qué cosa amable puedo hacer hoy?", "¿Qué puedo decirle a Dios cuando tengo miedo?"],
      themes: [
        ["El Padre nos Ama", "El amor de Dios es para siempre", "Nada de lo que hagas hará que Dios deje de amarte. Te amó antes de que nacieras.", "Dile hoy a alguien en casa: ¡Dios te ama!"],
        ["Grandes Historias", "Héroes de Las Sagradas Escrituras", "Daniel, David y Jonás fueron valientes porque Dios estaba con ellos, no porque fueran fuertes.", "Representa tu historia bíblica favorita con un familiar."],
        ["Ser Bondadoso", "Cómo tratar a los demás", "La bondad es amor que se ve. Los pequeños actos amables hacen fácil notar el amor de Dios.", "Haz hoy algo amable en secreto por alguien."],
        ["No Tengas Miedo", "El Padre siempre está contigo", "Cuando tengas miedo, puedes hablar con Dios. Está más cerca que la oscuridad y es más fuerte que cualquier miedo.", "Aprende Isaías 41:10 y dilo antes de dormir."],
        ["Escuchar y Obedecer", "Aprender a oír a Dios y a tus padres", "El joven Samuel escuchó y dijo: Habla, Señor. Escuchar es cómo crece la amistad con Dios.", "Di esta noche: Habla, Señor, te escucho."],
        ["Corazones Agradecidos", "Dar gracias a Dios", "Un corazón agradecido ve bendiciones en todas partes. Cada día es un regalo de Dios.", "Nombra tres cosas por las que estás agradecido en la cena."],
      ],
    },
    marriage: {
      sub: "Un pacto sagrado de amor y servicio",
      intro: "El matrimonio es imagen del amor del Padre por Su pueblo. Estos pasajes de Las Sagradas Escrituras edificarán y fortalecerán su pacto sagrado.",
      keyText: "Todo lo sufre, todo lo cree, todo lo espera, todo lo soporta.",
      qs: ["¿Cómo serví a mi cónyuge esta semana?", "¿Qué debo perdonar o pedir perdón?", "¿Cuándo fue la última vez que oramos juntos?"],
      themes: [
        ["El Diseño del Matrimonio", "El Padre instituyó el pacto del matrimonio", "El matrimonio es más que un contrato. Son dos vidas unidas por Dios para ser una.", "Dile a tu cónyuge una razón por la que lo elegirías otra vez."],
        ["Amor que Sirve", "El amor que edifica al otro", "El amor en el matrimonio es la decisión diaria de poner al otro primero, en lo pequeño.", "Haz hoy una tarea del hogar sin que te la pidan."],
        ["Comunicación y Perdón", "Sanar y crecer juntos", "Las palabras suaves apartan el enojo. El perdón es cómo el amor se renueva.", "Resuelve una pequeña tensión antes de que se ponga el sol."],
        ["Orar Juntos", "La pareja que ora, permanece", "Cordón de tres dobleces no se rompe pronto. Dios en el centro los mantiene unidos.", "Oren en voz alta tres minutos esta noche."],
        ["Fidelidad y Confianza", "Guardar el pacto", "La confianza se construye con pequeñas decisiones de honestidad y se conserva con fidelidad diaria.", "Comparte algo sincero que has callado."],
        ["Hogar y Finanzas", "Edificar un hogar con sabiduría", "Con sabiduría se edifica la casa y con prudencia se afirma. Planeen y agradezcan juntos.", "Fijen una fecha para revisar juntos su presupuesto y metas."],
      ],
    },
    newBeliever: {
      sub: "Los primeros pasos en la fe",
      intro: "Bienvenido a la familia del Padre. Esta sección te guiará por los fundamentos de la fe con pasajes clave de Las Sagradas Escrituras para nuevos creyentes.",
      keyText: "De manera que si alguno está en Cristo, nueva criatura es: las cosas viejas pasaron; he aquí todas son hechas nuevas.",
      qs: ["¿Qué significa para mí ser una nueva criatura?", "¿Cuándo apartaré un tiempo diario con Dios?", "¿A quién puedo hacerle mis preguntas?"],
      themes: [
        ["¿Quién es el Padre?", "Conociendo al Padre de Las Sagradas Escrituras", "Dios es amor y siempre lo ha sido. Las Escrituras son cómo Él se presenta a ti.", "Lee Juan 1:1-5 despacio y anota lo que aprendes de Él."],
        ["La Salvación", "El regalo más grande", "La salvación es un regalo que se recibe por fe, no por esfuerzo. Tu pasado está perdonado.", "Da gracias a Dios con tus palabras por perdonarte."],
        ["Comenzar a Orar", "Cómo hablar con el Padre", "Orar es simplemente hablar con Dios. Empieza con sencillez y sinceridad; importa más el corazón que las palabras.", "Ora el Padre Nuestro despacio, una línea a la vez."],
        ["Crecer en Fe", "Tu fe crecerá cada día", "La fe crece al oír Su palabra y confiar en Él en pasos pequeños.", "Elige una hora y un lugar diarios para encontrarte con Dios."],
        ["Leer la Biblia", "Lámpara a tus pies", "No necesitas empezar por Génesis. Comienza con el Evangelio de Juan y lee un poco cada día.", "Lee hoy un capítulo de Juan y anota un versículo."],
        ["Iglesia y Comunidad", "No fuiste hecho para caminar solo", "La fe crece en comunión. Los primeros creyentes compartían enseñanza, comida y oración.", "Busca un grupo o un amigo con quien compartir tu camino de fe."],
      ],
    },
  },
};

// Base text plus the themes added in stages (languages without base text fall back to English).
export const getForYouText = (lang, category) => {
  const base = (FOR_YOU_TEXT[lang] || FOR_YOU_TEXT.en)[category];
  const extra = (STAGE1_TEXT[lang] || STAGE1_TEXT.en)[category] || [];
  return base && { ...base, themes: [...base.themes, ...extra] };
};
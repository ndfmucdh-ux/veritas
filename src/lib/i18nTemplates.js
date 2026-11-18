// Preset study templates in every language. Each section is [title, placeholder].
const T = (name, s) => ({ name, s });

export const TEMPLATE_TEXT = {
  en: {
    cts: T("Context · Theme · Application", [["Context", "Historical and cultural background of this passage..."], ["Main theme", "What is the central message or theme?"], ["Key verse", "Which verse stands out most and why?"], ["Personal application", "How does this apply to my life today?"]]),
    soap: T("S.O.A.P. Method", [["Scripture", "Write out the verse(s) you are studying..."], ["Observation", "What do you observe in this passage? (who, what, when, where, why)"], ["Application", "How can you apply this truth to your life?"], ["Prayer", "Write a prayer in response to what you have read..."]]),
    ind: T("Inductive Study", [["Observation", "What does the text say? (facts only)"], ["Interpretation", "What does the text mean?"], ["Correlation", "How does this connect to other scriptures?"], ["Application", "What must I do or believe differently?"]]),
    top: T("Topical Study", [["Topic / keyword", "What topic or word are you studying?"], ["Related passages", "List all relevant scripture references..."], ["Connections and patterns", "What patterns emerge across passages?"], ["Summary and conclusion", "What has God revealed about this topic?"]]),
  },
  es: {
    cts: T("Contexto · Tema · Aplicación", [["Contexto", "Trasfondo histórico y cultural de este pasaje..."], ["Tema principal", "¿Cuál es el mensaje o tema central?"], ["Versículo clave", "¿Qué versículo destaca más y por qué?"], ["Aplicación personal", "¿Cómo se aplica esto a mi vida hoy?"]]),
    soap: T("Método S.O.A.P.", [["Escritura", "Escribe el o los versículos que estás estudiando..."], ["Observación", "¿Qué observas en este pasaje? (quién, qué, cuándo, dónde, por qué)"], ["Aplicación", "¿Cómo puedes aplicar esta verdad a tu vida?"], ["Oración", "Escribe una oración en respuesta a lo que leíste..."]]),
    ind: T("Estudio inductivo", [["Observación", "¿Qué dice el texto? (solo hechos)"], ["Interpretación", "¿Qué significa el texto?"], ["Correlación", "¿Cómo se conecta con otras escrituras?"], ["Aplicación", "¿Qué debo hacer o creer de manera distinta?"]]),
    top: T("Estudio temático", [["Tema / palabra clave", "¿Qué tema o palabra estás estudiando?"], ["Pasajes relacionados", "Anota todas las referencias bíblicas relevantes..."], ["Conexiones y patrones", "¿Qué patrones surgen entre los pasajes?"], ["Resumen y conclusión", "¿Qué ha revelado Dios sobre este tema?"]]),
  },
  fr: {
    cts: T("Contexte · Thème · Application", [["Contexte", "Contexte historique et culturel de ce passage..."], ["Thème principal", "Quel est le message ou le thème central ?"], ["Verset clé", "Quel verset ressort le plus et pourquoi ?"], ["Application personnelle", "Comment cela s'applique-t-il à ma vie aujourd'hui ?"]]),
    soap: T("Méthode S.O.A.P.", [["Écriture", "Écrivez le ou les versets que vous étudiez..."], ["Observation", "Que remarquez-vous dans ce passage ? (qui, quoi, quand, où, pourquoi)"], ["Application", "Comment appliquer cette vérité à votre vie ?"], ["Prière", "Écrivez une prière en réponse à votre lecture..."]]),
    ind: T("Étude inductive", [["Observation", "Que dit le texte ? (faits uniquement)"], ["Interprétation", "Que signifie le texte ?"], ["Corrélation", "Comment cela se relie-t-il à d'autres passages ?"], ["Application", "Que dois-je faire ou croire différemment ?"]]),
    top: T("Étude thématique", [["Thème / mot-clé", "Quel thème ou quel mot étudiez-vous ?"], ["Passages liés", "Listez toutes les références pertinentes..."], ["Liens et schémas", "Quels schémas apparaissent entre les passages ?"], ["Résumé et conclusion", "Qu'est-ce que Dieu a révélé sur ce sujet ?"]]),
  },
  pt: {
    cts: T("Contexto · Tema · Aplicação", [["Contexto", "Contexto histórico e cultural desta passagem..."], ["Tema principal", "Qual é a mensagem ou tema central?"], ["Versículo-chave", "Qual versículo mais se destaca e por quê?"], ["Aplicação pessoal", "Como isto se aplica à minha vida hoje?"]]),
    soap: T("Método S.O.A.P.", [["Escritura", "Escreva o(s) versículo(s) que você está estudando..."], ["Observação", "O que você observa nesta passagem? (quem, o quê, quando, onde, por quê)"], ["Aplicação", "Como você pode aplicar esta verdade à sua vida?"], ["Oração", "Escreva uma oração em resposta ao que leu..."]]),
    ind: T("Estudo indutivo", [["Observação", "O que o texto diz? (apenas fatos)"], ["Interpretação", "O que o texto significa?"], ["Correlação", "Como isto se conecta a outras escrituras?"], ["Aplicação", "O que devo fazer ou crer de forma diferente?"]]),
    top: T("Estudo temático", [["Tema / palavra-chave", "Que tema ou palavra você está estudando?"], ["Passagens relacionadas", "Liste todas as referências relevantes..."], ["Conexões e padrões", "Que padrões surgem entre as passagens?"], ["Resumo e conclusão", "O que Deus revelou sobre este tema?"]]),
  },
  de: {
    cts: T("Kontext · Thema · Anwendung", [["Kontext", "Historischer und kultureller Hintergrund dieser Stelle..."], ["Hauptthema", "Was ist die zentrale Botschaft oder das Thema?"], ["Schlüsselvers", "Welcher Vers sticht am meisten hervor und warum?"], ["Persönliche Anwendung", "Wie betrifft das mein Leben heute?"]]),
    soap: T("S.O.A.P.-Methode", [["Schrift", "Schreibe den Vers oder die Verse auf, die du studierst..."], ["Beobachtung", "Was beobachtest du in dieser Stelle? (wer, was, wann, wo, warum)"], ["Anwendung", "Wie kannst du diese Wahrheit in deinem Leben anwenden?"], ["Gebet", "Schreibe ein Gebet als Antwort auf das Gelesene..."]]),
    ind: T("Induktives Studium", [["Beobachtung", "Was sagt der Text? (nur Fakten)"], ["Auslegung", "Was bedeutet der Text?"], ["Verknüpfung", "Wie hängt das mit anderen Schriftstellen zusammen?"], ["Anwendung", "Was muss ich anders tun oder glauben?"]]),
    top: T("Themenstudium", [["Thema / Stichwort", "Welches Thema oder Wort studierst du?"], ["Verwandte Stellen", "Liste alle passenden Bibelstellen auf..."], ["Verbindungen und Muster", "Welche Muster zeigen sich über die Stellen hinweg?"], ["Zusammenfassung und Fazit", "Was hat Gott zu diesem Thema offenbart?"]]),
  },
};

export const PRESET_META = [
  { id: "cts", color: "#8BA888" },
  { id: "soap", color: "#C17B5C" },
  { id: "ind", color: "#C9A66B" },
  { id: "top", color: "#5B8C8C" },
];
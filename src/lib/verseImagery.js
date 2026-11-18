import { SEMANTIC_IMAGES } from "@/components/verse/verseArtData";

// Keyword groups (English, Spanish, Portuguese, French, German) mapped to the photo that best portrays the verse.
const RULES = [
  ["waterfall", /river|stream|fountain|living water|rio|río|rivière|fluss|ribeiro/i],
  ["ocean", /sea|water|wave|storm|deep|ship|mar\b|agua|água|eau|mer\b|wasser|meer/i],
  ["mountains", /mountain|hill|rock|strength|monte|montaña|montanha|montagne|berg|fels|help/i],
  ["sunrise", /light|dawn|morning|sun|day|luz|luz\b|aurora|mañana|manhã|lumière|matin|licht|morgen/i],
  ["starfield", /star|heaven|sky|firmament|glory|cielo|céu|ciel|himmel|estrella|étoile|stern/i],
  ["forest", /tree|forest|branch|vine|root|árbol|árvore|arbre|baum|wald/i],
  ["desert", /desert|wilderness|thirst|path|road|way|journey|desierto|deserto|désert|wüste|camino|caminho|chemin|weg/i],
  ["wheat", /bread|harvest|sow|reap|field|shepherd|sheep|pan\b|pão|pain\b|brot|pastor|oveja|ovelha|berger|hirte/i],
  ["dove", /peace|spirit|dove|paz|espíritu|espírito|paix|esprit|frieden|geist/i],
  ["candle", /lamp|candle|darkness|word|lámpara|lâmpada|lampe|dunkel|palabra|palavra|parole|wort/i],
  ["lily", /lily|flower|garden|anxious|anxiety|worry|care|cast|lirio|flor|jardín|jardim|fleur|blume/i],
  ["chapel", /pray|house|temple|church|worship|oración|oração|prière|gebet|casa|maison|haus/i],
];

export function pickVersePhoto(text = "") {
  const hit = RULES.find(([, re]) => re.test(text));
  const id = hit ? hit[0] : "sunrise";
  return SEMANTIC_IMAGES.find((i) => i.id === id)?.url || SEMANTIC_IMAGES[0].url;
}
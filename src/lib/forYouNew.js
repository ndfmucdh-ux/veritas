import { MEN_NEW_META, MEN_NEW_TEXT } from "@/lib/forYouNewMen";
import { WOMEN_NEW_META, WOMEN_NEW_TEXT } from "@/lib/forYouNewWomen";
import { YOUTH_NEW_META, YOUTH_NEW_TEXT } from "@/lib/forYouNewYouth";
import { KIDS_NEW_META, KIDS_NEW_TEXT } from "@/lib/forYouNewKids";
import { MARRIAGE_NEW_META, MARRIAGE_NEW_TEXT } from "@/lib/forYouNewMarriage";
import { NEWBELIEVER_NEW_META, NEWBELIEVER_NEW_TEXT } from "@/lib/forYouNewNewBeliever";

// Themes added after stage 1, per category, appended after every existing theme.
// META: [{ icon, photo, verses (15), cross (5) }]. TEXT: { en, es, pt } lists of [label, description, reflection, practice].
export const NEW_META = {
  men: MEN_NEW_META,
  women: WOMEN_NEW_META,
  youth: YOUTH_NEW_META,
  kids: KIDS_NEW_META,
  marriage: MARRIAGE_NEW_META,
  newBeliever: NEWBELIEVER_NEW_META,
};

const pick = (lang) => ({
  men: MEN_NEW_TEXT[lang], women: WOMEN_NEW_TEXT[lang], youth: YOUTH_NEW_TEXT[lang],
  kids: KIDS_NEW_TEXT[lang], marriage: MARRIAGE_NEW_TEXT[lang], newBeliever: NEWBELIEVER_NEW_TEXT[lang],
});

export const NEW_TEXT = { en: pick("en"), es: pick("es"), pt: pick("pt") };
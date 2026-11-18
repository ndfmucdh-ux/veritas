import { MEN_MORE, MEN_CROSS } from "@/lib/forYouExtraMen";
import { WOMEN_MORE, WOMEN_CROSS } from "@/lib/forYouExtraWomen";
import { YOUTH_MORE, YOUTH_CROSS } from "@/lib/forYouExtraYouth";
import { KIDS_MORE, KIDS_CROSS } from "@/lib/forYouExtraKids";
import { MARRIAGE_MORE, MARRIAGE_CROSS } from "@/lib/forYouExtraMarriage";
import { NEWBELIEVER_MORE, NEWBELIEVER_CROSS } from "@/lib/forYouExtraNewBeliever";

// Staged passages per category: `more` extends each theme to 15 passages, `cross` lists cross references.
// Both follow the theme order of FOR_YOU_META.
export const FOR_YOU_EXTRA = {
  men: { more: MEN_MORE, cross: MEN_CROSS },
  women: { more: WOMEN_MORE, cross: WOMEN_CROSS },
  youth: { more: YOUTH_MORE, cross: YOUTH_CROSS },
  kids: { more: KIDS_MORE, cross: KIDS_CROSS },
  marriage: { more: MARRIAGE_MORE, cross: MARRIAGE_CROSS },
  newBeliever: { more: NEWBELIEVER_MORE, cross: NEWBELIEVER_CROSS },
};
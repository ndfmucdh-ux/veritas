// Which language each Bible version is written in, so emails and reminders can follow the user's default Bible.

const ES = "RVR1960 NVI LBLA BTX3 TLA DHH NTV BLS RVR2020 PDT PDDPT RVA RV60 VIN SBD NVIC NVIA NVI2 NVISTD VPAD CBT98 VPDS VPDIOS RBTI LBLA88 VPALM VPCI VPSD RVRM NTVR CVDS NTVI VPLIB RVRA NTVS CVCS VPAL2 RVR60".split(" ");
const PT = "ARA ARC NVT BPT BRA NVI-PT VFL ARF BRC ARCM ARACV TRAD INTL ECUM MSGPT NVIC-PT ARACI".split(" ");
const FR = "LSG NEG1979 BDS SG21 FC97 PdV LSGSM BDSI LSGC NEG2002 NEG1839 SG10 LSV BTP MSGY DCR BDSK FCO PCD LSGND".split(" ");
const IT = "DIOD NRV CEI NBDC NRVI DIODM CEIH".split(" ");
const DE = "LUT ELB".split(" ");

export const LANG_NAME: Record<string, string> = { en: "English", es: "Spanish", fr: "French", pt: "Portuguese", de: "German", it: "Italian" };
export const DEFAULT_BY_LANG: Record<string, string> = { en: "KJV", es: "BTX3", fr: "LSG", pt: "ARA", de: "LUT", it: "DIOD" };

export function translationLang(code?: string): string {
  const c = String(code || "KJV");
  if (ES.includes(c)) return "es";
  if (PT.includes(c)) return "pt";
  if (FR.includes(c)) return "fr";
  if (IT.includes(c)) return "it";
  if (DE.includes(c)) return "de";
  return "en";
}

// The user's Bible: their saved choice, otherwise the default for their app language.
export function readerTranslation(prefs: any): string {
  return prefs?.default_translation || DEFAULT_BY_LANG[prefs?.language || "en"] || "KJV";
}

// Email interface language: the app language, otherwise the language of their Bible. Only languages we have labels for.
export function readerLang(prefs: any): string {
  const l = prefs?.language || translationLang(readerTranslation(prefs));
  return ["en", "es", "fr", "pt", "de"].includes(l) ? l : "en";
}

// Verse reference parts, e.g. "Romans 8:38-39" -> { chapter: 8, from: 38, to: 39 }
export function parseRef(ref: string, fallback: { chapter?: number; verse?: number } = {}) {
  const m = String(ref || "").match(/(\d+):(\d+)(?:\s*[-–]\s*(\d+))?\s*$/);
  const chapter = m ? Number(m[1]) : Number(fallback.chapter || 1);
  const from = m ? Number(m[2]) : Number(fallback.verse || 1);
  const to = m && m[3] ? Number(m[3]) : null;
  return { chapter, from, to };
}

// Today's date in a user's own time zone: { date: "YYYY-MM-DD", minutes: minutes since local midnight }
export function localNow(timeZone: string, now = new Date()) {
  let tz = timeZone || "UTC";
  try { new Intl.DateTimeFormat("en-US", { timeZone: tz }); } catch { tz = "UTC"; }
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value || "00";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, minutes: Number(get("hour")) * 60 + Number(get("minute")), tz };
}
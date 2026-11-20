// Who a message is for: their saved preferences (language, default Bible, time zone) and a few wording helpers.

// One person's preferences (newest record). Service-role read, so it also works from scheduled jobs.
export async function getPrefs(base44: any, email: string) {
  const rows = await base44.asServiceRole.entities.UserPreferences.filter({ created_by: email }, "-updated_date", 1);
  return rows?.[0] || null;
}

// Everyone's preferences by lowercase email, newest record wins.
export async function loadPrefsMap(base44: any): Promise<Map<string, any>> {
  const rows = await base44.asServiceRole.entities.UserPreferences.list("-updated_date", 1000);
  const map = new Map<string, any>();
  for (const p of rows || []) {
    const k = String(p.created_by || "").toLowerCase();
    if (k && !map.has(k)) map.set(k, p);
  }
  return map;
}

// Pick the wording for a language; falls back to English.
export const pick = (lang: string, words: { en: string; es?: string; fr?: string; pt?: string; de?: string }) =>
  (words as Record<string, string | undefined>)[lang] || words.en;
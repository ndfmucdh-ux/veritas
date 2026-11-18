import { base44 } from "@/api/base44Client";

// Best-effort sync of reading settings to the signed-in user's saved preferences,
// so they persist across devices and browser data clears. Signed-out visitors keep localStorage only.
export async function savePrefs(partial) {
  try {
    if (!(await base44.auth.isAuthenticated())) return;
    const prefs = await base44.entities.UserPreferences.list("-updated_date", 1);
    if (prefs?.[0]) await base44.entities.UserPreferences.update(prefs[0].id, partial);
    else await base44.entities.UserPreferences.create(partial);
  } catch (e) {
    console.warn("Preferences sync skipped", e);
  }
}

// Copies saved preferences into localStorage (server wins). Returns the prefs record or null.
export async function hydratePrefs() {
  try {
    if (!(await base44.auth.isAuthenticated())) return null;
    const prefs = (await base44.entities.UserPreferences.list("-updated_date", 1))?.[0];
    if (!prefs) return null;
    if (prefs.default_translation) localStorage.setItem("veritas_translation", prefs.default_translation);
    if (prefs.font_size) localStorage.setItem("veritas_reader_font_size", String(prefs.font_size));
    if (prefs.font_family) localStorage.setItem("veritas_reader_font_family", prefs.font_family);
    if (typeof prefs.show_verse_numbers === "boolean") localStorage.setItem("veritas_verse_numbers", String(prefs.show_verse_numbers));
    if (typeof prefs.show_red_letter === "boolean") localStorage.setItem("veritas_red_letter", String(prefs.show_red_letter));
    return prefs;
  } catch (e) {
    return null;
  }
}
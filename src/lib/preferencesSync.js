import { base44 } from "@/api/base44Client";
import { applyTheme } from "@/lib/theme";

// Settings the app keeps in local storage on the device (quiet mode, reading goals, audio speed, folders...)
// are mirrored to the account as they change, so they follow the person and survive clearing the browser.
const SYNCED_KEY = /^veritas_(quiet_mode|snooze_minutes|goal_mode|goal_target|daily_goal|weekly_goals|audio_speed|audio_bookmarks|note_folders|study_templates|plan_(start|daily)_.+)$/;
let applyingServer = false;
const queued = {};
let flushTimer;

async function flushDeviceSettings() {
  const changes = { ...queued };
  Object.keys(queued).forEach((k) => delete queued[k]);
  if (!Object.keys(changes).length || !(await base44.auth.isAuthenticated().catch(() => false))) return;
  const prefs = await getMyPrefs();
  await savePrefs({ app_settings: { ...(prefs?.app_settings || {}), ...changes } });
}

if (typeof window !== "undefined" && !Storage.prototype.__veritasSync) {
  const original = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key, value) {
    original.call(this, key, value);
    if (this === window.localStorage && !applyingServer && SYNCED_KEY.test(key)) {
      queued[key] = String(value);
      clearTimeout(flushTimer);
      flushTimer = setTimeout(flushDeviceSettings, 800);
    }
  };
  Storage.prototype.__veritasSync = true;
  window.addEventListener("pagehide", () => { flushDeviceSettings(); });
}

// The signed-in person's own preferences record. Filtering by creator matters: admins can read
// everyone's records, so an unfiltered "newest" would hand an admin someone else's settings.
export async function getMyPrefs() {
  const me = await base44.auth.me().catch(() => null);
  if (!me?.email) return null;
  const rows = await base44.entities.UserPreferences.filter({ created_by: me.email }, "-updated_date", 1);
  return rows?.[0] || null;
}

// Saves settings to the signed-in user's account (creating the record on first save), so they
// survive navigation, closing the app and switching devices. Signed-out visitors keep localStorage only.
export async function savePrefs(partial) {
  try {
    const prefs = await getMyPrefs();
    if (prefs) return await base44.entities.UserPreferences.update(prefs.id, partial);
    // First record: store the current language and Bible too, so emails and reminders match the app.
    return await base44.entities.UserPreferences.create({
      language: localStorage.getItem("veritas_lang") || undefined,
      default_translation: localStorage.getItem("veritas_translation") || undefined,
      ...partial,
    });
  } catch (e) {
    console.warn("Preferences sync skipped", e);
  }
}

// Copies saved preferences into localStorage (server wins). Returns the prefs record or null.
export async function hydratePrefs() {
  try {
    if (!(await base44.auth.isAuthenticated())) return null;
    const prefs = await getMyPrefs();
    if (!prefs) {
      savePrefs({ timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
      return null;
    }
    const set = (k, v) => v !== undefined && v !== null && localStorage.setItem(k, String(v));
    if (prefs.default_translation && prefs.translation_chosen) {
      localStorage.setItem("veritas_translation", prefs.default_translation);
      localStorage.setItem("veritas_translation_chosen", "1");
    } else if (prefs.default_translation && !localStorage.getItem("veritas_translation")) {
      localStorage.setItem("veritas_translation", prefs.default_translation);
    }
    set("veritas_reader_font_size", prefs.font_size);
    set("veritas_reader_font_family", prefs.font_family);
    set("veritas_verse_numbers", prefs.show_verse_numbers);
    set("veritas_red_letter", prefs.show_red_letter);
    set("veritas_oled_mode", prefs.oled_mode);
    set("veritas_audio_autoplay", prefs.audio_autoplay);
    set("veritas_font_size", prefs.font_size_label);
    applyingServer = true;
    Object.entries(prefs.app_settings || {}).forEach(([k, v]) => { if (SYNCED_KEY.test(k)) localStorage.setItem(k, v); });
    applyingServer = false;
    if (prefs.theme_mode) {
      localStorage.setItem("theme", prefs.theme_mode);
      applyTheme(prefs.theme_mode);
    }
    // Reminders fire in the user's local time, so keep the device time zone on the account.
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && prefs.timezone !== tz) base44.entities.UserPreferences.update(prefs.id, { timezone: tz }).catch(() => {});
    return prefs;
  } catch (e) {
    return null;
  }
}
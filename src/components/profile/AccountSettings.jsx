import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Lock, User, Shield, Eye, EyeOff, Check, Loader2, ChevronDown,
  Globe, Bell, Download, Trash2, AlertTriangle, Smartphone,
  BookOpen, Moon, Sun, Zap
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const SECTION_GROUPS = [
  {
    group: "Identity",
    sections: [
      { id: "name", label: "Display Name", icon: User, color: "#00f5ff", sub: "How others see you in Veritas" },
      { id: "email", label: "Email Address", icon: Mail, color: "#fbbf24", sub: "Change your login email" },
      { id: "password", label: "Change Password", icon: Lock, color: "#a78bfa", sub: "Keep your account secure" },
    ]
  },
  {
    group: "Reading Preferences",
    sections: [
      { id: "reading", label: "Reading Settings", icon: BookOpen, color: "#34d399", sub: "Font, translation & display" },
      { id: "language", label: "Language & Region", icon: Globe, color: "#60a5fa", sub: "App language and Bible translation" },
      { id: "notifications", label: "Notification Schedule", icon: Bell, color: "#f97316", sub: "When Veritas reminds you" },
    ]
  },
  {
    group: "Privacy & Security",
    sections: [
      { id: "security", label: "Security Overview", icon: Shield, color: "#34d399", sub: "Account protection details" },
      { id: "sessions", label: "Active Sessions", icon: Smartphone, color: "#a78bfa", sub: "Manage where you're signed in" },
      { id: "data", label: "Data & Export", icon: Download, color: "#00f5ff", sub: "Download or delete your data" },
    ]
  },
];

const FONT_SIZES = ["Small", "Medium", "Large", "Extra Large"];
const THEMES = [
  { id: "dark", label: "Dark", icon: Moon, color: "#a78bfa" },
  { id: "midnight", label: "Midnight", icon: Zap, color: "#00f5ff" },
  { id: "light", label: "Light", icon: Sun, color: "#fbbf24" },
];
const TRANSLATIONS = [
  // English
  "KJV", "NIV", "ESV", "NKJV", "NLT", "AMP", "MSG",
  // Spanish
  "RVR60", "NVI", "LBLA", "TLA", "DHH",
];
const LANGUAGES = ["English", "Español", "Français", "Português", "Deutsch"];

export default function AccountSettings({ user }) {
  const [openSection, setOpenSection] = useState(null);

  // Name
  const [newName, setNewName] = useState(user?.full_name || "");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  // Email
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMsg, setEmailMsg] = useState(null);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState(null);

  // Reading prefs (persisted to localStorage)
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("veritas_font_size") || "Medium");
  const [theme, setTheme] = useState(() => localStorage.getItem("veritas_theme") || "dark");
  const [defaultTranslation, setDefaultTranslation] = useState(() => localStorage.getItem("veritas_translation") || "KJV");
  const [redLetterOn, setRedLetterOn] = useState(() => localStorage.getItem("veritas_red_letter") !== "false");
  const [verseNumbers, setVerseNumbers] = useState(() => localStorage.getItem("veritas_verse_numbers") !== "false");
  const [audioAutoplay, setAudioAutoplay] = useState(() => localStorage.getItem("veritas_audio_autoplay") === "true");

  // Language
  const [appLanguage, setAppLanguage] = useState(() => localStorage.getItem("veritas_app_language") || "English");

  // Notification times
  const [morningTime, setMorningTime] = useState(() => localStorage.getItem("veritas_notif_morning") || "07:00");
  const [eveningTime, setEveningTime] = useState(() => localStorage.getItem("veritas_notif_evening") || "20:00");
  const [devotionalTime, setDevotionalTime] = useState(() => localStorage.getItem("veritas_notif_devotional_reminder_time") || "19:00");

  // Save feedback states
  const [readingSaved, setReadingSaved] = useState(false);
  const [langSaved, setLangSaved] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  const toggle = (id) => setOpenSection(s => s === id ? null : id);

  const saveName = async () => {
    if (!newName.trim()) return;
    setNameSaving(true);
    await base44.auth.updateMe({ full_name: newName.trim() });
    sessionStorage.setItem("veritas_display_name", newName.trim());
    setNameSaving(false);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2500);
  };

  const saveEmail = async () => {
    if (!newEmail.trim()) { setEmailMsg({ type: "error", text: "Enter a new email address." }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) { setEmailMsg({ type: "error", text: "Enter a valid email address." }); return; }
    setEmailSaving(true); setEmailMsg(null);
    try {
      await base44.auth.updateMe({ email: newEmail.trim() });
      setEmailMsg({ type: "success", text: "Email updated. Please verify your new address." });
      setNewEmail(""); setEmailPassword("");
    } catch (e) {
      setEmailMsg({ type: "error", text: e?.message || "Failed to update email." });
    }
    setEmailSaving(false);
  };

  const savePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) { setPwdMsg({ type: "error", text: "Fill in all password fields." }); return; }
    if (newPassword.length < 8) { setPwdMsg({ type: "error", text: "New password must be at least 8 characters." }); return; }
    if (newPassword !== confirmPassword) { setPwdMsg({ type: "error", text: "New passwords do not match." }); return; }
    setPwdSaving(true); setPwdMsg(null);
    try {
      await base44.auth.updateMe({ password: newPassword, current_password: currentPassword });
      setPwdMsg({ type: "success", text: "Password updated successfully." });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (e) {
      setPwdMsg({ type: "error", text: e?.message || "Incorrect current password or update failed." });
    }
    setPwdSaving(false);
  };

  const saveReadingPrefs = () => {
    localStorage.setItem("veritas_font_size", fontSize);
    localStorage.setItem("veritas_theme", theme);
    localStorage.setItem("veritas_translation", defaultTranslation);
    localStorage.setItem("veritas_red_letter", String(redLetterOn));
    localStorage.setItem("veritas_verse_numbers", String(verseNumbers));
    localStorage.setItem("veritas_audio_autoplay", String(audioAutoplay));
    setReadingSaved(true);
    setTimeout(() => setReadingSaved(false), 2500);
  };

  const saveLanguage = () => {
    localStorage.setItem("veritas_app_language", appLanguage);
    setLangSaved(true);
    setTimeout(() => setLangSaved(false), 2500);
  };

  const saveNotifications = () => {
    localStorage.setItem("veritas_notif_morning", morningTime);
    localStorage.setItem("veritas_notif_evening", eveningTime);
    localStorage.setItem("veritas_notif_devotional_reminder_time", devotionalTime);
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2500);
  };

  const pwdStrength = newPassword.length === 0 ? 0 : newPassword.length < 6 ? 1 : newPassword.length < 10 ? 2 : /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 4 : 3;
  const pwdStrengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const pwdStrengthColors = ["", "#f87171", "#fbbf24", "#60a5fa", "#34d399"];

  return (
    <div className="space-y-6">
      {SECTION_GROUPS.map(({ group, sections }) => (
        <div key={group}>
          <p className="text-[9px] font-cinzel uppercase tracking-[0.25em] mb-2.5 px-1"
            style={{ color: "rgba(255,255,255,0.2)" }}>{group}</p>
          <div className="space-y-2">
            {sections.map(({ id, label, icon: Icon, color, sub }) => (
              <div key={id} className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.03)", border: openSection === id ? `1px solid ${color}30` : "1px solid rgba(255,255,255,0.07)" }}>
                <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left" onClick={() => toggle(id)}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-cinzel font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>{label}</p>
                    <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{sub}</p>
                  </div>
                  <motion.div animate={{ rotate: openSection === id ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4" style={{ color: "rgba(255,255,255,0.25)" }} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openSection === id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <div className="px-4 pb-5 pt-1 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>

                        {/* ── NAME ── */}
                        {id === "name" && (
                          <div className="space-y-3 pt-3">
                            <div className="px-3 py-2 rounded-xl" style={{ background: "rgba(0,245,255,0.05)", border: "1px solid rgba(0,245,255,0.1)" }}>
                              <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.4)" }}>
                                Current name: <span style={{ color: "#00f5ff" }}>{user?.full_name || "—"}</span>
                              </p>
                            </div>
                            <input value={newName} onChange={e => setNewName(e.target.value)}
                              placeholder="New display name"
                              className="w-full rounded-xl px-3 py-2.5 text-sm font-inter focus:outline-none"
                              style={{ fontSize: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,245,255,0.2)", color: "rgba(255,255,255,0.85)" }} />
                            <button onClick={saveName} disabled={!newName.trim() || nameSaving}
                              className="w-full py-2.5 rounded-xl font-cinzel text-sm flex items-center justify-center gap-2 transition-all"
                              style={{ background: "rgba(0,245,255,0.12)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.25)", opacity: !newName.trim() ? 0.5 : 1 }}>
                              {nameSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : nameSaved ? <><Check className="w-4 h-4" /> Saved!</> : "Update Name"}
                            </button>
                          </div>
                        )}

                        {/* ── EMAIL ── */}
                        {id === "email" && (
                          <div className="space-y-3 pt-3">
                            <div className="px-3 py-2 rounded-xl" style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.15)" }}>
                              <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.4)" }}>
                                Current: <span style={{ color: "#fbbf24" }}>{user?.email}</span>
                              </p>
                            </div>
                            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                              placeholder="New email address"
                              className="w-full rounded-xl px-3 py-2.5 text-sm font-inter focus:outline-none"
                              style={{ fontSize: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(251,191,36,0.2)", color: "rgba(255,255,255,0.85)" }} />
                            <input type="password" value={emailPassword} onChange={e => setEmailPassword(e.target.value)}
                              placeholder="Confirm with your current password"
                              className="w-full rounded-xl px-3 py-2.5 text-sm font-inter focus:outline-none"
                              style={{ fontSize: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(251,191,36,0.15)", color: "rgba(255,255,255,0.85)" }} />
                            {emailMsg && <p className="text-xs font-inter" style={{ color: emailMsg.type === "error" ? "#f87171" : "#34d399" }}>{emailMsg.text}</p>}
                            <button onClick={saveEmail} disabled={emailSaving}
                              className="w-full py-2.5 rounded-xl font-cinzel text-sm flex items-center justify-center gap-2"
                              style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
                              {emailSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Email"}
                            </button>
                          </div>
                        )}

                        {/* ── PASSWORD ── */}
                        {id === "password" && (
                          <div className="space-y-3 pt-3">
                            <div className="relative">
                              <input type={showPwd ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                                placeholder="Current password"
                                className="w-full rounded-xl px-3 py-2.5 pr-10 text-sm font-inter focus:outline-none"
                                style={{ fontSize: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(167,139,250,0.2)", color: "rgba(255,255,255,0.85)" }} />
                              <button onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }}>
                                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            <input type={showPwd ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                              placeholder="New password (min 8 chars)"
                              className="w-full rounded-xl px-3 py-2.5 text-sm font-inter focus:outline-none"
                              style={{ fontSize: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(167,139,250,0.2)", color: "rgba(255,255,255,0.85)" }} />
                            <input type={showPwd ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                              placeholder="Confirm new password"
                              className="w-full rounded-xl px-3 py-2.5 text-sm font-inter focus:outline-none"
                              style={{ fontSize: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(167,139,250,0.2)", color: "rgba(255,255,255,0.85)" }} />
                            {newPassword.length > 0 && (
                              <div className="space-y-1">
                                <div className="flex gap-1">
                                  {[1,2,3,4].map(i => (
                                    <div key={i} className="h-1.5 flex-1 rounded-full transition-all"
                                      style={{ background: i <= pwdStrength ? pwdStrengthColors[pwdStrength] : "rgba(255,255,255,0.07)" }} />
                                  ))}
                                </div>
                                <p className="text-[10px] font-cinzel" style={{ color: pwdStrengthColors[pwdStrength] }}>
                                  {pwdStrengthLabels[pwdStrength]}
                                </p>
                              </div>
                            )}
                            {pwdMsg && <p className="text-xs font-inter" style={{ color: pwdMsg.type === "error" ? "#f87171" : "#34d399" }}>{pwdMsg.text}</p>}
                            <button onClick={savePassword} disabled={pwdSaving}
                              className="w-full py-2.5 rounded-xl font-cinzel text-sm flex items-center justify-center gap-2"
                              style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.25)" }}>
                              {pwdSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                            </button>
                          </div>
                        )}

                        {/* ── READING SETTINGS ── */}
                        {id === "reading" && (
                          <div className="space-y-4 pt-3">
                            {/* Default Translation */}
                            <div>
                              <p className="text-[10px] font-cinzel uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Default Translation</p>
                              <div className="flex flex-wrap gap-2">
                                {TRANSLATIONS.map(t => (
                                  <button key={t} onClick={() => setDefaultTranslation(t)}
                                    className="px-3 py-1.5 rounded-xl text-xs font-cinzel transition-all"
                                    style={{
                                      background: defaultTranslation === t ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.05)",
                                      color: defaultTranslation === t ? "#34d399" : "rgba(255,255,255,0.45)",
                                      border: defaultTranslation === t ? "1px solid rgba(52,211,153,0.35)" : "1px solid rgba(255,255,255,0.08)"
                                    }}>{t}</button>
                                ))}
                              </div>
                            </div>
                            {/* Font Size */}
                            <div>
                              <p className="text-[10px] font-cinzel uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Font Size</p>
                              <div className="flex gap-2">
                                {FONT_SIZES.map(s => (
                                  <button key={s} onClick={() => setFontSize(s)}
                                    className="flex-1 py-2 rounded-xl text-xs font-cinzel transition-all"
                                    style={{
                                      background: fontSize === s ? "rgba(0,245,255,0.12)" : "rgba(255,255,255,0.04)",
                                      color: fontSize === s ? "#00f5ff" : "rgba(255,255,255,0.35)",
                                      border: fontSize === s ? "1px solid rgba(0,245,255,0.25)" : "1px solid rgba(255,255,255,0.07)"
                                    }}>{s}</button>
                                ))}
                              </div>
                            </div>
                            {/* Toggles */}
                            <div className="space-y-2">
                              {[
                                { label: "Red Letter (Jesus' words)", key: "redLetterOn", value: redLetterOn, setter: setRedLetterOn, color: "#f87171" },
                                { label: "Show Verse Numbers", key: "verseNumbers", value: verseNumbers, setter: setVerseNumbers, color: "#00f5ff" },
                                { label: "Audio Autoplay", key: "audioAutoplay", value: audioAutoplay, setter: setAudioAutoplay, color: "#a78bfa" },
                              ].map(({ label, value, setter, color }) => (
                                <div key={label} className="flex items-center justify-between py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                                  <p className="text-sm font-inter" style={{ color: "rgba(255,255,255,0.65)" }}>{label}</p>
                                  <motion.button onClick={() => setter(v => !v)}
                                    className="w-11 h-6 rounded-full relative flex items-center px-1"
                                    style={{ background: value ? `${color}30` : "rgba(255,255,255,0.08)" }}>
                                    <motion.span animate={{ x: value ? 18 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 24 }}
                                      className="w-4 h-4 rounded-full bg-white shadow-sm" />
                                  </motion.button>
                                </div>
                              ))}
                            </div>
                            <button onClick={saveReadingPrefs}
                              className="w-full py-2.5 rounded-xl font-cinzel text-sm flex items-center justify-center gap-2 transition-all"
                              style={{ background: readingSaved ? "rgba(52,211,153,0.2)" : "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}>
                              <Check className="w-4 h-4" /> {readingSaved ? "Saved!" : "Save Reading Preferences"}
                            </button>
                          </div>
                        )}

                        {/* ── LANGUAGE ── */}
                        {id === "language" && (
                          <div className="space-y-4 pt-3">
                            <div>
                              <p className="text-[10px] font-cinzel uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>App Language</p>
                              <div className="space-y-1.5">
                                {LANGUAGES.map(lang => (
                                  <button key={lang} onClick={() => setAppLanguage(lang)}
                                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-inter transition-all"
                                    style={{
                                      background: appLanguage === lang ? "rgba(96,165,250,0.1)" : "rgba(255,255,255,0.03)",
                                      color: appLanguage === lang ? "#60a5fa" : "rgba(255,255,255,0.55)",
                                      border: appLanguage === lang ? "1px solid rgba(96,165,250,0.3)" : "1px solid rgba(255,255,255,0.06)"
                                    }}>
                                    {lang}
                                    {appLanguage === lang && <Check className="w-3.5 h-3.5" />}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <button onClick={saveLanguage}
                              className="w-full py-2.5 rounded-xl font-cinzel text-sm flex items-center justify-center gap-2 transition-all"
                              style={{ background: langSaved ? "rgba(96,165,250,0.2)" : "rgba(96,165,250,0.1)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.25)" }}>
                              <Check className="w-4 h-4" /> {langSaved ? "Saved!" : "Save Language"}
                            </button>
                          </div>
                        )}

                        {/* ── NOTIFICATIONS ── */}
                        {id === "notifications" && (
                          <div className="space-y-4 pt-3">
                            {[
                              { label: "🌅 Morning Verse", key: "morning", value: morningTime, setter: setMorningTime, sub: "Daily verse of the day" },
                              { label: "🌙 Evening Reflection", key: "evening", value: eveningTime, setter: setEveningTime, sub: "Prayer journal reminder" },
                              { label: "📖 Devotional Plan", key: "devotional", value: devotionalTime, setter: setDevotionalTime, sub: "Reading plan nudge" },
                            ].map(({ label, key, value, setter, sub }) => (
                              <div key={key} className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                                <div>
                                  <p className="text-sm font-inter" style={{ color: "rgba(255,255,255,0.75)" }}>{label}</p>
                                  <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{sub}</p>
                                </div>
                                <input type="time" value={value} onChange={e => setter(e.target.value)}
                                  className="text-xs font-cinzel px-3 py-1.5 rounded-xl focus:outline-none"
                                  style={{ background: "rgba(0,245,255,0.07)", border: "1px solid rgba(0,245,255,0.2)", color: "#00f5ff" }} />
                              </div>
                            ))}
                            <button onClick={saveNotifications}
                              className="w-full py-2.5 rounded-xl font-cinzel text-sm flex items-center justify-center gap-2 transition-all"
                              style={{ background: notifSaved ? "rgba(52,211,153,0.2)" : "rgba(0,245,255,0.1)", color: notifSaved ? "#34d399" : "#00f5ff", border: notifSaved ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(0,245,255,0.25)" }}>
                              <Check className="w-4 h-4" /> {notifSaved ? "Saved!" : "Save Schedule"}
                            </button>
                          </div>
                        )}

                        {/* ── SECURITY ── */}
                        {id === "security" && (
                          <div className="space-y-3 pt-3">
                            <div className="rounded-xl px-4 py-3" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}>
                              <div className="flex items-center gap-2 mb-1">
                                <Shield className="w-3.5 h-3.5" style={{ color: "#34d399" }} />
                                <p className="text-xs font-cinzel" style={{ color: "#34d399" }}>Account Protected</p>
                              </div>
                              <p className="text-xs font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                                Your account is secured with encryption. All personal notes and prayer entries are private by default.
                              </p>
                            </div>
                            {[
                              { label: "Email Verified", value: "Yes", color: "#34d399" },
                              { label: "Account Role", value: user?.role || "user", color: "#00f5ff" },
                              { label: "Email Address", value: user?.email || "—", color: "rgba(255,255,255,0.5)" },
                              { label: "Data Encryption", value: "Enabled", color: "#34d399" },
                              { label: "Private Notes", value: "On by default", color: "#34d399" },
                              { label: "Last Sign In", value: "This session", color: "rgba(255,255,255,0.4)" },
                            ].map(({ label, value, color }) => (
                              <div key={label} className="flex items-center justify-between py-2 border-b"
                                style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                                <span className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
                                <span className="text-xs font-cinzel capitalize" style={{ color }}>{value}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* ── SESSIONS ── */}
                        {id === "sessions" && (
                          <div className="space-y-3 pt-3">
                            <div className="rounded-xl px-4 py-3.5 flex items-center gap-3"
                              style={{ background: "rgba(0,245,255,0.05)", border: "1px solid rgba(0,245,255,0.15)" }}>
                              <Smartphone className="w-4 h-4 flex-shrink-0" style={{ color: "#00f5ff" }} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-cinzel text-white">Current Device</p>
                                <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                                  {navigator.userAgent.includes("Mobile") ? "Mobile" : "Desktop"} · Active now
                                </p>
                              </div>
                              <span className="text-[10px] font-cinzel px-2 py-0.5 rounded-full"
                                style={{ background: "rgba(52,211,153,0.15)", color: "#34d399" }}>This device</span>
                            </div>
                            <button onClick={() => base44.auth.logout()}
                              className="w-full py-2.5 rounded-xl font-cinzel text-sm flex items-center justify-center gap-2"
                              style={{ background: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                              Sign Out All Devices
                            </button>
                          </div>
                        )}

                        {/* ── DATA & EXPORT ── */}
                        {id === "data" && (
                          <div className="space-y-3 pt-3">
                            <p className="text-xs font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                              Your data belongs to you. Export it anytime or request permanent deletion.
                            </p>
                            {[
                              { label: "Export Library (Markdown)", sub: "Bookmarks, notes & highlights", color: "#00f5ff", icon: Download, action: () => {} },
                              { label: "Export Raw Data (JSON)", sub: "All your Veritas data", color: "#a78bfa", icon: Download, action: () => {} },
                            ].map(({ label, sub, color, icon: Ico, action }) => (
                              <button key={label} onClick={action}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                                style={{ background: `${color}07`, border: `1px solid ${color}20` }}>
                                <Ico className="w-4 h-4 flex-shrink-0" style={{ color }} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-inter" style={{ color: "rgba(255,255,255,0.75)" }}>{label}</p>
                                  <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{sub}</p>
                                </div>
                              </button>
                            ))}
                            <div className="rounded-xl px-4 py-3 mt-2" style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.15)" }}>
                              <div className="flex items-center gap-2 mb-1.5">
                                <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#f87171" }} />
                                <p className="text-xs font-cinzel" style={{ color: "#f87171" }}>Danger Zone</p>
                              </div>
                              <p className="text-[10px] font-inter leading-relaxed mb-2.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                                Deleting your account is permanent and cannot be undone. All data will be erased.
                              </p>
                              <button className="w-full py-2 rounded-xl font-cinzel text-xs flex items-center justify-center gap-2"
                                style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}>
                                <Trash2 className="w-3.5 h-3.5" /> Request Account Deletion
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
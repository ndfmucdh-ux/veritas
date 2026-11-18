import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Lock, User, Shield, Eye, EyeOff, Check, Loader2, ChevronDown,
  Globe, Bell, Download, Trash2, AlertTriangle, Smartphone,
  BookOpen, Moon, Sun, Zap
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/LanguageContext";
import { LANGUAGES } from "@/lib/i18n";

// label / sub / group are i18n keys, resolved with tr() at render time.
const SECTION_GROUPS = [
  {
    group: "set_identity",
    sections: [
      { id: "name", label: "set_displayName", icon: User, color: "#00f5ff", sub: "set_displayNameSub" },
      { id: "email", label: "set_email", icon: Mail, color: "#fbbf24", sub: "set_emailSub" },
      { id: "password", label: "set_password", icon: Lock, color: "#a78bfa", sub: "set_passwordSub" },
    ]
  },
  {
    group: "set_readingPrefs",
    sections: [
      { id: "reading", label: "set_reading", icon: BookOpen, color: "#34d399", sub: "set_readingSub" },
      { id: "language", label: "set_language", icon: Globe, color: "#60a5fa", sub: "set_languageSub" },
      { id: "notifications", label: "set_notif", icon: Bell, color: "#f97316", sub: "set_notifSub" },
    ]
  },
  {
    group: "set_privacy",
    sections: [
      { id: "security", label: "set_security", icon: Shield, color: "#34d399", sub: "set_securitySub" },
      { id: "sessions", label: "set_sessions", icon: Smartphone, color: "#a78bfa", sub: "set_sessionsSub" },
      { id: "data", label: "set_data", icon: Download, color: "#00f5ff", sub: "set_dataSub" },
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
  "KJV", "NIV", "ESV", "NKJV", "NLT", "AMP", "MSG", "BTX3",
  // Spanish
  "RVR60", "NVI", "LBLA", "TLA", "DHH",
];

export default function AccountSettings({ user }) {
  const { lang: currentLang, setLang, tr } = useLang();
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

  // Notification times
  const [morningTime, setMorningTime] = useState(() => localStorage.getItem("veritas_notif_morning") || "07:00");
  const [eveningTime, setEveningTime] = useState(() => localStorage.getItem("veritas_notif_evening") || "20:00");
  const [devotionalTime, setDevotionalTime] = useState(() => localStorage.getItem("veritas_notif_devotional_reminder_time") || "19:00");

  // Save feedback states
  const [readingSaved, setReadingSaved] = useState(false);
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
    if (!newEmail.trim()) { setEmailMsg({ type: "error", text: tr("set_errEmailEmpty") }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) { setEmailMsg({ type: "error", text: tr("set_errEmailInvalid") }); return; }
    setEmailSaving(true); setEmailMsg(null);
    try {
      await base44.auth.updateMe({ email: newEmail.trim() });
      setEmailMsg({ type: "success", text: tr("set_okEmail") });
      setNewEmail(""); setEmailPassword("");
    } catch (e) {
      setEmailMsg({ type: "error", text: e?.message || tr("set_errEmailFail") });
    }
    setEmailSaving(false);
  };

  const savePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) { setPwdMsg({ type: "error", text: tr("set_errPwdFields") }); return; }
    if (newPassword.length < 8) { setPwdMsg({ type: "error", text: tr("set_errPwdShort") }); return; }
    if (newPassword !== confirmPassword) { setPwdMsg({ type: "error", text: tr("set_errPwdMismatch") }); return; }
    setPwdSaving(true); setPwdMsg(null);
    try {
      await base44.auth.updateMe({ password: newPassword, current_password: currentPassword });
      setPwdMsg({ type: "success", text: tr("set_okPwd") });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (e) {
      setPwdMsg({ type: "error", text: e?.message || tr("set_errPwdFail") });
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

  const saveNotifications = () => {
    localStorage.setItem("veritas_notif_morning", morningTime);
    localStorage.setItem("veritas_notif_evening", eveningTime);
    localStorage.setItem("veritas_notif_devotional_reminder_time", devotionalTime);
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2500);
  };

  const pwdStrength = newPassword.length === 0 ? 0 : newPassword.length < 6 ? 1 : newPassword.length < 10 ? 2 : /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 4 : 3;
  const pwdStrengthLabels = ["", tr("set_pwd1"), tr("set_pwd2"), tr("set_pwd3"), tr("set_pwd4")];
  const pwdStrengthColors = ["", "#f87171", "#fbbf24", "#60a5fa", "#34d399"];

  return (
    <div className="space-y-6">
      {SECTION_GROUPS.map(({ group, sections }) => (
        <div key={group}>
          <p className="text-[9px] font-cinzel uppercase tracking-[0.25em] mb-2.5 px-1"
            style={{ color: "rgb(var(--ink) / 0.2)" }}>{tr(group)}</p>
          <div className="space-y-2">
            {sections.map(({ id, label, icon: Icon, color, sub }) => (
              <div key={id} className="rounded-2xl overflow-hidden"
                style={{ background: "var(--fill-1)", border: openSection === id ? `1px solid ${color}30` : "1px solid rgb(var(--ink) / 0.07)" }}>
                <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left" onClick={() => toggle(id)}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-cinzel font-semibold" style={{ color: "rgb(var(--ink) / 0.85)" }}>{tr(label)}</p>
                    <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.3)" }}>{tr(sub)}</p>
                  </div>
                  <motion.div animate={{ rotate: openSection === id ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4" style={{ color: "rgb(var(--ink) / 0.25)" }} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openSection === id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <div className="px-4 pb-5 pt-1 space-y-3" style={{ borderTop: "1px solid rgb(var(--ink) / 0.05)" }}>

                        {/* ── NAME ── */}
                        {id === "name" && (
                          <div className="space-y-3 pt-3">
                            <div className="px-3 py-2 rounded-xl" style={{ background: "rgba(0,245,255,0.05)", border: "1px solid rgba(0,245,255,0.1)" }}>
                              <p className="text-[10px] font-inter" style={{ color: "rgb(var(--ink) / 0.4)" }}>
                                {tr("set_currentName")} <span style={{ color: "#00f5ff" }}>{user?.full_name || "—"}</span>
                              </p>
                            </div>
                            <input value={newName} onChange={e => setNewName(e.target.value)}
                              placeholder={tr("set_newNamePh")}
                              className="w-full rounded-xl px-3 py-2.5 text-sm font-inter focus:outline-none"
                              style={{ fontSize: "16px", background: "var(--fill-2)", border: "1px solid rgba(0,245,255,0.2)", color: "rgb(var(--ink) / 0.85)" }} />
                            <button onClick={saveName} disabled={!newName.trim() || nameSaving}
                              className="w-full py-2.5 rounded-xl font-cinzel text-sm flex items-center justify-center gap-2 transition-all"
                              style={{ background: "rgba(0,245,255,0.12)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.25)", opacity: !newName.trim() ? 0.5 : 1 }}>
                              {nameSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : nameSaved ? <><Check className="w-4 h-4" /> {tr("set_saved")}</> : tr("set_updateName")}
                            </button>
                          </div>
                        )}

                        {/* ── EMAIL ── */}
                        {id === "email" && (
                          <div className="space-y-3 pt-3">
                            <div className="px-3 py-2 rounded-xl" style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.15)" }}>
                              <p className="text-[10px] font-inter" style={{ color: "rgb(var(--ink) / 0.4)" }}>
                                {tr("set_current")} <span style={{ color: "#fbbf24" }}>{user?.email}</span>
                              </p>
                            </div>
                            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                              placeholder={tr("set_newEmailPh")}
                              className="w-full rounded-xl px-3 py-2.5 text-sm font-inter focus:outline-none"
                              style={{ fontSize: "16px", background: "var(--fill-2)", border: "1px solid rgba(251,191,36,0.2)", color: "rgb(var(--ink) / 0.85)" }} />
                            <input type="password" value={emailPassword} onChange={e => setEmailPassword(e.target.value)}
                              placeholder={tr("set_confirmPwdPh")}
                              className="w-full rounded-xl px-3 py-2.5 text-sm font-inter focus:outline-none"
                              style={{ fontSize: "16px", background: "var(--fill-2)", border: "1px solid rgba(251,191,36,0.15)", color: "rgb(var(--ink) / 0.85)" }} />
                            {emailMsg && <p className="text-xs font-inter" style={{ color: emailMsg.type === "error" ? "#f87171" : "#34d399" }}>{emailMsg.text}</p>}
                            <button onClick={saveEmail} disabled={emailSaving}
                              className="w-full py-2.5 rounded-xl font-cinzel text-sm flex items-center justify-center gap-2"
                              style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
                              {emailSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : tr("set_updateEmail")}
                            </button>
                          </div>
                        )}

                        {/* ── PASSWORD ── */}
                        {id === "password" && (
                          <div className="space-y-3 pt-3">
                            <div className="relative">
                              <input type={showPwd ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                                placeholder={tr("set_currentPwdPh")}
                                className="w-full rounded-xl px-3 py-2.5 pr-10 text-sm font-inter focus:outline-none"
                                style={{ fontSize: "16px", background: "var(--fill-2)", border: "1px solid rgba(167,139,250,0.2)", color: "rgb(var(--ink) / 0.85)" }} />
                              <button onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "rgb(var(--ink) / 0.3)" }}>
                                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            <input type={showPwd ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                              placeholder={tr("set_newPwdPh")}
                              className="w-full rounded-xl px-3 py-2.5 text-sm font-inter focus:outline-none"
                              style={{ fontSize: "16px", background: "var(--fill-2)", border: "1px solid rgba(167,139,250,0.2)", color: "rgb(var(--ink) / 0.85)" }} />
                            <input type={showPwd ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                              placeholder={tr("set_confirmNewPwdPh")}
                              className="w-full rounded-xl px-3 py-2.5 text-sm font-inter focus:outline-none"
                              style={{ fontSize: "16px", background: "var(--fill-2)", border: "1px solid rgba(167,139,250,0.2)", color: "rgb(var(--ink) / 0.85)" }} />
                            {newPassword.length > 0 && (
                              <div className="space-y-1">
                                <div className="flex gap-1">
                                  {[1,2,3,4].map(i => (
                                    <div key={i} className="h-1.5 flex-1 rounded-full transition-all"
                                      style={{ background: i <= pwdStrength ? pwdStrengthColors[pwdStrength] : "rgb(var(--ink) / 0.07)" }} />
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
                              {pwdSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : tr("set_updatePwd")}
                            </button>
                          </div>
                        )}

                        {/* ── READING SETTINGS ── */}
                        {id === "reading" && (
                          <div className="space-y-4 pt-3">
                            {/* Default Translation */}
                            <div>
                              <p className="text-[10px] font-cinzel uppercase tracking-wider mb-2" style={{ color: "rgb(var(--ink) / 0.35)" }}>{tr("set_defaultTranslation")}</p>
                              <div className="flex flex-wrap gap-2">
                                {TRANSLATIONS.map(t => (
                                  <button key={t} onClick={() => setDefaultTranslation(t)}
                                    className="px-3 py-1.5 rounded-xl text-xs font-cinzel transition-all"
                                    style={{
                                      background: defaultTranslation === t ? "rgba(52,211,153,0.15)" : "rgb(var(--ink) / 0.05)",
                                      color: defaultTranslation === t ? "#34d399" : "rgb(var(--ink) / 0.45)",
                                      border: defaultTranslation === t ? "1px solid rgba(52,211,153,0.35)" : "1px solid rgb(var(--ink) / 0.08)"
                                    }}>{t}</button>
                                ))}
                              </div>
                            </div>
                            {/* Font Size */}
                            <div>
                              <p className="text-[10px] font-cinzel uppercase tracking-wider mb-2" style={{ color: "rgb(var(--ink) / 0.35)" }}>{tr("set_fontSize")}</p>
                              <div className="flex gap-2">
                                {FONT_SIZES.map(s => (
                                  <button key={s} onClick={() => setFontSize(s)}
                                    className="flex-1 py-2 rounded-xl text-xs font-cinzel transition-all"
                                    style={{
                                      background: fontSize === s ? "rgba(0,245,255,0.12)" : "rgb(var(--ink) / 0.04)",
                                      color: fontSize === s ? "#00f5ff" : "rgb(var(--ink) / 0.35)",
                                      border: fontSize === s ? "1px solid rgba(0,245,255,0.25)" : "1px solid rgb(var(--ink) / 0.07)"
                                    }}>{tr(`set_fs_${s.replace(" ", "")}`)}</button>
                                ))}
                              </div>
                            </div>
                            {/* Toggles */}
                            <div className="space-y-2">
                              {[
                                { label: "set_redLetter", key: "redLetterOn", value: redLetterOn, setter: setRedLetterOn, color: "#f87171" },
                                { label: "set_verseNumbers", key: "verseNumbers", value: verseNumbers, setter: setVerseNumbers, color: "#00f5ff" },
                                { label: "set_audioAutoplay", key: "audioAutoplay", value: audioAutoplay, setter: setAudioAutoplay, color: "#a78bfa" },
                              ].map(({ label, value, setter, color }) => (
                                <div key={label} className="flex items-center justify-between py-2 border-b" style={{ borderColor: "rgb(var(--ink) / 0.06)" }}>
                                  <p className="text-sm font-inter" style={{ color: "rgb(var(--ink) / 0.65)" }}>{tr(label)}</p>
                                  <motion.button onClick={() => setter(v => !v)}
                                    className="w-11 h-6 rounded-full relative flex items-center px-1"
                                    style={{ background: value ? `${color}30` : "rgb(var(--ink) / 0.08)" }}>
                                    <motion.span animate={{ x: value ? 18 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 24 }}
                                      className="w-4 h-4 rounded-full bg-white shadow-sm" />
                                  </motion.button>
                                </div>
                              ))}
                            </div>
                            <button onClick={saveReadingPrefs}
                              className="w-full py-2.5 rounded-xl font-cinzel text-sm flex items-center justify-center gap-2 transition-all"
                              style={{ background: readingSaved ? "rgba(52,211,153,0.2)" : "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}>
                              <Check className="w-4 h-4" /> {readingSaved ? tr("set_saved") : tr("set_saveReading")}
                            </button>
                          </div>
                        )}

                        {/* ── LANGUAGE ── */}
                        {id === "language" && (
                          <div className="space-y-4 pt-3">
                            <div>
                              <p className="text-[10px] font-cinzel uppercase tracking-wider mb-2" style={{ color: "rgb(var(--ink) / 0.35)" }}>{tr("set_appLanguage")}</p>
                              <div className="space-y-1.5" role="radiogroup" aria-label={tr("set_appLanguage")}>
                                {LANGUAGES.map(({ code, label: langLabel }) => (
                                  <button key={code} role="radio" aria-checked={currentLang === code} lang={code}
                                    onClick={() => setLang(code)}
                                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-inter transition-all min-h-11"
                                    style={{
                                      background: currentLang === code ? "rgba(96,165,250,0.1)" : "rgb(var(--ink) / 0.03)",
                                      color: currentLang === code ? "#60a5fa" : "rgb(var(--ink) / 0.55)",
                                      border: currentLang === code ? "1px solid rgba(96,165,250,0.3)" : "1px solid rgb(var(--ink) / 0.06)"
                                    }}>
                                    {langLabel}
                                    {currentLang === code && <Check className="w-3.5 h-3.5" />}
                                  </button>
                                ))}
                              </div>
                              <p className="text-[10px] font-inter mt-2" style={{ color: "rgb(var(--ink) / 0.3)" }}>{tr("set_langHint")}</p>
                            </div>
                          </div>
                        )}

                        {/* ── NOTIFICATIONS ── */}
                        {id === "notifications" && (
                          <div className="space-y-4 pt-3">
                            {[
                              { label: tr("set_morning"), key: "morning", value: morningTime, setter: setMorningTime, sub: tr("set_morningSub") },
                              { label: tr("set_evening"), key: "evening", value: eveningTime, setter: setEveningTime, sub: tr("set_eveningSub") },
                              { label: tr("set_devotional"), key: "devotional", value: devotionalTime, setter: setDevotionalTime, sub: tr("set_devotionalSub") },
                            ].map(({ label, key, value, setter, sub }) => (
                              <div key={key} className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                                style={{ background: "var(--fill-1)", border: "1px solid rgb(var(--ink) / 0.07)" }}>
                                <div>
                                  <p className="text-sm font-inter" style={{ color: "rgb(var(--ink) / 0.75)" }}>{label}</p>
                                  <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.3)" }}>{sub}</p>
                                </div>
                                <input type="time" value={value} onChange={e => setter(e.target.value)}
                                  className="text-xs font-cinzel px-3 py-1.5 rounded-xl focus:outline-none"
                                  style={{ background: "rgba(0,245,255,0.07)", border: "1px solid rgba(0,245,255,0.2)", color: "#00f5ff" }} />
                              </div>
                            ))}
                            <button onClick={saveNotifications}
                              className="w-full py-2.5 rounded-xl font-cinzel text-sm flex items-center justify-center gap-2 transition-all"
                              style={{ background: notifSaved ? "rgba(52,211,153,0.2)" : "rgba(0,245,255,0.1)", color: notifSaved ? "#34d399" : "#00f5ff", border: notifSaved ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(0,245,255,0.25)" }}>
                              <Check className="w-4 h-4" /> {notifSaved ? tr("set_saved") : tr("set_saveSchedule")}
                            </button>
                          </div>
                        )}

                        {/* ── SECURITY ── */}
                        {id === "security" && (
                          <div className="space-y-3 pt-3">
                            <div className="rounded-xl px-4 py-3" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}>
                              <div className="flex items-center gap-2 mb-1">
                                <Shield className="w-3.5 h-3.5" style={{ color: "#34d399" }} />
                                <p className="text-xs font-cinzel" style={{ color: "#34d399" }}>{tr("set_protected")}</p>
                              </div>
                              <p className="text-xs font-inter leading-relaxed" style={{ color: "rgb(var(--ink) / 0.45)" }}>
                                {tr("set_protectedText")}
                              </p>
                            </div>
                            {[
                              { label: tr("set_emailVerified"), value: tr("set_yes"), color: "#34d399" },
                              { label: tr("set_role"), value: user?.role || "user", color: "#00f5ff" },
                              { label: tr("set_email"), value: user?.email || "—", color: "rgb(var(--ink) / 0.5)" },
                              { label: tr("set_encryption"), value: tr("set_enabled"), color: "#34d399" },
                              { label: tr("set_privateNotes"), value: tr("set_onDefault"), color: "#34d399" },
                              { label: tr("set_lastSignIn"), value: tr("set_thisSession"), color: "rgb(var(--ink) / 0.4)" },
                            ].map(({ label, value, color }) => (
                              <div key={label} className="flex items-center justify-between py-2 border-b"
                                style={{ borderColor: "rgb(var(--ink) / 0.05)" }}>
                                <span className="text-xs font-inter" style={{ color: "rgb(var(--ink) / 0.4)" }}>{label}</span>
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
                                <p className="text-sm font-cinzel text-white">{tr("set_currentDevice")}</p>
                                <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.35)" }}>
                                  {navigator.userAgent.includes("Mobile") ? tr("set_mobile") : tr("set_desktop")} · {tr("set_activeNow")}
                                </p>
                              </div>
                              <span className="text-[10px] font-cinzel px-2 py-0.5 rounded-full"
                                style={{ background: "rgba(52,211,153,0.15)", color: "#34d399" }}>{tr("set_thisDevice")}</span>
                            </div>
                            <button onClick={() => base44.auth.logout()}
                              className="w-full py-2.5 rounded-xl font-cinzel text-sm flex items-center justify-center gap-2"
                              style={{ background: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                              {tr("set_signOutAll")}
                            </button>
                          </div>
                        )}

                        {/* ── DATA & EXPORT ── */}
                        {id === "data" && (
                          <div className="space-y-3 pt-3">
                            <p className="text-xs font-inter leading-relaxed" style={{ color: "rgb(var(--ink) / 0.4)" }}>
                              {tr("set_dataText")}
                            </p>
                            {[
                              { label: tr("set_exportMd"), sub: tr("set_exportMdSub"), color: "#00f5ff", icon: Download, action: () => {} },
                              { label: tr("set_exportJson"), sub: tr("set_exportJsonSub"), color: "#a78bfa", icon: Download, action: () => {} },
                            ].map(({ label, sub, color, icon: Ico, action }) => (
                              <button key={label} onClick={action}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                                style={{ background: `${color}07`, border: `1px solid ${color}20` }}>
                                <Ico className="w-4 h-4 flex-shrink-0" style={{ color }} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-inter" style={{ color: "rgb(var(--ink) / 0.75)" }}>{label}</p>
                                  <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgb(var(--ink) / 0.3)" }}>{sub}</p>
                                </div>
                              </button>
                            ))}
                            <div className="rounded-xl px-4 py-3 mt-2" style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.15)" }}>
                              <div className="flex items-center gap-2 mb-1.5">
                                <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#f87171" }} />
                                <p className="text-xs font-cinzel" style={{ color: "#f87171" }}>{tr("set_danger")}</p>
                              </div>
                              <p className="text-[10px] font-inter leading-relaxed mb-2.5" style={{ color: "rgb(var(--ink) / 0.35)" }}>
                                {tr("set_dangerText")}
                              </p>
                              <button className="w-full py-2 rounded-xl font-cinzel text-xs flex items-center justify-center gap-2"
                                style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}>
                                <Trash2 className="w-3.5 h-3.5" /> {tr("set_requestDeletion")}
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
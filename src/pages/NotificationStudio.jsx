import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  Bell, Mail, Smartphone, Send, Eye, ChevronRight,
  Loader2, Check, Sparkles, Calendar, BarChart3, Zap, BellOff
} from "lucide-react";
import QuietModeSettings from "@/components/notifications/QuietModeSettings";

const TABS = [
  { id: "push", label: "Push Notifications", icon: Smartphone },
  { id: "email_daily", label: "Daily Email", icon: Mail },
  { id: "email_weekly", label: "Weekly Digest", icon: Calendar },
  { id: "devotional_time", label: "Devotional Time", icon: Bell },
  { id: "prayer_reminders", label: "Prayer Reminders", icon: Bell },
  { id: "quiet_mode", label: "Quiet Mode", icon: BellOff },
  { id: "specs", label: "Design Specs", icon: Sparkles },
];

const PUSH_TEMPLATES_STATIC = [
  {
    id: "morning_grace", variant: "✨ Inspirational", time: "Morning",
    title: "✨ Good morning, {name}",
    body: '"{verse_excerpt}" — {ref}\n\nYour daily word awaits. 🙏',
    note: "Best for new subscribers. Warm, inviting tone.",
    char_hint: "Title: ~28 · Body: ~90",
  },
  {
    id: "strength_today", variant: "🔥 Challenging", time: "Morning",
    title: "🔥 Walk in strength today, {name}",
    body: '"{verse_excerpt}" — {ref}\n\nOpen Veritas to read the full verse & reflection.',
    note: "High CTR for men's segment. Action-focused.",
    char_hint: "Title: ~36 · Body: ~95",
  },
  {
    id: "reflective_noon", variant: "💭 Reflective", time: "Afternoon",
    title: "📖 A word for your afternoon",
    body: '"{verse_excerpt}"\n— {ref}\n\nPause. Breathe. Let this sink in.',
    note: "Ideal for midday send. Lower urgency, higher depth.",
    char_hint: "Title: ~30 · Body: ~80",
  },
  {
    id: "streaking", variant: "🏆 Streak", time: "Morning",
    title: "🔥 {streak_days}-day streak!",
    body: 'You\'re on fire. Today\'s verse: "{verse_excerpt}" — {ref}',
    note: "Trigger when streak ≥ 3 days. Gamification hook.",
    char_hint: "Title: ~22 · Body: ~92",
  },
  {
    id: "personal_invitation", variant: "🌅 Warm Invite", time: "Morning",
    title: "🌅 Your daily word is ready",
    body: '"{verse_excerpt}"\n— {ref} · Tap to open your full devotional.',
    note: "Universal. Works for all segments. Soft CTA.",
    char_hint: "Title: ~28 · Body: ~88",
  },
  {
    id: "evening_peace", variant: "🌙 Evening", time: "Evening",
    title: "🌙 Evening peace, {name}",
    body: 'Before you rest: "{verse_excerpt}" — {ref}\n\nReflect & rest in His word.',
    note: "7–9pm send window. Lower open rate but high engagement.",
    char_hint: "Title: ~24 · Body: ~85",
  },
  {
    id: "new_believer", variant: "✝️ Encouraging", time: "Morning",
    title: "✝️ God's word for you today",
    body: '"{verse_excerpt}"\n— {ref}\n\nEvery day in the Word is a step closer to Him.',
    note: "Onboarding segment. First 30 days of signup.",
    char_hint: "Title: ~26 · Body: ~98",
  },
  {
    id: "deep_study", variant: "🧠 Study", time: "Morning",
    title: "🧠 Today's verse to study",
    body: '"{verse_excerpt}" — {ref}\n\nOpen Study Center to go deeper. 📚',
    note: "Scholar/Elder level users. Intellectual engagement hook.",
    char_hint: "Title: ~25 · Body: ~80",
  },
];

const DESIGN_SPECS = [
  {
    title: "Push Notification Rich Image",
    specs: ["Size: 1080 × 540px (2:1 ratio)", "Format: JPEG or PNG, max 300KB", "Background: Deep dark gradient (#06080f → #0d1326)", "Logo: Centered, 120×120px with 22% border-radius", "Overlay: Subtle sacred geometry or light rays at 8% opacity", "Accent glow: Cyan (#00F5FF) radial, 30% opacity"],
    color: "#00F5FF",
  },
  {
    title: "Email Header Image",
    specs: ["Size: 600 × 280px (desktop), 375 × 200px (mobile)", "Format: JPEG, max 150KB", "Background: Linear gradient + subtle star field", "Logo: Top-center, 64×64px", "Tagline: 'VERITAS · THE WORD · EVERY DAY'"],
    color: "#FFD700",
  },
  {
    title: "Color Palette",
    specs: ["Background: #06080f (Deep Space Black)", "Glass surface: rgba(255,255,255,0.04)", "Cyan accent: #00F5FF — for hope, faith, peace themes", "Gold accent: #FFD700 — for love, wisdom, grace themes", "Orange: #f97316 — for strength, courage themes", "Red letter: #f87171 — for direct scripture quotes", "Text: rgba(255,255,255,0.88) / rgba(255,255,255,0.45) muted"],
    color: "#a78bfa",
  },
  {
    title: "Typography",
    specs: ["Verse text: Playfair Display Italic, 26px, line-height 1.65", "Headers / labels: Cinzel, 400–700 weight, letter-spacing 0.15–0.25em", "Body / reflection: Inter, 300–400 weight, 15px, line-height 1.8", "CTA buttons: Cinzel, 12px, uppercase, letter-spacing 0.15em"],
    color: "#34d399",
  },
];

const AUTOMATION_RULES = [
  { icon: "⏰", title: "Morning Send Window", desc: "6:00–7:30 AM in user's local timezone. Highest open rates for devotional content.", tag: "Recommended" },
  { icon: "🌍", title: "Timezone-Aware Delivery", desc: "Use user.timezone preference. Default to UTC-6 (Mexico City) for unset users.", tag: "Required" },
  { icon: "🔁", title: "Frequency Control", desc: "Max 1 push notification per day. Email: daily opt-in or weekly digest. Never both on same day.", tag: "Anti-spam" },
  { icon: "🔥", title: "Streak Boost Trigger", desc: "When streak_days ≥ 3, switch to the 'streak' push template variant for 7 days.", tag: "Engagement" },
  { icon: "🧪", title: "A/B Split Strategy", desc: "Rotate between 'inspirational' and 'challenging' variants weekly. Track open rate by variant.", tag: "Growth" },
  { icon: "😴", title: "Re-engagement Grace", desc: "If user hasn't opened in 3 days, send a gentle 'We miss you, {name}' with evening peace template.", tag: "Retention" },
];

export default function NotificationStudio() {
  const [activeTab, setActiveTab] = useState("push");
  const [loading, setLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [pushPreviews, setPushPreviews] = useState(null);
  const [selectedPush, setSelectedPush] = useState(null);
  const [sendEmail, setSendEmail] = useState("");
  const [sendName, setSendName] = useState("");
  const [sendStatus, setSendStatus] = useState(null);
  const [dailyVerse, setDailyVerse] = useState(null);
  const [devotionalTime, setDevotionalTime] = useState(localStorage.getItem("veritas_devotional_time") || "06:00");
  const [prayerReminderTime, setPrayerReminderTime] = useState(localStorage.getItem("veritas_prayer_reminder_time") || "20:00");

  useEffect(() => {
    base44.entities.DailyVerse.list("-date", 1).then(v => setDailyVerse(v?.[0] || null)).catch(() => {});
  }, []);

  const loadPushPreviews = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("sendVOTDNotification", {
        mode: "preview_push",
        recipient_name: sendName || "Sarah",
      });
      setPushPreviews(res.data?.push_templates || []);
    } catch (e) {
      setPushPreviews(null);
    } finally {
      setLoading(false);
    }
  };

  const loadEmailPreview = async (type) => {
    setLoading(true);
    setPreviewHtml(null);
    try {
      const res = await base44.functions.invoke("sendVOTDNotification", {
        mode: type === "weekly" ? "preview_email_weekly" : "preview_email_daily",
        recipient_name: sendName || "Sarah",
      });
      setPreviewHtml(res.data?.html || null);
    } catch (e) {
      setPreviewHtml(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
     if (!sendEmail) return;
     setLoading(true);
     setSendStatus(null);
     try {
       await base44.functions.invoke("sendVOTDNotification", {
         mode: "send_daily",
         recipient_email: sendEmail,
         recipient_name: sendName || "Beloved",
       });
       setSendStatus("success");
     } catch {
       setSendStatus("error");
     } finally {
       setLoading(false);
       setTimeout(() => setSendStatus(null), 4000);
     }
   };

   const saveDevotionalTime = () => {
     localStorage.setItem("veritas_devotional_time", devotionalTime);
     setSendStatus("success");
     setTimeout(() => setSendStatus(null), 2000);
   };

   const savePrayerReminderTime = () => {
     localStorage.setItem("veritas_prayer_reminder_time", prayerReminderTime);
     setSendStatus("success");
     setTimeout(() => setSendStatus(null), 2000);
   };

  return (
    <div className="md:ml-16 min-h-screen pb-28">
      {/* Page Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(167,139,250,0.1))", border: "1px solid rgba(251,191,36,0.3)" }}>
            <Bell className="w-5 h-5" style={{ color: "#fbbf24" }} />
          </div>
          <div>
            <h1 className="font-cinzel text-xl font-bold text-white">Notification Studio</h1>
            <p className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>VOTD Push & Email Templates · Veritas Brand System</p>
          </div>
        </div>

        {/* Daily verse chip */}
        {dailyVerse && (
          <div className="mt-4 rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.15)" }}>
            <Zap className="w-4 h-4 flex-shrink-0" style={{ color: "#00f5ff" }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-cinzel" style={{ color: "#00f5ff" }}>Today's VOTD · {dailyVerse.verse_ref}</p>
              <p className="text-xs font-inter mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.45)" }}>"{dailyVerse.text?.slice(0, 80)}…"</p>
            </div>
          </div>
        )}
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1.5 px-5 mb-5 overflow-x-auto scrollbar-hide">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setPreviewHtml(null); setPushPreviews(null); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-cinzel whitespace-nowrap transition-all flex-shrink-0"
              style={{
                background: activeTab === tab.id ? "rgba(0,245,255,0.1)" : "rgba(255,255,255,0.04)",
                color: activeTab === tab.id ? "#00f5ff" : "rgba(255,255,255,0.4)",
                border: activeTab === tab.id ? "1px solid rgba(0,245,255,0.25)" : "1px solid rgba(255,255,255,0.07)",
              }}>
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

          {/* ── PUSH NOTIFICATIONS TAB ── */}
          {activeTab === "push" && (
            <div className="px-5 space-y-4">
              <SectionHeader icon={Smartphone} label="8 Premium Push Notification Templates" color="#00f5ff" />

              {/* Preview name input */}
              <div className="flex gap-2">
                <input
                  value={sendName}
                  onChange={e => setSendName(e.target.value)}
                  placeholder="Preview name (e.g. Sarah)"
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-inter focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}
                />
                <button onClick={loadPushPreviews} disabled={loading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-cinzel transition-all"
                  style={{ background: "rgba(0,245,255,0.1)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.25)" }}>
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                  Preview with VOTD
                </button>
              </div>

              {/* Template cards */}
              <div className="space-y-3">
                {PUSH_TEMPLATES_STATIC.map((t, i) => {
                  const live = pushPreviews?.find(p => p.id === t.id);
                  return (
                    <motion.div key={t.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      onClick={() => setSelectedPush(selectedPush?.id === t.id ? null : t)}
                      className="rounded-2xl overflow-hidden cursor-pointer"
                      style={{ background: "rgba(255,255,255,0.03)", border: selectedPush?.id === t.id ? "1px solid rgba(0,245,255,0.3)" : "1px solid rgba(255,255,255,0.07)" }}>

                      <div className="px-4 py-3 flex items-start gap-3">
                        {/* Phone mockup mini */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                          <Smartphone className="w-4 h-4" style={{ color: "rgba(255,255,255,0.4)" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-cinzel px-2 py-0.5 rounded-full"
                              style={{ background: "rgba(0,245,255,0.08)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.18)" }}>
                              {t.variant}
                            </span>
                            <span className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.25)" }}>⏰ {t.time}</span>
                          </div>
                          <p className="text-sm font-cinzel font-semibold text-white mb-0.5">
                            {live ? live.title_rendered : t.title.replace("{name}", sendName || "Sarah").replace("{streak_days}", "7")}
                          </p>
                          <p className="text-xs font-inter leading-relaxed whitespace-pre-line"
                            style={{ color: "rgba(255,255,255,0.5)" }}>
                            {live ? live.body_rendered : t.body.replace("{name}", sendName || "Sarah").replace("{verse_excerpt}", dailyVerse?.text?.slice(0, 60) + "…" || "For God so loved the world…").replace("{ref}", dailyVerse?.verse_ref || "John 3:16")}
                          </p>
                        </div>
                      </div>

                      <AnimatePresence>
                        {selectedPush?.id === t.id && (
                          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                            <div className="px-4 pb-4 pt-2 border-t space-y-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                              <div className="flex items-center gap-2">
                                <div className="text-[10px] font-cinzel uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>Strategy Note</div>
                              </div>
                              <p className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.5)" }}>{t.note}</p>
                              <p className="text-[10px] font-cinzel" style={{ color: "rgba(255,255,255,0.25)" }}>📐 {t.char_hint}</p>
                              {live && (
                                <div className="flex gap-3 text-[10px] font-inter" style={{ color: "rgba(0,245,255,0.6)" }}>
                                  <span>Title: {live.char_count_title} chars</span>
                                  <span>Body: {live.char_count_body} chars</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              <div className="rounded-2xl p-4 mt-2" style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.15)" }}>
                <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2" style={{ color: "rgba(251,191,36,0.6)" }}>📱 Rich Push Spec</p>
                <ul className="space-y-1">
                  {["Image: 1080×540px, JPEG ≤300KB", "Background: Deep dark gradient #06080f → #0d1326", "Logo: Centered 120×120px, 22% border-radius", "Glow overlay: Cyan radial, 30% opacity", "Sacred geometry watermark: 8% opacity"].map(s => (
                    <li key={s} className="text-xs font-inter flex items-center gap-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                      <span style={{ color: "#fbbf24" }}>·</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ── DAILY EMAIL TAB ── */}
          {activeTab === "email_daily" && (
            <div className="px-5 space-y-4">
              <SectionHeader icon={Mail} label="Daily Verse of the Day Email" color="#fbbf24" />

              <div className="flex gap-2">
                <input value={sendName} onChange={e => setSendName(e.target.value)} placeholder="Recipient name"
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-inter focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }} />
                <button onClick={() => loadEmailPreview("daily")} disabled={loading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-cinzel"
                  style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                  Preview
                </button>
              </div>

              {/* Test send */}
              <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-[10px] font-cinzel uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>Send Test Email</p>
                <div className="flex gap-2">
                  <input value={sendEmail} onChange={e => setSendEmail(e.target.value)} placeholder="admin@example.com"
                    type="email"
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-inter focus:outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }} />
                  <button onClick={handleSendTest} disabled={loading || !sendEmail}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-cinzel transition-all"
                    style={{ background: sendStatus === "success" ? "rgba(52,211,153,0.15)" : "rgba(251,191,36,0.15)", color: sendStatus === "success" ? "#34d399" : "#fbbf24", border: `1px solid ${sendStatus === "success" ? "rgba(52,211,153,0.3)" : "rgba(251,191,36,0.3)"}` }}>
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : sendStatus === "success" ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                    {sendStatus === "success" ? "Sent!" : "Send Test"}
                  </button>
                </div>
              </div>

              {loading && !previewHtml && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#fbbf24" }} />
                </div>
              )}

              {previewHtml && (
                <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="px-4 py-2 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex gap-1.5">
                      {["#f87171", "#fbbf24", "#34d399"].map(c => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}
                    </div>
                    <span className="text-[10px] font-cinzel ml-2" style={{ color: "rgba(255,255,255,0.3)" }}>Email Preview · Daily Verse of the Day</span>
                  </div>
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full"
                    style={{ height: "700px", border: "none", background: "#06080f" }}
                    title="Email Preview"
                  />
                </div>
              )}
            </div>
          )}

          {/* ── WEEKLY EMAIL TAB ── */}
          {activeTab === "email_weekly" && (
            <div className="px-5 space-y-4">
              <SectionHeader icon={Calendar} label="Weekly Spiritual Summary Email" color="#a78bfa" />

              <div className="flex gap-2">
                <input value={sendName} onChange={e => setSendName(e.target.value)} placeholder="Recipient name"
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-inter focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }} />
                <button onClick={() => loadEmailPreview("weekly")} disabled={loading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-cinzel"
                  style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.25)" }}>
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                  Preview
                </button>
              </div>

              {loading && !previewHtml && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#a78bfa" }} />
                </div>
              )}

              {previewHtml && (
                <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="px-4 py-2 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex gap-1.5">
                      {["#f87171", "#fbbf24", "#34d399"].map(c => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}
                    </div>
                    <span className="text-[10px] font-cinzel ml-2" style={{ color: "rgba(255,255,255,0.3)" }}>Email Preview · Weekly Digest</span>
                  </div>
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full"
                    style={{ height: "700px", border: "none", background: "#06080f" }}
                    title="Weekly Email Preview"
                  />
                </div>
              )}

              <div className="rounded-2xl p-4" style={{ background: "rgba(167,139,250,0.04)", border: "1px solid rgba(167,139,250,0.15)" }}>
                <p className="text-[10px] font-cinzel uppercase tracking-widest mb-3" style={{ color: "rgba(167,139,250,0.6)" }}>Weekly Digest Contents</p>
                {["7 daily verses from the past week with themes", "User's streak + XP progress summary", "Most highlighted verse of the week", "3 CTA buttons: Open App · Start a Plan · Prayer Journal", "Unsubscribe + preference links in footer"].map(s => (
                  <div key={s} className="flex items-start gap-2 mb-2">
                    <span style={{ color: "#a78bfa" }}>·</span>
                    <p className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.5)" }}>{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── DEVOTIONAL TIME TAB ── */}
          {activeTab === "devotional_time" && (
            <div className="px-5 space-y-4 pb-4">
              <SectionHeader icon={Bell} label="Daily Devotional Reminder" color="#00f5ff" />
              <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(0,245,255,0.03)", border: "1px solid rgba(0,245,255,0.15)" }}>
                <p className="text-sm font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                  Choose what time each day you'd like to be reminded to check your personalized AI devotional.
                </p>
                <div>
                  <label className="text-[10px] font-cinzel uppercase tracking-widest mb-2 block" style={{ color: "rgba(255,255,255,0.35)" }}>Preferred Time (Your Timezone)</label>
                  <input
                    type="time"
                    value={devotionalTime}
                    onChange={e => setDevotionalTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm font-cinzel focus:outline-none"
                    style={{ background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.25)", color: "#00f5ff" }}
                  />
                </div>
                <button onClick={saveDevotionalTime}
                  className="w-full px-4 py-3 rounded-xl font-cinzel text-sm transition-all"
                  style={{ background: "rgba(0,245,255,0.15)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.3)" }}>
                  {sendStatus === "success" ? <Check className="w-4 h-4 inline mr-2" /> : null}
                  {sendStatus === "success" ? "Saved!" : "Save Time"}
                </button>
                <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: "rgba(0,245,255,0.04)" }}>
                  <Zap className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#00f5ff" }} />
                  <p className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.5)" }}>
                    You'll receive a personalized notification at <strong>{devotionalTime}</strong> reminding you to read your daily devotional based on your recent highlights and prayer journal.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── PRAYER REMINDERS TAB ── */}
          {activeTab === "prayer_reminders" && (
            <div className="px-5 space-y-4 pb-4">
              <SectionHeader icon={Bell} label="Prayer Reminder" color="#a78bfa" />
              <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(167,139,250,0.03)", border: "1px solid rgba(167,139,250,0.15)" }}>
                <p className="text-sm font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                  Set a time to be reminded about prayer journal entries with pending follow-up reminders.
                </p>
                <div>
                  <label className="text-[10px] font-cinzel uppercase tracking-widest mb-2 block" style={{ color: "rgba(255,255,255,0.35)" }}>Prayer Reminder Time (Your Timezone)</label>
                  <input
                    type="time"
                    value={prayerReminderTime}
                    onChange={e => setPrayerReminderTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm font-cinzel focus:outline-none"
                    style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.25)", color: "#a78bfa" }}
                  />
                </div>
                <button onClick={savePrayerReminderTime}
                  className="w-full px-4 py-3 rounded-xl font-cinzel text-sm transition-all"
                  style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.3)" }}>
                  {sendStatus === "success" ? <Check className="w-4 h-4 inline mr-2" /> : null}
                  {sendStatus === "success" ? "Saved!" : "Save Time"}
                </button>
                <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: "rgba(167,139,250,0.04)" }}>
                  <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#a78bfa" }} />
                  <p className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.5)" }}>
                    At <strong>{prayerReminderTime}</strong>, you'll be notified about pending prayer follow-ups and encouraged to update their status.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── QUIET MODE TAB ── */}
          {activeTab === "quiet_mode" && (
            <div className="px-5 pb-4">
              <QuietModeSettings />
            </div>
          )}

          {/* ── DESIGN SPECS TAB ── */}
          {activeTab === "specs" && (
            <div className="px-5 space-y-4">
              <SectionHeader icon={Sparkles} label="Design & Brand Specifications" color="#a78bfa" />

              {DESIGN_SPECS.map(spec => (
                <div key={spec.title} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${spec.color}22` }}>
                  <p className="font-cinzel text-sm font-semibold mb-3" style={{ color: spec.color }}>{spec.title}</p>
                  <ul className="space-y-1.5">
                    {spec.specs.map(s => (
                      <li key={s} className="flex items-start gap-2 text-xs font-inter" style={{ color: "rgba(255,255,255,0.55)" }}>
                        <span style={{ color: spec.color }}>·</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <SectionHeader icon={BarChart3} label="Automation & Delivery Rules" color="#00f5ff" />

              <div className="space-y-3">
                {AUTOMATION_RULES.map(rule => (
                  <div key={rule.title} className="flex items-start gap-3 rounded-2xl p-4"
                    style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <span className="text-xl flex-shrink-0">{rule.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-cinzel font-semibold text-white">{rule.title}</p>
                        <span className="text-[9px] font-cinzel px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(0,245,255,0.08)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.15)" }}>
                          {rule.tag}
                        </span>
                      </div>
                      <p className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.45)" }}>{rule.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl p-4" style={{ background: "rgba(52,211,153,0.04)", border: "1px solid rgba(52,211,153,0.15)" }}>
                <p className="text-[10px] font-cinzel uppercase tracking-widest mb-3" style={{ color: "rgba(52,211,153,0.7)" }}>🔧 Backend Function: sendVOTDNotification</p>
                <div className="space-y-1.5">
                  {[
                    { mode: "preview_push", desc: "Returns all 8 push templates filled with today's VOTD" },
                    { mode: "preview_email_daily", desc: "Returns full HTML of daily email with today's verse" },
                    { mode: "preview_email_weekly", desc: "Returns full HTML of weekly digest with last 7 verses" },
                    { mode: "send_daily", desc: "Sends the daily email to a given recipient_email" },
                  ].map(({ mode, desc }) => (
                    <div key={mode} className="flex items-start gap-2">
                      <code className="text-[10px] px-2 py-0.5 rounded font-mono flex-shrink-0"
                        style={{ background: "rgba(52,211,153,0.1)", color: "#34d399" }}>{mode}</code>
                      <p className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.4)" }}>{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SectionHeader({ icon: Icon, label, color }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <Icon className="w-3.5 h-3.5" style={{ color }} />
      <p className="text-[10px] font-cinzel uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
    </div>
  );
}
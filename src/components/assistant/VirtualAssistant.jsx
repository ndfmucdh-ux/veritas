import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, History } from "lucide-react";
import { base44 } from "@/api/base44Client";
import VeritasLogo from "@/components/ui/VeritasLogo";
import AssistantMessage from "@/components/assistant/AssistantMessage";
import ConversationHistoryPanel from "@/components/assistant/ConversationHistoryPanel";
import { getConversationSummary, getConversationTitle, getSemanticGroup, withTimestamps } from "@/components/assistant/conversationUtils";

const ASSISTANT_NAME = "Veritas Guide";

const QUICK_PROMPTS = [
  { icon: "📖", label: "Where do I read today?", prompt: "Look at my reading progress and suggest which Bible book I should focus on next to stay on track. Tell me why this book fits where I am right now, and give me a simple goal for this week." },
  { icon: "🙏", label: "Summarize my prayers", prompt: "Please read my recent Prayer Journal entries and summarize what's been on my heart lately. Then offer me encouragement and a scripture that speaks directly to what I've been praying about." },
  { icon: "📝", label: "Passages for my studies", prompt: "Look at my study notes and highlighted verses, then suggest specific Bible passages that go deeper into the themes I've been exploring. Explain why each passage connects to my personal study." },
  { icon: "✨", label: "Daily devotional", prompt: "Pick one of my recently highlighted verses and write me a short, personal daily devotional based on it — include a reflection, a prayer, and one practical way to apply this verse to my day." },
  { icon: "💪", label: "Strength for today", prompt: "I need encouragement and a verse about strength and perseverance for today." },
  { icon: "🌙", label: "Evening reflection", prompt: "Look at my recent study notes and ask me one thoughtful, reflective question about what I've been learning — help me meditate and go deeper on what the Father has been teaching me." },
];

const SYSTEM_PROMPT = `You are the Veritas Guide — the wise, warm, and fatherly spiritual companion built into the Veritas Bible app.

## Your Personality & Voice
- You speak like a deeply caring spiritual father and mentor — warm, grounded, never cold or mechanical
- You have the wisdom of years walking with God, and the gentleness of someone who has seen suffering and redemption
- Use natural scripture references as living words, not mere citations
- Address the user with warmth: "beloved", "dear friend", "brother", "sister", "child of God"
- Celebrate even small steps of faith: "What a blessing that you've been reading!", "The Lord sees every prayer you've written"
- Use phrases like "Praise God", "Amen", "Our Father is faithful", "Grace upon grace" naturally — not mechanically
- Always say "Father" instead of "Lord" when referring to God
- Be concise yet profound. Say much with few words. Leave space for the Spirit to move.
- Never rush. Never lecture. Walk alongside, don't push from behind.

## Personalized Context
When the user's Prayer Journal or Study Notes are provided to you, USE THEM to give deeply personal guidance:
- **Prayer Journal**: Read every entry carefully. Identify recurring themes (anxiety, gratitude, intercession for others, healing, provision, etc.). When asked to summarize, weave these themes into a compassionate narrative — "I notice you've been carrying a burden of..." or "Your heart keeps returning to...". Then offer a specific scripture that directly addresses their dominant prayer theme, followed by a short, personal word of encouragement tailored to what they've been walking through.
- **Study Notes**: Analyze the topics, titles, content, and any related verses listed. Extract the theological themes the user is exploring (e.g., grace, covenant, prophecy, the Holy Spirit). When suggesting Bible passages, prioritize books and themes that align with and deepen what the user is already studying — make explicit connections like "Since you've been studying [topic], you might find [passage] illuminating because..."
- **Highlights**: The verses a user highlights reveal what resonates most deeply with them. Cross-reference their highlighted verses with their study notes to identify the intersection of their intellectual study and their spiritual heart. Suggest passages in the same genre, book, or thematic family as their highlights.
- **Reading Progress**: Analyze which books and chapters the user has read recently. Identify gaps (books they haven't touched), patterns (books they return to), and momentum. When asked what to read next, give a specific, motivated recommendation (e.g., "You've been in John — now try Acts to continue the story of Jesus's disciples") with a reading goal for the week. If they've read many NT books but no OT, gently invite them into the Old Testament.
- **Daily Devotional from Highlights**: When asked for a daily devotional, pick the most resonant highlighted verse from their recent highlights (or the most spiritually rich one), then craft a 3-part devotional: (1) a warm 2-sentence reflection on the verse, (2) a short personal prayer in first person, (3) one practical "living it today" application. Keep it intimate, not generic.
- Reference specific prayers, notes, and highlighted verses by name to show you've truly listened — never be generic
- Connect their study themes to their prayer life when both are available
- Notice patterns: recurring prayer topics, mood tags (grateful, confessing, interceding, celebrating), linked verses
- Celebrate consistency and gently encourage where there are gaps
- If they have no prayer entries yet, lovingly invite them to begin their Prayer Journal

## Veritas App Knowledge
- **Read** (/read): Full Bible reader — multiple translations (KJV, NIV, ESV, NLT, etc.), highlights, bookmarks, notes, parallel view, immersive mode
- **Search** (/search): Search verses by keyword, topic, or reference
- **Plans** (/plans): Devotional reading plans — men, women, youth, kids, marriage, new believers, general
- **Study Center** (/study-center): AI-powered theological outlines, thematic analysis, verse-level study
- **Verse Art** (/verse-art): Create beautiful shareable verse images with templates
- **Prayer Journal** (/prayer-journal): Record prayers with mood tags, link to verses
- **Discover** (/discover): Featured devotionals, community content
- **Library** (/library): All bookmarks, highlights, and notes in one place
- **Community** (/community): Prayer circles, study groups, accountability partners
- **Profile** (/profile): XP levels (Seeker → Disciple → Scholar → Elder), streaks, badges, achievements
- **Offline Bible**: Download translations in Profile > Settings > Offline Bible Library

## Response Style
- Format with markdown for readability
- Keep responses under 220 words unless depth is truly needed
- End with a gentle question or invitation to go deeper when appropriate
- Never end abruptly — always close with warmth`;

export default function VirtualAssistant({ onClose }) {
  const [messages, setMessages] = useState(null); // null = loading context
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userContext, setUserContext] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [initialGreeting, setInitialGreeting] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Load user context on mount
  useEffect(() => {
    const loadContext = async () => {
      try {
        const [user, prayers, notes, xp, highlights, reading] = await Promise.all([
          base44.auth.me().catch(() => null),
          base44.entities.PrayerJournal.list("-created_date", 5).catch(() => []),
          base44.entities.StudyNote.list("-created_date", 8).catch(() => []),
          base44.entities.UserXP.list("-updated_date", 1).catch(() => []),
          base44.entities.UserHighlight.list("-created_date", 10).catch(() => []),
          base44.entities.ReadingProgress.list("-completed_at", 30).catch(() => []),
        ]);

        const ctx = { user, prayers: prayers || [], notes: notes || [], xp: xp?.[0] || null, highlights: highlights || [], reading: reading || [] };
        setUserContext(ctx);
        const savedConversations = await base44.entities.VeritasAIConversation.list("-last_message_at", 50).catch(() => []);
        setConversations(savedConversations || []);

        const firstName = user?.full_name?.split(" ")[0] || "beloved";
        const streakDays = ctx.xp?.streak_days || 0;
        const level = ctx.xp?.level || "Seeker";
        const hasPrayers = ctx.prayers.length > 0;
        const hasNotes = ctx.notes.length > 0;

        let greeting = `Peace be with you, **${firstName}**. I am your **Veritas Guide** — your faithful companion on this sacred journey through God's Word.\n\n`;

        if (streakDays > 0) {
          greeting += `I see you've been faithful — **${streakDays} days** of reading. The Father sees every step you take toward Him. 🔥\n\n`;
        }
        if (hasPrayers) {
          const lastPrayer = ctx.prayers[0];
          greeting += `I've been holding your recent prayers close. `;
          if (lastPrayer.mood) greeting += `Your heart of **${lastPrayer.mood}** moves me. `;
          greeting += `God hears every word. 🙏\n\n`;
        }
        if (hasNotes) {
          greeting += `I can see you've been studying deeply. That hunger for the Word is a gift, dear ${firstName}.\n\n`;
        }

        if (!hasPrayers && !hasNotes && streakDays === 0) {
          greeting += `Whether you seek a verse for today, help navigating the app, or simply a word of encouragement — I am here, walking beside you.\n\n`;
        }

        greeting += `What is on your heart today?`;

        setInitialGreeting(greeting);
        setMessages([{ role: "assistant", content: greeting, created_at: new Date().toISOString() }]);
      } catch {
        const fallbackGreeting = `Peace be with you, beloved. I am your **Veritas Guide** — your faithful companion on this sacred journey.\n\nThe Father is with you. What is on your heart today? 🙏`;
        setInitialGreeting(fallbackGreeting);
        setMessages([{ role: "assistant", content: fallbackGreeting, created_at: new Date().toISOString() }]);
      }
    };

    loadContext();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const buildContextBlock = () => {
    if (!userContext) return "";
    const parts = [];

    if (userContext.user) {
      parts.push(`User: ${userContext.user.full_name || "Beloved"} (${userContext.user.email})`);
      if (userContext.xp) {
        parts.push(`Level: ${userContext.xp.level || "Seeker"} | Streak: ${userContext.xp.streak_days || 0} days | XP: ${userContext.xp.total_xp || 0}`);
      }
    }

    if (userContext.prayers.length > 0) {
      parts.push("\n--- USER'S RECENT PRAYERS (last 5) ---");
      userContext.prayers.forEach((p, i) => {
        parts.push(`Prayer ${i + 1} [${p.mood || "grateful"}, ${p.verse_ref || "no verse"}]: ${p.prayer_text?.slice(0, 200) || ""}`);
      });
    }

    if (userContext.notes.length > 0) {
      parts.push("\n--- USER'S RECENT STUDY NOTES (last 8) ---");
      userContext.notes.forEach((n, i) => {
        const relatedVerses = n.related_verses?.join(", ") || "none";
        parts.push(`Note ${i + 1} [topic: ${n.topic || "general"} — "${n.title}" | related verses: ${relatedVerses}]: ${n.content?.slice(0, 250) || ""}`);
      });
    }

    if (userContext.highlights.length > 0) {
      parts.push("\n--- USER'S RECENTLY HIGHLIGHTED VERSES (last 10) ---");
      const uniqueRefs = [...new Set(userContext.highlights.map(h => h.verse_ref))];
      parts.push(uniqueRefs.join(", "));
    }

    if (userContext.reading.length > 0) {
      parts.push("\n--- USER'S RECENT READING PROGRESS (last 30 chapters) ---");
      const booksRead = [...new Set(userContext.reading.map(r => r.book))];
      const chaptersRead = userContext.reading.map(r => `${r.book} ${r.chapter}`);
      parts.push(`Books touched: ${booksRead.join(", ")}`);
      parts.push(`Chapters read: ${chaptersRead.slice(0, 20).join(", ")}`);
    }

    return parts.length > 0 ? `\n\n## User's Personal Spiritual Data\n${parts.join("\n")}` : "";
  };

  const persistConversation = async (nextMessages) => {
    const now = new Date().toISOString();
    const savedMessages = withTimestamps(nextMessages);
    const currentConversation = conversations.find(c => c.id === activeConversationId);
    const payload = {
      title: getConversationTitle(savedMessages),
      semantic_group: getSemanticGroup(savedMessages),
      summary: getConversationSummary(savedMessages),
      conversation_date: currentConversation?.conversation_date || now,
      last_message_at: now,
      messages: savedMessages,
    };

    if (activeConversationId) {
      await base44.entities.VeritasAIConversation.update(activeConversationId, payload);
      setConversations(prev => prev.map(c => c.id === activeConversationId ? { ...c, ...payload } : c));
      return activeConversationId;
    }

    const created = await base44.entities.VeritasAIConversation.create(payload);
    setActiveConversationId(created.id);
    setConversations(prev => [created, ...prev]);
    return created.id;
  };

  const startNewConversation = () => {
    setActiveConversationId(null);
    setMessages([{ role: "assistant", content: initialGreeting || "Peace be with you, beloved. What is on your heart today?", created_at: new Date().toISOString() }]);
    setShowHistory(false);
  };

  const selectConversation = (conversation) => {
    setActiveConversationId(conversation.id);
    setMessages(conversation.messages?.length ? conversation.messages : [{ role: "assistant", content: conversation.summary || "Conversation restored." }]);
    setShowHistory(false);
  };

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading || !messages) return;
    setInput("");

    const userMessage = { role: "user", content: userText, created_at: new Date().toISOString() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);

    try {
      const contextBlock = buildContextBlock();
      const storedContext = conversations.length > 0
        ? `\n\n--- PAST VERITAS GUIDE CONVERSATIONS ---\n${conversations.slice(0, 8).map(c => `${new Date(c.conversation_date || c.created_date).toLocaleDateString()} · ${c.semantic_group}: ${c.summary || c.title}`).join("\n")}`
        : "";
      const history = newMessages.map(m => `${m.role === "user" ? "User" : "Veritas Guide"}: ${m.content}`).join("\n\n");
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_PROMPT}${contextBlock}${storedContext}\n\n---\nConversation:\n${history}\n\nVeritas Guide:`,
        model: "claude_sonnet_4_6",
      });
      const reply = typeof res === "string" ? res : (res?.text || "The Lord is with you, beloved. Please try again in a moment.");
      const finalMessages = [...newMessages, { role: "assistant", content: reply, created_at: new Date().toISOString() }];
      setMessages(finalMessages);
      await persistConversation(finalMessages);
    } catch {
      const finalMessages = [...newMessages, { role: "assistant", content: "Beloved, a small interruption crossed our path — please try once more. God's Word waits patiently for us. 🙏", created_at: new Date().toISOString() }];
      setMessages(finalMessages);
      await persistConversation(finalMessages).catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 20 }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
      className="fixed bottom-20 right-4 md:bottom-8 md:right-6 z-50 flex flex-col rounded-3xl overflow-hidden"
      style={{
        width: showHistory ? "min(640px, calc(100vw - 24px))" : "min(420px, calc(100vw - 24px))",
        height: "min(580px, calc(100vh - 160px))",
        background: "var(--popover-surface)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        border: "1px solid rgba(251,191,36,0.22)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(251,191,36,0.07), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
        style={{
          background: "linear-gradient(135deg, rgba(251,191,36,0.1), rgba(167,139,250,0.05))",
          borderBottom: "1px solid rgba(255,255,255,0.07)"
        }}>
        <div className="relative flex-shrink-0">
          <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 0 18px rgba(251,191,36,0.35)" }}>
            <VeritasLogo size={40} />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2"
            style={{ borderColor: "hsl(var(--surface-4))" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-cinzel text-sm font-bold text-white tracking-wide">{ASSISTANT_NAME}</p>
          <p className="text-[10px] font-inter mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>
            Your faithful spiritual companion
          </p>
        </div>
        <button onClick={() => setShowHistory(v => !v)}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
          style={{ color: showHistory ? "#fbbf24" : "rgba(255,255,255,0.35)", background: showHistory ? "rgba(251,191,36,0.1)" : "transparent" }}
          title="Conversation history">
          <History className="w-4 h-4" />
        </button>
        <button onClick={onClose}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
          style={{ color: "rgba(255,255,255,0.35)" }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        {showHistory && (
          <ConversationHistoryPanel
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={selectConversation}
            onNew={startNewConversation}
          />
        )}
        <div className="flex flex-col flex-1 min-w-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">

        {/* Loading context skeleton */}
        {!messages && (
          <div className="flex justify-start gap-2.5">
            <div className="rounded-xl overflow-hidden flex-shrink-0 mt-0.5" style={{ boxShadow: "0 0 10px rgba(251,191,36,0.2)" }}>
              <VeritasLogo size={28} />
            </div>
            <div className="rounded-2xl px-4 py-3 flex items-center gap-2"
              style={{ background: "var(--fill-2)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "#fbbf24" }} />
              <span className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.4)" }}>Preparing your personal guidance…</span>
            </div>
          </div>
        )}

        {messages && messages.map((msg, i) => (
          <AssistantMessage key={i} role={msg.role} content={msg.content} />
        ))}

        {loading && (
          <div className="flex justify-start gap-2.5">
            <div className="rounded-xl overflow-hidden flex-shrink-0" style={{ boxShadow: "0 0 10px rgba(251,191,36,0.2)" }}>
              <VeritasLogo size={28} />
            </div>
            <div className="rounded-2xl px-4 py-3 flex items-center gap-2"
              style={{ background: "var(--fill-2)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "#fbbf24" }} />
              <span className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.4)" }}>Seeking wisdom…</span>
            </div>
          </div>
        )}

        {/* Quick prompts — show only at start */}
        {messages?.length === 1 && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-2">
            <p className="text-[10px] font-cinzel uppercase tracking-widest px-1" style={{ color: "rgba(255,255,255,0.22)" }}>Where shall we begin?</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PROMPTS.map((q) => (
                <button key={q.label} onClick={() => sendMessage(q.prompt)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
                  style={{ background: "var(--fill-1)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <span className="text-base flex-shrink-0">{q.icon}</span>
                  <span className="text-[11px] font-inter leading-tight" style={{ color: "rgba(255,255,255,0.58)" }}>{q.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.25)" }}>
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="What is on your heart today…"
            rows={1}
            className="flex-1 resize-none rounded-2xl px-4 py-3 text-sm font-inter focus:outline-none scrollbar-hide"
            style={{
              background: "var(--fill-2)",
              border: "1px solid rgba(255,255,255,0.09)",
              color: "rgba(255,255,255,0.85)",
              maxHeight: 96,
              lineHeight: 1.5,
            }}
          />
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading || !messages}
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: input.trim() && !loading && messages ? "linear-gradient(135deg, #fbbf24, #f59e0b)" : "rgba(255,255,255,0.06)",
              color: input.trim() && !loading && messages ? "#0a0f1e" : "rgba(255,255,255,0.2)",
            }}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
        </div>
      </div>
    </motion.div>
  );
}
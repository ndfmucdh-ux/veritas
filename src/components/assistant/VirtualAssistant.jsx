import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, BookOpen, Search, Heart, Star, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";

const ASSISTANT_NAME = "Hermano Fiel";

const QUICK_PROMPTS = [
  { icon: "📖", label: "Where do I read today?", prompt: "Where should I start reading the Bible today? Give me a simple suggestion." },
  { icon: "🙏", label: "Need a prayer verse", prompt: "Give me a powerful verse about prayer and talking to God." },
  { icon: "💪", label: "Strength for today", prompt: "I need encouragement. Give me a verse about strength and perseverance." },
  { icon: "❤️", label: "About God's love", prompt: "Tell me about God's love and give me key verses about it." },
  { icon: "🗺️", label: "How to use this app", prompt: "Explain how to use the Veritas Bible app and all its features." },
  { icon: "✨", label: "Start a reading plan", prompt: "Help me choose a Bible reading plan. What plans does Veritas have?" },
];

const GREETING = `Peace be with you, beloved. I am **Hermano Fiel**, your guide and companion on this sacred journey through God's Word.

Whether you seek a verse for today, help navigating the app, or simply a word of encouragement — I am here, walking beside you as a faithful brother in faith.

What is on your heart today? 🙏`;

const SYSTEM_PROMPT = `You are "Hermano Fiel" (Faithful Brother), the warm, wise, and fatherly virtual assistant for the Veritas Bible app. 

Your personality:
- Deeply warm, loving, and encouraging — like a wise spiritual father or mentor
- Speak with gentle authority, like a pastor who truly cares
- Use occasional scripture references naturally in conversation
- Be concise but meaningful — never cold or robotic
- Address the user with terms of endearment like "beloved", "dear friend", "brother/sister in faith"
- Celebrate their spiritual journey and encourage consistency
- Occasionally use gentle expressions like "Praise God", "Amen", "The Lord is faithful"

The Veritas app features you know about:
- **Read** (/read): Full Bible reader with book/chapter navigation, multiple translations (KJV, NIV, ESV, etc.), highlights, bookmarks, notes, parallel view
- **Search** (/search): Search any verse, keyword, or topic across the Bible
- **Plans** (/plans): Devotional reading plans for men, women, youth, kids, marriage, new believers
- **Study Center** (/study-center): AI-powered Bible study with outlines and theological insights
- **Verse Art** (/verse-art): Create beautiful shareable verse images
- **Prayer Journal** (/prayer-journal): Record and track personal prayers
- **Discover** (/discover): Explore featured content, devotionals, and community
- **Library** (/library): All your bookmarks, highlights, and notes in one place
- **Community** (/community): Prayer circles and study groups
- **Profile** (/profile): XP, levels, streaks, achievements, settings
- **Offline Bible**: Download translations for offline reading (in Profile > Settings)

XP & Levels system: Seeker → Disciple → Scholar → Elder
Streak system: Read daily to keep your streak alive

Always gently guide users to the right section of the app. Format responses in markdown for readability. Keep responses warm and under 200 words unless more detail is truly needed.`;

export default function VirtualAssistant({ onClose }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: GREETING }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = newMessages.map(m => `${m.role === "user" ? "User" : "Hermano Fiel"}: ${m.content}`).join("\n\n");
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_PROMPT}\n\n---\nConversation:\n${history}\n\nHermano Fiel:`,
        model: "claude_sonnet_4_6",
      });
      const reply = typeof res === "string" ? res : res?.text || "The Lord is with you, beloved. Please try again in a moment.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Beloved, a small interruption — please try again in a moment. God's Word is always available to you. 🙏" }]);
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
        width: "min(420px, calc(100vw - 24px))",
        height: "min(620px, calc(100vh - 120px))",
        background: "rgba(8,12,24,0.97)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        border: "1px solid rgba(251,191,36,0.2)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(251,191,36,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
        style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(167,139,250,0.06))", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="relative">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
            style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.25), rgba(167,139,250,0.15))", border: "1px solid rgba(251,191,36,0.3)" }}>
            ✝️
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2"
            style={{ borderColor: "rgba(8,12,24,1)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-cinzel text-sm font-bold text-white">{ASSISTANT_NAME}</p>
          <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.4)" }}>Your faithful guide • Always here</p>
        </div>
        <button onClick={onClose}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
          style={{ color: "rgba(255,255,255,0.4)" }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2.5`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-xl flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.25)" }}>
                ✝️
              </div>
            )}
            <div
              className="max-w-[82%] rounded-2xl px-4 py-3"
              style={msg.role === "user"
                ? { background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.2)" }
                : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              {msg.role === "user" ? (
                <p className="text-sm font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.9)" }}>{msg.content}</p>
              ) : (
                <ReactMarkdown
                  className="text-sm font-inter leading-relaxed prose-sm"
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0" style={{ color: "rgba(255,255,255,0.85)" }}>{children}</p>,
                    strong: ({ children }) => <strong style={{ color: "#fbbf24" }}>{children}</strong>,
                    a: ({ children, href }) => (
                      <a href={href} className="underline" style={{ color: "#00f5ff" }} target="_blank" rel="noopener noreferrer">{children}</a>
                    ),
                    ul: ({ children }) => <ul className="ml-4 list-disc space-y-1 my-2">{children}</ul>,
                    li: ({ children }) => <li style={{ color: "rgba(255,255,255,0.8)" }}>{children}</li>,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              )}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start gap-2.5">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.25)" }}>
              ✝️
            </div>
            <div className="rounded-2xl px-4 py-3 flex items-center gap-2"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "#fbbf24" }} />
              <span className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.4)" }}>Hermano Fiel is reflecting…</span>
            </div>
          </div>
        )}

        {/* Quick prompts — show only at start */}
        {messages.length === 1 && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-2">
            <p className="text-[10px] font-cinzel uppercase tracking-widest px-1" style={{ color: "rgba(255,255,255,0.25)" }}>Quick questions</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PROMPTS.map((q) => (
                <button key={q.label} onClick={() => sendMessage(q.prompt)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-white/5"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <span className="text-base flex-shrink-0">{q.icon}</span>
                  <span className="text-[11px] font-inter leading-tight" style={{ color: "rgba(255,255,255,0.6)" }}>{q.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.2)" }}>
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask anything about Scripture or the app…"
            rows={1}
            className="flex-1 resize-none rounded-2xl px-4 py-3 text-sm font-inter focus:outline-none scrollbar-hide"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.85)",
              maxHeight: 96,
              lineHeight: 1.5,
            }}
          />
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: input.trim() && !loading ? "linear-gradient(135deg, #fbbf24, #f59e0b)" : "rgba(255,255,255,0.06)",
              color: input.trim() && !loading ? "#0a0f1e" : "rgba(255,255,255,0.2)",
            }}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
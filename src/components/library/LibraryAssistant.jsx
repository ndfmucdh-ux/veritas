import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, ChevronDown, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const QUICK_PROMPTS = [
  "Suggest themes for my saved verses",
  "Organize my bookmarks into collections",
  "Find verses about strength and courage",
  "What collection fits my highlights?",
  "Help me create a 'Comfort' collection",
  "Sugerencias para mis versículos guardados",
  "Organiza mis marcadores por tema",
  "Encuentra versículos sobre la esperanza",
];

export default function LibraryAssistant({ open, onClose }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && !conversation) { initConversation(); }
  }, [open]);

  useEffect(() => {
    if (!conversation) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
    return unsub;
  }, [conversation?.id]);

  const initConversation = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: "library_organizer",
      metadata: { name: "Library Session" }
    });
    setConversation(conv);
    setMessages(conv.messages || []);
  };

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || !conversation || sending) return;
    setInput("");
    setShowPrompts(false);
    setSending(true);
    await base44.agents.addMessage(conversation, { role: "user", content: msg });
    setSending(false);
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 360, damping: 28 }}
      className="fixed bottom-20 left-3 right-3 md:left-auto md:right-6 md:w-96 z-[60] rounded-3xl overflow-hidden flex flex-col"
      style={{
        background: "rgba(6,9,20,0.98)",
        border: "1px solid rgba(167,139,250,0.25)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.8), 0 0 40px rgba(167,139,250,0.08)",
        backdropFilter: "blur(28px)",
        maxHeight: "72vh",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(167,139,250,0.06)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(167,139,250,0.18)", border: "1px solid rgba(167,139,250,0.3)" }}>
            <Sparkles className="w-4 h-4" style={{ color: "#a78bfa" }} />
          </div>
          <div>
            <p className="font-cinzel text-sm font-bold text-white">Library AI</p>
            <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>Organize your verses</p>
          </div>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && !sending && (
          <div className="text-center py-4">
            <p className="text-2xl mb-2">📚</p>
            <p className="font-cinzel text-sm text-white mb-1">Library Organizer</p>
            <p className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>
              Ask me to help organize your bookmarks, highlights, and notes into themed collections.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm font-inter leading-relaxed`}
              style={{
                background: msg.role === "user"
                  ? "rgba(167,139,250,0.2)"
                  : "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.85)",
                border: msg.role === "user" ? "1px solid rgba(167,139,250,0.3)" : "1px solid rgba(255,255,255,0.07)",
              }}>
              {msg.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "#a78bfa" }} />
              <span className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.4)" }}>Thinking…</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      <AnimatePresence>
        {showPrompts && messages.length === 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden flex-shrink-0">
            <div className="px-3 pb-2">
              <div className="flex items-center gap-1 mb-2">
                <ChevronDown className="w-3 h-3" style={{ color: "rgba(255,255,255,0.25)" }} />
                <span className="text-[10px] font-cinzel uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>
                  Quick Actions
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map(p => (
                  <button key={p} onClick={() => send(p)}
                    className="px-2.5 py-1.5 rounded-xl text-[11px] font-inter transition-all"
                    style={{ background: "rgba(167,139,250,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(167,139,250,0.18)" }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="px-3 pb-3 pt-2 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask about your library…"
            className="flex-1 rounded-2xl px-3.5 py-2.5 text-sm font-inter focus:outline-none"
            style={{ fontSize: "16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(167,139,250,0.2)", color: "rgba(255,255,255,0.85)" }}
          />
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => send()}
            disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: input.trim() ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.04)",
              border: input.trim() ? "1px solid rgba(167,139,250,0.35)" : "1px solid rgba(255,255,255,0.07)",
              color: input.trim() ? "#a78bfa" : "rgba(255,255,255,0.2)"
            }}>
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
import { memo } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import VeritasLogo from "@/components/ui/VeritasLogo";

// Memoized chat bubble. The assistant re-renders on every keystroke (input state)
// and on each scroll effect; without memo, every prior message re-parses its
// markdown each time. Bubbles only change when their own message content changes.
const MARKDOWN_COMPONENTS = {
  p: ({ children }) => <p className="text-sm font-inter leading-relaxed mb-2 last:mb-0" style={{ color: "rgb(var(--ink) / 0.85)" }}>{children}</p>,
  strong: ({ children }) => <strong style={{ color: "#fbbf24" }}>{children}</strong>,
  em: ({ children }) => <em style={{ color: "rgb(var(--ink) / 0.6)" }}>{children}</em>,
  a: ({ children, href }) => <a href={href} className="underline" style={{ color: "#00f5ff" }} target="_blank" rel="noopener noreferrer">{children}</a>,
  ul: ({ children }) => <ul className="ml-4 list-disc space-y-1 my-2">{children}</ul>,
  li: ({ children }) => <li className="text-sm font-inter" style={{ color: "rgb(var(--ink) / 0.78)" }}>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 pl-3 my-2 italic" style={{ borderColor: "#fbbf24", color: "rgb(var(--ink) / 0.6)" }}>{children}</blockquote>
  ),
};

function AssistantMessage({ role, content }) {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} gap-2.5`}
    >
      {!isUser && (
        <div className="rounded-xl overflow-hidden flex-shrink-0 mt-0.5" style={{ boxShadow: "0 0 10px rgba(251,191,36,0.2)" }}>
          <VeritasLogo size={28} />
        </div>
      )}
      <div
        className="max-w-[82%] rounded-2xl px-4 py-3"
        style={isUser
          ? { background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.18)" }
          : { background: "var(--fill-2)", border: "1px solid rgb(var(--ink) / 0.08)" }
        }
      >
        {isUser ? (
          <p className="text-sm font-inter leading-relaxed" style={{ color: "rgb(var(--ink) / 0.9)" }}>{content}</p>
        ) : (
          <ReactMarkdown components={MARKDOWN_COMPONENTS}>{content}</ReactMarkdown>
        )}
      </div>
    </motion.div>
  );
}

export default memo(AssistantMessage);
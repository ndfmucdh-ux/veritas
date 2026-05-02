import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";

/**
 * Parallax chapter header. Mount this at the top of the scroll container.
 * Pass `scrollRef` as the scroll container ref.
 */
export default function ChapterHeader({ book, chapter, testament, scrollRef }) {
  const shouldReduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ container: scrollRef });

  // Parallax transforms
  const y         = useTransform(scrollYProgress, [0, 0.3], shouldReduce ? [0, 0] : [0, -28]);
  const opacity   = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const blurVal   = useTransform(scrollYProgress, [0, 0.25], [0, 6]);
  const scale     = useTransform(scrollYProgress, [0, 0.3], shouldReduce ? [1, 1] : [1, 0.94]);

  const isNT = testament === "NT";

  return (
    <motion.div
      style={{ y, opacity, scale }}
      className="relative overflow-hidden rounded-3xl mb-8 text-center py-10 px-6"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 rounded-3xl"
        style={{
          background: isNT
            ? "linear-gradient(160deg, rgba(0,245,255,0.08) 0%, rgba(167,139,250,0.06) 60%, rgba(0,0,0,0) 100%)"
            : "linear-gradient(160deg, rgba(255,215,0,0.08) 0%, rgba(251,113,11,0.05) 60%, rgba(0,0,0,0) 100%)",
          border: `1px solid ${isNT ? "rgba(0,245,255,0.1)" : "rgba(255,215,0,0.12)"}`,
        }}
      />

      {/* Glow orbs */}
      <motion.div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full opacity-30"
        style={{ background: `radial-gradient(ellipse, ${isNT ? "rgba(0,245,255,0.25)" : "rgba(255,215,0,0.2)"}, transparent 70%)` }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[10px] font-inter uppercase tracking-[0.25em] mb-3"
          style={{ color: isNT ? "rgba(0,245,255,0.5)" : "rgba(255,215,0,0.5)" }}
        >
          {testament === "NT" ? "New Testament" : "Old Testament"}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, type: "spring", stiffness: 260, damping: 24 }}
          className="font-cinzel font-bold text-white mb-2"
          style={{ fontSize: "clamp(26px, 7vw, 38px)" }}
        >
          {book}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-inter text-white/35 text-sm"
        >
          Chapter {chapter}
        </motion.p>

        {/* Decorative divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-5 h-px w-20"
          style={{ background: isNT
            ? "linear-gradient(90deg, transparent, rgba(0,245,255,0.5), transparent)"
            : "linear-gradient(90deg, transparent, rgba(255,215,0,0.5), transparent)"
          }}
        />
      </div>
    </motion.div>
  );
}
import { motion } from "framer-motion";
import { BookOpen, Sparkles } from "lucide-react";

export default function DiscoverVerseCard({ verse, index, onGenerateDevotional, devotionalLabel, readLabel }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass rounded-xl p-5 border border-border/50"
    >
      <p className="font-playfair text-base text-foreground leading-relaxed italic mb-3">
        "{verse.text}"
      </p>
      <div className="flex items-center justify-between">
        <span className="font-cinzel text-sm text-gold">{verse.ref}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{verse.theme}</span>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={() => onGenerateDevotional(verse.ref)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-purple/20 text-purple hover:bg-purple/30 transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          {devotionalLabel}
        </button>
        <a
          href={`/read?book=${verse.ref.split(' ').slice(0,-1).join(' ')}&chapter=${verse.ref.split(' ').pop()?.split(':')[0]}`}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-cyan/10 text-cyan hover:bg-cyan/20 transition-colors"
        >
          <BookOpen className="w-3 h-3" />
          {readLabel}
        </a>
      </div>
    </motion.div>
  );
}
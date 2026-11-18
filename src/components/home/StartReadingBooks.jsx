import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const START_BOOKS = ["John", "Psalms", "Proverbs", "Romans", "Genesis", "Matthew", "Isaiah"];

export default function StartReadingBooks() {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {START_BOOKS.map((name, i) => (
        <Link key={name} to={`/read?book=${name}&chapter=1`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 + i * 0.04 }}
            whileTap={{ scale: 0.93 }}
            className="flex-shrink-0 px-5 py-3.5 rounded-xl font-cinzel text-sm whitespace-nowrap"
            style={{ background: "var(--fill-2)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}
          >
            {name}
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function HeaderNavPill({ to, icon: Icon, label }) {
  return (
    <Link to={to} aria-label={label}>
      <motion.div
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.04 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-inter"
        style={{ color: "rgba(255,255,255,0.65)" }}
      >
        <Icon className="w-4 h-4" />
        <span className="hidden md:inline">{label}</span>
      </motion.div>
    </Link>
  );
}
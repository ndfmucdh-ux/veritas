import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function SideNavItem({ path, icon: Icon, label, active }) {
  return (
    <Link key={path} to={path} title={label} aria-label={label}>
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
        style={{
          background: active ? "rgba(251,191,36,0.12)" : "transparent",
          border: active ? "1px solid rgba(251,191,36,0.25)" : "1px solid transparent",
        }}
      >
        <Icon style={{ width: 24, height: 24, color: active ? "#fbbf24" : "rgba(255,255,255,0.35)" }} />
      </motion.div>
    </Link>
  );
}
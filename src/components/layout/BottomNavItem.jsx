import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function BottomNavItem({ path, icon: Icon, label, active }) {
  return (
    <Link to={path} aria-label={label} className="flex-1 min-w-0 flex flex-col items-center justify-center py-2 px-1 gap-1 min-h-16">
      <motion.div
        animate={{ scale: active ? 1.05 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className="px-4 py-1 rounded-full"
        style={{ background: active ? "rgba(251,191,36,0.14)" : "transparent" }}
      >
        <Icon style={{ width: 22, height: 22, color: active ? "#fbbf24" : "rgba(255,255,255,0.55)" }} />
      </motion.div>
      <span className="text-[10px] font-inter text-center leading-tight" style={{ color: active ? "#fbbf24" : "rgba(255,255,255,0.55)" }}>
        {label}
      </span>
    </Link>
  );
}
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function BottomNavItem({ path, icon: Icon, label, active }) {
  return (
    <Link to={path} aria-label={label} className="flex-1 flex flex-col items-center justify-center py-4 px-3 gap-1 min-h-16">
      <motion.div animate={{ scale: active ? 1.15 : 1 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}>
        <Icon style={{ width: 30, height: 30, color: active ? "#fbbf24" : "rgba(255,255,255,0.35)" }} />
      </motion.div>
      <span className="text-[10px] font-inter" style={{ color: active ? "#fbbf24" : "rgba(255,255,255,0.3)" }}>
        {label}
      </span>
    </Link>
  );
}
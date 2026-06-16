import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function HeaderProfileLink({ avatarUrl, displayName }) {
  return (
    <Link to="/profile" aria-label="Open profile">
      <motion.div whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.05 }} className="ml-1 flex-shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName || "Profile"}
            className="w-8 h-8 rounded-xl object-cover"
            style={{ border: "1.5px solid rgba(251,191,36,0.4)", boxShadow: "0 0 10px rgba(251,191,36,0.15)" }}
          />
        ) : (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-cinzel text-sm font-bold"
            style={{ background: "rgba(251,191,36,0.12)", border: "1.5px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}
          >
            {displayName?.[0]?.toUpperCase() || "V"}
          </div>
        )}
      </motion.div>
    </Link>
  );
}
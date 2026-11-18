import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useCurrentUserDisplay from "@/hooks/useCurrentUserDisplay";
import { useLang } from "@/lib/LanguageContext";

export default function HomeGreeting() {
  const { t } = useLang();
  const { displayName, displayAvatar, firstName } = useCurrentUserDisplay();
  const hour = new Date().getHours();
  const period = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const greetingKey = period === "morning" ? "goodMorning" : period === "afternoon" ? "goodAfternoon" : "goodEvening";

  return (
    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cinzel font-bold text-white leading-tight" style={{ fontSize: "clamp(16px, 4.5vw, 21px)" }}>
            {t[greetingKey]}{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="font-inter text-xs mt-0.5" style={{ color: "rgb(var(--ink) / 0.3)" }}>
            "{t.slogan}"
          </p>
        </div>
        <Link to="/profile" aria-label={t.openProfile}>
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt="avatar"
              className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
              style={{ border: "1.5px solid rgba(251,191,36,0.3)", boxShadow: "0 0 10px rgba(251,191,36,0.15)" }}
            />
          ) : (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-cinzel text-base font-bold"
              style={{ background: "rgba(251,191,36,0.1)", border: "1.5px solid rgba(251,191,36,0.2)", color: "#fbbf24" }}
            >
              {displayName?.[0]?.toUpperCase() || "V"}
            </div>
          )}
        </Link>
      </div>
    </motion.div>
  );
}
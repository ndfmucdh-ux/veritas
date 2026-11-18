import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, Leaf } from "lucide-react";
import useCurrentUserDisplay from "@/hooks/useCurrentUserDisplay";
import { useLang } from "@/lib/LanguageContext";

export default function HomeGreeting() {
  const { t } = useLang();
  const { firstName } = useCurrentUserDisplay();
  const hour = new Date().getHours();
  const greetingKey = hour < 12 ? "goodMorning" : hour < 17 ? "goodAfternoon" : "goodEvening";

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-cinzel font-medium leading-[1.05] text-foreground" style={{ fontSize: "clamp(34px, 9vw, 46px)" }}>
            {t[greetingKey]},
            <span className="flex items-center gap-2 font-semibold" style={{ color: "var(--t-gold)" }}>
              {firstName || t.beloved || "Beloved"}
              <Leaf className="w-6 h-6 opacity-70" strokeWidth={1.3} />
            </span>
          </h1>
          <p className="font-inter text-base mt-2" style={{ color: "rgb(var(--ink) / 0.65)" }}>
            {t.graceAndPeace || "Grace and peace to you."}
          </p>
        </div>
        <Link
          to="/notification-studio"
          aria-label={t.notifications || "Notifications"}
          className="relative w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--fill-3)" }}
        >
          <Bell className="w-5 h-5" style={{ color: "rgb(var(--ink) / 0.85)" }} strokeWidth={1.6} />
          <span className="absolute top-3 right-3.5 w-2 h-2 rounded-full" style={{ background: "var(--t-gold)" }} />
        </Link>
      </div>
    </motion.div>
  );
}
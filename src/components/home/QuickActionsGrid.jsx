import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Map, Compass, Palette } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import PhotoCard from "@/components/ui/PhotoCard";

const ACTIONS = [
  { label: "s4Study", icon: GraduationCap, path: "/study-center", photo: "candle" },
  { label: "s4ReadingPlans", icon: Map, path: "/plans", photo: "desert" },
  { label: "s4Discover", icon: Compass, path: "/discover", photo: "ocean" },
  { label: "s4VerseArt", icon: Palette, path: "/verse-art", photo: "sunrise" },
];

export default function QuickActionsGrid() {
  const { t } = useLang();
  return (
    <div className="grid grid-cols-2 auto-rows-fr gap-3">
      {ACTIONS.map((a, i) => (
        <Link key={a.path} to={a.path} className="block h-full min-w-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.05 }} whileTap={{ scale: 0.96 }} className="h-full"
          >
            <PhotoCard photo={a.photo} mark={a.icon} markClass="w-16 h-16" className="h-full min-h-[92px] rounded-2xl" innerClassName="flex items-end px-4 py-4">
              <span className="font-cinzel text-base font-semibold break-words" style={{ color: "#fff" }}>{t[a.label]}</span>
            </PhotoCard>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
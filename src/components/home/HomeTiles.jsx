import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Map, Heart, ChevronRight } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";
import PhotoCard from "@/components/ui/PhotoCard";

const TILES = [
  { path: "/read", mark: BookOpen, photo: "candle", title: "s4Reading", desc: "s4ReadingD" },
  { path: "/plans", mark: Map, photo: "desert", title: "s4Plans", desc: "s4PlansD" },
  { path: "/prayer-journal", mark: Heart, photo: "chapel", title: "s4Prayer", desc: "s4PrayerD" },
];

export default function HomeTiles() {
  const { t } = useLang();
  return (
    <div className="grid grid-cols-3 auto-rows-fr gap-3">
      {TILES.map((tile, i) => (
        <Link key={tile.path} to={tile.path} className="block h-full min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
            whileTap={{ scale: 0.97 }} className="h-full"
          >
            <PhotoCard photo={tile.photo} mark={tile.mark} markClass="w-20 h-20" className="h-full min-h-[150px] rounded-2xl" innerClassName="p-3.5 flex flex-col">
              <p className="font-cinzel text-lg font-semibold leading-tight break-words" style={{ color: "#fff" }}>{t[tile.title]}</p>
              <p className="font-inter text-xs mt-1 leading-snug break-words" style={{ color: "rgba(255,255,255,0.8)" }}>{t[tile.desc]}</p>
              <ChevronRight className="w-4 h-4 mt-auto" style={{ color: "#d9b77e" }} />
            </PhotoCard>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
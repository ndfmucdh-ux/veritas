import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLang } from "@/lib/LanguageContext";
import { Shield, Heart, Zap, Star, Anchor, Sprout } from "lucide-react";
import PhotoCard, { GOLD } from "@/components/ui/PhotoCard";

const CATEGORIES = [
  { key: "men", label: "s4Men", icon: Shield, photo: "mountains" },
  { key: "women", label: "s4Women", icon: Heart, photo: "lily" },
  { key: "youth", label: "s4Youth", icon: Zap, photo: "sunrise" },
  { key: "kids", label: "s4Kids", icon: Star, photo: "starfield" },
  { key: "marriage", label: "s4Marriage", icon: Anchor, photo: "dove" },
  { key: "newBeliever", label: "s4NewBeliever", icon: Sprout, photo: "forest" },
];

export default function CategoryCards() {
  const { t } = useLang();
  return (
    <div className="grid grid-cols-3 auto-rows-fr gap-2.5">
      {CATEGORIES.map((cat, i) => {
        const Icon = cat.icon;
        return (
          <Link key={cat.key} to={`/for-you/${cat.key}`} className="block h-full min-w-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 360, damping: 24 }}
              whileTap={{ scale: 0.95 }} className="h-full"
            >
              <PhotoCard photo={cat.photo} className="h-full min-h-[96px] rounded-2xl cursor-pointer" innerClassName="flex flex-col items-center justify-center gap-2 py-4 px-2">
                <Icon className="w-7 h-7" strokeWidth={1.4} style={{ color: GOLD }} />
                <span className="font-cinzel text-[11px] font-semibold text-center leading-tight break-words max-w-full" style={{ color: "#fff" }}>
                  {t[cat.label]}
                </span>
              </PhotoCard>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}
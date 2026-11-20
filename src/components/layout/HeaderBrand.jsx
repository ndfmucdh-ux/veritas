import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import VeritasLogo from "@/components/ui/VeritasLogo";
import useGoBack from "@/hooks/useGoBack";
import { useLang } from "@/lib/LanguageContext";

// Root screens show the brand; child screens show a back button.
export default function HeaderBrand() {
  const { pathname } = useLocation();
  const { t } = useLang();
  const parts = pathname.split("/").filter(Boolean);
  const goBack = useGoBack(`/${parts[0] || ""}`);

  if (parts.length > 1) {
    return (
      <div className="flex items-center gap-1 min-w-0">
        <button type="button" onClick={goBack} aria-label={t.back || "Back"}
          className="w-11 h-11 -ml-2 flex-shrink-0 flex items-center justify-center rounded-full text-foreground">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <Link to="/" className="font-cinzel font-bold text-xl tracking-[0.1em] text-foreground">VERITAS</Link>
      </div>
    );
  }

  return (
    <Link to="/" className="flex items-center gap-2.5">
      <motion.div whileHover={{ scale: 1.05 }} className="rounded-xl">
        <VeritasLogo size={34} />
      </motion.div>
      <span className="font-cinzel font-bold text-xl tracking-[0.1em] text-foreground">
        VERITAS
      </span>
      <span className="font-cursive text-lg italic text-foreground/70 ml-1.5">by</span>
      <img src="https://base44.app/api/apps/69f67135f4b5e8717434ca7b/files/mp/public/69f67135f4b5e8717434ca7b/2d2084bf6_awaken-logo-transparent.png" alt="Awaken Apostolic Network" className="h-8 w-auto object-contain" />
    </Link>
  );
}
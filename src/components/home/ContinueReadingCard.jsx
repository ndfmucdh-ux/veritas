import { Link } from "react-router-dom";
import { BookOpen, ChevronRight } from "lucide-react";
import SoftCard from "@/components/ui/SoftCard";
import { useLang } from "@/lib/LanguageContext";

export default function ContinueReadingCard() {
  const { t } = useLang();
  return (
    <SoftCard as={Link} to="/read" className="flex items-center gap-4 px-5 min-h-[72px] active:scale-[0.99]">
      <span className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/15 text-primary flex-shrink-0">
        <BookOpen className="w-5 h-5" strokeWidth={1.5} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-cinzel text-sm text-foreground">{t.continueReading}</span>
        <span className="block text-xs mt-0.5 text-muted-foreground">{t.pickUp}</span>
      </span>
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
    </SoftCard>
  );
}
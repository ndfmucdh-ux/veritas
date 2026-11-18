import { Link } from "react-router-dom";
import { GraduationCap, Map, Compass, Palette } from "lucide-react";
import SoftCard from "@/components/ui/SoftCard";
import { useLang } from "@/lib/LanguageContext";

export default function QuickActionsGrid() {
  const { t } = useLang();
  const actions = [
    { label: t.studyCenter, icon: GraduationCap, path: "/study-center" },
    { label: t.readingPlans, icon: Map, path: "/plans" },
    { label: t.discover, icon: Compass, path: "/discover" },
    { label: t.verseArt, icon: Palette, path: "/verse-art" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map(({ label, icon: Icon, path }) => (
        <SoftCard key={path} as={Link} to={path} className="flex items-center gap-3 px-4 min-h-[60px] active:scale-[0.98]">
          <Icon className="w-5 h-5 text-primary flex-shrink-0" strokeWidth={1.5} />
          <span className="font-cinzel text-sm text-foreground">{label}</span>
        </SoftCard>
      ))}
    </div>
  );
}
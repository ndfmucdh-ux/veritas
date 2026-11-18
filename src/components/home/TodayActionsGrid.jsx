import { BookOpen, Map, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import SoftCard from "@/components/ui/SoftCard";
import { useLang } from "@/lib/LanguageContext";

export default function TodayActionsGrid() {
  const { tr } = useLang();
  const actions = [
    { label: tr("home_todaysReading"), sub: tr("home_todaysReadingSub"), icon: BookOpen, path: "/read" },
    { label: tr("plans"), sub: tr("home_plansSub"), icon: Map, path: "/plans" },
    { label: tr("prayer"), sub: tr("home_prayerSub"), icon: Heart, path: "/prayer-journal" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map(({ label, sub, icon: Icon, path }) => (
        <SoftCard
          key={path}
          as={Link}
          to={path}
          className="flex flex-col gap-2 p-3.5 sm:p-4 min-h-[112px] active:scale-[0.98]"
        >
          <span className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/15 text-primary">
            <Icon className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <span className="font-cinzel text-sm leading-tight text-foreground">{label}</span>
          <span className="text-[11px] leading-tight text-muted-foreground hidden sm:block">{sub}</span>
        </SoftCard>
      ))}
    </div>
  );
}
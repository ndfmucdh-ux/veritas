import { Link } from "react-router-dom";
import useCurrentUserDisplay from "@/hooks/useCurrentUserDisplay";
import { useLang } from "@/lib/LanguageContext";

export default function HomeGreeting() {
  const { t } = useLang();
  const { displayName, displayAvatar, firstName } = useCurrentUserDisplay();
  const hour = new Date().getHours();
  const greetingKey = hour < 12 ? "goodMorning" : hour < 17 ? "goodAfternoon" : "goodEvening";

  return (
    <div className="flex items-center justify-between gap-3 fade-in">
      <div className="min-w-0">
        <h1 className="font-cinzel text-foreground leading-tight" style={{ fontSize: "clamp(22px, 5vw, 28px)" }}>
          {t[greetingKey]}{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="text-sm mt-1 text-muted-foreground">{t.slogan}</p>
      </div>
      <Link to="/profile" aria-label={t.profile} className="min-w-11 min-h-11 flex items-center justify-center">
        {displayAvatar ? (
          <img src={displayAvatar} alt="" className="w-11 h-11 rounded-full object-cover border border-border" />
        ) : (
          <span className="w-11 h-11 rounded-full flex items-center justify-center font-cinzel text-base bg-primary/15 text-primary">
            {displayName?.[0]?.toUpperCase() || "V"}
          </span>
        )}
      </Link>
    </div>
  );
}